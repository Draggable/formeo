import dom from './dom'
import { POLYFILLS } from '../constants'

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
        const formeoStyle = dom.create({
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

        document.head.appendChild(formeoStyle)
      })
  )

  return Promise.all(promises)
}

export const insertIcons = ({ responseText: children }) => {
  const id = 'formeo-sprite'
  const iconSpriteWrap = dom.create({
    tag: 'div',
    children,
    id,
  })
  iconSpriteWrap.style.display = 'none'
  const existingSprite = document.getElementById(id)
  if (existingSprite) {
    existingSprite.parentElement.replaceChild(iconSpriteWrap, existingSprite)
  } else {
    document.body.insertBefore(iconSpriteWrap, document.body.childNodes[0])
  }
}

export const loadPolyfills = polyfillConfig => {
  const polyfills = Array.isArray(polyfillConfig)
    ? POLYFILLS.filter(({ name }) => polyfillConfig.indexOf(name) !== -1)
    : POLYFILLS

  const promises = polyfills.map(({ src }) => insertScript(src))

  return Promise.all(promises)
}

export const ajax = (file, callback) => {
  return new Promise(function(resolve, reject) {
    const xhr = new window.XMLHttpRequest()
    xhr.open('GET', file, true)
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        callback(xhr)
        resolve(xhr.response)
      } else {
        reject(new Error(`status: ${this.status}: ${xhr.statusText}`))
      }
    }
    xhr.onerror = function() {
      reject(new Error(`status: ${this.status}: ${xhr.statusText}`))
    }
    xhr.send()
  })
}
