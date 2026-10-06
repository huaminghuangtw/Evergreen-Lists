#!/usr/bin/env node

/*
 * Turn the Shortcuts JSON exports into Markdown and
 * PDF, and sync the Google Sheets.
 *
 * Usage:
 *   node .scripts/main.mjs md      [<id> ...]   # writes <id>/<id>.md
 *   node .scripts/main.mjs pdf     [<id> ...]   # requires <id>.md → writes <id>.pdf
 *   node .scripts/main.mjs gsheet  [<id> ...]   # rebuilds the Google Sheet
 */

import { spawnSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  LISTS_REPO,
  exists,
  listIds,
  listMarkdownDocument,
  loadListSource,
} from './lib/source.ts'
import { syncGoogleSheet } from './lib/gsheets.ts'

const PANDOC_DIR = resolve(LISTS_REPO, '.scripts/pandoc')

function runPandoc(markdownPath, pdfPath) {
  const result = spawnSync(
    'pandoc',
    [
      markdownPath,
      '-o',
      pdfPath,
      '--pdf-engine=xelatex',
      `--lua-filter=${resolve(PANDOC_DIR, 'my_lua_filter.lua')}`,
      `--filter=${resolve(PANDOC_DIR, 'my_pandoc_filter.js')}`,
      '-V',
      'geometry:margin=0.75in',
      '--table-of-contents',
      '-H',
      resolve(PANDOC_DIR, 'my_header.tex'),
    ],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) throw new Error('pandoc failed')
}

const COMMANDS = {
  async md(id) {
    const source = await loadListSource(id)
    await writeFile(
      resolve(LISTS_REPO, id, `${id}.md`),
      listMarkdownDocument(source),
    )
    console.log(`✓ ${id}.md`)
  },

  async pdf(id) {
    const markdownPath = resolve(LISTS_REPO, id, `${id}.md`)
    if (!(await exists(markdownPath))) {
      throw new Error(
        `✗ ${id}.md not found — run 'node .scripts/main.mjs md' first`,
      )
    }
    runPandoc(markdownPath, resolve(LISTS_REPO, id, `${id}.pdf`))
    console.log(`✓ ${id}.pdf`)
  },

  async gsheet(id) {
    await syncGoogleSheet(await loadListSource(id))
    console.log(`✓ ${id}.gsheet`)
  },
}

const [command, ...requested] = process.argv.slice(2)
if (!Object.hasOwn(COMMANDS, command)) {
  console.error('Usage: node .scripts/main.mjs <md|pdf|gsheet> [<id> ...]')
  process.exit(1)
}

const ids = requested.length > 0 ? requested : await listIds()

let failed = 0
for (const id of ids) {
  try {
    await COMMANDS[command](id)
  } catch (error) {
    console.error(`✗ ${id}: ${error?.message ?? error}`)
    failed++
  }
}

process.exit(failed > 0 ? 1 : 0)
