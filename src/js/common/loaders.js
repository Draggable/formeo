import noop from 'lodash/noop'
import dom from './dom'
import { POLYFILLS } from '../constants'

/* global fetch */

const loaded = {
  js: [],
  css: [],
}

export const insertScript = src => {
  return new Promise((resolve, reject) => {
    if (loaded.js.includes(src)) {
      return resolve(src)
    }

    // Create script element and set attributes
    const script = dom.create({
      tag: 'script',
      attrs: {
        type: 'text/javascript',
        async: true,
        src: `//${this.src}`,
      },
      action: {
        load: () => {
          loaded.js.push(src)
          resolve(src)
        },
        error: () => reject(new Error(`${this.src} failed to load.`)),
      },
    })

    // Append the script to the DOM
    const el = document.getElementsByTagName('script')[0]
    el.parentNode.insertBefore(script, el)
  })
}

export const insertStyle = srcs => {
  srcs = Array.isArray(srcs) ? srcs : [srcs]
  const promises = srcs.map(
    src =>
      new Promise((resolve, reject) => {
        if (loaded.css.includes(src)) {
          return resolve(src)
        }
        function onLoad() {
          this.removeEventListener('load', onLoad)
          this.rel = 'stylesheet'
          loaded.css.push(src)
          resolve(src)
        }
        const styleLink = dom.create({
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: src,
            as: 'style',
          },
          action: {
            load: onLoad,
            error: () => reject(new Error(`${this.src} failed to load.`)),
          },
        })

        document.head.appendChild(styleLink)
      })
  )

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
      .catch(err => reject(onError(err)))
  })
}
