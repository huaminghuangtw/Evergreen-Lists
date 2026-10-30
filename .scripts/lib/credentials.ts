import { existsSync } from 'node:fs'

/*
 * Google credentials for the Sheets sync.
 *
 * Secrets never live in a file that is read at run time from outside the repo:
 * locally they come from `.env.local` (gitignored, loaded here with Node's
 * built-in env-file support), and any other caller can export the same names.
 * Values already set in the environment always win.
 */
if (typeof process.loadEnvFile === 'function') {
  for (const file of ['.env.local', '.env']) {
    if (existsSync(file)) process.loadEnvFile(file)
  }
}

export interface GoogleCredentials {
  clientID: string
  clientSecret: string
  refreshToken: string
  tokenEndpoint: string
}

const REQUIRED = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
] as const

export function googleCredentials(): GoogleCredentials {
  const missing = REQUIRED.filter((name) => !process.env[name])
  if (missing.length > 0) {
    throw new Error(
      `missing ${missing.join(', ')} — put them in .env.local (see .env.example) or export them`,
    )
  }

  return {
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN as string,
    tokenEndpoint:
      process.env.GOOGLE_TOKEN_ENDPOINT ??
      'https://oauth2.googleapis.com/token',
  }
}
