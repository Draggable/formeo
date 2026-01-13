import { BUNDLED_SVG_SPRITE, FALLBACK_CSS_URL, FALLBACK_SVG_SPRITE_URL, SVG_SPRITE_URL } from '../constants.js'
import dom from './dom.js'
import { noop } from './utils/index.mjs'

export const loaded = {
  js: new Set(),
  css: new Set(),
  formeoSprite: null,
}

export const ajax = (fileUrl, callback, onError = noop) => {
  return new Promise(resolve => {
    return fetch(fileUrl)
      .then(data => {
        if (!data.ok) {
          return resolve(onError(data))
        }
        resolve(callback ? callback(data) : data)
      })
      .catch(err => onError(err))
  })
}

const onLoadStylesheet = (elem, cb) => {
  elem.removeEventListener('load', onLoadStylesheet)
  cb(elem.src)
}

const onLoadJavascript = (elem, cb) => {
  elem.removeEventListener('load', onLoadJavascript)
  cb(elem.src)
}

export const insertScript = src => {
  return new Promise((resolve, reject) => {
    if (loaded.js.has(src)) {
      return resolve(src)
    }
    loaded.js.add(src)

    // Create script element and set attributes
    const script = dom.create({
      tag: 'script',
      attrs: {
        type: 'text/javascript',
        async: true,
        src,
      },
      action: {
        load: () => onLoadJavascript(script, resolve),
        error: () => reject(new Error(`${src} failed to load.`)),
      },
    })

    // Append the script to the document head
    document.head.appendChild(script)
  })
}

export const insertStyle = srcs => {
  srcs = Array.isArray(srcs) ? srcs : [srcs]
  const promises = srcs.map(
    src =>
      new Promise((resolve, reject) => {
        if (loaded.css.has(src)) {
          return resolve(src)
        }
        loaded.css.add(src)

        const styleLink = dom.create({
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: src,
          },
          action: {
            load: () => onLoadStylesheet(styleLink, resolve),
            error: () => reject(new Error(`${src} failed to load.`)),
          },
        })

        document.head.appendChild(styleLink)
      })
  )

  return Promise.all(promises)
}

/**
 * Inserts multiple script elements into the document.
 *
 * @param {string|string[]} srcs - A single script source URL or an array of script source URLs.
 * @returns {Promise<void[]>} A promise that resolves when all scripts have been loaded.
 */
export const insertScripts = srcs => {
  srcs = Array.isArray(srcs) ? srcs : [srcs]
  const promises = srcs.map(src => insertScript(src))
  return Promise.all(promises)
}

/**
 * Inserts multiple stylesheets into the document.
 *
 * @param {string|string[]} srcs - A single stylesheet URL or an array of stylesheet URLs to be inserted.
 * @returns {Promise<void[]>} A promise that resolves when all stylesheets have been inserted.
 */
export const insertStyles = srcs => {
  srcs = Array.isArray(srcs) ? srcs : [srcs]
  const promises = srcs.map(src => insertStyle(src))
  return Promise.all(promises)
}

/**
 * Parses SVG sprite and keeps it in memory without inserting into the DOM.
 * Icons will be inlined when used, eliminating the need for xlink:href references.
 *
 * @param {string} iconSvgStr - A string containing SVG icons.
 * @returns {HTMLElement} The in-memory element wrapping the SVG sprite.
 */
export const insertIcons = iconSvgStr => {
  // Create an in-memory DOM element to parse the SVG sprite
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(iconSvgStr, 'image/svg+xml')

  // Store the parsed SVG in memory (not in the document)
  loaded.formeoSprite = svgDoc.documentElement

  return loaded.formeoSprite
}

/**
 * Fetches icons from the provided URL or uses bundled sprite, keeping them in memory.
 * If a URL is provided and fails, it attempts to fetch from a fallback URL.
 * If no URL is provided, uses the bundled sprite included in the package.
 * The sprite is not inserted into the DOM; icons are inlined when used.
 *
 * @param {string|null} iconSpriteUrl - Optional URL to fetch the icon sprite from. If null, uses bundled sprite.
 * @returns {Promise<void>} A promise that resolves when the icons are fetched and parsed.
 */
export const fetchIcons = async (iconSpriteUrl = SVG_SPRITE_URL) => {
  if (loaded.formeoSprite) {
    return loaded.formeoSprite
  }

  // If no sprite url provided, use the bundled sprite
  if (!iconSpriteUrl) {
    return insertIcons(BUNDLED_SVG_SPRITE)
  }

  const parseResp = async resp => insertIcons(await resp.text())

  return ajax(iconSpriteUrl, parseResp, () => ajax(FALLBACK_SVG_SPRITE_URL, parseResp))
}

export const LOADER_MAP = {
  js: insertScripts,
  css: insertStyles,
}

/**
 * Fetches and loads the specified dependencies.
 *
 * @param {Object} dependencies - An object where keys are dependency types and values are the source URLs.
 * @returns {Promise<Array>} A promise that resolves to an array of results from loading each dependency.
 */
export const fetchDependencies = dependencies => {
  const promises = Object.entries(dependencies).map(([type, src]) => {
    return LOADER_MAP[type](src)
  })
  return Promise.all(promises)
}

/**
 * Fetches and inserts the Formeo style sheet from the given URL.
 * If the necessary styles are not loaded, it attempts to insert the style sheet.
 * If the styles are still not loaded, it uses a fallback URL to insert the style sheet.
 *
 * @param {string} cssUrl - The URL of the CSS file to be loaded.
 * @returns {Promise<void>} A promise that resolves when the style sheet is loaded.
 */
export const fetchFormeoStyle = async cssUrl => {
  // check if necessary styles were loaded
  if (cssUrl && !loaded.css.has(cssUrl)) {
    await insertStyle(cssUrl)
    // check again and use fallback if necessary styles were not loaded
    if (!loaded.css.has(cssUrl) && !loaded.css.has(FALLBACK_CSS_URL)) {
      return await insertStyle(FALLBACK_CSS_URL)
    }
  }
}
