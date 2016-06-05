#!/bin/sh
#

svgo -f src/icons -o src/icons/optimized --config="{\"plugins\":[{\"cleanupAttrs\":true},{\"removeDimensions\":true},{\"removeTitle\":true},{\"removeUselessDefs\":true},{\"mergePaths\":true},{\"removeStyleElement\":true},{\"removeNonInheritableGroupAttrs\":true},{\"removeAttrs\":{\"attrs\":[\"fill\",\"style\"]}}]}"
svg-sprite -s --symbol-dest="dist/" src/icons/optimized/*.svg
mv dist/svg/sprite.css.svg dist/formeo-sprite.svg
rm -r dist/svg
rm -r src/icons/optimized
