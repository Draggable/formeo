import { existsSync, globSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))

/** Links to this repo on GitHub are checked against the working tree, so a PR is judged on its own files. */
const REPO_URL = /^https:\/\/github\.com\/Draggable\/formeo\/(?:blob|tree)\/main\/([^#?]*)(?:#(.*))?$/

/** Markdown files whose links are checked (paths relative to the repo root). */
export const CHECKED_FILES = [
  'README.md',
  'CONTRIBUTING.md',
  ...globSync('docs/**/*.md', { cwd: root, exclude: ['docs/superpowers/**'] }).sort(),
]

/** GitHub's heading anchor: link text only, backticks dropped, lowercased, punctuation removed, spaces to dashes. */
export const githubSlug = heading =>
  heading
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replaceAll('`', '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-')

const stripCode = text => text.replace(/^(```|~~~)[\s\S]*?^\1/gm, block => block.replace(/[^\n]/g, ''))

/** All anchors a markdown document exposes, with GitHub's -1, -2 suffixes for repeated headings. */
export function anchorsOf(text) {
  const seen = new Map()
  const anchors = new Set()
  for (const [, heading] of stripCode(text).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const slug = githubSlug(heading)
    const count = seen.get(slug) ?? 0
    anchors.add(count ? `${slug}-${count}` : slug)
    seen.set(slug, count + 1)
  }
  return anchors
}

/** `[text](target)` links outside code blocks, with 1-based line numbers. */
export function linksOf(text) {
  const code = stripCode(text)
  return [...code.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map(match => ({
    target: match[1],
    line: code.slice(0, match.index).split('\n').length,
  }))
}

/**
 * Find broken internal links in one markdown file.
 * @param {string} file path relative to `base`
 * @param {string} [base] repository root
 * @return {string[]} `file:line: target (reason)` entries
 */
export function findBrokenLinks(file, base = root) {
  const text = readFileSync(join(base, file), 'utf8')
  const problems = []

  for (const { target, line } of linksOf(text)) {
    if (target === '#') {
      problems.push(`${file}:${line}: # (placeholder link)`)
      continue
    }
    const repoMatch = target.match(REPO_URL)
    if (/^[a-z][a-z+.-]*:/i.test(target) && !repoMatch) {
      continue // external URL or mailto:, not checked offline
    }

    const [path, anchor] = repoMatch ? [repoMatch[1], repoMatch[2]] : target.split('#')
    let resolved = repoMatch ? normalize(path) : path ? normalize(join(dirname(file), decodeURI(path))) : file

    if (!existsSync(join(base, resolved))) {
      problems.push(`${file}:${line}: ${target} (missing file)`)
      continue
    }
    if (statSync(join(base, resolved)).isDirectory()) {
      resolved = join(resolved, 'README.md')
      if (!existsSync(join(base, resolved))) {
        problems.push(`${file}:${line}: ${target} (directory has no README.md)`)
        continue
      }
    }
    if (anchor && resolved.endsWith('.md') && !anchorsOf(readFileSync(join(base, resolved), 'utf8')).has(anchor)) {
      problems.push(`${file}:${line}: ${target} (no heading for #${anchor})`)
    }
  }

  return problems
}

/** Check every file in CHECKED_FILES; returns the problem lines. */
export const checkDocLinks = (files = CHECKED_FILES, base = root) => files.flatMap(file => findBrokenLinks(file, base))

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const problems = checkDocLinks()
  if (problems.length) {
    console.error(`Broken docs links:\n${problems.join('\n')}`)
    process.exit(1)
  }
}
