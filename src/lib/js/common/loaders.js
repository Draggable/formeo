import dom from './dom.js'
import { POLYFILLS } from '../constants.js'
import { noop } from './utils/index.mjs'

/* global fetch */

const loaded = {
  js: new Set(),
  css: new Set(),
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

export const insertStyles = srcs => {
  srcs = Array.isArray(srcs) ? srcs : [srcs]
  const promises = srcs.map(src => insertStyle(src))
  return Promise.all(promises)
}

export const insertIcons = resp => {
  const spritePromise = typeof resp === 'string' ? Promise.resolve(resp) : resp.text()
  return spritePromise.then(iconSvgStr => {
    const id = 'formeo-sprite'
    let iconSpriteWrap = document.getElementById(id)
    if (!iconSpriteWrap) {
      iconSpriteWrap = dom.create({
        id,
        children: iconSvgStr,
        attrs: {
          hidden: true,
          style: 'display: none;',
        },
      })

      document.body.insertBefore(iconSpriteWrap, document.body.childNodes[0])
    }
    return iconSpriteWrap
  })
}

export const loadPolyfills = polyfillConfig => {
  const polyfills = Array.isArray(polyfillConfig)
    ? POLYFILLS.filter(({ name }) => polyfillConfig.indexOf(name) !== -1)
    : POLYFILLS
  return Promise.all(polyfills.map(({ src }) => insertScript(src)))
}

export const ajax = (file, callback, onError = noop) => {
  return new Promise((resolve, reject) => {
    return fetch(file)
      .then(data => resolve(callback ? callback(data) : data))
      .catch(err => reject(new Error(onError(err))))
  })
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
