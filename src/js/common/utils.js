const utils = {};

/**
 * Match the values from a string or array against a str.
 * @param  {String} str    String we are searching
 * @param  {String|Array}  filter String or array of values to match
 * @return {Boolean}        [description]
 */
utils.match = (str = '', filter) => {
  if (!filter) {
    console.warn('utils.match missing argument 2.');
    return false;
  }
  let matchOperators = /[|\\{}()[\]^*$+?.]/g;
  let filterArray = (typeof filter === 'string') ? [filter] : filter;
  filterArray = filterArray.map(filterStr => {
    return filterStr === '*' ? '' : filterStr.replace(matchOperators, '\\$&');
  });

  let isMatch = true;
  if (filterArray.length) {
    isMatch = !str.match(new RegExp(filterArray.join('|'), 'i'));
  }

  return isMatch;
};

/**
 * Removes a value from an array
 * @param  {Array} arr
 * @param  {String|Number} val
 */
export const remove = (arr, val) => {
  let index = arr.indexOf(val);

  if (index > -1) {
     arr.splice(index, 1);
  }
};

/**
 * Find the closest parent by class
 * @param  {Object} el  DOM element
 * @param  {String} cls class
 * @return {Object}     DOM Element
 */
export const closest = (el, cls) => {
  let className = cls.replace('.', '');
  while ((el = el.parentElement) && !el.classList.contains(className));
  return el;
};

export default utils;
