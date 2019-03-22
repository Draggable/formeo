import fs from 'fs-extra'
import path from 'path'
import SVGSpriter from 'svg-sprite'

// Create a sprite from a directory of svg files.

const projectRootDir = path.resolve(__dirname, '../')

function generateSprite() {
  const prefix = 'f'
  const iconDelim = 'i'
  const srcDir = path.join(projectRootDir, process.argv[2] || 'src/icons')
  const outputDir = path.join(projectRootDir, process.argv[3] || 'src/demo/assets/img')
  const spriteName = process.argv[3] ? '' : '/formeo-sprite.svg'

  const isSvg = filePath => /.svg$/.test(filePath)
  const iconPaths = fs
    .readdirSync(srcDir)
    .filter(isSvg)
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
              { cleanupAttrs: true },
              { removeDimensions: true },
              { removeTitle: true },
              { removeUselessDefs: true },
              { mergePaths: true },
              { removeStyleElement: true },
              { removeNonInheritableGroupAttrs: true },
              {
                removeAttrs: { attrs: '(stroke|fill|style|^font-*)' },
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
  spriter.compile(function(error, result) {
    if (error) {
      throw new Error(error)
    }
    fs.mkdirpSync(outputDir)
    fs.writeFileSync(outputDir + spriteName, result.symbol.sprite.contents)
  })
}

generateSprite()
