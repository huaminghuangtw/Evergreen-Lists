import { readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve } from 'node:path'

/*
 * Non-secret list metadata (titles, descriptions, spreadsheet ids).
 *
 * Credentials are NOT read from here — see lib/credentials.ts, which takes them
 * from the environment so no token or client secret ever sits in a plain file.
 */
export const CONFIG_PATH = resolve(
  homedir(),
  'Library/Mobile Documents/com~apple~CloudDocs/Documents/JSONFiles/config.json',
)

export interface ListConfig {
  title: string
  description: string
  headerTitle?: string
  spreadsheetId?: string
}

export interface Config {
  'My Reminders'?: { evergreenLists?: Record<string, ListConfig> }
}

export async function readConfig(): Promise<Config> {
  return JSON.parse(await readFile(CONFIG_PATH, 'utf-8')) as Config
}

export async function writeConfig(config: Config): Promise<void> {
  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 4)}\n`)
}

/*
 * Strip non-breaking spaces. Pasting metadata (into config.json, or out of
 * Reminders) commonly introduces U+00A0, which would otherwise leak into
 * titles, headings, and the generated Markdown.
 */
export function clean(value: string | undefined): string {
  return (value ?? '').replace(/\u00a0/g, ' ')
}

export function listConfig(config: Config, id: string): ListConfig | undefined {
  const entry = config['My Reminders']?.evergreenLists?.[id]
  if (!entry) return undefined
  return {
    ...entry,
    title: clean(entry.title),
    description: clean(entry.description),
  }
}
