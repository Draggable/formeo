import {
  COMPONENT_INDEX_TYPES,
  COMPONENT_TYPE_CLASSNAMES_REGEXP,
  COMPONENT_TYPE_CLASSNAMES_LOOKUP,
  CHILD_TYPE_MAP,
} from '../../constants.js'
import mergeWith from 'lodash/mergeWith.js'

const uuidv4 = () => crypto.randomUUID()

/**
 * Match the values from a string or array against a str.
 * @param  {String} str    String we are searching
 * @param  {String|Array}  filter String or array of values to match
 * @return {Boolean}        [description]
 */
export const match = (str = '', filter) => {
  if (!filter) {
    console.warn('utils.match missing argument 2.')
    return false
  }
  const matchOperators = /[|\\{}()[\]^*$+?.]/g
  let filterArray = typeof filter === 'string' ? [filter] : filter
  filterArray = filterArray.map(filterStr => {
    return filterStr === '*' ? '' : filterStr.replace(matchOperators, '\\$&')
  })

  let isMatch = true
  if (filterArray.length) {
    isMatch = !new RegExp(filterArray.join('|'), 'i').exec(str)
  }

  return isMatch
}

/**
 * Removes a value from an array
 * @param  {Array} arr
 * @param  {String|Number} val
 */
export const remove = (arr, val) => {
  const index = arr.indexOf(val)

  if (index !== -1) {
    arr.splice(index, 1)
  }
}

/**
 * Find the closest parent by class
 * @param  {Object} el  DOM element
 * @param  {String} cls class
 * @return {Object}     DOM Element
 */
export const closest = (el, cls) => {
  const className = cls.replace('.', '')
  while ((el = el.parentElement) && !el.classList.contains(className));
  return el
}

/**
 * Find the closest parent by class
 * @param  {Object} el  DOM element
 * @param  {String} cls class
 * @return {Object}     DOM Element
 */
export const closestFtype = el => {
  while ((el = el.parentElement) && !componentType(el));
  return el
}

/**
 * Determine component type
 * @param  {NodeElement} node
 * @return {String}     component type or undefined
 */
export const componentType = node => {
  const classMatch = node.className?.match(COMPONENT_TYPE_CLASSNAMES_REGEXP)
  return classMatch && COMPONENT_TYPE_CLASSNAMES_LOOKUP[classMatch[0]]
}

/**
 * Remove duplicates from an array of elements
 * @param  {Array} array with possible duplicates
 * @return {Array} array with only unique values
 */
export const unique = array => Array.from(new Set(array))

// Get or generate a uuid
export const uuid = elem => {
  let id
  if (elem) {
    const { attrs = {} } = elem
    id = attrs.id || elem.id || uuidv4()
    elem.id = id
  } else {
    id = uuidv4()
  }
  return id
}

/**
 * Merge one object with another.
 * This is expensive, use as little as possible.
 * @param  {Object} obj1
 * @param  {Object} obj2
 * @return {Object}      merged object
 */
export const merge = (obj1, obj2, opts = Object.create(null)) => {
  const customizer = (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      if (Array.isArray(srcValue)) {
        return unique(opts.mergeArray ? objValue.concat(srcValue) : srcValue)
      } else {
        return srcValue
      }
    }
  }
  return mergeWith({}, obj1, obj2, customizer)
}

export const clone = obj => {
  let copy

  const isPromise = obj instanceof Promise
  const isObject = typeof obj === 'object'

  // Handle the 4 simple types, and null or undefined
  if (obj === null || !isObject || isPromise) {
    return obj
  }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date()
    copy.setTime(obj.getTime())
    return copy
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = []
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i])
    }
    return copy
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {}
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = clone(obj[attr])
      }
    }

    return copy
  }

  debugger

  throw new Error('Unable to copy Object, type not supported.')
}

export const percent = (val, total) => (val / total) * 100

export const numToPercent = num => num.toString() + '%'

export const numberBetween = (num, min, max) => num > min && num < max

/**
 * Determine if an element was clicked or dragged. Handles firefox issue
 * where on dragstart and onclick both fire
 * @param {Number} x
 * @param {Number} y
 * @param {Object} position
 * @param {Number} button
 * @return {Boolean} clicked
 */
export const clicked = (x, y, position, button) => {
  const xMin = position.x - 5
  const xMax = position.x + 5
  const yMin = position.y - 5
  const yMax = position.y + 5
  const xOK = numberBetween(x, xMin, xMax)
  const yOK = numberBetween(y, yMin, yMax)

  return xOK && yOK && button !== 2
}

/**
 * Cache results of expensive functions
 * @param  {Function} fn
 * @param  {Function} resolver
 * @return {String|Object} memoized
 */
export const memoize = (fn, resolver) => {
  if (typeof fn !== 'function' || (resolver && typeof resolver !== 'function')) {
    throw new TypeError('memoize: First argument must be a function')
  }
  const memoized = (...args) => {
    const key = resolver ? resolver.apply(memoized, args) : args[0]
    const cache = memoized.cache

    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn.apply(memoized, args)
    memoized.cache = cache.set(key, result)
    return result
  }
  memoized.cache = new Map()
  return memoized
}

export const sessionStorage = Object.create(null, {
  get: {
    value: key => {
      const itemValue = window.sessionStorage && window.sessionStorage.getItem(key)
      try {
        return JSON.parse(itemValue)
      } catch (error) {
        console.error(error)
      }
    },
  },
  set: {
    value: (key, itemValue) => {
      try {
        return window.sessionStorage && window.sessionStorage.setItem(key, JSON.stringify(itemValue))
      } catch (error) {
        console.error(error)
      }
    },
  },
})

/**
 * Escape markup so it can be displayed rather than rendered
 * @param  {String} html markup
 * @return {String}      escaped html
 */
export const escapeHtml = html => {
  const escapeElement = document.createElement('textarea')
  escapeElement.textContent = html
  return escapeElement.innerHTML
}

/**
 * Test if a string is a formeo address
 * @param {String} str
 */
export const isAddress = str => COMPONENT_INDEX_TYPES.some(indexType => new RegExp(`^${indexType}.`).test(str))

/**
 * Test if a string is an external address
 * @param {String} str
 */
export const isExternalAddress = str => str.startsWith('external')

/**
 * Tests if key is for a boolean property
 * assumes property starts with is or has
 * @param {String} key
 */
export const isBoolKey = key => /^is|^has/.test(key)

export const typeIsChildOf = (childType, parentType) => CHILD_TYPE_MAP.get(parentType) === childType

/**
 * Creates a throttled function that only invokes the provided callback at most once per every limit milliseconds.
 *
 * @param {Function} callback - The function to throttle.
 * @param {number} limit - The number of milliseconds to throttle invocations to.
 * @returns {Function} - Returns the new throttled function.
 */
export function throttle(callback, limit) {
  let wait = false
  return function () {
    if (!wait) {
      callback(...arguments)
      wait = true
      const timeout = setTimeout(() => {
        wait = false
        clearTimeout(timeout)
      }, limit)
    }
  }
}

export function identity(value) {
  return value
}

export function noop() {
  // Do nothing
}