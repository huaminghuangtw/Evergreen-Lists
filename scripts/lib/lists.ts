import { clean } from './config.ts'

export interface ListSubtask {
  name?: string
  url?: string
  notes?: string
}

export interface ListSection {
  name?: string
  url?: string
  notes?: string
  subtasks?: ListSubtask[]
}

type ListMode = 'kbd' | 'code' | 'footnote' | 'multiline'

const LIST_MODES: Record<string, ListMode> = {
  'keyboard-hotkey': 'kbd',
  'cheat-sheet': 'code',
  'journal-prompt': 'footnote',
  'ai-prompt': 'footnote',
  'world-cuisine': 'footnote',
  'healthy-food': 'footnote',
  'life-pro-tip': 'multiline',
  'tech-pro-tip': 'multiline',
  'shortcuts-dev-tip': 'multiline',
  'home-exercise': 'multiline',
  'gym-workout': 'multiline',
}

/*
 * Wrap a hotkey string in `<kbd>` tags: split by `=`, then by `+`, wrap each
 * trimmed piece in `<kbd>…</kbd>`, escape backslashes and backticks.
 */
function kbdWrap(name: string): string {
  return name
    .split('=')
    .map((part) =>
      part
        .split('+')
        .map((piece) =>
          `<kbd>${piece.trim().replace(/\\/g, '\\\\')}</kbd>`.replace(
            '<kbd>`</kbd>',
            '<kbd>&#96;</kbd>',
          ),
        )
        .join(' + '),
    )
    .join(' = ')
}

/*
 * Turn lines into globally-numbered footnotes, returning `text` with the
 * `[^n]` markers appended.
 * For lines like "1. …" / "+ …", drop the leading marker.
 */
function markFootnotes(
  text: string,
  footnotes: string[],
  lines: string[],
): string {
  const markers = lines.map((raw) => {
    const line = clean(raw).replace(/\n+$/g, '')
    const content = /^[1-9+]/.test(line)
      ? line.match(/(?<=\s)(.*)/)?.[1] ?? line
      : line
    footnotes.push(content)
    return footnotes.length
  })
  return `${text} ${markers.map((n) => `[^${n}]`).join(' ')}`
}

function renderItem(
  mode: ListMode,
  item: ListSubtask,
  footnotes: string[],
): string {
  const name = clean(item.name ?? '').trimEnd()
  const notes = clean(item.notes)
  const bullet = `* ${name}`

  if (mode === 'kbd' || mode === 'code') {
    const extra =
      mode === 'kbd' ? kbdWrap(name) : `\`\`\`bash\n  ${name}\n  \`\`\``
    // The last `—`-separated segment, if any, becomes footnotes.
    const [note = '', ...tail] = notes.split('\n—\n')
    const last = tail.at(-1)
    const main = mode === 'kbd' ? note : `* ${note}`
    const withNotes = last
      ? markFootnotes(main, footnotes, last.split('\n'))
      : main
    return mode === 'kbd'
      ? `| ${extra} | ${withNotes} |`
      : `${withNotes}\n\n\t${extra}`
  }

  if (mode === 'footnote') {
    return notes ? markFootnotes(bullet, footnotes, notes.split('\n')) : bullet
  }

  const lines = notes ? notes.split('\n') : ['']
  if (lines.length > 1) {
    return `${bullet}\n${lines.map((line) => `  ${line}`).join('\n')}`
  }
  return lines[0] ? markFootnotes(bullet, footnotes, [lines[0]]) : bullet
}

function renderSection(
  mode: ListMode,
  section: ListSection,
  footnotes: string[],
): string {
  let title = clean(section.name ?? '').trimEnd()
  if (section.url && !title.includes(section.url)) {
    title = `[${title}](${section.url})`
  }
  if (section.notes) {
    title = markFootnotes(title, footnotes, clean(section.notes).split('\n'))
  }

  const lines = (section.subtasks ?? []).map((item) =>
    renderItem(mode, item, footnotes),
  )

  if (mode === 'kbd') {
    const rows = lines.join('\n')
    return `# ${title}\n\n| Hotkey | Note |\n| - | - |\n${rows ? `${rows}\n` : ''}`
  }
  return lines.length > 0
    ? `# ${title}\n\n${lines.join('\n')}\n`
    : `# ${title}\n`
}

export function remindersToMarkdown(
  id: string,
  reminders: ListSection[],
): string {
  const mode = LIST_MODES[id]
  const footnotes: string[] = []
  const body = reminders
    .map((section) => renderSection(mode, section, footnotes))
    .join('\n')
  if (footnotes.length === 0) return body
  return `${body}\n${footnotes.map((f, i) => `[^${i + 1}]: ${f}`).join('\n')}\n`
}
