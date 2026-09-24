import { globSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const OK = '// formeo-color-literal-ok'
const root = fileURLToPath(new URL('../', import.meta.url))

/** Files that must take every color from tokens.$* (paths relative to the repo root). */
export const GUARDED_FILES = [
  ...globSync('src/lib/sass/components/**/*.scss', { cwd: root }).sort(),
  'src/lib/sass/_render.scss',
  'src/lib/sass/base/_bs.scss',
  'src/lib/sass/base/_icons.scss',
  'src/lib/sass/base/_mixins.scss',
  'src/lib/sass/base/_variables.scss',
  'src/lib/sass/base/_animation.scss',
]

/** Every CSS named color (CSS Color 4). transparent, currentcolor and the global keywords are allowed. */
export const NAMED_COLORS = [
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
]

/** Hex, color functions and the colors module's `color.$*` namespace, anywhere in code. */
const LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|\bcolors?\.\$/
/** A named color as a whole identifier (not part of `$brand-red`, `white-space` or `t.$white`). */
const NAMED = new RegExp(`(?<![\\w$.#-])(?:${NAMED_COLORS.join('|')})(?![\\w(-])`, 'i')
/** `@use '…colors'` with an optional namespace; group 2 is the namespace. */
const COLORS_USE = /^\s*@use\s+(['"])(?:[^'"]*\/)?_?colors(?:\.scss)?\1(?:\s+as\s+([\w-]+|\*))?\s*;/
/** A property or Sass variable declaration; group 1 is the value after the first colon. */
const DECLARATION = /^\s*\$?[a-zA-Z-][\w-]*\s*:(?!:)(.*)$/

/** Blank out block comments and line comments, keeping line numbers. */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' ')).replace(/\/\/.*$/gm, '')
}

/**
 * Lines of `text` (from `file`) that hard-code a color or reach into the colors module.
 * Lines carrying `// formeo-color-literal-ok: <reason>` are exempt.
 * @returns {string[]} `file:line: source` for each problem line
 */
export function findColorLiterals(text, file) {
  const raw = text.split('\n')
  const code = stripComments(text).split('\n')
  const namespaces = code.map(line => line.match(COLORS_USE)).filter(Boolean)
  const namespaceUse = namespaces
    .map(match => match[2] ?? 'colors')
    .filter(ns => !['color', 'colors', '*'].includes(ns))
    .map(ns => new RegExp(`(?<![\\w$.-])${ns}\\.\\$`))

  const problems = []
  code.forEach((line, i) => {
    if (raw[i].includes(OK)) return
    const trimmed = line.trim()
    const value = !trimmed.startsWith('@') && !trimmed.endsWith('{') ? line.match(DECLARATION)?.[1] : undefined
    const flagged =
      LITERAL.test(line) ||
      COLORS_USE.test(line) ||
      namespaceUse.some(re => re.test(line)) ||
      (value !== undefined && NAMED.test(value))
    if (flagged) problems.push(`${file}:${i + 1}: ${raw[i].trim()}`)
  })
  return problems
}

/** Check every guarded file; returns the problem lines. */
export function checkGuardedFiles() {
  return GUARDED_FILES.flatMap(file =>
    findColorLiterals(readFileSync(new URL(file, pathToFileURL(root)), 'utf8'), file)
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const problems = checkGuardedFiles()
  if (problems.length) {
    console.error(`Color literals / colors.$* found (use tokens.$*):\n${problems.join('\n')}`)
    process.exit(1)
  }
}
