#!/usr/bin/env node

/*
 * Turn the Shortcuts JSON exports into Markdown and
 * PDF, and sync the Google Sheets.
 *
 * Usage:
 *   node .scripts/main.mjs                     # every list: gsheet → md → pdf
 *   node .scripts/main.mjs <id> ...            # those lists, same three steps
 *   node .scripts/main.mjs <mode> [<id> ...]   # a single step
 *
 * With no arguments it exits early when the repo has no pending changes —
 * nothing was exported since the last publish, so there is nothing to rebuild.
 *
 * Modes:
 *   gsheet   rebuild the Google Sheet
 *   md       write <id>/<id>.md
 *   pdf      build <id>/<id>.pdf from <id>.md
 *
 * Examples:
 *   node .scripts/main.mjs                          # publish everything
 *   node .scripts/main.mjs tech-pro-tip             # publish one list
 *   node .scripts/main.mjs cheat-sheet gym-workout  # publish two lists
 *   node .scripts/main.mjs md                       # regenerate all Markdown only
 *   node .scripts/main.mjs pdf tech-pro-tip         # rebuild one PDF only
 *   node .scripts/main.mjs gsheet life-pro-tip      # re-sync one sheet only
 *
 * The order matters: gsheet writes the spreadsheet id that md records in the
 * frontmatter, and pdf is built from that md.
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

const PUBLISH = [COMMANDS.gsheet, COMMANDS.md, COMMANDS.pdf]

/* Untracked and modified files both count; if git is unavailable, don't block. */
function hasPendingChanges() {
  const result = spawnSync('git', ['status', '--porcelain'], {
    cwd: LISTS_REPO,
    encoding: 'utf8',
  })
  if (result.error || result.status !== 0) return true
  return result.stdout.trim() !== ''
}

const [arg, ...rest] = process.argv.slice(2)
const known = Object.hasOwn(COMMANDS, arg)
const commands = known ? [COMMANDS[arg]] : PUBLISH
const requested = known ? rest : [arg, ...rest].filter(Boolean)

if (!known && requested.length === 0 && !hasPendingChanges()) {
  console.log('↷ nothing to publish — no changes in this repo')
  process.exit(0)
}

const ids = requested.length > 0 ? requested : await listIds()

let failed = 0
for (const id of ids) {
  for (const run of commands) {
    try {
      await run(id)
    } catch (error) {
      console.error(`✗ ${id}: ${error?.message ?? error}`)
      failed++
      break // later modes depend on this one
    }
  }
}

process.exit(failed > 0 ? 1 : 0)
