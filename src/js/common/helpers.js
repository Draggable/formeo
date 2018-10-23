'use strict'
import dom from './dom'
import { unique } from './utils'
import lodashSet from 'lodash/set'
import lodashGet from 'lodash/get'

export const bsGridRegEx = /\bcol-\w+-\d+/g

const loaded = {
  js: [],
  css: [],
}

/**
 * Tests if is whole number. returns false if n is Float
 * @param {String|Number} n
 */
export const isInt = n => Number.isInteger(Number(n))

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
 * Orders an array of objects by specific attributes
 * @param  {Array}  elements  Array of element objects
 * @param  {Array}  order     array of keys to order objects by
 * @param  {String} path      string path to property to order by
 * @return {Array}            Ordered Array of Element Objects
 */
export const orderObjectsBy = (elements, order, path) => {
  // OR operator for path
  const splitPath = path.split('||')
  const newOrder = unique(order)
    .map(key =>
      elements.find(elem => {
        const newPath = splitPath.find(p => !!get(elem, p))
        return newPath && get(elem, newPath) === key
      })
    )
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
  })
}

export const get = lodashGet
export const set = lodashSet

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
  forEach(arr, (elem, i) => newArray.push(cb(elem, i)))

  return newArray
}

export const safeAttrName = name => {
  const safeAttr = {
    className: 'class',
  }

  return safeAttr[name] || hyphenCase(name)
}

export const capitalize = str => str.replace(/\b\w/g, m => m.toUpperCase())

// Expensive recursive object copy
export const copyObj = obj => window.JSON.parse(window.JSON.stringify(obj))

// subtract the contents of 1 array from another
export const subtract = (arr, from) => {
  return from.filter(function(a) {
    return !~this.indexOf(a)
  }, arr)
}

export const detectIE = () => {
  let isIE = false // innocent until proven guilty
  const ua = window.navigator.userAgent
  const msie = ua.indexOf('MSIE ')
  if (msie > 0) {
    // IE 10 or older => return version number
    isIE = true
  }
  // other browser
  return isIE
}

export const helpers = {
  hyphenCase,
  capitalize,
  safeAttrName,
  insertScript,
  forEach,
  copyObj,

  // basic map that can be used on nodeList
  map,
  subtract,
  indexOfNode,
  isInt,
  get,
  set,

  orderObjectsBy,
  detectIE,
}

export default helpers
