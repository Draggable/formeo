# Build tools

## Icon Sprite Generator

Formeo uses an SVG sprite as the source of its icons. SVG has many advantages that include excellent cross-browser support and small filesize but they can be difficult to work with in a sprite. We've included a tool to make expanding the icon library as easy as dropping your svg icon in the `src/icons/` directory. The script also has support for external svg files.

### Generate icons with the default settings

The following command will read `^icon-(.*).svg$` files from `src/icons/` and output a sprite to `src/demo/img/formeo-sprite.svg`

```bash
yarn build:icons
```

Use icons from a different directory and output to a different directory with

```bash
yarn build:icons path/to/src/dir path/to/dest/dir
```
