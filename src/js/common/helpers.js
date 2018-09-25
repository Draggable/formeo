'use strict'
import dom from './dom'
import { unique } from './utils'
import set from 'lodash/set'

// eslint-disable-next-line
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g
const reEscapeChar = /\\(\\)?/g
export const bsGridRegEx = /\bcol-\w+-\d+/g

const loaded = {
  js: [],
  css: [],
}

/**
 * Tests if is whole number. returns false if n is Float
 * @param {String|Number} n
 */
export const isInt = n => (Number(n) === n && n % 1 === 0) || n === '0'

/**
 * Finds the index of an element in its parent
 * @param {NodeElement} node
 * @param {NodeLement} parent
 */
export const indexOfNode = (node, parent) => {
  const parentElement = parent || node.parentElement
  const nodeList = Array.prototype.slice.call(parentElement.childNodes)
  return nodeList.indexOf(node)
}

/**
 * Orders an array of objects by specific attribute
 * @param  {Array}  elements  Array of element objects
 * @param  {Array}  order     array of keys to order objects by
 * @param  {String} path      string path to property to order by
 * @return {Array}            Ordered Array of Element Objects
 */
export const orderObjectsBy = (elements, order, path) => {
  const newOrder = unique(order)
    .map(key => elements.find(elem => helpers.get(elem, path) === key))
    .filter(Boolean)
  const orderedElements = newOrder.concat(elements)

  return unique(orderedElements)
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

/**
 * get nested property value in an object
 *
 * @private
 * @param {Object} object The object to query.
 * @param {String} path The path of the property to get.
 * @return {String|Array|Object} Returns the resolved value.
 */
export const get = (obj, path) => {
  path = Array.isArray(path) ? path : stringToPath(path)
  const val = path.reduce((acc, part) => {
    if (typeof acc === 'string') {
      return acc
    }
    return acc && acc[part]
  }, obj)
  return val
}

/**
 * @param {Array|NodeList} arr to be iterated
 * @param {Function} cb
 * @param {Context}
 */
export const forEach = (arr, cb, scope) => {
  for (let i = 0; i < arr.length; i++) {
    cb.call(scope, arr[i], i)
  }
}

/**
 * Convert camelCase into lowercase-hyphen
 *
 * @param  {String} str
 * @return {String}
 */
export const hyphenCase = str => {
  str = str.replace(/([A-Z])/g, $1 => `-${$1.toLowerCase()}`)

  return str.replace(/\s/g, '-').replace(/^-+/g, '')
}

/**
 * @param {Array|NodeList} arr to be iterated
 * @param {Function} cb
 * @return {Array} newArray
 */
export const map = (arr, cb) => {
  const newArray = []
  forEach(arr, (elem, i) => newArray.push(cb(i)))

  return newArray
}

export const helpers = {
  hyphenCase,

  safeAttrName: name => {
    const safeAttr = {
      className: 'class',
    }

    return safeAttr[name] || hyphenCase(name)
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
  capitalize: str => {
    return str.replace(/\b\w/g, function(m) {
      return m.toUpperCase()
    })
  },
  // nicer syntax for checking the existence of an element in an array
  inArray: (needle, haystack) => {
    return haystack.indexOf(needle) !== -1
  },
  forEach,
  // Expensive recursive object copy
  copyObj: obj => {
    return window.JSON.parse(window.JSON.stringify(obj))
  },

  // basic map that can be used on nodeList
  map,
  subtract: (arr, from) => {
    return from.filter(function(a) {
      return !~this.indexOf(a)
    }, arr)
  },
  indexOfNode,
  isInt,
  get,
  getIn: (map, path, fallback) => {
    const value = path.reduce((acc, part) => acc.get(), map)
    return value || (fallback && typeof fallback === 'function') ? fallback() : fallback
  },
  set, // use lodash set

  orderObjectsBy,
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
