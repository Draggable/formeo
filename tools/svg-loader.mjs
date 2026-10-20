import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Module load hook that handles SVG imports (with or without the ?raw suffix) in tests,
 * because Node.js doesn't natively support importing .svg files.
 *
 * The hook is synchronous so it can be used with `module.registerHooks()`, which also covers
 * `require()` of ES modules. It works unchanged as an async `module.register()` hook.
 */
export function load(url, context, nextLoad) {
  const urlWithoutQuery = url.split('?')[0]

  if (urlWithoutQuery.endsWith('.svg')) {
    let content = ''
    try {
      content = readFileSync(fileURLToPath(urlWithoutQuery), 'utf-8')
    } catch {
      // If the file doesn't exist or can't be read, export an empty string
    }

    return {
      format: 'module',
      source: `export default ${JSON.stringify(content)}`,
      shortCircuit: true,
    }
  }

  // Let Node.js handle all other file types
  return nextLoad(url, context)
}
