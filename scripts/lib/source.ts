import { access, readdir, readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { listConfig, readConfig } from './config.ts'
import { remindersToMarkdown, type ListSection } from './lists.ts'

export const LISTS_REPO = resolve(
  homedir(),
  'Library/Mobile Documents/iCloud~md~obsidian/Documents/Second-Brain/Evergreen-Lists',
)

export interface ListSource {
  id: string
  title: string
  description: string
  modified: Date
  reminders: ListSection[]
  body: string
  spreadsheetId?: string
  filePath: string
}

export async function loadListSource(
  id: string,
  base: string = LISTS_REPO,
): Promise<ListSource | null> {
  const jsonPath = resolve(base, id, `${id}.json`)
  const raw = await readFile(jsonPath, 'utf-8').catch(() => null)
  if (raw === null) return null

  const meta = listConfig(await readConfig(), id)
  if (!meta) {
    throw new Error(
      `[lists] no "My Reminders.evergreenLists.${id}" entry in config.json`,
    )
  }

  const reminders =
    (JSON.parse(raw) as { reminders?: ListSection[] }).reminders ?? []

  return {
    id,
    title: meta.title,
    description: meta.description,
    modified: (await stat(jsonPath)).mtime,
    reminders,
    body: remindersToMarkdown(id, reminders),
    spreadsheetId: meta.spreadsheetId,
    filePath: `${id}/${id}.json`,
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
    const hasExport = await access(
      resolve(base, entry.name, `${entry.name}.json`),
    ).then(
      () => true,
      () => false,
    )
    if (hasExport) ids.push(entry.name)
  }
  return ids.sort()
}
