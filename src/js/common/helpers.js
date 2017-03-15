'use strict';
import dom from './dom';
import deepExtend from 'deep-extend';
import {unique} from './utils';
/**
 * [memoize description]
 * @param  {[type]} func     [description]
 * @param  {[type]} resolver [description]
 * @return {[type]}          [description]
 */
function memoize(func, resolver) {
  if (typeof func !== 'function' ||
    (resolver && typeof resolver !== 'function')) {
    throw new TypeError('memoize: First argument must be a function');
  }
  const memoized = (...args) => {
    let key = resolver ? resolver.apply(memoized, args) : args[0];
    let cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    let result = func.apply(memoized, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new(memoize.Cache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = Map;

// eslint-disable-next-line
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g;
const reEscapeChar = /\\(\\)?/g;

const stringToPath = function(string) {
  let result = [];
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
};

const helpers = {

  /**
   * Convert camelCase into lowercase-hyphen
   *
   * @param  {String} str
   * @return {String}
   */
  hyphenCase: (str) => {
    str = str.replace(/([A-Z])/g, function($1) {
      return '-' + $1.toLowerCase();
    });

    return str.replace(/\s/g, '-').replace(/^-+/g, '');
  },
  safeAttrName: (name) => {
    let safeAttr = {
      className: 'class'
    };

    return safeAttr[name] || helpers.hyphenCase(name);
  },
  ajax: (file, callback) => {
    return new window.Promise(function(resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', file, true);
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          callback(xhr);
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function() {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  },
  insertIcons: response => {
    let iconSpriteWrap = dom.create({
      tag: 'div',
      content: response.responseText
    });
    iconSpriteWrap.style.display = 'none';
    document.body.insertBefore(iconSpriteWrap, document.body.childNodes[0]);
  },
  insertStyle: response => {
    let formeoStyle = dom.create({
      tag: 'style',
      content: response.responseText
    });
    document.head.appendChild(formeoStyle);
  },
  capitalize: str => {
    return str.replace(/\b\w/g, function(m) {
      return m.toUpperCase();
    });
  },
  // nicer syntax for checking the existence of an element in an array
  inArray: (needle, haystack) => {
    return haystack.indexOf(needle) !== -1;
  },
  // forEach that can be used on nodeList
  forEach: (array, callback, scope) => {
    for (let i = 0; i < array.length; i++) {
      callback.call(scope, i, array[i]);
    }
  },
  // Added because Object.assign is mutating objects.
  // Maybe a babel polyfill issue?
  copyObj: obj => {
    return (window.JSON.parse(window.JSON.stringify(obj)));
  },

  // basic map that can be used on nodeList
  map: (arr, callback, scope) => {
    let newArray = [];
    helpers.forEach(arr, i => newArray.push(callback(i)));

    return newArray;
  },
  subtract: (arr, from) => {
    return from.filter(function(a) {
      return !~this.indexOf(a);
    }, arr);
  },
  // find the index of one node in another
  indexOfNode: (node, parent) => {
    let parentElement = parent || node.parentElement;
    let nodeList = Array.prototype.slice.call(parentElement.childNodes);
    return nodeList.indexOf(node);
  },
  // Tests if is whole number. returns false if n is Float
  isInt: (n) => {
    return Number(n) === n && n % 1 === 0;
  },
  extend: (obj1, obj2) => {
    return deepExtend(obj1, obj2);
  },
  /**
   * get nested property value in an object
   *
   * @private
   * @param {Object} object The object to query.
   * @param {String} path The path of the property to get.
   * @return {String|Array|Object} Returns the resolved value.
   */
  get: (object, path) => {
    path = stringToPath(path);

    let index = 0;
    let length = path.length;

    while (object != null && index < length) {
      object = object[path[index++]];
    }

    return (index && index === length) ? object : undefined;
  },
  set: (object, path, value, customizer) => {
    path = stringToPath(path);

    let index = -1;
    let length = path.length;
    let lastIndex = length - 1;
    let nested = object;

    while (nested !== null && ++index < length) {
      let key = path[index];
      if (typeof nested === 'object') {
        let newValue = value;
        if (index !== lastIndex) {
          let objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : undefined;
          if (newValue === undefined) {
            newValue = objValue === null ? [] : objValue;
          }
        }

        if (!(hasOwnProperty.call(nested, key) && (nested[key] === newValue)) ||
          (newValue === undefined && !(key in nested))) {
          nested[key] = newValue;
        }
      }
      nested = nested[key];
    }

    return object;
  },
  /**
   * Merge one object with another.
   * This is expensive, use as little as possible.
   * @param  {Object} obj1
   * @param  {Object} obj2
   * @return {Object}      merged object
   */
  merge: (obj1, obj2) => {
    let mergedObj = Object.assign({}, obj1, obj2);
    for (let prop in obj2) {
      if (mergedObj.hasOwnProperty(prop)) {
        if (Array.isArray(obj2[prop])) {
          // eslint-disable-next-line
          mergedObj[prop] = Array.isArray(obj1[prop]) ? obj1[prop].concat(obj2[prop]) : obj2[prop];
        } else if (typeof obj2[prop] === 'object') {
          mergedObj[prop] = helpers.merge(obj1[prop], obj2[prop]);
        } else {
          mergedObj[prop] = obj2[prop];
        }
      }
    }
    return mergedObj;
  },

  /**
   * Orders an array of objects by specific attribute
   * @param  {Array}  elements  Array of element objects
   * @param  {Array}  order     array of keys to order objects by
   * @param  {String} path      string path to property to order by
   * @return {Array}            Ordered Array of Element Objects
   */
  orderObjectsBy: (elements, order, path) => {
    let objOrder = unique(order);
    const newOrder = objOrder.map(key => {
        return elements.filter(function(elem) {
          let propVal = helpers.get(elem, path);
          return propVal === key;
        })[0];
      }).filter(Boolean);
    let orderedElements = newOrder.concat(elements);

    return unique(orderedElements);
  },

  /**
   * Hide or show an Array or HTMLCollection of elements
   * @param  {Array} elems
   * @param  {String} term  match textContent to this term
   * @return {Array}        filtered elements
   */
  toggleElementsByStr: (elems, term) => {
    let filteredElems = [];
    helpers.forEach(elems, (i) => {
      let txt = elems[i].textContent.toLowerCase();
      if (txt.indexOf(term.toLowerCase()) !== -1) {
        elems[i].style.display = 'block';
        filteredElems.push(elems[i]);
      } else {
        elems[i].style.display = 'none';
      }
    });

    return filteredElems;
  }

};

export default helpers;
