import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Custom loader to handle SVG imports with ?raw suffix in tests
 * This loader is needed because Node.js doesn't natively support importing .svg files
 */

export async function resolve(specifier, context, nextResolve) {
  // Let the default resolver handle the path resolution first
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  // Check if this is an SVG file (with or without ?raw query parameter)
  const urlWithoutQuery = url.split('?')[0]

  if (urlWithoutQuery.endsWith('.svg')) {
    try {
      const filePath = fileURLToPath(urlWithoutQuery)
      const content = readFileSync(filePath, 'utf-8')

      // Return as an ES module with a default export
      return {
        format: 'module',
        source: `export default ${JSON.stringify(content)}`,
        shortCircuit: true,
      }
    } catch {
      // If file doesn't exist or can't be read, return empty string
      return {
        format: 'module',
        source: 'export default ""',
        shortCircuit: true,
      }
    }
  }

  // Let Node.js handle all other file types
  return nextLoad(url, context)
}
