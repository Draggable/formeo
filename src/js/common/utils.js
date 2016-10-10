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
  let matchOperators = /[|\\{}()[\]^*$+?.]/g,
  filterArray = (typeof filter === 'string') ? [filter] : filter;
  filterArray = filterArray.map((filterStr) => {
    return filterStr === '*' ? '' : filterStr.replace(matchOperators, '\\$&');
  });

  return filterArray.length ? !str.match(new RegExp(filterArray.join('|'), 'i')) : true;
};

export default utils;
