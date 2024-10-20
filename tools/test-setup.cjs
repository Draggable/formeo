const { snapshot } = require('node:test')
const { basename, join, dirname } = require('node:path')
const { JSDOM } = require('jsdom')

const { window } = new JSDOM(`<!DOCTYPE html><p>Hello World</p>`)
global.window = window
global.document = window.document
global.navigator = window.navigator

snapshot.setResolveSnapshotPath(testFile => join(dirname(testFile), '__snapshots__', `${basename(testFile)}.snapshot`))
