const { snapshot } = require('node:test')
const { basename, join, dirname, resolve } = require('node:path')
const { JSDOM } = require('jsdom')
const { ResizeObserver } = require('./__mocks__/ResizeObserver')
const { readFileSync } = require('node:fs')

const { window } = new JSDOM('<!DOCTYPE html><p>Hello World</p>', { pretendToBeVisual: true })

window.ResizeObserver = ResizeObserver
global.window = window
global.document = window.document
global.navigator = window.navigator
global.CustomEvent = window.CustomEvent

// Prepare the SVG sprite data for sprite-init.mjs (imported via --import flag)
const spritePath = resolve(__dirname, '..', 'src', 'lib', 'icons', 'formeo-sprite.svg')
const spriteContent = readFileSync(spritePath, 'utf-8')
const parser = new window.DOMParser()
const svgDoc = parser.parseFromString(spriteContent, 'image/svg+xml')
const parsedSprite = svgDoc.documentElement

// Expose a global function that sprite-init.mjs will call
global.__initFormeoSprite = loadedObject => {
  if (!loadedObject.formeoSprite) {
    loadedObject.formeoSprite = parsedSprite
  }
}

// jsdom does not provide this method
window.Element.prototype.animate = () => ({
  finished: Promise.resolve(),
  addEventListener: () => {},
  removeEventListener: () => {},
})

snapshot.setResolveSnapshotPath(testFile => join(dirname(testFile), '__snapshots__', `${basename(testFile)}.snapshot`))

// for debugging
// process.on('beforeExit', () => console.log('Before exit event triggered'))
// process.on('exit', () => console.log('Exit event triggered'))
// process.on('uncaughtException', err => console.error('Unhandled exception:', err))
// process.on('unhandledRejection', reason => console.error('Unhandled rejection:', reason))
