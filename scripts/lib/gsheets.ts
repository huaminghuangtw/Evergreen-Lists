import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  CONFIG_PATH,
  listConfig,
  readConfig,
  writeConfig,
  type Config,
  type ListConfig,
} from './config.ts'
import type { ListSection, ListSubtask } from './lists.ts'
import { LISTS_REPO, type ListSource } from './source.ts'

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

interface SheetProperties {
  sheetId: number
  title: string
  index: number
}

function formatExpiry(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

async function getAccessToken(config: Config): Promise<string> {
  const google = config['API Credentials']?.Google
  if (!google) {
    throw new Error(`no "API Credentials.Google" in ${CONFIG_PATH}`)
  }
  const endpoint =
    google.baseURL?.tokenEndpoint ?? 'https://oauth2.googleapis.com/token'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: google.clientID,
      client_secret: google.clientSecret,
      refresh_token: google.refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!response.ok) {
    throw new Error(
      `token refresh failed (${response.status}): ${await response.text()}`,
    )
  }
  const token = (await response.json()) as {
    access_token: string
    expires_in: number
  }

  google.accessToken = token.access_token
  google.expires_in = formatExpiry(
    new Date(Date.now() + token.expires_in * 1000),
  )

  return token.access_token
}

async function sheetsRequest<T>(
  token: string,
  url: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(
      `sheets ${method} ${url.replace(/\?.*$/, '')} → ${response.status}: ${await response.text()}`,
    )
  }
  return (await response.json()) as T
}

/* Normalize non-breaking spaces from the Reminders export. */
function clean(value: string | undefined): string {
  return (value ?? '').replace(/\u00a0/g, ' ')
}

