#!/bin/bash

if [[ -z "$CI" ]]; then
  npx commitlint --edit $GIT_PARAMS
fi
