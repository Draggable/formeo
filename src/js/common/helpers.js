'use strict'
import dom from './dom'
import { unique } from './utils'
import set from 'lodash/set'
import merge from 'lodash/merge'

// eslint-disable-next-line
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g
const reEscapeChar = /\\(\\)?/g

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

const stringToPath = function(string) {
  let result = []
  if (Array.isArray(string)) {
    result = string
  } else {
    string.replace(rePropName, function(match, number, quote, string) {
      let segment
      if (quote) {
        segment = string.replace(reEscapeChar, '$1')
      } else {
        segment = number || match
      }
      result.push(segment)
    })
  }
  return result
}

export const helpers = {
  /**
   * Convert camelCase into lowercase-hyphen
   *
   * @param  {String} str
   * @return {String}
   */
  hyphenCase: str => {
    str = str.replace(/([A-Z])/g, function($1) {
      return '-' + $1.toLowerCase()
    })

    return str.replace(/\s/g, '-').replace(/^-+/g, '')
  },

  safeAttrName: name => {
    const safeAttr = {
      className: 'class',
    }

    return safeAttr[name] || helpers.hyphenCase(name)
  },
  insertScript: src => {
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

      // Resolve the promise once the script is loaded
      // script.addEventListener('load', )

      // Catch any errors while loading the script
      // script.addEventListener('error', () => reject(new Error(`${this.src} failed to load.`)))
    })
  },
  insertStyle,
  ajax: (file, callback) => {
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
  },
  insertIcons: response => {
    const id = 'formeo-sprite'
    const iconSpriteWrap = dom.create({
      tag: 'div',
      content: response.responseText,
      id,
    })
    iconSpriteWrap.style.display = 'none'
    const existingSprite = document.getElementById(id)
    if (existingSprite) {
      existingSprite.parentElement.replaceChild(iconSpriteWrap, existingSprite)
    } else {
      document.body.insertBefore(iconSpriteWrap, document.body.childNodes[0])
    }
  },
  capitalize: str => {
    return str.replace(/\b\w/g, function(m) {
      return m.toUpperCase()
    })
  },
  // nicer syntax for checking the existence of an element in an array
  inArray: (needle, haystack) => {
    return haystack.indexOf(needle) !== -1
  },
  // forEach that can be used on nodeList
  forEach: (array, callback, scope) => {
    for (let i = 0; i < array.length; i++) {
      callback.call(scope, array[i], i)
    }
  },
  // Expensive recursive object copy
  copyObj: obj => {
    return window.JSON.parse(window.JSON.stringify(obj))
  },

  // basic map that can be used on nodeList
  map: (arr, callback, scope) => {
    const newArray = []
    helpers.forEach(arr, (elem, i) => newArray.push(callback(i)))

    return newArray
  },
  subtract: (arr, from) => {
    return from.filter(function(a) {
      return !~this.indexOf(a)
    }, arr)
  },
  // find the index of one node in another
  indexOfNode: (node, parent) => {
    const parentElement = parent || node.parentElement
    const nodeList = Array.prototype.slice.call(parentElement.childNodes)
    return nodeList.indexOf(node)
  },
  // Tests if is whole number. returns false if n is Float
  isInt: n => {
    return Number(n) === n && n % 1 === 0
  },
  /**
   * get nested property value in an object
   *
   * @private
   * @param {Object} object The object to query.
   * @param {String} path The path of the property to get.
   * @return {String|Array|Object} Returns the resolved value.
   */
  get: (obj, path) => {
    path = Array.isArray(path) ? path : stringToPath(path)
    const val = path.reduce((acc, part) => {
      if (typeof acc === 'string') {
        return acc
      }
      return acc && acc[part]
    }, obj)
    return val
  },
  getIn: (map, path, fallback) => {
    const value = path.reduce((acc, part) => acc.get(), map)
    return value || (fallback && typeof fallback === 'function') ? fallback() : fallback
  },
  set, // use lodash set
  /**
   * Merge one object with another.
   * This is expensive, use as little as possible.
   * @param  {Object} obj1
   * @param  {Object} obj2
   * @return {Object}      merged object
   */
  merge,

  /**
   * Orders an array of objects by specific attribute
   * @param  {Array}  elements  Array of element objects
   * @param  {Array}  order     array of keys to order objects by
   * @param  {String} path      string path to property to order by
   * @return {Array}            Ordered Array of Element Objects
   */
  orderObjectsBy: (elements, order, path) => {
    const newOrder = unique(order)
      .map(key => elements.find(elem => helpers.get(elem, path) === key))
      .filter(Boolean)
    const orderedElements = newOrder.concat(elements)

    return unique(orderedElements)
  },
  detectIE: () => {
    let isIE = false // innocent until proven guilty
    const ua = window.navigator.userAgent
    const msie = ua.indexOf('MSIE ')
    if (msie > 0) {
      // IE 10 or older => return version number
      isIE = true
    }
    // other browser
    return isIE
  },
}

export default helpers
