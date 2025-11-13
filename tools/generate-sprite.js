import fs from 'fs-extra'
import { dirname, join, resolve } from 'path'
import SVGSpriter from 'svg-sprite'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create a sprite from a directory of svg files.

const projectRootDir = resolve(__dirname, '../')

function generateSprite() {
  const prefix = 'f'
  const iconDelim = 'i'
  const srcDir = join(projectRootDir, process.argv[2] || 'src/lib/icons')
  const outputDir = join(projectRootDir, process.argv[3] || 'src/lib/icons')
  const spriteName = process.argv[3] ? '' : '/formeo-sprite.svg'

  const isIconSvg = filePath => /^icon-.+\.svg$/.test(filePath)
  const iconPaths = fs
    .readdirSync(srcDir)
    .filter(isIconSvg)
    .map(filename => `${srcDir}/${filename}`)

  const spriteConfig = {
    dest: outputDir,
    shape: {
      id: {
        generator: name => name.replace(/^icon-(.*)\.svg$/, `${prefix}-${iconDelim}-$1`),
      },
      transform: [
        {
          svgo: {
            plugins: [
              'cleanupAttrs',
              'removeDimensions',
              'removeTitle',
              'removeUselessDefs',
              'mergePaths',
              'removeStyleElement',
              'removeNonInheritableGroupAttrs',
              {
                name: 'prefixIds',
                params: {
                  prefixClassNames: false,
                },
              },
              {
                name: 'removeAttrs',
                params: { attrs: '(style|^font-*)' },
              },
            ],
          },
        },
      ],
    },

    mode: {
      symbol: true,
    },
  }

  const spriter = new SVGSpriter(spriteConfig)

  iconPaths.forEach(iconPath => {
    spriter.add(iconPath, null, fs.readFileSync(iconPath, { encoding: 'utf-8' }))
  })

  // Compile the sprite
  spriter.compile((error, result) => {
    if (error) {
      throw new Error(error)
    }
    fs.mkdirpSync(outputDir)
    fs.writeFileSync(outputDir + spriteName, result.symbol.sprite.contents)
  })
}

generateSprite()