/*
 * Markdown → plain text
 */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`{1,3}([^`]*?)`{1,3}/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])/g, '$1')
    .replace(/(?<![_\w])_(?!\s)(.+?)(?<!\s)_(?![_\w])/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/\t/g, ' ')
    .replace(/\n\s+([0-9]|•)/g, '\n$1')
    .trim()
}

function tabTitle(section: ListSection, used: Set<string>): string {
  const base =
    toPlainText(clean(section.name)).replace(/[[\]*?/\\]/g, ' ').trim().slice(0, 100) ||
    'Sheet'
  let title = base
  let suffix = 2
  while (used.has(title)) {
    title = `${base} (${suffix++})`
  }
  used.add(title)
  return title
}

function nameCell(item: ListSubtask): unknown {
  const label = toPlainText(clean(item.name))
  const url = clean(item.url).trim()
  return url
    ? { formulaValue: `=HYPERLINK("${url}", "${label}")` }
    : { stringValue: label }
}

function headerRequests(sheetId: number, headerTitle: string): unknown[] {
  const range = {
    sheetId,
    startRowIndex: 0,
    endRowIndex: 1,
    startColumnIndex: 0,
    endColumnIndex: 2,
  }
  return [
    {
      updateCells: {
        rows: [
          {
            values: [
              { userEnteredValue: { stringValue: headerTitle } },
              { userEnteredValue: { stringValue: 'Note' } },
            ],
          },
        ],
        fields: 'userEnteredValue',
        range,
      },
    },
    {
      repeatCell: {
        range,
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0, green: 0, blue: 0 },
            horizontalAlignment: 'CENTER',
            textFormat: {
              foregroundColor: { red: 1, green: 1, blue: 1 },
              fontSize: 12,
              bold: true,
            },
          },
        },
        fields:
          'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
      },
    },
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 450 },
        fields: 'pixelSize',
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
        properties: { pixelSize: 300 },
        fields: 'pixelSize',
      },
    },
  ]
}

function subtasksOf(section: ListSection): ListSubtask[] {
  const subtasks = section.subtasks
  if (!subtasks) return []
  return Array.isArray(subtasks) ? subtasks : [subtasks]
}

function rowRequest(sheetId: number, subtasks: ListSubtask[]): unknown {
  return {
    updateCells: {
      rows: subtasks.map((item) => ({
        values: [
          nameCell(item),
          {
            stringValue: toPlainText(clean(item.notes)),
          },
        ].map((userEnteredValue) => ({
          userEnteredValue,
          userEnteredFormat: { wrapStrategy: 'WRAP' },
        })),
      })),
      fields: 'userEnteredValue,userEnteredFormat.wrapStrategy',
      range: { sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 2 },
    },
  }
}

async function fetchSpreadsheet(
  token: string,
  spreadsheetId: string,
): Promise<boolean> {
  const response = await fetch(
    `${SHEETS_API}/${spreadsheetId}?fields=spreadsheetId`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (response.status === 404 || response.status === 410) return false
  if (!response.ok) {
    throw new Error(
      `sheets GET ${spreadsheetId} → ${response.status}: ${await response.text()}`,
    )
  }
  return true
}

async function readAliasEmail(id: string): Promise<string> {
  const raw = await readFile(
    resolve(LISTS_REPO, id, `${id}.gsheet`),
    'utf-8',
  ).catch(() => null)
  if (!raw) return ''
  try {
    return (JSON.parse(raw) as { email?: string }).email ?? ''
  } catch {
    return ''
  }
}

async function writeGsheetAlias(id: string, spreadsheetId: string): Promise<void> {
  const alias = {
    '': 'WARNING! DO NOT EDIT THIS FILE! ANY CHANGES MADE WILL BE LOST!',
    doc_id: spreadsheetId,
    resource_key: '',
    email: await readAliasEmail(id),
  }
  await writeFile(
    resolve(LISTS_REPO, id, `${id}.gsheet`),
    JSON.stringify(alias),
  )
}

async function ensureSpreadsheet(
  token: string,
  config: Config,
  source: ListSource,
  sheetConfig: ListConfig | undefined,
): Promise<{ spreadsheetId: string; created: boolean }> {
  if (
    sheetConfig?.spreadsheetId &&
    (await fetchSpreadsheet(token, sheetConfig.spreadsheetId))
  ) {
    return { spreadsheetId: sheetConfig.spreadsheetId, created: false }
  }

  const title = sheetConfig?.title ?? source.title
  const created = await sheetsRequest<{ spreadsheetId: string }>(
    token,
    SHEETS_API,
    'POST',
    { properties: { title } },
  )

  const reminders = (config['My Reminders'] ??= {})
  const evergreen = (reminders.evergreenLists ??= {})
  evergreen[source.id] = {
    ...sheetConfig,
    title,
    description: sheetConfig?.description ?? source.description,
    headerTitle: sheetConfig?.headerTitle ?? 'Name',
    spreadsheetId: created.spreadsheetId,
  }

  await writeGsheetAlias(source.id, created.spreadsheetId)
  return { spreadsheetId: created.spreadsheetId, created: true }
}

export async function syncGoogleSheet(source: ListSource): Promise<{
  tabs: number
  spreadsheetId: string
  created: boolean
}> {
  const config = await readConfig()
  const sheetConfig = listConfig(config, source.id)
  const token = await getAccessToken(config)
  const { spreadsheetId, created } = await ensureSpreadsheet(
    token,
    config,
    source,
    sheetConfig,
  )
  const headerTitle = sheetConfig?.headerTitle ?? 'Name'
  const title = sheetConfig?.title ?? source.title

  // Persist the refreshed token and any newly created spreadsheet id.
  await writeConfig(config)

  const meta = await sheetsRequest<{
    sheets: Array<{ properties: SheetProperties }>
  }>(
    token,
    `${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`,
  )
  const sheets = [...meta.sheets].sort(
    (a, b) => a.properties.index - b.properties.index,
  )
  const defaultSheet = sheets[0]

  // 1. Reset: keep the first tab and drop the rest. Unhide that tab first — a
  //    spreadsheet must always keep at least one visible sheet, so a re-run
  //    would otherwise fail with "can't remove all visible sheets".
  await sheetsRequest(token, `${SHEETS_API}/${spreadsheetId}:batchUpdate`, 'POST', {
    requests: [
      {
        updateSheetProperties: {
          properties: {
            sheetId: defaultSheet.properties.sheetId,
            hidden: false,
          },
          fields: 'hidden',
        },
      },
      ...sheets
        .slice(1)
        .map((sheet) => ({ deleteSheet: { sheetId: sheet.properties.sheetId } })),
      {
        updateSpreadsheetProperties: {
          properties: { title },
          fields: 'title',
        },
      },
    ],
  })

  // 2. One tab per section.
  const used = new Set<string>()
  const sections = source.reminders
  const added = await sheetsRequest<{
    replies: Array<{ addSheet: { properties: { sheetId: number } } }>
  }>(token, `${SHEETS_API}/${spreadsheetId}:batchUpdate`, 'POST', {
    requests: sections.map((section) => ({
      addSheet: { properties: { title: tabTitle(section, used) } },
    })),
  })
  const sheetIds = added.replies.map(
    (reply) => reply.addSheet.properties.sheetId,
  )

  // 3. Header + rows for every tab.
  const requests: unknown[] = []
  sections.forEach((section, index) => {
    const sheetId = sheetIds[index]
    requests.push(...headerRequests(sheetId, headerTitle))
    const subtasks = subtasksOf(section)
    if (subtasks.length > 0) requests.push(rowRequest(sheetId, subtasks))
  })
  if (requests.length > 0) {
    await sheetsRequest(
      token,
      `${SHEETS_API}/${spreadsheetId}:batchUpdate`,
      'POST',
      { requests },
    )
  }

  // 4. Blank out and hide the leftover default tab.
  await sheetsRequest(
    token,
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(defaultSheet.properties.title)}:clear`,
    'POST',
    {},
  )
  await sheetsRequest(token, `${SHEETS_API}/${spreadsheetId}:batchUpdate`, 'POST', {
    requests: [
      {
        updateSheetProperties: {
          properties: { sheetId: defaultSheet.properties.sheetId, hidden: true },
          fields: 'hidden',
        },
      },
    ],
  })

  return { tabs: sections.length, spreadsheetId, created }
}
