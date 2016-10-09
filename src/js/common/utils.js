const utils = {};

utils.match = (str, filter) => {
  let matchOperatorsRe = /[|\\{}()[\]^$+?.]/g,
  filterArray = (typeof filter === 'string') ? [filter] : filter;
  console.log(filterArray);
  filterArray = filterArray.map((filterStr) => {
    return filterStr === '*' ? '' : filterStr.replace(matchOperatorsRe, '\\$&');
  });

  return filterArray.length ? !str.match(new RegExp(filterArray.join('|'), 'i')) : true;
};

export default utils;
