const utils = {};

utils.match = (str, filter) => {
  let matchOperators = /[|\\{}()[\]^*$+?.]/g,
  filterArray = (typeof filter === 'string') ? [filter] : filter;
  filterArray = filterArray.map((filterStr) => {
    return filterStr === '*' ? '' : filterStr.replace(matchOperators, '\\$&');
  });

  return filterArray.length ? !str.match(new RegExp(filterArray.join('|'), 'i')) : true;
};

export default utils;
