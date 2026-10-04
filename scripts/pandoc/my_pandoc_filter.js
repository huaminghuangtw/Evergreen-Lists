#!/usr/bin/env node

// https://pandoc.org/filters.html

const pandoc = require("pandoc-filter")
const fs = require('fs')
const https = require('https')
const twemoji = require('twemoji')
const shell = require('shelljs')
const path = require('path')

const INKSCAPE  = shell.which("inkscape").stdout.split("\n")[0].trim()
const EMOJI_IMG_RE = /<img class="emoji" draggable="false" alt="([^"]+)" src="([^"]+)"\/>/g

function svgToPdf(svgPath) {
	const pdfPath = svgPath.replace(/\.svg$/, ".pdf")
	if (!fs.existsSync(pdfPath))
		shell.exec(`"${INKSCAPE}" --export-type=pdf "${pdfPath}" "${svgPath}"`)
	return pdfPath
}

function downloadFile(url, destPath) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(destPath)
		https.get(url, (response) => {
			response.pipe(file)
			file.on('finish', () => { file.close(); resolve() })
		}).on('error', reject)
	})
}

async function getEmoji(icon) {
	const url     = `${twemoji.base}svg/${icon}.svg`
	const dir     = path.join(__dirname, "twemoji")
	const svgPath = path.join(dir, `${icon}.svg`)
	if (!fs.existsSync(dir))
		shell.mkdir('-p', dir)
	if (!fs.existsSync(svgPath))
		await downloadFile(url, svgPath)
	return svgPath
}

async function buildEmojiNode(icon, alt, format, context) {
	const pdfPath = svgToPdf(await getEmoji(icon))
	const graphicsArgs = "height=1em"
	const escapedPath  = pdfPath.replace(/\\/g, '/')
	if (format === "latex") {
		const inner = `\\includegraphics[${graphicsArgs}]{${escapedPath}}`
		const raw = context === "Verbatim" || context === "texttt"
			? `$\\raisebox{-0.35ex}{${inner}}$`
			: `\\raisebox{-0.35ex}{${inner}}`
		return pandoc.RawInline("latex", raw)
	}
	const attrs   = [["height", "1em"]]
	const caption = alt ? [Object.assign(pandoc.Str(alt), { __skip: true })] : []
	return pandoc.Image(["", [], attrs], caption, [pdfPath, "fig:"])
}

async function replaceEmojis(text, format, context) {
	const parsed = twemoji.parse(text, { callback: (icon) => icon })
	const parts  = parsed.split(EMOJI_IMG_RE)
	if (parts.length === 1)
		return pandoc.Str(parts[0])

	const nodes = []
	for (let i = 0; i < parts.length; i += 3) {
		if (parts[i])
			nodes.push(pandoc.Str(parts[i]))
		if (i + 2 < parts.length && parts[i + 2] != null)
			nodes.push(await buildEmojiNode(parts[i + 2], parts[i + 1], format, context))
	}
	return nodes
}

function latexEscapeKbd(text) {
	return text
		.replace(/\\/g, "\\textbackslash{}")
		.replace(/←/g, "\\ensuremath{\\leftarrow}")
		.replace(/→/g, "\\ensuremath{\\rightarrow}")
		.replace(/↑/g, "\\ensuremath{\\uparrow}")
		.replace(/↓/g, "\\ensuremath{\\downarrow}")
}

function isKbdOpen(el) {
	return el.t === "RawInline" && el.c[0] === "html" && el.c[1].startsWith("<kbd>")
}

function extractKbdContent(arr, startIndex) {
	let content = arr[startIndex].c[1].slice(5) // strip opening <kbd>
	const closeInFirst = content.indexOf("</kbd>")
	if (closeInFirst !== -1)
		return { content: content.slice(0, closeInFirst), nextIndex: startIndex + 1 }

	// <kbd> split across multiple nodes — collect until </kbd>
	let j = startIndex + 1
	while (j < arr.length) {
		if (arr[j].t === "RawInline" && arr[j].c[0] === "html" && arr[j].c[1] === "</kbd>") break
		if (arr[j].t === "Str")   content += arr[j].c
		if (arr[j].t === "Space") content += " "
		j++
	}
	return { content, nextIndex: j + 1 }
}

async function visit(obj, format) {
	if (obj.t === "Str")
		return await replaceEmojis(obj.c, format)
}

async function visitArray(arr, format) {
	if (format !== "latex") return arr

	const result = []
	let i = 0
	while (i < arr.length) {
		if (isKbdOpen(arr[i])) {
			const { content, nextIndex } = extractKbdContent(arr, i)
			result.push(pandoc.RawInline("latex", `\\kbd{${latexEscapeKbd(content)}}`))
			i = nextIndex
		} else {
			result.push(arr[i++])
		}
	}
	return result
}

pandoc.stdio({ single: visit, array: visitArray })
