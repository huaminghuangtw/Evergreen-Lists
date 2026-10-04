#!/usr/bin/env node

/*
 * Turn the Shortcuts JSON exports into Markdown and
 * PDF, and sync the Google Sheets.
 *
 * Usage:
 *   node scripts/main.mjs md      [<id> ...]   # writes <id>/<id>.md
 *   node scripts/main.mjs pdf     [<id> ...]   # requires <id>.md → writes <id>.pdf
 *   node scripts/main.mjs sheets  [<id> ...]   # rebuilds the Google Sheet
 */

import { spawnSync } from 'node:child_process'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  LISTS_REPO,
  listIds,
  listMarkdownDocument,
  loadListSource,
} from './lib/source.ts'
import { syncGoogleSheet } from './lib/gsheets.ts'

const PANDOC_SCRIPTS = resolve(LISTS_REPO, 'scripts/pandoc')
const COMMANDS = new Set(['md', 'pdf', 'sheets'])

const [command, ...requested] = process.argv.slice(2)
if (!command || !COMMANDS.has(command)) {
  console.error('Usage: node scripts/main.mjs <md|pdf|sheets> [list-id ...]')
  process.exit(1)
}

const ids = requested.length > 0 ? requested : await listIds()

const exists = (path) => access(path).then(() => true, () => false)

function runPandoc(markdownPath, pdfPath) {
  const result = spawnSync(
    'pandoc',
    [
      markdownPath,
      '-o',
      pdfPath,
      '--pdf-engine=xelatex',
      `--lua-filter=${resolve(PANDOC_SCRIPTS, 'my_lua_filter.lua')}`,
      `--filter=${resolve(PANDOC_SCRIPTS, 'my_pandoc_filter.js')}`,
      '-V',
      'geometry:margin=0.75in',
      '--table-of-contents',
      '-H',
      resolve(PANDOC_SCRIPTS, 'my_header.tex'),
    ],
    { stdio: 'inherit' },
  )
  return result.status === 0
}

let failed = 0
for (const id of ids) {
  try {
    if (command === 'md') {
      const source = await loadListSource(id)
      if (!source) throw new Error(`no ${id}/${id}.json in this repo`)
      await mkdir(resolve(LISTS_REPO, id), { recursive: true })
      await writeFile(
        resolve(LISTS_REPO, id, `${id}.md`),
        listMarkdownDocument(source),
      )
      console.log(`✓ ${id}: ${id}.md`)
    } else if (command === 'pdf') {
      const markdownPath = resolve(LISTS_REPO, id, `${id}.md`)
      if (!(await exists(markdownPath))) {
        throw new Error(`${id}.md not found — run 'node scripts/main.mjs md' first`)
      }
      const pdfPath = resolve(LISTS_REPO, id, `${id}.pdf`)
      if (!runPandoc(markdownPath, pdfPath)) throw new Error('pandoc failed')
      console.log(`✓ ${id}: ${id}.pdf`)
    } else {
      const source = await loadListSource(id)
      if (!source) throw new Error(`no ${id}/${id}.json in this repo`)
      const { tabs, spreadsheetId, created } = await syncGoogleSheet(source)
      console.log(
        `✓ ${id}: sheets (${tabs} tabs${created ? `, created ${spreadsheetId}` : ''})`,
      )
    }
  } catch (error) {
    console.error(
      `✗ ${id}: ${error instanceof Error ? error.message : String(error)}`,
    )
    failed++
  }
}

process.exit(failed > 0 ? 1 : 0)
