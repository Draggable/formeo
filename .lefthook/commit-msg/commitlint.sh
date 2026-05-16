#!/bin/bash

if [[ -z "$CI" ]]; then
  npx commitlint --edit "$LEFTHOOK_PARAMS"
fi
