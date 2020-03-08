'use strict'
import { unique } from './utils'
import lodashSet from 'lodash/set'
import lodashGet from 'lodash/get'
import lodashCamelCase from 'lodash/camelCase'
import lodashLowerCase from 'lodash/lowerCase'

/**
 * Tests if is whole number. returns false if n is Float
 * @param {String|Number} n
 */
export const isInt = n => Number.isInteger(Number(n))

/**
 * Finds the index of an element in its parent
 * @param {NodeElement} node
 * @param {NodeElement} parent
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
 * convert a hyphenated string to camelCase
 * @param  {String} str
 * @return {String} camelCase string
 */
export const camelCase = lodashCamelCase

/**
 * Convert camelCase into lowercase-hyphen
 *
 * @param  {String} str
 * @return {String} lowercase hyphenated string
 */
export const hyphenCase = str => lodashLowerCase(str).replace(/\s/g, '-')

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
export const subtract = (arr, from) => from.filter(a => !~arr.indexOf(a))

export const isIE = () => window.navigator.userAgent.indexOf('MSIE ') !== -1

export const helpers = {
  hyphenCase,
  capitalize,
  safeAttrName,
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
  isIE,
}

export default helpers
