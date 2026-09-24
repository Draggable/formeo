import { fileURLToPath } from 'node:url'
import * as sass from 'sass-embedded'

const entry = fileURLToPath(new URL('../src/lib/sass/formeo.scss', import.meta.url))

/** Compile formeo.scss exactly as the lib build does (modern compiler, expanded output). */
export function compileFormeoCss() {
  return sass.compile(entry, { style: 'expanded', silenceDeprecations: ['import'] }).css
}
