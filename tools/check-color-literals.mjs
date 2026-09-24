import { globSync, readFileSync } from 'node:fs'

const OK = '// formeo-color-literal-ok'
const files = [
  ...globSync('src/lib/sass/components/**/*.scss'),
  'src/lib/sass/_render.scss',
  'src/lib/sass/base/_bs.scss',
  'src/lib/sass/base/_icons.scss',
  'src/lib/sass/base/_mixins.scss',
  'src/lib/sass/base/_variables.scss',
  'src/lib/sass/base/_animation.scss',
]
const LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bcolor\.\$|:\s*(white|black)\b/
const problems = []
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (line.includes(OK)) return
      const code = line.replace(/\/\/.*$/, '') // ignore comments
      if (LITERAL.test(code)) {
        problems.push(`${file}:${i + 1}: ${line.trim()}`)
      }
    })
}
if (problems.length) {
  console.error(`Color literals / colors.$* found (use tokens.$*):\n${problems.join('\n')}`)
  process.exit(1)
}
