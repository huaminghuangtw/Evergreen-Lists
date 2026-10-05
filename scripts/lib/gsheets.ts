import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  CONFIG_PATH,
  clean,
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

async function sheetsApi<T>(
  token: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const method = body === undefined ? 'GET' : 'POST'
  const response = await fetch(`${SHEETS_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(
      `sheets ${method} ${path} → ${response.status}: ${await response.text()}`,
    )
  }
  return (await response.json()) as T
}

interface BatchUpdateReply {
  addSheet?: { properties: { sheetId: number } }
}

function batchUpdate(
  token: string,
  spreadsheetId: string,
  requests: unknown[],
): Promise<{ replies: BatchUpdateReply[] }> {
  return sheetsApi(token, `/${spreadsheetId}:batchUpdate`, { requests })
}

/*
 * Markdown → plain text
 */
function toPlainText(markdown: string): string {
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

async function existsSpreadsheet(
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

async function listTabs(
  token: string,
  spreadsheetId: string,
): Promise<SheetProperties[]> {
  const { sheets } = await sheetsApi<{
    sheets: Array<{ properties: SheetProperties }>
  }>(token, `/${spreadsheetId}?fields=sheets.properties`)

  return sheets
    .map((sheet) => sheet.properties)
    .sort((a, b) => a.index - b.index)
}

/*
 * Deletes every tab but `keep`, which is unhidden and left holding the
 * spreadsheet title. Unhiding it first matters: a spreadsheet must always keep
 * at least one visible sheet, so deleting the others while all are hidden fails
 * with "can't remove all visible sheets".
 */
async function resetTabs(
  token: string,
  spreadsheetId: string,
  keep: SheetProperties,
  drop: SheetProperties[],
  title: string,
): Promise<void> {
  await batchUpdate(token, spreadsheetId, [
    {
      updateSheetProperties: {
        properties: { sheetId: keep.sheetId, hidden: false },
        fields: 'hidden',
      },
    },
    ...drop.map((sheet) => ({ deleteSheet: { sheetId: sheet.sheetId } })),
    { updateSpreadsheetProperties: { properties: { title }, fields: 'title' } },
  ])
}

/* One tab per section, titled after it. Returns the new sheet ids in order. */
async function addTabs(
  token: string,
  spreadsheetId: string,
  sections: ListSection[],
): Promise<number[]> {
  const used = new Set<string>()
  const { replies } = await batchUpdate(
    token,
    spreadsheetId,
    sections.map((section) => ({
      addSheet: { properties: { title: tabTitle(section, used) } },
    })),
  )
  return replies.flatMap((reply) =>
    reply.addSheet ? [reply.addSheet.properties.sheetId] : [],
  )
}

/* Header row plus one row per item, in every tab. */
async function fillTabs(
  token: string,
  spreadsheetId: string,
  sections: ListSection[],
  sheetIds: number[],
  headerTitle: string,
): Promise<void> {
  const requests = sections.flatMap((section, index) => {
    const sheetId = sheetIds[index]
    const subtasks = subtasksOf(section)
    return [
      ...headerRequests(sheetId, headerTitle),
      ...(subtasks.length > 0 ? [rowRequest(sheetId, subtasks)] : []),
    ]
  })
  if (requests.length > 0) await batchUpdate(token, spreadsheetId, requests)
}

/* The leftover tab is blanked first, so unhiding it later shows nothing. */
async function retireTab(
  token: string,
  spreadsheetId: string,
  sheet: SheetProperties,
): Promise<void> {
  const range = `/${spreadsheetId}/values/${encodeURIComponent(sheet.title)}:clear`
  await sheetsApi(token, range, {})
  await batchUpdate(token, spreadsheetId, [
    {
      updateSheetProperties: {
        properties: { sheetId: sheet.sheetId, hidden: true },
        fields: 'hidden',
      },
    },
  ])
}

/*
 * Reuses the configured spreadsheet, rebuilding it when it is gone. A newly
 * created id, and the <id>.gsheet Drive alias beside the Markdown, are written
 * back so the next run finds them.
 */
async function ensureSpreadsheet(
  token: string,
  config: Config,
  source: ListSource,
  entry: ListConfig,
): Promise<string> {
  const { spreadsheetId } = entry
  if (spreadsheetId && (await existsSpreadsheet(token, spreadsheetId))) {
    return spreadsheetId
  }

  const created = await sheetsApi<{ spreadsheetId: string }>(token, '', {
    properties: { title: entry.title },
  })
  const reminders = (config['My Reminders'] ??= {})
  const evergreen = (reminders.evergreenLists ??= {})
  evergreen[source.id] = { ...entry, spreadsheetId: created.spreadsheetId }

  await writeGsheetAlias(source.id, created.spreadsheetId)
  return created.spreadsheetId
}

/*
 * Rebuilds the sheet from the list: every tab is replaced by one per section.
 * The spreadsheet's own first tab is kept, blanked and hidden, because it
 * cannot be the only visible sheet while the others are being deleted.
 */
export async function syncGoogleSheet(source: ListSource): Promise<void> {
  const config = await readConfig()
  const meta = listConfig(config, source.id)
  const entry = {
    title: meta?.title ?? source.title,
    description: meta?.description ?? source.description,
    headerTitle: meta?.headerTitle ?? 'Name',
    spreadsheetId: meta?.spreadsheetId,
  }

  const token = await getAccessToken(config)
  const spreadsheetId = await ensureSpreadsheet(token, config, source, entry)
  await writeConfig(config) // keeps the refreshed token and any new id

  const [keep, ...drop] = await listTabs(token, spreadsheetId)
  await resetTabs(token, spreadsheetId, keep, drop, entry.title)

  const sections = source.reminders
  const sheetIds = await addTabs(token, spreadsheetId, sections)
  await fillTabs(token, spreadsheetId, sections, sheetIds, entry.headerTitle)
  await retireTab(token, spreadsheetId, keep)
}
