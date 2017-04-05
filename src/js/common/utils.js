import uuidv4 from 'uuid-v4';
/**
 * Match the values from a string or array against a str.
 * @param  {String} str    String we are searching
 * @param  {String|Array}  filter String or array of values to match
 * @return {Boolean}        [description]
 */
export const match = (str = '', filter) => {
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

/**
 * Find the closest parent by class
 * @param  {Object} el  DOM element
 * @param  {String} cls class
 * @return {Object}     DOM Element
 */
export const closestFtype = el => {
  while ((el = el.parentElement) && !el.fType);
  return el;
};

/**
 * Remove duplicates from an array of elements
 * @param  {Array} array with possible duplicates
 * @return {Array} array with only unique values
 */
export const unique = array =>
  array.filter((elem, pos, arr) =>
    (arr.indexOf(elem) === pos));

export const objToStrMap = obj => {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
};

export const strMapToObj = strMap => {
  let obj = Object.create(null);
  strMap.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
};

export const uuid = elem => {
  let id;
  if (elem) {
    let {attrs = {}} = elem;
    id = attrs.id || elem.id || uuidv4();
    elem.id = id;
  } else {
    id = uuidv4();
  }
  return id;
};


export const clone = obj => {
  let copy;

  // Handle the 4 simple types, and null or undefined
  if (null === obj || 'object' !== typeof obj) {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (let attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy;
  }

  throw new Error('Unable to copy Object, type not supported.');
};

export const numToPercent = num => num.toString() + '%';

export const numberBetween = (num, min, max) => (num > min && num < max);

/**
 * Empty an objects contents
 * @param  {Object} obj
 * @return {Object} fresh
 */
export const cleanObj = obj => {
  let fresh = Object.assign({}, obj);
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      fresh[key] = '';
    } else if (typeof obj[key] === 'boolean') {
      fresh[key] = false;
    }
  });
  return fresh;
};

export const clicked = (x, y, position, button) => {
  let xMin = position.x - 5;
  let xMax = position.x + 5;
  let yMin = position.y - 5;
  let yMax = position.y + 5;
  let xOK = numberBetween(x, xMin, xMax);
  let yOK = numberBetween(y, yMin, yMax);

  return (xOK && yOK && button !== 2);
};


/**
 * Cache results of expensive functions
 * @param  {Function} fn
 * @param  {Function} resolver
 * @return {String|Object} memoized
 */
export const memoize = (fn, resolver) => {
  if (typeof fn !== 'function' ||
    (resolver && typeof resolver !== 'function')) {
    throw new TypeError('memoize: First argument must be a function');
  }
  const memoized = (...args) => {
    let key = resolver ? resolver.apply(memoized, args) : args[0];
    let cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    let result = fn.apply(memoized, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new(memoize.Cache);
  return memoized;
};

// Assign cache to `_.memoize`.
memoize.Cache = Map;
