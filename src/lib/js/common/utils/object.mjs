/**
 * Retrieves the value at a given path within an object.
 *
 * @param {Object} obj - The object to query.
 * @param {string|string[]} pathArg - The path of the property to get. If a string is provided, it will be converted to an array.
 * @returns {*} - Returns the value at the specified path of the object.
 *
 * @example
 * const obj = { foo: [{ bar: 'baz' }] };
 * get(obj, 'foo[0].bar'); // 'baz'
 * get(obj, ['foo', '0', 'bar']); // 'baz'
 */
export function get(obj, pathArg) {
  let path = pathArg
  if (!Array.isArray(pathArg)) {
    /*
      If pathString is not an array, then this statement replaces any
      instances of `[<digit>]` with `.<digit>` using a regular expression
      (/\[(\d)\]/g) and then splits pathString into an array using the
      delimiter `.`. The g flag in the regex indicates that we want to
      replace all instances of [<digit>] (not just the first instance).
      We're doing this because the walker needs each path segment to be
      a valid dot notation property.

      For example, if we have a path string of 'foo[0].bar', we need to
      convert it to 'foo.0.bar' so that we can split it into an array
      of ['foo', '0', 'bar'].
     */
    path = pathArg.replace(/\[(\d)\]/g, '.$1').split('.')
  }

  return path.reduce((acc, part) => {
    const currentVal = acc[part]
    path.shift()
    if (Array.isArray(currentVal)) {
      const [nextPart] = path
      const nextPartIndex = Number(nextPart)
      path.shift()
      if (nextPart) {
        if (isNaN(nextPartIndex)) {
          return get(currentVal.map(aObj => aObj[nextPart]).flat(), path)
        }

        return get(obj[part][nextPartIndex], path)
      }

      return currentVal
    }

    if (!currentVal) {
      path.splice(0)
    }

    return get(currentVal, path)
  }, obj)
}

/**
 * Sets the value at the specified path of the object. If the path does not exist, it will be created.
 *
 * @param {Object} obj - The object to modify.
 * @param {string|string[]} pathArg - The path of the property to set. Can be a string with dot notation or an array of strings/numbers.
 * @param {*} value - The value to set at the specified path.
 */
export function set(obj, pathArg, value) {
  let path = pathArg
  if (!Array.isArray(pathArg)) {
    path = pathArg.replace(/\[(\d)\]/g, '.$1').split('.')
  }

  path.reduce((acc, part, index) => {
    if (index === path.length - 1) {
      acc[part] = value
    } else if (!acc[part] || typeof acc[part] !== 'object') {
      acc[part] = isNaN(Number(path[index + 1])) ? {} : []
    }
    return acc[part]
  }, obj)
}

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
