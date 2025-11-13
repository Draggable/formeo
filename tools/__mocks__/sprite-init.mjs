/**
 * Initialize the SVG sprite for tests
 * This uses the global function set up in test-setup.cjs
 */
import { loaded } from '../../src/lib/js/common/loaders.js'

// Call the global initialization function if it exists
if (typeof global.__initFormeoSprite === 'function') {
  global.__initFormeoSprite(loaded)
}
