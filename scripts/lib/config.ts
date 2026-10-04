import { readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { resolve } from 'node:path'

export const CONFIG_PATH = resolve(
  homedir(),
  'Library/Mobile Documents/com~apple~CloudDocs/Documents/JSONFiles/config.json',
)

export interface GoogleCredentials {
  clientID: string
  clientSecret: string
  refreshToken: string
  accessToken?: string
  expires_in?: string
  baseURL?: { tokenEndpoint?: string }
}

export interface ListConfig {
  title: string
  description: string
  headerTitle?: string
  spreadsheetId?: string
}

export interface Config {
  'API Credentials'?: { Google?: GoogleCredentials }
  'My Reminders'?: { evergreenLists?: Record<string, ListConfig> }
}

export async function readConfig(): Promise<Config> {
  return JSON.parse(await readFile(CONFIG_PATH, 'utf-8')) as Config
}

export async function writeConfig(config: Config): Promise<void> {
  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 4)}\n`)
}

/*
 * Strip non-breaking spaces — pasting metadata into config.json commonly
 * introduces U+00A0, which would otherwise leak into titles/headings.
 */
function cleanText(value: string): string {
  return value.replace(/\u00a0/g, ' ')
}

export function listConfig(config: Config, id: string): ListConfig | undefined {
  const entry = config['My Reminders']?.evergreenLists?.[id]
  if (!entry) return undefined
  return {
    ...entry,
    title: cleanText(entry.title),
    description: cleanText(entry.description ?? ''),
  }
}
