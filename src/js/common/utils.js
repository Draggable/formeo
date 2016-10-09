const utils = {};


utils.match = (str, filter) => {
  let match = false,
  matchOperatorsRe = /[|\\{}()[\]^$+?.]/g,
  filterArray = (typeof filter === 'string') ? [filter] : filter;
  filterArray = filterArray.map((filterStr) => {
    return filterStr === '*' ? '' : filterStr.replace(matchOperatorsRe, '\\$&');
  });

  if (filterArray.length) {
    match = !str.match(new RegExp(filterArray.join('|'), 'i'));
  }

  return match;
};

export default utils;
