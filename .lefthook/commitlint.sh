#!/bin/bash

if [[ "$CI" != "true" ]]; then
  npx commitlint --edit $GIT_PARAMS
fi
