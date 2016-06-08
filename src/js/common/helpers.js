'use strict';
import DOM from './dom';
import uuid from 'uuid-v4';
import deepExtend from 'deep-extend';
var dom = new DOM();

function memoize(func, resolver) {
  if (typeof func !== 'function' || (resolver && typeof resolver !== 'function')) {
    throw new TypeError('memoize: First argument must be a function');
  }
  var memoized = () => {
    var args = arguments,
      key = resolver ? resolver.apply(this, args) : args[0],
      cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new(memoize.Cache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = Map;

var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g;
var reEscapeChar = /\\(\\)?/g;

var stringToPath = function(string) {
  var result = [];
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
  loadIcons: function(file) {
    var ajax = new XMLHttpRequest();
    ajax.open('GET', file, true);
    ajax.send();
    ajax.onload = function() {
      if (ajax.status) {
        var iconSpriteWrap = dom.create({ tag: 'div', content: ajax.responseText });
        iconSpriteWrap.style.display = 'none';
        document.body.insertBefore(iconSpriteWrap, document.body.childNodes[0]);
      }
    };
  },
  uuid: function(elem) {
    if (elem) {
      if (!elem.id) {
        if (elem.attrs && elem.attrs.id) {
          elem.id = elem.attrs.id;
        } else {
          let tag = elem.tag || elem.localName;

          elem.id = uuid();
        }
      }
    } else {
      return uuid();
    }
  },
  capitalize: (str) => {
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
    for (var i = 0; i < array.length; i++) {
      callback.call(scope, i, array[i]);
    }
  },
  // Added because Object.assign is mutating objects.
  // Maybe a babel polyfill issue?
  copyObj: (obj) => {
    return (window.JSON.parse(window.JSON.stringify(obj)));
  },
  clone: (obj) => {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null === obj || 'object' != typeof obj) {
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
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = helpers.clone(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = helpers.clone(obj[attr]);
        }
      }
      return copy;
    }

    throw new Error('Unable to copy Object, type not supported.');
  },
  // basic map that can be used on nodeList
  map: (arr, callback, scope) => {
    let newArray = [],
      mapCallback = (i) => {
        newArray.push(callback(i));
      };

    helpers.forEach(arr, mapCallback);

    return newArray;
  },
  subtract: (arr, from) => {
    return from.filter(function(a) {
      return !~this.indexOf(a);
    }, arr);
  },
  // find the index of one node in another
  indexOfNode: (node, parent) => {
    let parentElement = parent || node.parentElement,
      nodeList = Array.prototype.slice.call(parentElement.childNodes);
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
   * @returns {*} Returns the resolved value.
   */
  get: (object, path) => {
    path = stringToPath(path);

    var index = 0,
      length = path.length;

    while (object != null && index < length) {
      object = object[path[index++]];
    }

    return (index && index === length) ? object : undefined;
  },
  set: (object, path, value, customizer) => {
    path = stringToPath(path);

    var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

    while (nested !== null && ++index < length) {
      var key = path[index];
      if (typeof nested === 'object') {
        var newValue = value;
        if (index !== lastIndex) {
          var objValue = nested[key];
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
   * Remove duplicates from an array of elements
   * @param  {array} arrArg array with possible duplicates
   * @return {array}        array with only unique values
   */
  unique: (array) => {
    return array.filter((elem, pos, arr) => {
      return arr.indexOf(elem) === pos;
    });
  },
  /**
   * Orders an array of objects by specific attribute
   *
   * @param  {Array}  elements  Array of element objects
   * @param  {Array}  order     array of keys to order objects by
   * @param  {String} path      string path to property to order by
   * @return {Array}            Ordered Array of Element Objects
   */
  orderObjectsBy: (elements, order, path) => {
    var objOrder = helpers.unique(order),
      newOrder = objOrder.map((key) => {
        return elements.filter(function(elem) {
          let propVal = helpers.get(elem, path);
          return propVal === key;
        })[0];
      }).filter(Boolean),
      orderedElements = newOrder.concat(elements);

    return helpers.unique(orderedElements);
  }
};

export default helpers;
