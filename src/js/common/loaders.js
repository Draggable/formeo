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
          console.log(loaded.js)
          resolve(src)
        },
        error: () => reject(new Error(`${this.src} failed to load.`)),
      },
    })

    // Append the script to the DOM
    const el = document.getElementsByTagName('script')[0]
    el.parentNode.insertBefore(script, el)

    // Resolve the promise once the script is loaded
    // script.addEventListener('load', )

    // Catch any errors while loading the script
    // script.addEventListener('error', () => reject(new Error(`${this.src} failed to load.`)))
  })
}

export const insertStyle = src => {
  return new Promise((resolve, reject) => {
    const formeoStyle = dom.create({
      tag: 'link',
      attrs: {
        rel: 'preload',
        href: src,
        as: 'style',
        onload: "this.onload=null;this.rel='stylesheet'",
      },
    })

    document.head.appendChild(formeoStyle)

    resolve(src)
  })
}

export const loadPolyfills = polyfillConfig => {
  const polyfills = Array.isArray(polyfillConfig)
    ? POLYFILLS.filter(({ name }) => polyfillConfig.indexOf !== -1)
    : POLYFILLS

  const promises = polyfills.map(({ src }) => insertScript(src))

  return Promise.all(promises)
}
