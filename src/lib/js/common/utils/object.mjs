import lodashSet from 'lodash/set.js'
import lodashGet from 'lodash/get.js'

export const get = lodashGet
export const set = lodashSet

/**
 * Empty an objects contents
 * @param  {Object} obj
 * @return {Object} fresh
 */
export const cleanObj = obj => {
  const fresh = { ...obj }
  const typeMap = {
    string: () => '',
    boolean: () => false,
    object: val => cleanObj(val),
  }

  Object.keys(obj).forEach(key => {
    const valType = typeof obj[key]
    if (typeMap[valType]) {
      fresh[key] = typeMap[valType](obj[key])
    }
  })

  return fresh
}

/**
 * Determines if a value should be cloned.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns `true` if the value is an object and not null, otherwise `false`.
 */
export function shouldClone(value) {
  return value !== null && typeof value === 'object'
}

/**
 * Deeply clones an object or array.
 *
 * This function recursively clones all nested objects and arrays within the provided object.
 * If the input is not an object or array, it returns the input as is.
 *
 * @param {Object|Array} obj - The object or array to be deeply cloned.
 * @returns {Object|Array} - A deep clone of the input object or array.
 */
export function deepClone(obj) {
  if (!shouldClone(obj)) return obj

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item))
  }

  const cloned = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}
