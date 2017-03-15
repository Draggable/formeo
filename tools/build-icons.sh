#!/bin/sh

node_modules/svgo/bin/svgo -f src/icons -o src/icons/optimized --config="{\"plugins\":[{\"cleanupAttrs\":true},{\"removeDimensions\":true},{\"removeTitle\":true},{\"removeUselessDefs\":true},{\"mergePaths\":true},{\"removeStyleElement\":true},{\"removeNonInheritableGroupAttrs\":true},{\"removeAttrs\":{\"attrs\":[\"fill\",\"style\"]}}]}"
node ./node_modules/svg-sprite/bin/svg-sprite.js -s --symbol-dest="dist/" src/icons/optimized/*.svg
mv dist/svg/sprite.css.svg dist/formeo-sprite.svg
cp dist/formeo-sprite.svg demo/assets/img/formeo-sprite.svg
rm -r dist/svg
rm -r src/icons/optimized
