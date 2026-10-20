import module from 'node:module'
import { load } from './svg-loader.mjs'

/**
 * Registers the test module hooks. Loaded with `--import` before any test code.
 *
 * `module.registerHooks()` (Node >= 22.15 / 23.5) runs the hooks in-thread and synchronously,
 * so they also apply to `require()` of ES modules. The older `--loader` flag ran async hooks
 * off-thread and crashed on Node 22 with "ERR_METHOD_NOT_IMPLEMENTED: The resolveSync() method
 * is not implemented" as soon as a CommonJS module required an ES module.
 */
if (typeof module.registerHooks === 'function') {
  module.registerHooks({ load })
} else {
  module.register('./svg-loader.mjs', import.meta.url)
}
