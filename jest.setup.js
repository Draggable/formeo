process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'

function MutationObserver() {
  return {
    observe: () => [],
    takeRecords: () => [],
    disconnect: () => null,
  }
}

Object.defineProperty(window, 'MutationObserver', { value: MutationObserver })
