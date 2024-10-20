const toTitleCaseLowers =
  'a an and as at but by for for from in into near nor of on onto or the to with'
    .split(' ')
    .map(lower => `\\s${lower}\\s`)
const toTitleCaseRegex = new RegExp(
  `(?!${toTitleCaseLowers.join('|')})\\w\\S*`,
  'g',
)
const regexSpace = /\s+/g

/**
 * Converts a given string to title case.
 * 
 * @param {string} str - The string to be converted.
 * @returns {string} - The converted string in title case. If the input is not a string or contains spaces, it returns the original input.
 */
export function toTitleCase(str) {
  if (typeof str !== 'string') {
    return str
  }

  if (str.trim().match(regexSpace)) {
    return str
  }

  const newString = str.replace(
    toTitleCaseRegex,
    txt =>
      txt.charAt(0).toUpperCase() +
      txt.substring(1).replace(/[A-Z]/g, word => ` ${word}`),
  )
  return newString
}



/**
 * convert a string to camelCase
 * @param  {String} str
 * @return {String} camelCase string
 */
export const toCamelCase = str => {
  str = str.replace(/\s/g, '').replace(/[_-]+(\w)/g, (_m, w) => w.toUpperCase())
  return str.charAt(0).toLowerCase() + str.slice(1)
}


/**
 * Converts a string into a URL-friendly "slug" by normalizing, 
 * removing accents, converting to lowercase, trimming, and 
 * replacing spaces and invalid characters with a specified separator.
 *
 * @param {string} str - The string to be slugified.
 * @param {string} [separator='-'] - The separator to use for spaces and invalid characters.
 * @returns {string} - The slugified string.
 */
export const slugify = (str, separator = '-') =>
  str
    .toString()
    .normalize('NFD') // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, separator)
