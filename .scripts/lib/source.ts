import { access, readdir, readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { clean, listConfig, readConfig } from './config.ts'
import { remindersToMarkdown, type ListSection } from './lists.ts'

export const LISTS_REPO = resolve(
  homedir(),
  'Library/Mobile Documents/iCloud~md~obsidian/Documents/Second-Brain/Evergreen-Lists',
)

export const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  )

export interface ListSource {
  id: string
  title: string
  description: string
  modified: Date
  reminders: ListSection[]
  body: string
  spreadsheetId?: string
}

/*
 * Trailing spaces on a note line are a Markdown hard line break, so they
 * survive into the PDF as unwanted `<br>`s.
 */
const trimLines = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')

const normalizeReminders = (reminders: ListSection[]): ListSection[] =>
  reminders.map((section) => ({
    ...section,
    name: clean(section.name).trimEnd(),
    url: clean(section.url),
    notes: trimLines(clean(section.notes)),
    subtasks: section.subtasks?.map((subtask) => ({
      ...subtask,
      name: clean(subtask.name).trimEnd(),
      url: clean(subtask.url),
      notes: trimLines(clean(subtask.notes)),
    })),
  }))

export async function loadListSource(
  id: string,
  base: string = LISTS_REPO,
): Promise<ListSource> {
  const jsonPath = resolve(base, id, `${id}.json`)
  const raw = await readFile(jsonPath, 'utf-8').catch(() => null)
  if (raw === null) throw new Error(`no ${id}/${id}.json in this repo`)

  const meta = listConfig(await readConfig(), id)
  if (!meta) {
    throw new Error(
      `No "My Reminders.evergreenLists" entry matching "${id}" in config.json`,
    )
  }

  const reminders = normalizeReminders(
    (JSON.parse(raw) as { reminders?: ListSection[] }).reminders ?? [],
  )

  return {
    id,
    title: meta.title,
    description: meta.description,
    modified: (await stat(jsonPath)).mtime,
    reminders,
    body: remindersToMarkdown(id, reminders),
    spreadsheetId: meta.spreadsheetId,
  }
}

export function listMarkdownDocument(source: ListSource): string {
  const frontmatter = [
    '---',
    `title: ${source.title}`,
    `description: ${source.description}`,
    `modified: ${source.modified.toISOString().slice(0, 10)}`,
  ]
  if (source.spreadsheetId) {
    frontmatter.push(`spreadsheetId: ${source.spreadsheetId}`)
  }
  frontmatter.push('---', '', '')
  return `${frontmatter.join('\n')}${source.body}`
}

export async function listIds(base: string = LISTS_REPO): Promise<string[]> {
  const entries = await readdir(base, { withFileTypes: true })
  const ids: string[] = []
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue
    if (await exists(resolve(base, entry.name, `${entry.name}.json`))) {
      ids.push(entry.name)
    }
  }
  return ids.sort()
}
