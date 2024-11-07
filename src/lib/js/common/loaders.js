import dom from './dom.js'
import {
  CSS_URL,
  FALLBACK_CSS_URL,
  FALLBACK_SVG_SPRITE_URL,
  POLYFILLS,
  SVG_SPRITE_URL,
  formeoSpriteId,
} from '../constants.js'
import { noop } from './utils/index.mjs'

/* global fetch */

const loaded = {
  js: new Set(),
  css: new Set(),
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
  elem.rel = 'stylesheet'
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
        src: `//${src.replace(/^https?:\/\//, '')}`,
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
            rel: 'preload',
            href: src,
            as: 'style',
          },
          action: {
            load: () => onLoadStylesheet(styleLink, resolve),
            error: () => reject(new Error(`${this.src} failed to load.`)),
          },
        })

        document.head.appendChild(styleLink)
      }),
  )

  return Promise.all(promises)
}

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
 * Inserts SVG icons into the document if they are not already present.
 *
 * @param {string} iconSvgStr - A string containing SVG icons.
 * @returns {HTMLElement} The element wrapping the inserted SVG icons.
 */
export const insertIcons = iconSvgStr => {
  let iconSpriteWrap = document.getElementById(formeoSpriteId)
  if (!iconSpriteWrap) {
    iconSpriteWrap = dom.create({
      id: formeoSpriteId,
      children: iconSvgStr,
      attrs: {
        hidden: true,
        style: 'display: none;',
      },
    })

    document.body.insertBefore(iconSpriteWrap, document.body.childNodes[0])
  }
  return iconSpriteWrap
}

/**
 * Fetches icons from the provided URL and inserts them into the document.
 * If the primary URL fails, it attempts to fetch from a fallback URL.
 *
 * @param {string} iconSpriteUrl - The URL to fetch the icon sprite from.
 * @returns {Promise<void>} A promise that resolves when the icons are fetched and inserted.
 */
export const fetchIcons = async (iconSpriteUrl = SVG_SPRITE_URL) => {
  const parseResp = async resp => insertIcons(await resp.text())
  return ajax(iconSpriteUrl, parseResp, () => ajax(FALLBACK_SVG_SPRITE_URL, parseResp))
}

export const loadPolyfills = polyfillConfig => {
  const polyfills = Array.isArray(polyfillConfig)
    ? POLYFILLS.filter(({ name }) => polyfillConfig.indexOf(name) !== -1)
    : POLYFILLS
  return Promise.all(polyfills.map(({ src }) => insertScript(src)))
}

export const LOADER_MAP = {
  js: insertScripts,
  css: insertStyles,
}

export const fetchDependencies = dependencies => {
  const promises = Object.entries(dependencies).map(([type, src]) => {
    return LOADER_MAP[type](src)
  })
  return Promise.all(promises)
}

export const isCssLoaded = () => {
  const formeoSprite = document.getElementById(formeoSpriteId)
  const computedStyle = window.getComputedStyle(formeoSprite)

  return computedStyle.visibility === 'hidden'
}

export const fetchFormeoStyle = async () => {
  // check if necessary styles were loaded
  if (!isCssLoaded()) {
    await insertStyle(CSS_URL)
    // check again and use fallback if necessary styles were not loaded
    if (!isCssLoaded()) {
      return await insertStyle(FALLBACK_CSS_URL)
    }
  }
}
