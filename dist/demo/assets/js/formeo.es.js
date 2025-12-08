
/**
formeo - https://formeo.io
Version: 4.2.4
Author: Draggable https://draggable.io
*/

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const handler = url.endsWith(".lang") ? "text" : "json";
    const data = await response[handler]();
    return data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    throw error;
  }
}
const DEFAULT_CONFIG$4 = {
  extension: ".lang",
  // local or remote directory containing language files
  location: "assets/lang/",
  // list of available locales, handy for populating selector.
  langs: ["en-US"],
  locale: "en-US",
  // init with user's preferred language
  override: {}
};
class I18N {
  /**
   * Process options and start the module
   * @param {Object} options
   */
  constructor(options = DEFAULT_CONFIG$4) {
    this.langs = /* @__PURE__ */ Object.create(null);
    this.loaded = [];
    this.processConfig(options);
  }
  /**
   * parse and format config
   * @param {Object} options
   */
  processConfig(options) {
    const { location, ...restOptions } = { ...DEFAULT_CONFIG$4, ...options };
    const parsedLocation = location.replace(/\/?$/, "/");
    this.config = { location: parsedLocation, ...restOptions };
    const { override, preloaded = {} } = this.config;
    const allLangs = Object.entries(this.langs).concat(Object.entries(override || preloaded));
    this.langs = allLangs.reduce((acc, [locale2, lang]) => {
      acc[locale2] = this.applyLanguage(locale2, lang);
      return acc;
    }, {});
    this.locale = this.config.locale || this.config.langs[0];
  }
  /**
   * Load language and set default
   * @param  {Object} options
   * @return {Promise}        resolves language
   */
  init(options) {
    this.processConfig({ ...this.config, ...options });
    return this.setCurrent(this.locale);
  }
  /**
   * Adds a language to the list of available languages
   * @param {String} locale
   * @param {String|Object} lang
   */
  addLanguage(locale2, lang = {}) {
    lang = typeof lang === "string" ? I18N.processFile(lang) : lang;
    this.applyLanguage(locale2, lang);
    this.config.langs.push("locale");
  }
  /**
   * get a string from a loaded language file
   * @param  {String} key  - the key for the string we are trying to retrieve
   * @param  {String} locale - locale to check for value
   * @return {String} language string or undefined
   */
  getValue(key, locale2 = this.locale) {
    var _a;
    const value = (_a = this.langs[locale2]) == null ? void 0 : _a[key];
    return value || this.getFallbackValue(key);
  }
  /**
   * Find a language that has desired key
   * @param {String} key value key
   * @return {String} found value or undefined
   */
  getFallbackValue(key) {
    const fallbackLang = Object.values(this.langs).find((lang) => lang[key]);
    return fallbackLang == null ? void 0 : fallbackLang[key];
  }
  /**
   * Escape variable syntax
   * @param  {String} str
   * @return {String}     escaped str
   */
  makeSafe(str) {
    const mapObj = {
      "{": "\\{",
      "}": "\\}",
      "|": "\\|"
    };
    str = str.replace(/[{}|]/g, (matched) => mapObj[matched]);
    return new RegExp(str, "g");
  }
  /**
   * Temporarily put a string into the currently loaded language
   * @param  {String} key
   * @param  {String} string
   * @return {String} string in current language
   */
  put(key, string) {
    this.current[key] = string;
    return string;
  }
  /**
   * Parse arguments for the requested string
   * @param  {String} key  the key we use to lookup our translation
   * @param  {multi}  args  string, number or object containing our arguments
   * @return {String}      updated string translation
   */
  get(key, args) {
    const _this = this;
    let value = this.getValue(key);
    if (!value) {
      return;
    }
    const tokens = value.match(/\{[^}]+?\}/g);
    if (args && tokens) {
      if ("object" === typeof args) {
        for (const token of tokens) {
          const key2 = token.substring(1, token.length - 1);
          value = value.replace(_this.makeSafe(token), args[key2] || "");
        }
      } else {
        value = value.replace(/\{[^}]+?\}/g, args);
      }
    }
    return value;
  }
  /**
   * Static method: Process a language file from raw text
   * @param  {String} response
   * @return {Object} processed language
   */
  static processFile(response) {
    return I18N.fromFile(response.replace(/\n\n/g, "\n"));
  }
  /**
   * Static method: Turn raw text from the language files into fancy JSON
   * @param  {String} rawText
   * @return {Object} converted language file
   */
  static fromFile(rawText) {
    const lines = rawText.split("\n");
    const lang = {};
    for (let matches2, i2 = 0; i2 < lines.length; i2++) {
      const regex = /^(.+?) *?= *?([^\n]+)/;
      matches2 = regex.exec(lines[i2]);
      if (matches2) {
        lang[matches2[1]] = matches2[2].replace(/(^\s+|\s+$)/g, "");
      }
    }
    return lang;
  }
  /**
   * Load a remotely stored language file
   * @param  {String} locale
   * @param  {Boolean} useCache
   * @return {Promise}       resolves response
   */
  loadLang(locale2, useCache = true) {
    const _this = this;
    return new Promise(function(resolve, reject) {
      if (_this.loaded.indexOf(locale2) !== -1 && useCache) {
        _this.applyLanguage(_this.langs[locale2]);
        return resolve(_this.langs[locale2]);
      } else {
        const langFile = [_this.config.location, locale2, _this.config.extension].join("");
        return fetchData(langFile).then((lang) => {
          const processedFile = I18N.processFile(lang);
          _this.applyLanguage(locale2, processedFile);
          _this.loaded.push(locale2);
          return resolve(_this.langs[locale2]);
        }).catch((err) => {
          console.error(err);
          const lang = _this.applyLanguage(locale2);
          resolve(lang);
        });
      }
    });
  }
  /**
   * applies overrides from config
   * @param {String} locale
   * @param {Object} lang
   * @return {Object} overriden language
   */
  applyLanguage(locale2, lang = {}) {
    const override = this.config.override[locale2] || {};
    const existingLang = this.langs[locale2] || {};
    this.langs[locale2] = { ...existingLang, ...lang, ...override };
    return this.langs[locale2];
  }
  /**
   * return currently available languages
   * @return {Object} all configured languages
   */
  get getLangs() {
    return this.config.langs;
  }
  /**
   * Attempt to set the current language to the local provided
   * @param {String}   locale
   * @return {Promise} language
   */
  async setCurrent(locale2 = "en-US") {
    await this.loadLang(locale2);
    this.locale = locale2;
    this.current = this.langs[locale2];
    return this.current;
  }
}
const mi18n = new I18N();
!(function() {
  try {
    if ("undefined" != typeof document) {
      var o = document.createElement("style");
      o.appendChild(document.createTextNode('._3x4ZIcu-{position:absolute;background:#1f2937;color:#fff;padding:.75rem;border-radius:.375rem;max-width:200px;z-index:50;visibility:hidden;opacity:0;transition:opacity .2s;pointer-events:none;left:0;top:0}._3x4ZIcu-.JIt36hCJ{visibility:visible;opacity:1;pointer-events:all}._3x4ZIcu-:before{content:"";position:absolute;width:0;height:0;border:6px solid transparent}._3x4ZIcu-[data-position=top]:before{border-top-color:#1f2937;bottom:-12px;left:50%;transform:translate(-50%)}._3x4ZIcu-[data-position=bottom]:before{border-bottom-color:#1f2937;top:-12px;left:50%;transform:translate(-50%)}._3x4ZIcu-[data-position=left]:before{border-left-color:#1f2937;right:-12px;top:50%;transform:translateY(-50%)}._3x4ZIcu-[data-position=right]:before{border-right-color:#1f2937;left:-12px;top:50%;transform:translateY(-50%)}._3x4ZIcu-[data-position=top-left]:before{border-top-color:#1f2937;bottom:-12px;left:12px;transform:none}._3x4ZIcu-[data-position=top-right]:before{border-top-color:#1f2937;bottom:-12px;right:12px;left:auto;transform:none}._3x4ZIcu-[data-position=bottom-left]:before{border-bottom-color:#1f2937;top:-12px;left:12px;transform:none}._3x4ZIcu-[data-position=bottom-right]:before{border-bottom-color:#1f2937;top:-12px;right:12px;left:auto;transform:none}')), document.head.appendChild(o);
    }
  } catch (t) {
    console.error("vite-plugin-css-injected-by-js", t);
  }
})();
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const tooltip = "_3x4ZIcu-";
const visible = "JIt36hCJ";
const styles = {
  tooltip,
  visible
};
const defaultOptions$1 = {
  triggerName: "tooltip"
};
class SmartTooltip {
  constructor(options = defaultOptions$1) {
    __publicField(this, "triggerName");
    __publicField(this, "tooltip");
    __publicField(this, "activeTriggerType", null);
    __publicField(this, "spacing", 12);
    __publicField(this, "handleClick", (e2) => {
      const triggerName = this.triggerName;
      const trigger = e2.target.closest(`[${triggerName}][${triggerName}-type="click"]`);
      if (trigger) {
        if (this.isVisible()) {
          this.hide();
        } else {
          const content = trigger.getAttribute(`${triggerName}`);
          this.show(trigger, content);
          this.activeTriggerType = "click";
        }
      } else {
        this.hide();
      }
    });
    __publicField(this, "handleMouseOver", (e2) => {
      const triggerName = this.triggerName;
      const trigger = e2.target.closest(`[${triggerName}]`);
      if (this.activeTriggerType !== "click" && (trigger == null ? void 0 : trigger.getAttribute(`${triggerName}-type`)) !== "click") {
        const content = trigger == null ? void 0 : trigger.getAttribute(`${triggerName}`);
        if (content) {
          this.show(trigger, content);
          this.activeTriggerType = "hover";
        }
      }
    });
    __publicField(this, "handleMouseOut", (e2) => {
      const triggerName = this.triggerName;
      const trigger = e2.target.closest(`[${triggerName}]`);
      if (this.activeTriggerType !== "click" && (trigger == null ? void 0 : trigger.getAttribute(`${triggerName}-type`)) !== "click") {
        this.hide();
      }
    });
    __publicField(this, "handleResize", () => {
      if (this.isVisible()) {
        this.hide();
      }
    });
    __publicField(this, "handleScroll", () => {
      if (this.isVisible()) {
        this.hide();
      }
    });
    this.triggerName = `data-${options.triggerName}`;
    this.tooltip = document.createElement("div");
    this.tooltip.className = `d-tooltip ${styles.tooltip}`;
    document.body.appendChild(this.tooltip);
    this.setupEventListeners();
  }
  setupEventListeners() {
    document.addEventListener("mouseover", this.handleMouseOver);
    document.addEventListener("mouseout", this.handleMouseOut);
    document.addEventListener("touchstart", this.handleMouseOver);
    document.addEventListener("touchend", this.handleMouseOut);
    document.addEventListener("click", this.handleClick);
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("scroll", this.handleScroll, true);
  }
  isVisible() {
    return this.tooltip.classList.contains(styles.visible);
  }
  /**
   * Calculates the optimal position for the tooltip relative to the trigger element.
   * It tries to find a position where the tooltip fits within the viewport.
   * If no position fits, it defaults to the first position in the list.
   *
   * @param {HTMLElement} trigger - The HTML element that triggers the tooltip.
   * @returns {Position} The calculated position for the tooltip.
   */
  calculatePosition(trigger) {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const positions = [
      {
        name: "top",
        x: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
        y: triggerRect.top - tooltipRect.height - this.spacing
      },
      {
        name: "bottom",
        x: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
        y: triggerRect.bottom + this.spacing
      },
      {
        name: "left",
        x: triggerRect.left - tooltipRect.width - this.spacing,
        y: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      },
      {
        name: "right",
        x: triggerRect.right + this.spacing,
        y: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      },
      // Corner positions
      {
        name: "top-left",
        x: triggerRect.left,
        y: triggerRect.top - tooltipRect.height - this.spacing
      },
      {
        name: "top-right",
        x: triggerRect.right - tooltipRect.width,
        y: triggerRect.top - tooltipRect.height - this.spacing
      },
      {
        name: "bottom-left",
        x: triggerRect.left,
        y: triggerRect.bottom + this.spacing
      },
      {
        name: "bottom-right",
        x: triggerRect.right - tooltipRect.width,
        y: triggerRect.bottom + this.spacing
      }
    ];
    return positions.find((pos) => this.fitsInViewport(pos, tooltipRect)) || positions[0];
  }
  /**
   * Checks if the tooltip fits within the viewport and is not obstructed by other elements.
   *
   * @param pos - The position of the tooltip.
   * @param tooltipRect - The bounding rectangle of the tooltip.
   * @returns `true` if the tooltip fits within the viewport and is not obstructed, otherwise `false`.
   */
  fitsInViewport(pos, tooltipRect) {
    const inViewport = pos.x >= 0 && pos.y >= 0 && pos.x + tooltipRect.width <= window.innerWidth && pos.y + tooltipRect.height <= window.innerHeight;
    if (!inViewport) return false;
    const points = [
      [pos.x, pos.y],
      // Top-left
      [pos.x + tooltipRect.width, pos.y],
      // Top-right
      [pos.x, pos.y + tooltipRect.height],
      // Bottom-left
      [pos.x + tooltipRect.width, pos.y + tooltipRect.height],
      // Bottom-right
      [pos.x + tooltipRect.width / 2, pos.y + tooltipRect.height / 2]
      // Center
    ];
    const elementsAtPoints = points.flatMap(([x, y]) => Array.from(document.elementsFromPoint(x, y)));
    const obstructingElements = elementsAtPoints.filter((element) => {
      if (this.tooltip.contains(element) || // Exclude tooltip and its children
      element === this.tooltip || element.classList.contains(styles.tooltip) || // Ignore other tooltips
      getComputedStyle(element).pointerEvents === "none") {
        return false;
      }
    });
    return obstructingElements.length === 0;
  }
  show(trigger, content) {
    this.tooltip.innerHTML = content ?? "";
    this.tooltip.classList.add(styles.visible);
    const position = this.calculatePosition(trigger);
    this.tooltip.style.left = `${position.x}px`;
    this.tooltip.style.top = `${position.y}px`;
    this.tooltip.dataset.position = position.name;
  }
  hide() {
    this.tooltip.classList.remove(styles.visible);
    this.activeTriggerType = null;
  }
  destroy() {
    document.removeEventListener("mouseover", this.handleMouseOver);
    document.removeEventListener("mouseout", this.handleMouseOut);
    document.removeEventListener("touchstart", this.handleMouseOver);
    document.removeEventListener("touchend", this.handleMouseOut);
    document.removeEventListener("click", this.handleClick);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("scroll", this.handleScroll, true);
    this.tooltip.remove();
  }
}
if (window !== void 0) {
  window.SmartTooltip = SmartTooltip;
}
const name$1 = "formeo";
const version$2 = "4.2.4";
const pkg = {
  name: name$1,
  version: version$2
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var _listCacheClear;
var hasRequired_listCacheClear;
function require_listCacheClear() {
  if (hasRequired_listCacheClear) return _listCacheClear;
  hasRequired_listCacheClear = 1;
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  _listCacheClear = listCacheClear;
  return _listCacheClear;
}
var eq_1;
var hasRequiredEq;
function requireEq() {
  if (hasRequiredEq) return eq_1;
  hasRequiredEq = 1;
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  eq_1 = eq;
  return eq_1;
}
var _assocIndexOf;
var hasRequired_assocIndexOf;
function require_assocIndexOf() {
  if (hasRequired_assocIndexOf) return _assocIndexOf;
  hasRequired_assocIndexOf = 1;
  var eq = requireEq();
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  _assocIndexOf = assocIndexOf;
  return _assocIndexOf;
}
var _listCacheDelete;
var hasRequired_listCacheDelete;
function require_listCacheDelete() {
  if (hasRequired_listCacheDelete) return _listCacheDelete;
  hasRequired_listCacheDelete = 1;
  var assocIndexOf = require_assocIndexOf();
  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__, index2 = assocIndexOf(data, key);
    if (index2 < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index2 == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index2, 1);
    }
    --this.size;
    return true;
  }
  _listCacheDelete = listCacheDelete;
  return _listCacheDelete;
}
var _listCacheGet;
var hasRequired_listCacheGet;
function require_listCacheGet() {
  if (hasRequired_listCacheGet) return _listCacheGet;
  hasRequired_listCacheGet = 1;
  var assocIndexOf = require_assocIndexOf();
  function listCacheGet(key) {
    var data = this.__data__, index2 = assocIndexOf(data, key);
    return index2 < 0 ? void 0 : data[index2][1];
  }
  _listCacheGet = listCacheGet;
  return _listCacheGet;
}
var _listCacheHas;
var hasRequired_listCacheHas;
function require_listCacheHas() {
  if (hasRequired_listCacheHas) return _listCacheHas;
  hasRequired_listCacheHas = 1;
  var assocIndexOf = require_assocIndexOf();
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  _listCacheHas = listCacheHas;
  return _listCacheHas;
}
var _listCacheSet;
var hasRequired_listCacheSet;
function require_listCacheSet() {
  if (hasRequired_listCacheSet) return _listCacheSet;
  hasRequired_listCacheSet = 1;
  var assocIndexOf = require_assocIndexOf();
  function listCacheSet(key, value) {
    var data = this.__data__, index2 = assocIndexOf(data, key);
    if (index2 < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index2][1] = value;
    }
    return this;
  }
  _listCacheSet = listCacheSet;
  return _listCacheSet;
}
var _ListCache;
var hasRequired_ListCache;
function require_ListCache() {
  if (hasRequired_ListCache) return _ListCache;
  hasRequired_ListCache = 1;
  var listCacheClear = require_listCacheClear(), listCacheDelete = require_listCacheDelete(), listCacheGet = require_listCacheGet(), listCacheHas = require_listCacheHas(), listCacheSet = require_listCacheSet();
  function ListCache(entries) {
    var index2 = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index2 < length) {
      var entry = entries[index2];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  _ListCache = ListCache;
  return _ListCache;
}
var _stackClear;
var hasRequired_stackClear;
function require_stackClear() {
  if (hasRequired_stackClear) return _stackClear;
  hasRequired_stackClear = 1;
  var ListCache = require_ListCache();
  function stackClear() {
    this.__data__ = new ListCache();
    this.size = 0;
  }
  _stackClear = stackClear;
  return _stackClear;
}
var _stackDelete;
var hasRequired_stackDelete;
function require_stackDelete() {
  if (hasRequired_stackDelete) return _stackDelete;
  hasRequired_stackDelete = 1;
  function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
  }
  _stackDelete = stackDelete;
  return _stackDelete;
}
var _stackGet;
var hasRequired_stackGet;
function require_stackGet() {
  if (hasRequired_stackGet) return _stackGet;
  hasRequired_stackGet = 1;
  function stackGet(key) {
    return this.__data__.get(key);
  }
  _stackGet = stackGet;
  return _stackGet;
}
var _stackHas;
var hasRequired_stackHas;
function require_stackHas() {
  if (hasRequired_stackHas) return _stackHas;
  hasRequired_stackHas = 1;
  function stackHas(key) {
    return this.__data__.has(key);
  }
  _stackHas = stackHas;
  return _stackHas;
}
var _freeGlobal;
var hasRequired_freeGlobal;
function require_freeGlobal() {
  if (hasRequired_freeGlobal) return _freeGlobal;
  hasRequired_freeGlobal = 1;
  var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  _freeGlobal = freeGlobal;
  return _freeGlobal;
}
var _root;
var hasRequired_root;
function require_root() {
  if (hasRequired_root) return _root;
  hasRequired_root = 1;
  var freeGlobal = require_freeGlobal();
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  _root = root;
  return _root;
}
var _Symbol;
var hasRequired_Symbol;
function require_Symbol() {
  if (hasRequired_Symbol) return _Symbol;
  hasRequired_Symbol = 1;
  var root = require_root();
  var Symbol2 = root.Symbol;
  _Symbol = Symbol2;
  return _Symbol;
}
var _getRawTag;
var hasRequired_getRawTag;
function require_getRawTag() {
  if (hasRequired_getRawTag) return _getRawTag;
  hasRequired_getRawTag = 1;
  var Symbol2 = require_Symbol();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = void 0;
      var unmasked = true;
    } catch (e2) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  _getRawTag = getRawTag;
  return _getRawTag;
}
var _objectToString;
var hasRequired_objectToString;
function require_objectToString() {
  if (hasRequired_objectToString) return _objectToString;
  hasRequired_objectToString = 1;
  var objectProto = Object.prototype;
  var nativeObjectToString = objectProto.toString;
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }
  _objectToString = objectToString;
  return _objectToString;
}
var _baseGetTag;
var hasRequired_baseGetTag;
function require_baseGetTag() {
  if (hasRequired_baseGetTag) return _baseGetTag;
  hasRequired_baseGetTag = 1;
  var Symbol2 = require_Symbol(), getRawTag = require_getRawTag(), objectToString = require_objectToString();
  var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
  var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  _baseGetTag = baseGetTag;
  return _baseGetTag;
}
var isObject_1;
var hasRequiredIsObject;
function requireIsObject() {
  if (hasRequiredIsObject) return isObject_1;
  hasRequiredIsObject = 1;
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  isObject_1 = isObject;
  return isObject_1;
}
var isFunction_1;
var hasRequiredIsFunction;
function requireIsFunction() {
  if (hasRequiredIsFunction) return isFunction_1;
  hasRequiredIsFunction = 1;
  var baseGetTag = require_baseGetTag(), isObject = requireIsObject();
  var asyncTag = "[object AsyncFunction]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  isFunction_1 = isFunction;
  return isFunction_1;
}
var _coreJsData;
var hasRequired_coreJsData;
function require_coreJsData() {
  if (hasRequired_coreJsData) return _coreJsData;
  hasRequired_coreJsData = 1;
  var root = require_root();
  var coreJsData = root["__core-js_shared__"];
  _coreJsData = coreJsData;
  return _coreJsData;
}
var _isMasked;
var hasRequired_isMasked;
function require_isMasked() {
  if (hasRequired_isMasked) return _isMasked;
  hasRequired_isMasked = 1;
  var coreJsData = require_coreJsData();
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  })();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  _isMasked = isMasked;
  return _isMasked;
}
var _toSource;
var hasRequired_toSource;
function require_toSource() {
  if (hasRequired_toSource) return _toSource;
  hasRequired_toSource = 1;
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e2) {
      }
      try {
        return func + "";
      } catch (e2) {
      }
    }
    return "";
  }
  _toSource = toSource;
  return _toSource;
}
var _baseIsNative;
var hasRequired_baseIsNative;
function require_baseIsNative() {
  if (hasRequired_baseIsNative) return _baseIsNative;
  hasRequired_baseIsNative = 1;
  var isFunction = requireIsFunction(), isMasked = require_isMasked(), isObject = requireIsObject(), toSource = require_toSource();
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto = Function.prototype, objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var reIsNative = RegExp(
    "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  );
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  _baseIsNative = baseIsNative;
  return _baseIsNative;
}
var _getValue;
var hasRequired_getValue;
function require_getValue() {
  if (hasRequired_getValue) return _getValue;
  hasRequired_getValue = 1;
  function getValue(object, key) {
    return object == null ? void 0 : object[key];
  }
  _getValue = getValue;
  return _getValue;
}
var _getNative;
var hasRequired_getNative;
function require_getNative() {
  if (hasRequired_getNative) return _getNative;
  hasRequired_getNative = 1;
  var baseIsNative = require_baseIsNative(), getValue = require_getValue();
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : void 0;
  }
  _getNative = getNative;
  return _getNative;
}
var _Map;
var hasRequired_Map;
function require_Map() {
  if (hasRequired_Map) return _Map;
  hasRequired_Map = 1;
  var getNative = require_getNative(), root = require_root();
  var Map2 = getNative(root, "Map");
  _Map = Map2;
  return _Map;
}
var _nativeCreate;
var hasRequired_nativeCreate;
function require_nativeCreate() {
  if (hasRequired_nativeCreate) return _nativeCreate;
  hasRequired_nativeCreate = 1;
  var getNative = require_getNative();
  var nativeCreate = getNative(Object, "create");
  _nativeCreate = nativeCreate;
  return _nativeCreate;
}
var _hashClear;
var hasRequired_hashClear;
function require_hashClear() {
  if (hasRequired_hashClear) return _hashClear;
  hasRequired_hashClear = 1;
  var nativeCreate = require_nativeCreate();
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }
  _hashClear = hashClear;
  return _hashClear;
}
var _hashDelete;
var hasRequired_hashDelete;
function require_hashDelete() {
  if (hasRequired_hashDelete) return _hashDelete;
  hasRequired_hashDelete = 1;
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  _hashDelete = hashDelete;
  return _hashDelete;
}
var _hashGet;
var hasRequired_hashGet;
function require_hashGet() {
  if (hasRequired_hashGet) return _hashGet;
  hasRequired_hashGet = 1;
  var nativeCreate = require_nativeCreate();
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : void 0;
  }
  _hashGet = hashGet;
  return _hashGet;
}
var _hashHas;
var hasRequired_hashHas;
function require_hashHas() {
  if (hasRequired_hashHas) return _hashHas;
  hasRequired_hashHas = 1;
  var nativeCreate = require_nativeCreate();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
  }
  _hashHas = hashHas;
  return _hashHas;
}
var _hashSet;
var hasRequired_hashSet;
function require_hashSet() {
  if (hasRequired_hashSet) return _hashSet;
  hasRequired_hashSet = 1;
  var nativeCreate = require_nativeCreate();
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
    return this;
  }
  _hashSet = hashSet;
  return _hashSet;
}
var _Hash;
var hasRequired_Hash;
function require_Hash() {
  if (hasRequired_Hash) return _Hash;
  hasRequired_Hash = 1;
  var hashClear = require_hashClear(), hashDelete = require_hashDelete(), hashGet = require_hashGet(), hashHas = require_hashHas(), hashSet = require_hashSet();
  function Hash(entries) {
    var index2 = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index2 < length) {
      var entry = entries[index2];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  _Hash = Hash;
  return _Hash;
}
var _mapCacheClear;
var hasRequired_mapCacheClear;
function require_mapCacheClear() {
  if (hasRequired_mapCacheClear) return _mapCacheClear;
  hasRequired_mapCacheClear = 1;
  var Hash = require_Hash(), ListCache = require_ListCache(), Map2 = require_Map();
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      "hash": new Hash(),
      "map": new (Map2 || ListCache)(),
      "string": new Hash()
    };
  }
  _mapCacheClear = mapCacheClear;
  return _mapCacheClear;
}
var _isKeyable;
var hasRequired_isKeyable;
function require_isKeyable() {
  if (hasRequired_isKeyable) return _isKeyable;
  hasRequired_isKeyable = 1;
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  _isKeyable = isKeyable;
  return _isKeyable;
}
var _getMapData;
var hasRequired_getMapData;
function require_getMapData() {
  if (hasRequired_getMapData) return _getMapData;
  hasRequired_getMapData = 1;
  var isKeyable = require_isKeyable();
  function getMapData(map2, key) {
    var data = map2.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  _getMapData = getMapData;
  return _getMapData;
}
var _mapCacheDelete;
var hasRequired_mapCacheDelete;
function require_mapCacheDelete() {
  if (hasRequired_mapCacheDelete) return _mapCacheDelete;
  hasRequired_mapCacheDelete = 1;
  var getMapData = require_getMapData();
  function mapCacheDelete(key) {
    var result = getMapData(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  _mapCacheDelete = mapCacheDelete;
  return _mapCacheDelete;
}
var _mapCacheGet;
var hasRequired_mapCacheGet;
function require_mapCacheGet() {
  if (hasRequired_mapCacheGet) return _mapCacheGet;
  hasRequired_mapCacheGet = 1;
  var getMapData = require_getMapData();
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  _mapCacheGet = mapCacheGet;
  return _mapCacheGet;
}
var _mapCacheHas;
var hasRequired_mapCacheHas;
function require_mapCacheHas() {
  if (hasRequired_mapCacheHas) return _mapCacheHas;
  hasRequired_mapCacheHas = 1;
  var getMapData = require_getMapData();
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  _mapCacheHas = mapCacheHas;
  return _mapCacheHas;
}
var _mapCacheSet;
var hasRequired_mapCacheSet;
function require_mapCacheSet() {
  if (hasRequired_mapCacheSet) return _mapCacheSet;
  hasRequired_mapCacheSet = 1;
  var getMapData = require_getMapData();
  function mapCacheSet(key, value) {
    var data = getMapData(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  _mapCacheSet = mapCacheSet;
  return _mapCacheSet;
}
var _MapCache;
var hasRequired_MapCache;
function require_MapCache() {
  if (hasRequired_MapCache) return _MapCache;
  hasRequired_MapCache = 1;
  var mapCacheClear = require_mapCacheClear(), mapCacheDelete = require_mapCacheDelete(), mapCacheGet = require_mapCacheGet(), mapCacheHas = require_mapCacheHas(), mapCacheSet = require_mapCacheSet();
  function MapCache(entries) {
    var index2 = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index2 < length) {
      var entry = entries[index2];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  _MapCache = MapCache;
  return _MapCache;
}
var _stackSet;
var hasRequired_stackSet;
function require_stackSet() {
  if (hasRequired_stackSet) return _stackSet;
  hasRequired_stackSet = 1;
  var ListCache = require_ListCache(), Map2 = require_Map(), MapCache = require_MapCache();
  var LARGE_ARRAY_SIZE = 200;
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  _stackSet = stackSet;
  return _stackSet;
}
var _Stack;
var hasRequired_Stack;
function require_Stack() {
  if (hasRequired_Stack) return _Stack;
  hasRequired_Stack = 1;
  var ListCache = require_ListCache(), stackClear = require_stackClear(), stackDelete = require_stackDelete(), stackGet = require_stackGet(), stackHas = require_stackHas(), stackSet = require_stackSet();
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }
  Stack.prototype.clear = stackClear;
  Stack.prototype["delete"] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;
  _Stack = Stack;
  return _Stack;
}
var _defineProperty$1;
var hasRequired_defineProperty;
function require_defineProperty() {
  if (hasRequired_defineProperty) return _defineProperty$1;
  hasRequired_defineProperty = 1;
  var getNative = require_getNative();
  var defineProperty = (function() {
    try {
      var func = getNative(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e2) {
    }
  })();
  _defineProperty$1 = defineProperty;
  return _defineProperty$1;
}
var _baseAssignValue;
var hasRequired_baseAssignValue;
function require_baseAssignValue() {
  if (hasRequired_baseAssignValue) return _baseAssignValue;
  hasRequired_baseAssignValue = 1;
  var defineProperty = require_defineProperty();
  function baseAssignValue(object, key, value) {
    if (key == "__proto__" && defineProperty) {
      defineProperty(object, key, {
        "configurable": true,
        "enumerable": true,
        "value": value,
        "writable": true
      });
    } else {
      object[key] = value;
    }
  }
  _baseAssignValue = baseAssignValue;
  return _baseAssignValue;
}
var _assignMergeValue;
var hasRequired_assignMergeValue;
function require_assignMergeValue() {
  if (hasRequired_assignMergeValue) return _assignMergeValue;
  hasRequired_assignMergeValue = 1;
  var baseAssignValue = require_baseAssignValue(), eq = requireEq();
  function assignMergeValue(object, key, value) {
    if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
      baseAssignValue(object, key, value);
    }
  }
  _assignMergeValue = assignMergeValue;
  return _assignMergeValue;
}
var _createBaseFor;
var hasRequired_createBaseFor;
function require_createBaseFor() {
  if (hasRequired_createBaseFor) return _createBaseFor;
  hasRequired_createBaseFor = 1;
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index2 = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
      while (length--) {
        var key = props[fromRight ? length : ++index2];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }
  _createBaseFor = createBaseFor;
  return _createBaseFor;
}
var _baseFor;
var hasRequired_baseFor;
function require_baseFor() {
  if (hasRequired_baseFor) return _baseFor;
  hasRequired_baseFor = 1;
  var createBaseFor = require_createBaseFor();
  var baseFor = createBaseFor();
  _baseFor = baseFor;
  return _baseFor;
}
var _cloneBuffer = { exports: {} };
_cloneBuffer.exports;
var hasRequired_cloneBuffer;
function require_cloneBuffer() {
  if (hasRequired_cloneBuffer) return _cloneBuffer.exports;
  hasRequired_cloneBuffer = 1;
  (function(module, exports) {
    var root = require_root();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : void 0, allocUnsafe = Buffer ? Buffer.allocUnsafe : void 0;
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    module.exports = cloneBuffer;
  })(_cloneBuffer, _cloneBuffer.exports);
  return _cloneBuffer.exports;
}
var _Uint8Array;
var hasRequired_Uint8Array;
function require_Uint8Array() {
  if (hasRequired_Uint8Array) return _Uint8Array;
  hasRequired_Uint8Array = 1;
  var root = require_root();
  var Uint8Array = root.Uint8Array;
  _Uint8Array = Uint8Array;
  return _Uint8Array;
}
var _cloneArrayBuffer;
var hasRequired_cloneArrayBuffer;
function require_cloneArrayBuffer() {
  if (hasRequired_cloneArrayBuffer) return _cloneArrayBuffer;
  hasRequired_cloneArrayBuffer = 1;
  var Uint8Array = require_Uint8Array();
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array(result).set(new Uint8Array(arrayBuffer));
    return result;
  }
  _cloneArrayBuffer = cloneArrayBuffer;
  return _cloneArrayBuffer;
}
var _cloneTypedArray;
var hasRequired_cloneTypedArray;
function require_cloneTypedArray() {
  if (hasRequired_cloneTypedArray) return _cloneTypedArray;
  hasRequired_cloneTypedArray = 1;
  var cloneArrayBuffer = require_cloneArrayBuffer();
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }
  _cloneTypedArray = cloneTypedArray;
  return _cloneTypedArray;
}
var _copyArray;
var hasRequired_copyArray;
function require_copyArray() {
  if (hasRequired_copyArray) return _copyArray;
  hasRequired_copyArray = 1;
  function copyArray(source, array) {
    var index2 = -1, length = source.length;
    array || (array = Array(length));
    while (++index2 < length) {
      array[index2] = source[index2];
    }
    return array;
  }
  _copyArray = copyArray;
  return _copyArray;
}
var _baseCreate;
var hasRequired_baseCreate;
function require_baseCreate() {
  if (hasRequired_baseCreate) return _baseCreate;
  hasRequired_baseCreate = 1;
  var isObject = requireIsObject();
  var objectCreate = Object.create;
  var baseCreate = /* @__PURE__ */ (function() {
    function object() {
    }
    return function(proto) {
      if (!isObject(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object();
      object.prototype = void 0;
      return result;
    };
  })();
  _baseCreate = baseCreate;
  return _baseCreate;
}
var _overArg;
var hasRequired_overArg;
function require_overArg() {
  if (hasRequired_overArg) return _overArg;
  hasRequired_overArg = 1;
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  _overArg = overArg;
  return _overArg;
}
var _getPrototype;
var hasRequired_getPrototype;
function require_getPrototype() {
  if (hasRequired_getPrototype) return _getPrototype;
  hasRequired_getPrototype = 1;
  var overArg = require_overArg();
  var getPrototype = overArg(Object.getPrototypeOf, Object);
  _getPrototype = getPrototype;
  return _getPrototype;
}
var _isPrototype;
var hasRequired_isPrototype;
function require_isPrototype() {
  if (hasRequired_isPrototype) return _isPrototype;
  hasRequired_isPrototype = 1;
  var objectProto = Object.prototype;
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
    return value === proto;
  }
  _isPrototype = isPrototype;
  return _isPrototype;
}
var _initCloneObject;
var hasRequired_initCloneObject;
function require_initCloneObject() {
  if (hasRequired_initCloneObject) return _initCloneObject;
  hasRequired_initCloneObject = 1;
  var baseCreate = require_baseCreate(), getPrototype = require_getPrototype(), isPrototype = require_isPrototype();
  function initCloneObject(object) {
    return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
  }
  _initCloneObject = initCloneObject;
  return _initCloneObject;
}
var isObjectLike_1;
var hasRequiredIsObjectLike;
function requireIsObjectLike() {
  if (hasRequiredIsObjectLike) return isObjectLike_1;
  hasRequiredIsObjectLike = 1;
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  isObjectLike_1 = isObjectLike;
  return isObjectLike_1;
}
var _baseIsArguments;
var hasRequired_baseIsArguments;
function require_baseIsArguments() {
  if (hasRequired_baseIsArguments) return _baseIsArguments;
  hasRequired_baseIsArguments = 1;
  var baseGetTag = require_baseGetTag(), isObjectLike = requireIsObjectLike();
  var argsTag = "[object Arguments]";
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }
  _baseIsArguments = baseIsArguments;
  return _baseIsArguments;
}
var isArguments_1;
var hasRequiredIsArguments;
function requireIsArguments() {
  if (hasRequiredIsArguments) return isArguments_1;
  hasRequiredIsArguments = 1;
  var baseIsArguments = require_baseIsArguments(), isObjectLike = requireIsObjectLike();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
    return arguments;
  })()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  isArguments_1 = isArguments;
  return isArguments_1;
}
var isArray_1;
var hasRequiredIsArray;
function requireIsArray() {
  if (hasRequiredIsArray) return isArray_1;
  hasRequiredIsArray = 1;
  var isArray = Array.isArray;
  isArray_1 = isArray;
  return isArray_1;
}
var isLength_1;
var hasRequiredIsLength;
function requireIsLength() {
  if (hasRequiredIsLength) return isLength_1;
  hasRequiredIsLength = 1;
  var MAX_SAFE_INTEGER = 9007199254740991;
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }
  isLength_1 = isLength;
  return isLength_1;
}
var isArrayLike_1;
var hasRequiredIsArrayLike;
function requireIsArrayLike() {
  if (hasRequiredIsArrayLike) return isArrayLike_1;
  hasRequiredIsArrayLike = 1;
  var isFunction = requireIsFunction(), isLength = requireIsLength();
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  isArrayLike_1 = isArrayLike;
  return isArrayLike_1;
}
var isArrayLikeObject_1;
var hasRequiredIsArrayLikeObject;
function requireIsArrayLikeObject() {
  if (hasRequiredIsArrayLikeObject) return isArrayLikeObject_1;
  hasRequiredIsArrayLikeObject = 1;
  var isArrayLike = requireIsArrayLike(), isObjectLike = requireIsObjectLike();
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }
  isArrayLikeObject_1 = isArrayLikeObject;
  return isArrayLikeObject_1;
}
var isBuffer = { exports: {} };
var stubFalse_1;
var hasRequiredStubFalse;
function requireStubFalse() {
  if (hasRequiredStubFalse) return stubFalse_1;
  hasRequiredStubFalse = 1;
  function stubFalse() {
    return false;
  }
  stubFalse_1 = stubFalse;
  return stubFalse_1;
}
isBuffer.exports;
var hasRequiredIsBuffer;
function requireIsBuffer() {
  if (hasRequiredIsBuffer) return isBuffer.exports;
  hasRequiredIsBuffer = 1;
  (function(module, exports) {
    var root = require_root(), stubFalse = requireStubFalse();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : void 0;
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0;
    var isBuffer2 = nativeIsBuffer || stubFalse;
    module.exports = isBuffer2;
  })(isBuffer, isBuffer.exports);
  return isBuffer.exports;
}
var isPlainObject_1;
var hasRequiredIsPlainObject;
function requireIsPlainObject() {
  if (hasRequiredIsPlainObject) return isPlainObject_1;
  hasRequiredIsPlainObject = 1;
  var baseGetTag = require_baseGetTag(), getPrototype = require_getPrototype(), isObjectLike = requireIsObjectLike();
  var objectTag = "[object Object]";
  var funcProto = Function.prototype, objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var objectCtorString = funcToString.call(Object);
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
  }
  isPlainObject_1 = isPlainObject;
  return isPlainObject_1;
}
var _baseIsTypedArray;
var hasRequired_baseIsTypedArray;
function require_baseIsTypedArray() {
  if (hasRequired_baseIsTypedArray) return _baseIsTypedArray;
  hasRequired_baseIsTypedArray = 1;
  var baseGetTag = require_baseGetTag(), isLength = requireIsLength(), isObjectLike = requireIsObjectLike();
  var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }
  _baseIsTypedArray = baseIsTypedArray;
  return _baseIsTypedArray;
}
var _baseUnary;
var hasRequired_baseUnary;
function require_baseUnary() {
  if (hasRequired_baseUnary) return _baseUnary;
  hasRequired_baseUnary = 1;
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  _baseUnary = baseUnary;
  return _baseUnary;
}
var _nodeUtil = { exports: {} };
_nodeUtil.exports;
var hasRequired_nodeUtil;
function require_nodeUtil() {
  if (hasRequired_nodeUtil) return _nodeUtil.exports;
  hasRequired_nodeUtil = 1;
  (function(module, exports) {
    var freeGlobal = require_freeGlobal();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = (function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e2) {
      }
    })();
    module.exports = nodeUtil;
  })(_nodeUtil, _nodeUtil.exports);
  return _nodeUtil.exports;
}
var isTypedArray_1;
var hasRequiredIsTypedArray;
function requireIsTypedArray() {
  if (hasRequiredIsTypedArray) return isTypedArray_1;
  hasRequiredIsTypedArray = 1;
  var baseIsTypedArray = require_baseIsTypedArray(), baseUnary = require_baseUnary(), nodeUtil = require_nodeUtil();
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
  isTypedArray_1 = isTypedArray;
  return isTypedArray_1;
}
var _safeGet;
var hasRequired_safeGet;
function require_safeGet() {
  if (hasRequired_safeGet) return _safeGet;
  hasRequired_safeGet = 1;
  function safeGet(object, key) {
    if (key === "constructor" && typeof object[key] === "function") {
      return;
    }
    if (key == "__proto__") {
      return;
    }
    return object[key];
  }
  _safeGet = safeGet;
  return _safeGet;
}
var _assignValue;
var hasRequired_assignValue;
function require_assignValue() {
  if (hasRequired_assignValue) return _assignValue;
  hasRequired_assignValue = 1;
  var baseAssignValue = require_baseAssignValue(), eq = requireEq();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
      baseAssignValue(object, key, value);
    }
  }
  _assignValue = assignValue;
  return _assignValue;
}
var _copyObject;
var hasRequired_copyObject;
function require_copyObject() {
  if (hasRequired_copyObject) return _copyObject;
  hasRequired_copyObject = 1;
  var assignValue = require_assignValue(), baseAssignValue = require_baseAssignValue();
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});
    var index2 = -1, length = props.length;
    while (++index2 < length) {
      var key = props[index2];
      var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
      if (newValue === void 0) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }
  _copyObject = copyObject;
  return _copyObject;
}
var _baseTimes;
var hasRequired_baseTimes;
function require_baseTimes() {
  if (hasRequired_baseTimes) return _baseTimes;
  hasRequired_baseTimes = 1;
  function baseTimes(n, iteratee) {
    var index2 = -1, result = Array(n);
    while (++index2 < n) {
      result[index2] = iteratee(index2);
    }
    return result;
  }
  _baseTimes = baseTimes;
  return _baseTimes;
}
var _isIndex;
var hasRequired_isIndex;
function require_isIndex() {
  if (hasRequired_isIndex) return _isIndex;
  hasRequired_isIndex = 1;
  var MAX_SAFE_INTEGER = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  _isIndex = isIndex;
  return _isIndex;
}
var _arrayLikeKeys;
var hasRequired_arrayLikeKeys;
function require_arrayLikeKeys() {
  if (hasRequired_arrayLikeKeys) return _arrayLikeKeys;
  hasRequired_arrayLikeKeys = 1;
  var baseTimes = require_baseTimes(), isArguments = requireIsArguments(), isArray = requireIsArray(), isBuffer2 = requireIsBuffer(), isIndex = require_isIndex(), isTypedArray = requireIsTypedArray();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer2(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
      (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
      isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  _arrayLikeKeys = arrayLikeKeys;
  return _arrayLikeKeys;
}
var _nativeKeysIn;
var hasRequired_nativeKeysIn;
function require_nativeKeysIn() {
  if (hasRequired_nativeKeysIn) return _nativeKeysIn;
  hasRequired_nativeKeysIn = 1;
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }
  _nativeKeysIn = nativeKeysIn;
  return _nativeKeysIn;
}
var _baseKeysIn;
var hasRequired_baseKeysIn;
function require_baseKeysIn() {
  if (hasRequired_baseKeysIn) return _baseKeysIn;
  hasRequired_baseKeysIn = 1;
  var isObject = requireIsObject(), isPrototype = require_isPrototype(), nativeKeysIn = require_nativeKeysIn();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object), result = [];
    for (var key in object) {
      if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }
  _baseKeysIn = baseKeysIn;
  return _baseKeysIn;
}
var keysIn_1;
var hasRequiredKeysIn;
function requireKeysIn() {
  if (hasRequiredKeysIn) return keysIn_1;
  hasRequiredKeysIn = 1;
  var arrayLikeKeys = require_arrayLikeKeys(), baseKeysIn = require_baseKeysIn(), isArrayLike = requireIsArrayLike();
  function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }
  keysIn_1 = keysIn;
  return keysIn_1;
}
var toPlainObject_1;
var hasRequiredToPlainObject;
function requireToPlainObject() {
  if (hasRequiredToPlainObject) return toPlainObject_1;
  hasRequiredToPlainObject = 1;
  var copyObject = require_copyObject(), keysIn = requireKeysIn();
  function toPlainObject(value) {
    return copyObject(value, keysIn(value));
  }
  toPlainObject_1 = toPlainObject;
  return toPlainObject_1;
}
var _baseMergeDeep;
var hasRequired_baseMergeDeep;
function require_baseMergeDeep() {
  if (hasRequired_baseMergeDeep) return _baseMergeDeep;
  hasRequired_baseMergeDeep = 1;
  var assignMergeValue = require_assignMergeValue(), cloneBuffer = require_cloneBuffer(), cloneTypedArray = require_cloneTypedArray(), copyArray = require_copyArray(), initCloneObject = require_initCloneObject(), isArguments = requireIsArguments(), isArray = requireIsArray(), isArrayLikeObject = requireIsArrayLikeObject(), isBuffer2 = requireIsBuffer(), isFunction = requireIsFunction(), isObject = requireIsObject(), isPlainObject = requireIsPlainObject(), isTypedArray = requireIsTypedArray(), safeGet = require_safeGet(), toPlainObject = requireToPlainObject();
  function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
    if (stacked) {
      assignMergeValue(object, key, stacked);
      return;
    }
    var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
    var isCommon = newValue === void 0;
    if (isCommon) {
      var isArr = isArray(srcValue), isBuff = !isArr && isBuffer2(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
      newValue = srcValue;
      if (isArr || isBuff || isTyped) {
        if (isArray(objValue)) {
          newValue = objValue;
        } else if (isArrayLikeObject(objValue)) {
          newValue = copyArray(objValue);
        } else if (isBuff) {
          isCommon = false;
          newValue = cloneBuffer(srcValue, true);
        } else if (isTyped) {
          isCommon = false;
          newValue = cloneTypedArray(srcValue, true);
        } else {
          newValue = [];
        }
      } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
        newValue = objValue;
        if (isArguments(objValue)) {
          newValue = toPlainObject(objValue);
        } else if (!isObject(objValue) || isFunction(objValue)) {
          newValue = initCloneObject(srcValue);
        }
      } else {
        isCommon = false;
      }
    }
    if (isCommon) {
      stack.set(srcValue, newValue);
      mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
      stack["delete"](srcValue);
    }
    assignMergeValue(object, key, newValue);
  }
  _baseMergeDeep = baseMergeDeep;
  return _baseMergeDeep;
}
var _baseMerge;
var hasRequired_baseMerge;
function require_baseMerge() {
  if (hasRequired_baseMerge) return _baseMerge;
  hasRequired_baseMerge = 1;
  var Stack = require_Stack(), assignMergeValue = require_assignMergeValue(), baseFor = require_baseFor(), baseMergeDeep = require_baseMergeDeep(), isObject = requireIsObject(), keysIn = requireKeysIn(), safeGet = require_safeGet();
  function baseMerge(object, source, srcIndex, customizer, stack) {
    if (object === source) {
      return;
    }
    baseFor(source, function(srcValue, key) {
      stack || (stack = new Stack());
      if (isObject(srcValue)) {
        baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
      } else {
        var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
        if (newValue === void 0) {
          newValue = srcValue;
        }
        assignMergeValue(object, key, newValue);
      }
    }, keysIn);
  }
  _baseMerge = baseMerge;
  return _baseMerge;
}
var identity_1;
var hasRequiredIdentity;
function requireIdentity() {
  if (hasRequiredIdentity) return identity_1;
  hasRequiredIdentity = 1;
  function identity2(value) {
    return value;
  }
  identity_1 = identity2;
  return identity_1;
}
var _apply;
var hasRequired_apply;
function require_apply() {
  if (hasRequired_apply) return _apply;
  hasRequired_apply = 1;
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);
      case 1:
        return func.call(thisArg, args[0]);
      case 2:
        return func.call(thisArg, args[0], args[1]);
      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  _apply = apply;
  return _apply;
}
var _overRest;
var hasRequired_overRest;
function require_overRest() {
  if (hasRequired_overRest) return _overRest;
  hasRequired_overRest = 1;
  var apply = require_apply();
  var nativeMax = Math.max;
  function overRest(func, start, transform) {
    start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
    return function() {
      var args = arguments, index2 = -1, length = nativeMax(args.length - start, 0), array = Array(length);
      while (++index2 < length) {
        array[index2] = args[start + index2];
      }
      index2 = -1;
      var otherArgs = Array(start + 1);
      while (++index2 < start) {
        otherArgs[index2] = args[index2];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }
  _overRest = overRest;
  return _overRest;
}
var constant_1;
var hasRequiredConstant;
function requireConstant() {
  if (hasRequiredConstant) return constant_1;
  hasRequiredConstant = 1;
  function constant(value) {
    return function() {
      return value;
    };
  }
  constant_1 = constant;
  return constant_1;
}
var _baseSetToString;
var hasRequired_baseSetToString;
function require_baseSetToString() {
  if (hasRequired_baseSetToString) return _baseSetToString;
  hasRequired_baseSetToString = 1;
  var constant = requireConstant(), defineProperty = require_defineProperty(), identity2 = requireIdentity();
  var baseSetToString = !defineProperty ? identity2 : function(func, string) {
    return defineProperty(func, "toString", {
      "configurable": true,
      "enumerable": false,
      "value": constant(string),
      "writable": true
    });
  };
  _baseSetToString = baseSetToString;
  return _baseSetToString;
}
var _shortOut;
var hasRequired_shortOut;
function require_shortOut() {
  if (hasRequired_shortOut) return _shortOut;
  hasRequired_shortOut = 1;
  var HOT_COUNT = 800, HOT_SPAN = 16;
  var nativeNow = Date.now;
  function shortOut(func) {
    var count = 0, lastCalled = 0;
    return function() {
      var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(void 0, arguments);
    };
  }
  _shortOut = shortOut;
  return _shortOut;
}
var _setToString;
var hasRequired_setToString;
function require_setToString() {
  if (hasRequired_setToString) return _setToString;
  hasRequired_setToString = 1;
  var baseSetToString = require_baseSetToString(), shortOut = require_shortOut();
  var setToString = shortOut(baseSetToString);
  _setToString = setToString;
  return _setToString;
}
var _baseRest;
var hasRequired_baseRest;
function require_baseRest() {
  if (hasRequired_baseRest) return _baseRest;
  hasRequired_baseRest = 1;
  var identity2 = requireIdentity(), overRest = require_overRest(), setToString = require_setToString();
  function baseRest(func, start) {
    return setToString(overRest(func, start, identity2), func + "");
  }
  _baseRest = baseRest;
  return _baseRest;
}
var _isIterateeCall;
var hasRequired_isIterateeCall;
function require_isIterateeCall() {
  if (hasRequired_isIterateeCall) return _isIterateeCall;
  hasRequired_isIterateeCall = 1;
  var eq = requireEq(), isArrayLike = requireIsArrayLike(), isIndex = require_isIndex(), isObject = requireIsObject();
  function isIterateeCall(value, index2, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index2;
    if (type == "number" ? isArrayLike(object) && isIndex(index2, object.length) : type == "string" && index2 in object) {
      return eq(object[index2], value);
    }
    return false;
  }
  _isIterateeCall = isIterateeCall;
  return _isIterateeCall;
}
var _createAssigner;
var hasRequired_createAssigner;
function require_createAssigner() {
  if (hasRequired_createAssigner) return _createAssigner;
  hasRequired_createAssigner = 1;
  var baseRest = require_baseRest(), isIterateeCall = require_isIterateeCall();
  function createAssigner(assigner) {
    return baseRest(function(object, sources) {
      var index2 = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
      customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? void 0 : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index2 < length) {
        var source = sources[index2];
        if (source) {
          assigner(object, source, index2, customizer);
        }
      }
      return object;
    });
  }
  _createAssigner = createAssigner;
  return _createAssigner;
}
var mergeWith_1;
var hasRequiredMergeWith;
function requireMergeWith() {
  if (hasRequiredMergeWith) return mergeWith_1;
  hasRequiredMergeWith = 1;
  var baseMerge = require_baseMerge(), createAssigner = require_createAssigner();
  var mergeWith2 = createAssigner(function(object, source, srcIndex, customizer) {
    baseMerge(object, source, srcIndex, customizer);
  });
  mergeWith_1 = mergeWith2;
  return mergeWith_1;
}
var mergeWithExports = requireMergeWith();
const mergeWith = /* @__PURE__ */ getDefaultExportFromCjs(mergeWithExports);
const uuidv4 = () => crypto.randomUUID().slice(0, 8);
const shortId = () => uuidv4().slice(0, 8);
const match = (str = "", filter) => {
  if (!filter) {
    console.warn("utils.match missing argument 2.");
    return false;
  }
  const matchOperators = /[|\\{}()[\]^*$+?.]/g;
  let filterArray = typeof filter === "string" ? [filter] : filter;
  filterArray = filterArray.map((filterStr) => {
    return filterStr === "*" ? "" : filterStr.replace(matchOperators, "\\$&");
  });
  let isMatch = true;
  if (filterArray.length) {
    isMatch = !new RegExp(filterArray.join("|"), "i").exec(str);
  }
  return isMatch;
};
const remove = (arr, val) => {
  const index2 = arr.indexOf(val);
  if (index2 !== -1) {
    arr.splice(index2, 1);
  }
};
const componentType = (node) => {
  const classMatch = node.className?.match(COMPONENT_TYPE_CLASSNAMES_REGEXP);
  return classMatch && COMPONENT_TYPE_CLASSNAMES_LOOKUP[classMatch[0]];
};
const unique = (array) => Array.from(new Set(array));
const uuid = (elem) => {
  return elem?.attrs?.id || elem?.id || shortId();
};
const merge = (obj1, obj2) => {
  const customizer = (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      if (srcValue !== void 0 && srcValue !== null) {
        return unique(objValue.concat(srcValue));
      }
      return srcValue;
    }
    if (Array.isArray(srcValue)) {
      if (objValue !== void 0 && objValue !== null) {
        return unique(srcValue.concat(objValue));
      }
      return srcValue;
    }
  };
  return mergeWith({}, obj1, obj2, customizer);
};
const clone$1 = (obj) => {
  let copy;
  const isPromise = obj instanceof Promise;
  const isObject = typeof obj === "object";
  if (obj === null || !isObject || isPromise) {
    return obj;
  }
  if (obj instanceof Date) {
    copy = /* @__PURE__ */ new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  if (Array.isArray(obj)) {
    copy = [];
    for (let i2 = 0, len = obj.length; i2 < len; i2++) {
      copy[i2] = clone$1(obj[i2]);
    }
    return copy;
  }
  if (obj instanceof Object) {
    copy = {};
    for (const attr in obj) {
      if (Object.hasOwn(obj, attr)) {
        copy[attr] = clone$1(obj[attr]);
      }
    }
    return copy;
  }
  throw new Error("Unable to copy Object, type not supported.");
};
const percent = (val, total) => val / total * 100;
const numToPercent = (num) => `${num.toString()}%`;
const sessionStorage = Object.create(null, {
  get: {
    value: (key) => {
      const itemValue = window.sessionStorage?.getItem(key);
      try {
        return JSON.parse(itemValue);
      } catch (_err) {
        return itemValue;
      }
    }
  },
  set: {
    value: (key, itemValue) => {
      try {
        return window.sessionStorage?.setItem(key, JSON.stringify(itemValue));
      } catch (error) {
        console.error(error);
      }
    }
  }
});
const isAddress = (str) => {
  return /^(stage|row|column|field)s./.test(str);
};
const isInternalAddress = (str) => {
  return INTERNAL_COMPONENT_INDEX_REGEX.test(str);
};
function throttle$1(callback, limit = ANIMATION_SPEED_SLOW) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      callback.apply(this, args);
    }
  };
}
function debounce(fn, delay = ANIMATION_SPEED_FAST) {
  let timeoutID;
  return function(...args) {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(() => fn.apply(this, args), delay);
  };
}
function identity(value) {
  return value;
}
function noop() {
}
function parseData(data = /* @__PURE__ */ Object.create(null)) {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e2) {
      console.error("Invalid JSON string provided:", e2);
      return /* @__PURE__ */ Object.create(null);
    }
  }
  return data;
}
const cleanFormData = (formData) => formData ? clone$1(parseData(formData)) : DEFAULT_FORMDATA();
function buildFlatDataStructure(data, componentId, componentType2, result = {}) {
  if (!componentId || !data[componentType2][componentId]) {
    return result;
  }
  const key = `${componentType2}.${componentId}`;
  result[key] = data[componentType2][componentId];
  const childType = CHILD_TYPE_INDEX_MAP.get(componentType2);
  if (childType) {
    const childrenIds = data[componentType2][componentId].data?.children || [];
    for (const childId of childrenIds) {
      buildFlatDataStructure(data, childId, childType, result);
    }
  }
  return result;
}
const BUNDLED_SVG_SPRITE = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><symbol id="f-i-autocomplete" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M6,5h1v1H6V5z M4,4H3v1h1V4z M6,4H5v1h1V4z M2,5v1h1V5H2z M3,7h1V6H3V7z M5,7h1V6H5V7z M4,5v1h1V5H4z M2,14h1v-1H2V14z M4,14h1v-1H4V14z M6,14h1v-1H6V14z M9,13H8v1h1V13z M16,3.5v4C16,8.3,15.3,9,14.5,9H14v3v3c0,0.6-0.4,1-1,1H1c-0.6,0-1-0.4-1-1V3.5 C0,2.7,0.7,2,1.5,2h3H8V1.5V1H7H6V0.5V0h2.5H11v0.5V1h-1H9v0.5V2h3h2.5C15.3,2,16,2.7,16,3.5z M13,12H7H1v3h12V12z M3,11v-1H2v1H3z M5,11v-1H4v1H5z M15,3.5C15,3.2,14.8,3,14.5,3H9v2.5V8H8.5H8V7.5V7H7V6h1V5.5V5H7V4h1V3.5V3H1.5C1.2,3,1,3.2,1,3.5v4 C1,7.8,1.2,8,1.5,8H8v1H6v0.5V10h2.5H11V9.5V9H9V8h5.5C14.8,8,15,7.8,15,7.5V3.5z"/></symbol><symbol viewBox="0 0 32 32" id="f-i-bin" xmlns="http://www.w3.org/2000/svg"><path d="M4 10v20c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-20h-22zM10 28h-2v-14h2v14zM14 28h-2v-14h2v14zM18 28h-2v-14h2v14zM22 28h-2v-14h2v14zM26.5 4h-6.5v-2.5c0-.825-.675-1.5-1.5-1.5h-7c-.825 0-1.5.675-1.5 1.5v2.5h-6.5c-.825 0-1.5.675-1.5 1.5v2.5h26v-2.5c0-.825-.675-1.5-1.5-1.5zM18 4h-6v-1.975h6v1.975z"/></symbol><symbol id="f-i-button" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><metadata id="acprefix__metadata8"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><cc:Work rdf:about="" xmlns:cc="http://creativecommons.org/ns#"><dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" xmlns:dc="http://purl.org/dc/elements/1.1/"/><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/"/></cc:Work></rdf:RDF></metadata><path id="acprefix__rect4140" d="M 0.4765625,4 A 0.47706934,0.47706934 0 0 0 0,4.4765625 L 0,11.523438 A 0.47706934,0.47706934 0 0 0 0.4765625,12 L 15.523438,12 A 0.47706934,0.47706934 0 0 0 16,11.523438 L 16,4.4765625 A 0.47706934,0.47706934 0 0 0 15.523438,4 L 0.4765625,4 Z m 0.4765625,0.953125 14.09375,0 0,6.09375 -14.09375,0 0,-6.09375 z"/><g id="acprefix__layer1"><g id="acprefix__text4203"><g id="acprefix__g4212" transform="translate(0.10112835,0.1001358)"><path id="acprefix__path4208" d="m 6.0690374,6.4093857 q -0.5371093,0 -0.8544922,0.4003906 -0.3149414,0.4003906 -0.3149414,1.0913086 0,0.6884766 0.3149414,1.0888672 0.3173829,0.4003906 0.8544922,0.4003906 0.5371094,0 0.8496094,-0.4003906 0.3149414,-0.4003906 0.3149414,-1.0888672 0,-0.690918 -0.3149414,-1.0913086 -0.3125,-0.4003906 -0.8496094,-0.4003906 z m 0,-0.4003906 q 0.7666016,0 1.225586,0.5151367 0.4589843,0.5126953 0.4589843,1.3769531 0,0.8618164 -0.4589843,1.3769531 -0.4589844,0.5126953 -1.225586,0.5126953 -0.7690429,0 -1.2304687,-0.5126953 -0.4589844,-0.5126953 -0.4589844,-1.3769531 0,-0.8642578 0.4589844,-1.3769531 0.4614258,-0.5151367 1.2304687,-0.5151367 z"/><path id="acprefix__path4210" d="m 8.5250921,6.074913 0.4931641,0 0,1.5405274 1.6357418,-1.5405274 0.634766,0 -1.809082,1.6992188 1.938477,1.9458008 -0.649415,0 -1.7504878,-1.7553711 0,1.7553711 -0.4931641,0 0,-3.6450196 z"/></g></g></g></symbol><symbol viewBox="0 0 32 32" id="f-i-calendar" xmlns="http://www.w3.org/2000/svg"><path d="M12.048 16.961c-0.178 0.257-0.395 0.901-0.652 1.059-0.257 0.157-0.547 0.267-0.869 0.328-0.323 0.062-0.657 0.089-1.002 0.079v1.527h2.467v6.046h1.991v-9.996h-1.584c-0.056 0.381-0.173 0.7-0.351 0.957zM23 8h2c0.553 0 1-0.448 1-1v-6c0-0.552-0.447-1-1-1h-2c-0.553 0-1 0.448-1 1v6c0 0.552 0.447 1 1 1zM7 8h2c0.552 0 1-0.448 1-1v-6c0-0.552-0.448-1-1-1h-2c-0.552 0-1 0.448-1 1v6c0 0.552 0.448 1 1 1zM30 4h-2v5c0 0.552-0.447 1-1 1h-6c-0.553 0-1-0.448-1-1v-5h-8v5c0 0.552-0.448 1-1 1h-6c-0.552 0-1-0.448-1-1v-5h-2c-1.104 0-2 0.896-2 2v24c0 1.104 0.896 2 2 2h28c1.104 0 2-0.896 2-2v-24c0-1.104-0.896-2-2-2zM30 29c0 0.553-0.447 1-1 1h-26c-0.552 0-1-0.447-1-1v-16c0-0.552 0.448-1 1-1h26c0.553 0 1 0.448 1 1v16zM15.985 17.982h4.968c-0.936 1.152-1.689 2.325-2.265 3.705-0.575 1.381-0.638 2.818-0.749 4.312h2.131c0.009-0.666-0.195-1.385-0.051-2.156 0.146-0.771 0.352-1.532 0.617-2.285 0.267-0.752 0.598-1.461 0.996-2.127 0.396-0.667 0.853-1.229 1.367-1.686v-1.742h-7.015v1.979z"/></symbol><symbol id="f-i-checkbox" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M13.5,5v8c0,0.8-0.7,1.5-1.5,1.5H3c-0.8,0-1.5-0.7-1.5-1.5V4c0-0.8,0.7-1.5,1.5-1.5h9c0.7,0,1.3,0.5,1.5,1.2l2.4-1.4L13.5,5 z M12.5,6.2L7.7,12L2.8,5.5l4.9,1.6l4.8-2.9V4c0-0.3-0.2-0.5-0.5-0.5H3C2.7,3.5,2.5,3.7,2.5,4v9c0,0.3,0.2,0.5,0.5,0.5h9 c0.3,0,0.5-0.2,0.5-0.5V6.2z"/></symbol><symbol id="f-i-checkbox-group" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M0,1h16V0H0V1z M0,3h16V2H0V3z M6,5v1h9V5H6z M15,14v-1H6v1H15z M6,10h9V9H6V10z M4,12l-2.5,1.5L0,13l1.5,2L4,12z M4,8 L1.5,9.5L0,9l1.5,2L4,8z M4,4L1.5,5.5L0,5l1.5,2L4,4z"/></symbol><symbol xml:space="preserve" viewBox="0 0 16 16" id="f-i-columns" xmlns="http://www.w3.org/2000/svg"><metadata id="agprefix__metadata4318"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><cc:Work rdf:about="" xmlns:cc="http://creativecommons.org/ns#"><dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" xmlns:dc="http://purl.org/dc/elements/1.1/"/><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/"/></cc:Work></rdf:RDF></metadata><path id="agprefix__rect4860-3-5" d="M 16,0.5 A 0.50004997,0.50004997 0 0 0 15.5,0 l -5,0 -5,0 -5,0 A 0.50004997,0.50004997 0 0 0 0,0.5 l 0,15 A 0.50004997,0.50004997 0 0 0 0.5,16 l 5,0 5,0 5,0 A 0.50004997,0.50004997 0 0 0 16,15.5 l 0,-15 z M 15,1 15,15 11,15 11,1 15,1 Z M 10,1 10,15 6,15 6,1 10,1 Z M 5,1 5,15 1,15 1,1 5,1 Z"/></symbol><symbol viewBox="0 0 32 32" id="f-i-copy" xmlns="http://www.w3.org/2000/svg"><path d="M20 8v-8h-14l-6 6v18h12v8h20v-24h-12zM6 2.828v3.172h-3.172l3.172-3.172zM2 22v-14h6v-6h10v6l-6 6v8h-10zM18 10.828v3.172h-3.172l3.172-3.172zM30 30h-16v-14h6v-6h10v20z"/></symbol><symbol id="f-i-divider" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><metadata id="aiprefix__metadata10"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><cc:Work rdf:about="" xmlns:cc="http://creativecommons.org/ns#"><dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" xmlns:dc="http://purl.org/dc/elements/1.1/"/><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/"/></cc:Work></rdf:RDF></metadata><rect y="7" x="0" height="1" width="15" id="aiprefix__rect4182"/></symbol><symbol viewBox="0 0 28 32" id="f-i-edit" xmlns="http://www.w3.org/2000/svg"><path d="M22 2l-4 4 6 6 4-4-6-6zM0 24l0.021 6.018 5.979-0.018 16-16-6-6-16 16zM6 28h-4v-4h2v2h2v2z"/></symbol><symbol fill="#000000" viewBox="0 0 24 24" id="f-i-email" xmlns="http://www.w3.org/2000/svg"><path d="M12,2 C17.4292399,2 21.8479317,6.32667079 21.9961582,11.7200952 L22,12 L22,13 C22,15.1729208 20.477434,17 18.5,17 C17.3269391,17 16.3139529,16.3570244 15.6839382,15.3803024 C14.770593,16.3757823 13.4581934,17 12,17 C9.23857625,17 7,14.7614237 7,12 C7,9.23857625 9.23857625,7 12,7 C14.6887547,7 16.8818181,9.12230671 16.9953805,11.7831104 L17,12 L17,13 C17,14.1407877 17.7160103,15 18.5,15 C19.2447902,15 19.928229,14.2245609 19.9947109,13.1689341 L20,13 L20,12 C20,7.581722 16.418278,4 12,4 C7.581722,4 4,7.581722 4,12 C4,16.418278 7.581722,20 12,20 C13.1630948,20 14.2892822,19.7522618 15.3225159,19.2798331 C15.8247876,19.0501777 16.4181317,19.271177 16.647787,19.7734487 C16.8774423,20.2757205 16.656443,20.8690646 16.1541713,21.0987199 C14.861218,21.689901 13.4515463,22 12,22 C6.4771525,22 2,17.5228475 2,12 C2,6.4771525 6.4771525,2 12,2 Z M12,9 C10.3431458,9 9,10.3431458 9,12 C9,13.6568542 10.3431458,15 12,15 C13.6568542,15 15,13.6568542 15,12 C15,10.3431458 13.6568542,9 12,9 Z"/></symbol><symbol viewBox="0 0 32 32" id="f-i-floppy-disk" xmlns="http://www.w3.org/2000/svg"><path d="M28 0h-28v32h32v-28l-4-4zM16 4h4v8h-4v-8zM28 28h-24v-24h2v10h18v-10h2.343l1.657 1.657v22.343z"/></symbol><symbol xml:space="preserve" viewBox="0 0 16 16" id="f-i-handle" xmlns="http://www.w3.org/2000/svg"><metadata id="aqprefix__metadata8"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><cc:Work rdf:about="" xmlns:cc="http://creativecommons.org/ns#"><dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" xmlns:dc="http://purl.org/dc/elements/1.1/"/><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/"/></cc:Work></rdf:RDF></metadata><g transform="translate(0,-2)" id="aqprefix__g4220"><rect id="aqprefix__rect4191" width="2" height="2" x="2" y="7"/><rect id="aqprefix__rect4191-2" width="2" height="2" x="7" y="7"/><rect id="aqprefix__rect4191-4" width="2" height="2" x="12" y="7"/></g><g transform="translate(0,2)" id="aqprefix__g4220-6"><rect id="aqprefix__rect4191-40" width="2" height="2" x="2" y="7"/><rect id="aqprefix__rect4191-2-3" width="2" height="2" x="7" y="7"/><rect id="aqprefix__rect4191-4-9" width="2" height="2" x="12" y="7"/></g></symbol><symbol xml:space="preserve" viewBox="0 0 16 16" id="f-i-handle-column" xmlns="http://www.w3.org/2000/svg"><path d="M2 7h2v2H2zM7 7h2v2H7zM12 7h2v2h-2zM2 12h2v2H2zM7 12h2v2H7zM12 12h2v2h-2z" transform="rotate(90 9.25 9.25)"/></symbol><symbol xml:space="preserve" viewBox="0 0 16 16" id="f-i-handle-field" xmlns="http://www.w3.org/2000/svg"><path d="M9.5-6.5h2v2h-2zm-5 0h2v2h-2zm5-5h2v2h-2zm-5 0h2v2h-2z" transform="rotate(90)"/></symbol><symbol xml:space="preserve" viewBox="0 0 16 16" id="f-i-handle-row" xmlns="http://www.w3.org/2000/svg"><path d="M12 9.5h2v2h-2zm-5 0h2v2H7Zm-5 0h2v2H2Zm10-5h2v2h-2zm-5 0h2v2H7Zm-5 0h2v2H2Z"/></symbol><symbol xml:space="preserve" viewBox="0 0 16 16" id="f-i-handle-stage" xmlns="http://www.w3.org/2000/svg"><path d="M2 4.5h2v2H2zM7 4.5h2v2H7zM12 4.5h2v2h-2zM2 9.5h2v2H2zM7 9.5h2v2H7zM12 9.5h2v2h-2zM2-.5h2v2H2zM7-.5h2v2H7zM12-.5h2v2h-2z" transform="translate(0 2.5)"/></symbol><symbol viewBox="0 0 448 512" id="f-i-hash" xmlns="http://www.w3.org/2000/svg"><g id="arprefix__icomoon-ignore"/><path fill="#000" d="M448 192v-64h-80.064l16-128h-64l-16 128h-127.968l16-128h-64l-16 128h-111.968v64h103.968l-15.968 128h-88v64h80l-16 128h64l16-128h127.968l-16 128h64.032l16-128h112v-64h-104l15.936-128h88.064zM279.968 320h-127.968l15.968-128h127.968l-15.968 128z"/></symbol><symbol viewBox="0 0 28 28" id="f-i-header" xmlns="http://www.w3.org/2000/svg"><path fill="#444" d="M26.281 26q-0.688 0-2.070-0.055t-2.086-0.055q-0.688 0-2.063 0.055t-2.063 0.055q-0.375 0-0.578-0.32t-0.203-0.711q0-0.484 0.266-0.719t0.609-0.266 0.797-0.109 0.703-0.234q0.516-0.328 0.516-2.188l-0.016-6.109q0-0.328-0.016-0.484-0.203-0.063-0.781-0.063h-10.547q-0.594 0-0.797 0.063-0.016 0.156-0.016 0.484l-0.016 5.797q0 2.219 0.578 2.562 0.25 0.156 0.75 0.203t0.891 0.055 0.703 0.234 0.313 0.711q0 0.406-0.195 0.75t-0.57 0.344q-0.734 0-2.18-0.055t-2.164-0.055q-0.672 0-2 0.055t-1.984 0.055q-0.359 0-0.555-0.328t-0.195-0.703q0-0.469 0.242-0.703t0.562-0.273 0.742-0.117 0.656-0.234q0.516-0.359 0.516-2.234l-0.016-0.891v-12.703q0-0.047 0.008-0.406t0-0.57-0.023-0.602-0.055-0.656-0.102-0.57-0.172-0.492-0.25-0.281q-0.234-0.156-0.703-0.187t-0.828-0.031-0.641-0.219-0.281-0.703q0-0.406 0.187-0.75t0.562-0.344q0.719 0 2.164 0.055t2.164 0.055q0.656 0 1.977-0.055t1.977-0.055q0.391 0 0.586 0.344t0.195 0.75q0 0.469-0.266 0.68t-0.602 0.227-0.773 0.063-0.672 0.203q-0.547 0.328-0.547 2.5l0.016 5q0 0.328 0.016 0.5 0.203 0.047 0.609 0.047h10.922q0.391 0 0.594-0.047 0.016-0.172 0.016-0.5l0.016-5q0-2.172-0.547-2.5-0.281-0.172-0.914-0.195t-1.031-0.203-0.398-0.773q0-0.406 0.195-0.75t0.586-0.344q0.688 0 2.063 0.055t2.063 0.055q0.672 0 2.016-0.055t2.016-0.055q0.391 0 0.586 0.344t0.195 0.75q0 0.469-0.273 0.688t-0.625 0.227-0.805 0.047-0.688 0.195q-0.547 0.359-0.547 2.516l0.016 14.734q0 1.859 0.531 2.188 0.25 0.156 0.719 0.211t0.836 0.070 0.648 0.242 0.281 0.695q0 0.406-0.187 0.75t-0.562 0.344z"/></symbol><symbol xml:space="preserve" viewBox="0 0 16 16" id="f-i-hidden" xmlns="http://www.w3.org/2000/svg"><path d="M0 12h1v-1H0Zm15-7h1V4h-1zm-1 7h1v-1h-1zm-2 0h1v-1h-1zm-2 0h1v-1h-1Zm-2 0h1v-1H8Zm-2 0h1v-1H6Zm-2 0h1v-1H4Zm-2 0h1v-1H2Zm13-1h1v-1h-1ZM0 10h1V9H0Zm15-1h1V8h-1ZM0 8h1V7H0Zm15-1h1V6h-1ZM0 6h1V5H0Zm13-1h1V4h-1zm-2 0h1V4h-1ZM9 5h1V4H9ZM7 5h1V4H7ZM5 5h1V4H5ZM3 5h1V4H3ZM1 5h1V4H1Z"/></symbol><symbol viewBox="0 0 384 512" id="f-i-menu" xmlns="http://www.w3.org/2000/svg"><g id="auprefix__icomoon-ignore"/><path d="M0 96v64h384v-64h-384zM0 288h384v-64h-384v64zM0 416h384v-64h-384v64z"/></symbol><symbol viewBox="0 0 24 24" fill="none" id="f-i-minus" xmlns="http://www.w3.org/2000/svg"><path d="M6 12L18 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol viewBox="0 0 512 512" id="f-i-move" xmlns="http://www.w3.org/2000/svg"><path d="M287.744 94.736v129.008h128v-64l96.256 96.256-96.256 96.24v-65.488h-128v129.008h64.496l-96.24 96.24-96.256-96.24h64v-129.008h-128v64.992l-95.744-95.744 95.744-95.744v63.488h128v-129.008h-62.496l94.752-94.736 94.752 94.736h-63.008z"/></symbol><symbol viewBox="0 0 512 512" id="f-i-move-vertical" xmlns="http://www.w3.org/2000/svg"><metadata id="awprefix__metadata10"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><cc:Work rdf:about="" xmlns:cc="http://creativecommons.org/ns#"><dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" xmlns:dc="http://purl.org/dc/elements/1.1/"/><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/"/></cc:Work></rdf:RDF></metadata><sodipodi:namedview pagecolor="#ffffff" bordercolor="#666666" borderopacity="1" objecttolerance="10" gridtolerance="10" guidetolerance="10" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:pageopacity="0" inkscape:pageshadow="2" inkscape:window-width="3440" inkscape:window-height="1416" id="awprefix__namedview6" showgrid="false" inkscape:zoom="1.84375" inkscape:cx="421.4312" inkscape:cy="218.56484" inkscape:window-x="0" inkscape:window-y="24" inkscape:window-maximized="1" inkscape:current-layer="svg2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"/><path d="m 287.744,94.736 0,321.024 64.496,0 L 256,512 l -96.256,-96.24 64,0 0,-321.024 -62.496,0 L 256,0 350.752,94.736 Z" id="awprefix__path4" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:connector-curvature="0" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccccccccccc"/></symbol><symbol viewBox="0 0 20 28" id="f-i-paragraph" xmlns="http://www.w3.org/2000/svg"><path fill="#444" d="M19.969 2.953v1.141q0 0.453-0.289 0.953t-0.664 0.5q-0.781 0-0.844 0.016-0.406 0.094-0.5 0.484-0.047 0.172-0.047 1v18q0 0.391-0.281 0.672t-0.672 0.281h-1.687q-0.391 0-0.672-0.281t-0.281-0.672v-19.031h-2.234v19.031q0 0.391-0.273 0.672t-0.68 0.281h-1.687q-0.406 0-0.68-0.281t-0.273-0.672v-7.75q-2.297-0.187-3.828-0.922-1.969-0.906-3-2.797-1-1.828-1-4.047 0-2.594 1.375-4.469 1.375-1.844 3.266-2.484 1.734-0.578 6.516-0.578h7.484q0.391 0 0.672 0.281t0.281 0.672z"/></symbol><symbol id="f-i-phone-receiver" viewBox="0 0 578.106 578.106" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><g><g><path d="M577.83,456.128c1.225,9.385-1.635,17.545-8.568,24.48l-81.396,80.781 c-3.672,4.08-8.465,7.551-14.381,10.404c-5.916,2.857-11.729,4.693-17.439,5.508c-0.408,0-1.635,0.105-3.676,0.309 c-2.037,0.203-4.689,0.307-7.953,0.307c-7.754,0-20.301-1.326-37.641-3.979s-38.555-9.182-63.645-19.584 c-25.096-10.404-53.553-26.012-85.376-46.818c-31.823-20.805-65.688-49.367-101.592-85.68 c-28.56-28.152-52.224-55.08-70.992-80.783c-18.768-25.705-33.864-49.471-45.288-71.299 c-11.425-21.828-19.993-41.616-25.705-59.364S4.59,177.362,2.55,164.51s-2.856-22.95-2.448-30.294 c0.408-7.344,0.612-11.424,0.612-12.24c0.816-5.712,2.652-11.526,5.508-17.442s6.324-10.71,10.404-14.382L98.022,8.756 c5.712-5.712,12.24-8.568,19.584-8.568c5.304,0,9.996,1.53,14.076,4.59s7.548,6.834,10.404,11.322l65.484,124.236 c3.672,6.528,4.692,13.668,3.06,21.42c-1.632,7.752-5.1,14.28-10.404,19.584l-29.988,29.988c-0.816,0.816-1.53,2.142-2.142,3.978 s-0.918,3.366-0.918,4.59c1.632,8.568,5.304,18.36,11.016,29.376c4.896,9.792,12.444,21.726,22.644,35.802 s24.684,30.293,43.452,48.653c18.36,18.77,34.68,33.354,48.96,43.76c14.277,10.4,26.215,18.053,35.803,22.949 c9.588,4.896,16.932,7.854,22.031,8.871l7.648,1.531c0.816,0,2.145-0.307,3.979-0.918c1.836-0.613,3.162-1.326,3.979-2.143 l34.883-35.496c7.348-6.527,15.912-9.791,25.705-9.791c6.938,0,12.443,1.223,16.523,3.672h0.611l118.115,69.768 C571.098,441.238,576.197,447.968,577.83,456.128z"/></g></g><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/></symbol><symbol viewBox="0 0 24 24" fill="none" id="f-i-plus" xmlns="http://www.w3.org/2000/svg"><path d="M6 12H18M12 6V18" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="f-i-radio-group" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M0,1h16V0H0V1z M0,3h16V2H0V3z M5,6h10V5H5V6z M15,9H5v1h10V9z M15,14v-1H5v1H15z M1.5,7C0.7,7,0,6.3,0,5.5S0.7,4,1.5,4 S3,4.7,3,5.5S2.3,7,1.5,7z M1.5,5C1.2,5,1,5.2,1,5.5S1.2,6,1.5,6S2,5.8,2,5.5S1.8,5,1.5,5z M1.5,11.1C0.7,11.1,0,10.4,0,9.6 s0.7-1.5,1.5-1.5S3,8.7,3,9.6S2.3,11.1,1.5,11.1z M1.5,9.1C1.2,9.1,1,9.3,1,9.6s0.2,0.5,0.5,0.5S2,9.8,2,9.6S1.8,9.1,1.5,9.1z M1.5,15C0.7,15,0,14.3,0,13.5S0.7,12,1.5,12S3,12.7,3,13.5S2.3,15,1.5,15z M1.5,13C1.2,13,1,13.2,1,13.5S1.2,14,1.5,14 S2,13.8,2,13.5S1.8,13,1.5,13z"/></symbol><symbol viewBox="0 0 512 512" id="f-i-remove" xmlns="http://www.w3.org/2000/svg"><path d="M193.694-139.2h87.322v510.916h-87.322zM-18.103 159.92V72.597h510.915v87.322z" transform="rotate(45 77.994 208.636)"/></symbol><symbol id="f-i-rich-text" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M15,1H1C0.4,1,0,1.4,0,2v12c0,0.6,0.4,1,1,1h14c0.6,0,1-0.4,1-1V2C16,1.4,15.6,1,15,1z M1,3.1h0.8v0.3H1V3.1z M1,3.6h0.8 v0.3H1V3.6z M15,14H1V5.1h14V14z M15,4.9H1V4.6h14V4.9z M15,4.4H1V4.1h0.8v0.2h1.5V4.1h1.3v0.2H6V4.1h1.3v0.2h1.5V4.1H10v0.2h1.5 V4.1h1.3v0.2h1.5V4.1H15V4.4z M4.5,3.6v0.3H3.3V3.6H4.5z M3.3,3.4V3.1h1.3v0.3H3.3z M7.3,3.6v0.3H6V3.6H7.3z M6,3.4V3.1h1.3v0.3H6z M10,3.6v0.3H8.8V3.6H10z M8.8,3.4V3.1H10v0.3H8.8z M12.8,3.6v0.3h-1.3V3.6H12.8z M11.5,3.4V3.1h1.3v0.3H11.5z M15,3.9h-0.8V3.6H15 V3.9z M15,3.4h-0.8V3.1H15V3.4z M15,2.9h-0.8V2.8h-1.5v0.2h-1.3V2.8H10v0.2H8.8V2.8H7.3v0.2H6V2.8H4.5v0.2H3.3V2.8H1.8v0.2H1V2.6h14 V2.9z M15,2.4H1V2.1h14V2.4z M3,12v-1h10v1H3z M13,10H3V9h10V10z M11,8H3V7h8V8z"/></symbol><symbol xml:space="preserve" viewBox="0 0 16 16" id="f-i-rows" xmlns="http://www.w3.org/2000/svg"><metadata id="beprefix__metadata4318"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><cc:Work rdf:about="" xmlns:cc="http://creativecommons.org/ns#"><dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" xmlns:dc="http://purl.org/dc/elements/1.1/"/><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/"/></cc:Work></rdf:RDF></metadata><g transform="matrix(0,1,-1,0,3.0984025,11.835155)" id="beprefix__g7209"><path id="beprefix__rect4860-3-5" d="m 4.1640625,-12.402344 a 0.50004997,0.50004997 0 0 0 -0.5,-0.5 l -5,0 -5,0 -5.0000005,0 a 0.50004997,0.50004997 0 0 0 -0.5,0.5 l 0,15.0000002 a 0.50004997,0.50004997 0 0 0 0.5,0.5 l 4.9648442,0 a 0.50004997,0.50004997 0 0 0 0.035156,0 l 4.9648437,0 a 0.50004997,0.50004997 0 0 0 0.035156,0 l 5,0 a 0.50004997,0.50004997 0 0 0 0.5,-0.5 l 0,-15.0000002 z m -1,0.5 0,14.0000002 -4,0 0,-14.0000002 4,0 z m -5,0 0,14.0000002 -4,0 0,-14.0000002 4,0 z m -5,0 0,14.0000002 -4.0000005,0 0,-14.0000002 4.0000005,0 z"/></g></symbol><symbol id="f-i-select" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path id="bfprefix__XMLID_1_" d="M0,0v14h0c0,0.6,0.4,1,1,1h10c0.6,0,1-0.4,1-1h0V5h4V0H0z M1,1h10v3H1V1z M1,7h10v3H1V7z M1,14v-3h10v3H1z M15,4h-3V1h3V4z M2,2h1v1H2V2z M2,12h1v1H2V12z M4,12h1v1H4V12z M6,12h1v1H6V12z M9,12v1H8v-1H9z M2,8h1v1H2V8z M4,8h1v1H4V8z M6,8 h1v1H6V8z M13.5,3.1l-1-1.1h1.9L13.5,3.1z M2,6V5h1v1H2L2,6z M4,6V5h1v1H4L4,6z"/></symbol><symbol viewBox="0 0 448 512" id="f-i-settings" xmlns="http://www.w3.org/2000/svg"><g id="bgprefix__icomoon-ignore"/><path d="M223.969 175c-44.703 0-80.969 36.266-80.969 81 0 44.688 36.266 81.031 80.969 81.031 44.719 0 80.719-36.344 80.719-81.031-0-44.734-36-81-80.719-81zM386.313 302.531l-14.594 35.156 29.469 57.875-36.094 36.094-59.218-27.969-35.156 14.438-17.844 54.625-2.281 7.25h-51.016l-22.078-61.656-35.156-14.5-57.952 29.344-36.078-36.063 27.938-59.25-14.484-35.125-61.767-20.156v-50.984l61.703-22.109 14.485-35.094-25.953-51.234-3.422-6.719 36.031-36.031 59.297 27.922 35.109-14.516 17.828-54.594 2.297-7.234h51l22.094 61.734 35.063 14.516 58.031-29.406 36.063 36.031-27.938 59.203 14.438 35.172 61.875 20.125v50.969l-61.688 22.187z"/></symbol><symbol id="f-i-text-input" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path id="bhprefix__XMLID_10_" d="M15,4H4.5V3H6V2H4.5h-1H2v1h1.5v1H1C0.4,4,0,4.5,0,5v6c0,0.6,0.4,1,1,1h2.5v1H2v1h4v-1H4.5v-1H15 c0.6,0,1-0.4,1-1V5C16,4.5,15.6,4,15,4z M1,11V5h2.5v6H1z M15,11H4.5V5H15V11z"/></symbol><symbol id="f-i-textarea" viewBox="0 0 16 16" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path id="biprefix__XMLID_1_" d="M3,11v-1h8v1H3L3,11z M3,7h10V6H3V7L3,7z M3,8v1h10V8H3L3,8z M13,4H3v1h10V4L13,4z M16,14V2c0-0.6-0.4-1-1-1 H1C0.4,1,0,1.4,0,2v12c0,0.6,0.4,1,1,1h14C15.6,15,16,14.6,16,14z M15,2v12H1V2H15z"/></symbol><symbol viewBox="0 0 24 32" id="f-i-triangle-down" xmlns="http://www.w3.org/2000/svg"><path fill="#444" d="M0 12l11.992 11.992 11.992-11.992h-23.984z"/></symbol><symbol viewBox="0 0 12 32" id="f-i-triangle-left" xmlns="http://www.w3.org/2000/svg"><path fill="#444" d="M0 15.996l11.992 11.992v-23.984l-11.992 11.992z"/></symbol><symbol viewBox="0 0 12 32" id="f-i-triangle-right" xmlns="http://www.w3.org/2000/svg"><path fill="#444" d="M0.002 4.008l11.992 11.992-11.992 11.992v-23.984z"/></symbol><symbol viewBox="0 0 24 32" id="f-i-triangle-up" xmlns="http://www.w3.org/2000/svg"><path fill="#444" d="M11.992 8l-11.992 11.992h23.984l-11.992-11.992z"/></symbol><symbol viewBox="0 0 512 512" id="f-i-upload" xmlns="http://www.w3.org/2000/svg"><g id="bnprefix__icomoon-ignore"/><path d="M240 352h-240v128h480v-128h-240zM448 416h-64v-32h64v32zM112 160l128-128 128 128h-80v160h-96v-160z"/></symbol></svg>';
const name = pkg.name;
const version$1 = pkg.version;
const PACKAGE_NAME = name;
const formeoSpriteId = "formeo-sprite";
const SVG_SPRITE_URL = null;
const FALLBACK_SVG_SPRITE_URL = `https://cdn.jsdelivr.net/npm/formeo@${version$1}/dist/${formeoSpriteId}.svg`;
const CSS_URL = `https://cdn.jsdelivr.net/npm/formeo@${version$1}/dist/formeo.min.css`;
const FALLBACK_CSS_URL = "https://draggable.github.io/formeo/assets/css/formeo.min.css";
const PANEL_CLASSNAME = "f-panel";
const CONTROL_GROUP_CLASSNAME = "control-group";
const STAGE_CLASSNAME = `${PACKAGE_NAME}-stage`;
const ROW_CLASSNAME = `${PACKAGE_NAME}-row`;
const COLUMN_CLASSNAME = `${PACKAGE_NAME}-column`;
const FIELD_CLASSNAME = `${PACKAGE_NAME}-field`;
const CUSTOM_COLUMN_OPTION_CLASSNAME = "custom-column-widths";
const COLUMN_PRESET_CLASSNAME = "column-preset";
const COLUMN_RESIZE_CLASSNAME = "resizing-columns";
const CHILD_CLASSNAME_MAP = /* @__PURE__ */ new Map([
  [STAGE_CLASSNAME, ROW_CLASSNAME],
  [ROW_CLASSNAME, COLUMN_CLASSNAME],
  [COLUMN_CLASSNAME, FIELD_CLASSNAME]
]);
const INTERNAL_COMPONENT_TYPES = ["stage", "row", "column", "field"];
const INTERNAL_COMPONENT_INDEX_TYPES = INTERNAL_COMPONENT_TYPES.map((type) => `${type}s`);
new Map(
  INTERNAL_COMPONENT_INDEX_TYPES.map((type, index2) => [type, INTERNAL_COMPONENT_TYPES[index2]])
);
const INTERNAL_COMPONENT_INDEX_REGEX = new RegExp(`^${INTERNAL_COMPONENT_INDEX_TYPES.join("|")}.`);
const COMPONENT_TYPES = [...INTERNAL_COMPONENT_TYPES];
const COMPONENT_INDEX_TYPES = [...INTERNAL_COMPONENT_INDEX_TYPES];
const COMPONENT_INDEX_TYPE_MAP = new Map(
  COMPONENT_INDEX_TYPES.map((type, index2) => [type, COMPONENT_TYPES[index2]])
);
const COMPONENT_TYPE_MAP = COMPONENT_TYPES.reduce((acc, type) => {
  acc[type] = type;
  return acc;
}, {});
const COMPONENT_TYPE_CONFIGS = [
  { name: "controls", className: CONTROL_GROUP_CLASSNAME },
  { name: "stage", className: STAGE_CLASSNAME },
  { name: "row", className: ROW_CLASSNAME },
  { name: "column", className: COLUMN_CLASSNAME },
  { name: "field", className: FIELD_CLASSNAME }
];
const COMPONENT_TYPE_CLASSNAMES = {
  controls: CONTROL_GROUP_CLASSNAME,
  stage: STAGE_CLASSNAME,
  row: ROW_CLASSNAME,
  column: COLUMN_CLASSNAME,
  field: FIELD_CLASSNAME
};
const COMPONENT_TYPE_CLASSNAMES_LOOKUP = Object.entries(COMPONENT_TYPE_CLASSNAMES).reduce(
  (acc, [type, className]) => {
    acc[className] = type;
    return acc;
  },
  {}
);
const COMPONENT_TYPE_CLASSNAMES_ARRAY = Object.values(COMPONENT_TYPE_CLASSNAMES);
const COMPONENT_TYPE_CLASSNAMES_REGEXP = new RegExp(`${COMPONENT_TYPE_CLASSNAMES_ARRAY.join("|")}`, "g");
const { childTypeMapVals, childTypeIndexMapVals } = COMPONENT_TYPE_CONFIGS.reduce(
  (acc, { name: name2 }, index2, arr) => {
    const { name: childName } = arr[index2 + 1] || {};
    if (childName) {
      acc.childTypeMapVals.push([name2, childName]);
      acc.childTypeIndexMapVals.push([`${name2}s`, `${childName}s`]);
    }
    return acc;
  },
  { childTypeMapVals: [], childTypeIndexMapVals: [] }
);
const parentTypeMap = childTypeMapVals.slice().map((typeMap) => typeMap.slice().reverse()).reverse();
const CHILD_TYPE_MAP = new Map(childTypeMapVals);
const CHILD_TYPE_INDEX_MAP = new Map(childTypeIndexMapVals);
const PARENT_TYPE_MAP = new Map(parentTypeMap.slice());
const columnTemplates = [
  [{ value: "100.0", label: "100%" }],
  [
    { value: "50.0,50.0", label: "50 | 50" },
    { value: "33.3,66.6", label: "33 | 66" },
    { value: "66.6,33.3", label: "66 | 33" }
  ],
  [
    { value: "33.3,33.3,33.3", label: "33 | 33 | 33" },
    { value: "25.0,25.0,50.0", label: "25 | 25 | 50" },
    { value: "50.0,25.0,25.0", label: "50 | 25 | 25" },
    { value: "25.0,50.0,25.0", label: "25 | 50 | 25" }
  ],
  [{ value: "25.0,25.0,25.0,25.0", label: "25 | 25 | 25 | 25" }],
  [{ value: "20.0,20.0,20.0,20.0,20.0", label: "20 | 20 | 20 | 20 | 20" }],
  [{ value: "16.66,16.66,16.66,16.66,16.66,16.66", label: "16.66 | 16.66 | 16.66 | 16.66 | 16.66 | 16.66" }]
];
const COLUMN_TEMPLATES = new Map(
  columnTemplates.reduce((acc, cur, idx) => {
    acc.push([idx, cur]);
    return acc;
  }, [])
);
const SESSION_FORMDATA_KEY = `${name}-formData`;
const SESSION_LOCALE_KEY = `${name}-locale`;
const ANIMATION_SPEED_BASE = 333;
const ANIMATION_SPEED_FAST = Math.round(ANIMATION_SPEED_BASE / 2);
const ANIMATION_SPEED_SLOW = Math.round(ANIMATION_SPEED_BASE * 2);
const EVENT_FORMEO_SAVED = "formeoSaved";
const EVENT_FORMEO_UPDATED = "formeoUpdated";
const EVENT_FORMEO_CHANGED = "formeoChanged";
const EVENT_FORMEO_UPDATED_STAGE = "formeoUpdatedStage";
const EVENT_FORMEO_UPDATED_ROW = "formeoUpdatedRow";
const EVENT_FORMEO_UPDATED_COLUMN = "formeoUpdatedColumn";
const EVENT_FORMEO_UPDATED_FIELD = "formeoUpdatedField";
const EVENT_FORMEO_CLEARED = "formeoCleared";
const EVENT_FORMEO_ON_RENDER = "formeoOnRender";
const EVENT_FORMEO_CONDITION_UPDATED = "formeoConditionUpdated";
const EVENT_FORMEO_ADDED_ROW = "formeoAddedRow";
const EVENT_FORMEO_ADDED_COLUMN = "formeoAddedColumn";
const EVENT_FORMEO_ADDED_FIELD = "formeoAddedField";
const EVENT_FORMEO_REMOVED_ROW = "formeoRemovedRow";
const EVENT_FORMEO_REMOVED_COLUMN = "formeoRemovedColumn";
const EVENT_FORMEO_REMOVED_FIELD = "formeoRemovedField";
const COMPARISON_OPERATORS = {
  equals: "==",
  notEquals: "!=",
  contains: "⊃",
  notContains: "!⊃"
};
const LOGICAL_OPERATORS = {
  and: "&&",
  or: "||"
};
const ASSIGNMENT_OPERATORS = {
  equals: "="
};
const CONDITION_INPUT_ORDER = [
  "logical",
  "source",
  "sourceProperty",
  "comparison",
  "target",
  "targetProperty",
  "assignment",
  "value"
];
const CHECKABLE_OPTIONS = ["isChecked", "isNotChecked"];
const VISIBLE_OPTIONS = ["isVisible", "isNotVisible"];
const PROPERTY_OPTIONS = ["value"];
const OPERATORS = {
  comparison: COMPARISON_OPERATORS,
  assignment: ASSIGNMENT_OPERATORS,
  logical: LOGICAL_OPERATORS
};
const conditionTypeIf = "if";
const conditionTypeThen = "then";
const CONDITION_TEMPLATE = () => ({
  [conditionTypeIf]: [
    {
      source: "",
      sourceProperty: "",
      comparison: "",
      target: "",
      targetProperty: ""
    }
  ],
  [conditionTypeThen]: [
    {
      target: "",
      targetProperty: "",
      assignment: "",
      value: ""
    }
  ]
});
const UUID_REGEXP = /(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)|(\b[0-9a-f]{8}\b)/g;
const bsColRegExp = /\bcol-\w+-\d+/g;
const iconPrefix = "f-i-";
const DEFAULT_FORMDATA = () => ({
  id: uuid(),
  stages: { [uuid()]: {} },
  rows: {},
  columns: {},
  fields: {}
});
const CHECKED_TYPES = ["selected", "checked"];
const REVERSED_CHECKED_TYPES = CHECKED_TYPES.toReversed();
const toTitleCaseLowers = "a an and as at but by for for from in into near nor of on onto or the to with".split(" ").map((lower) => `\\s${lower}\\s`);
const toTitleCaseRegex = new RegExp(`(?!${toTitleCaseLowers.join("|")})\\w\\S*`, "g");
const regexSpace = /\s+/g;
function toTitleCase(str) {
  if (typeof str !== "string") {
    return str;
  }
  if (str.trim().match(regexSpace)) {
    return str;
  }
  const newString = str.replace(
    toTitleCaseRegex,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).replace(/[A-Z]/g, (word) => ` ${word}`)
  );
  return newString;
}
const slugify = (str, separator = "-") => str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, separator);
const splitAddress = (str) => {
  if (Array.isArray(str)) {
    return str;
  }
  const regex = /[.[\]]/g;
  const matches2 = [];
  let lastIndex = 0;
  let match2 = regex.exec(str);
  while (match2 !== null) {
    matches2.push(str.slice(lastIndex, match2.index));
    lastIndex = match2.index + match2[0].length;
    match2 = regex.exec(str);
  }
  if (lastIndex < str.length) {
    matches2.push(str.slice(lastIndex));
  }
  return matches2.filter(Boolean);
};
const slugifyAddress = (str, separator = "-") => {
  return splitAddress(str).join(separator);
};
const extractTextFromHtml = (htmlString) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || "";
};
const truncateByWord = (str, maxLength, tail = "…") => {
  if (str.length <= maxLength) return str;
  const truncated = str.slice(0, maxLength);
  const spaceIndex = truncated.lastIndexOf(" ");
  let truncatedWord = `${spaceIndex > 0 ? truncated.slice(0, spaceIndex) : truncated}`;
  if (tail) {
    truncatedWord += tail;
  }
  return truncatedWord;
};
var isSymbol_1;
var hasRequiredIsSymbol;
function requireIsSymbol() {
  if (hasRequiredIsSymbol) return isSymbol_1;
  hasRequiredIsSymbol = 1;
  var baseGetTag = require_baseGetTag(), isObjectLike = requireIsObjectLike();
  var symbolTag = "[object Symbol]";
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
  }
  isSymbol_1 = isSymbol;
  return isSymbol_1;
}
var _isKey;
var hasRequired_isKey;
function require_isKey() {
  if (hasRequired_isKey) return _isKey;
  hasRequired_isKey = 1;
  var isArray = requireIsArray(), isSymbol = requireIsSymbol();
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
  function isKey(value, object) {
    if (isArray(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }
  _isKey = isKey;
  return _isKey;
}
var memoize_1;
var hasRequiredMemoize;
function requireMemoize() {
  if (hasRequiredMemoize) return memoize_1;
  hasRequiredMemoize = 1;
  var MapCache = require_MapCache();
  var FUNC_ERROR_TEXT = "Expected a function";
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver != null && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache)();
    return memoized;
  }
  memoize.Cache = MapCache;
  memoize_1 = memoize;
  return memoize_1;
}
var _memoizeCapped;
var hasRequired_memoizeCapped;
function require_memoizeCapped() {
  if (hasRequired_memoizeCapped) return _memoizeCapped;
  hasRequired_memoizeCapped = 1;
  var memoize = requireMemoize();
  var MAX_MEMOIZE_SIZE = 500;
  function memoizeCapped(func) {
    var result = memoize(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });
    var cache = result.cache;
    return result;
  }
  _memoizeCapped = memoizeCapped;
  return _memoizeCapped;
}
var _stringToPath;
var hasRequired_stringToPath;
function require_stringToPath() {
  if (hasRequired_stringToPath) return _stringToPath;
  hasRequired_stringToPath = 1;
  var memoizeCapped = require_memoizeCapped();
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = memoizeCapped(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46) {
      result.push("");
    }
    string.replace(rePropName, function(match2, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match2);
    });
    return result;
  });
  _stringToPath = stringToPath;
  return _stringToPath;
}
var _arrayMap;
var hasRequired_arrayMap;
function require_arrayMap() {
  if (hasRequired_arrayMap) return _arrayMap;
  hasRequired_arrayMap = 1;
  function arrayMap(array, iteratee) {
    var index2 = -1, length = array == null ? 0 : array.length, result = Array(length);
    while (++index2 < length) {
      result[index2] = iteratee(array[index2], index2, array);
    }
    return result;
  }
  _arrayMap = arrayMap;
  return _arrayMap;
}
var _baseToString;
var hasRequired_baseToString;
function require_baseToString() {
  if (hasRequired_baseToString) return _baseToString;
  hasRequired_baseToString = 1;
  var Symbol2 = require_Symbol(), arrayMap = require_arrayMap(), isArray = requireIsArray(), isSymbol = requireIsSymbol();
  var symbolProto = Symbol2 ? Symbol2.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isArray(value)) {
      return arrayMap(value, baseToString) + "";
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -Infinity ? "-0" : result;
  }
  _baseToString = baseToString;
  return _baseToString;
}
var toString_1;
var hasRequiredToString;
function requireToString() {
  if (hasRequiredToString) return toString_1;
  hasRequiredToString = 1;
  var baseToString = require_baseToString();
  function toString(value) {
    return value == null ? "" : baseToString(value);
  }
  toString_1 = toString;
  return toString_1;
}
var _castPath;
var hasRequired_castPath;
function require_castPath() {
  if (hasRequired_castPath) return _castPath;
  hasRequired_castPath = 1;
  var isArray = requireIsArray(), isKey = require_isKey(), stringToPath = require_stringToPath(), toString = requireToString();
  function castPath(value, object) {
    if (isArray(value)) {
      return value;
    }
    return isKey(value, object) ? [value] : stringToPath(toString(value));
  }
  _castPath = castPath;
  return _castPath;
}
var _toKey;
var hasRequired_toKey;
function require_toKey() {
  if (hasRequired_toKey) return _toKey;
  hasRequired_toKey = 1;
  var isSymbol = requireIsSymbol();
  function toKey(value) {
    if (typeof value == "string" || isSymbol(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -Infinity ? "-0" : result;
  }
  _toKey = toKey;
  return _toKey;
}
var _baseGet;
var hasRequired_baseGet;
function require_baseGet() {
  if (hasRequired_baseGet) return _baseGet;
  hasRequired_baseGet = 1;
  var castPath = require_castPath(), toKey = require_toKey();
  function baseGet(object, path) {
    path = castPath(path, object);
    var index2 = 0, length = path.length;
    while (object != null && index2 < length) {
      object = object[toKey(path[index2++])];
    }
    return index2 && index2 == length ? object : void 0;
  }
  _baseGet = baseGet;
  return _baseGet;
}
var get_1;
var hasRequiredGet;
function requireGet() {
  if (hasRequiredGet) return get_1;
  hasRequiredGet = 1;
  var baseGet = require_baseGet();
  function get2(object, path, defaultValue) {
    var result = object == null ? void 0 : baseGet(object, path);
    return result === void 0 ? defaultValue : result;
  }
  get_1 = get2;
  return get_1;
}
var getExports = requireGet();
const lodashGet = /* @__PURE__ */ getDefaultExportFromCjs(getExports);
var _baseSet;
var hasRequired_baseSet;
function require_baseSet() {
  if (hasRequired_baseSet) return _baseSet;
  hasRequired_baseSet = 1;
  var assignValue = require_assignValue(), castPath = require_castPath(), isIndex = require_isIndex(), isObject = requireIsObject(), toKey = require_toKey();
  function baseSet(object, path, value, customizer) {
    if (!isObject(object)) {
      return object;
    }
    path = castPath(path, object);
    var index2 = -1, length = path.length, lastIndex = length - 1, nested = object;
    while (nested != null && ++index2 < length) {
      var key = toKey(path[index2]), newValue = value;
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return object;
      }
      if (index2 != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : void 0;
        if (newValue === void 0) {
          newValue = isObject(objValue) ? objValue : isIndex(path[index2 + 1]) ? [] : {};
        }
      }
      assignValue(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  }
  _baseSet = baseSet;
  return _baseSet;
}
var set_1;
var hasRequiredSet;
function requireSet() {
  if (hasRequiredSet) return set_1;
  hasRequiredSet = 1;
  var baseSet = require_baseSet();
  function set2(object, path, value) {
    return object == null ? object : baseSet(object, path, value);
  }
  set_1 = set2;
  return set_1;
}
var setExports = requireSet();
const lodashSet = /* @__PURE__ */ getDefaultExportFromCjs(setExports);
const get = lodashGet;
const set = lodashSet;
function mergeActions(target, source = {}) {
  const result = { ...target };
  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      if (Object.hasOwn(result, key)) {
        if (Array.isArray(result[key])) {
          result[key].push(source[key]);
        } else {
          result[key] = [result[key], source[key]];
        }
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
}
function objectFromStringArray(...arr) {
  return arr.flat().reduce((acc, item) => {
    acc[item] = item;
    return acc;
  }, {});
}
var _setCacheAdd;
var hasRequired_setCacheAdd;
function require_setCacheAdd() {
  if (hasRequired_setCacheAdd) return _setCacheAdd;
  hasRequired_setCacheAdd = 1;
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
  }
  _setCacheAdd = setCacheAdd;
  return _setCacheAdd;
}
var _setCacheHas;
var hasRequired_setCacheHas;
function require_setCacheHas() {
  if (hasRequired_setCacheHas) return _setCacheHas;
  hasRequired_setCacheHas = 1;
  function setCacheHas(value) {
    return this.__data__.has(value);
  }
  _setCacheHas = setCacheHas;
  return _setCacheHas;
}
var _SetCache;
var hasRequired_SetCache;
function require_SetCache() {
  if (hasRequired_SetCache) return _SetCache;
  hasRequired_SetCache = 1;
  var MapCache = require_MapCache(), setCacheAdd = require_setCacheAdd(), setCacheHas = require_setCacheHas();
  function SetCache(values) {
    var index2 = -1, length = values == null ? 0 : values.length;
    this.__data__ = new MapCache();
    while (++index2 < length) {
      this.add(values[index2]);
    }
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;
  _SetCache = SetCache;
  return _SetCache;
}
var _arraySome;
var hasRequired_arraySome;
function require_arraySome() {
  if (hasRequired_arraySome) return _arraySome;
  hasRequired_arraySome = 1;
  function arraySome(array, predicate) {
    var index2 = -1, length = array == null ? 0 : array.length;
    while (++index2 < length) {
      if (predicate(array[index2], index2, array)) {
        return true;
      }
    }
    return false;
  }
  _arraySome = arraySome;
  return _arraySome;
}
var _cacheHas;
var hasRequired_cacheHas;
function require_cacheHas() {
  if (hasRequired_cacheHas) return _cacheHas;
  hasRequired_cacheHas = 1;
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  _cacheHas = cacheHas;
  return _cacheHas;
}
var _equalArrays;
var hasRequired_equalArrays;
function require_equalArrays() {
  if (hasRequired_equalArrays) return _equalArrays;
  hasRequired_equalArrays = 1;
  var SetCache = require_SetCache(), arraySome = require_arraySome(), cacheHas = require_cacheHas();
  var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    var arrStacked = stack.get(array);
    var othStacked = stack.get(other);
    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array;
    }
    var index2 = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
    stack.set(array, other);
    stack.set(other, array);
    while (++index2 < arrLength) {
      var arrValue = array[index2], othValue = other[index2];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index2, other, array, stack) : customizer(arrValue, othValue, index2, array, other, stack);
      }
      if (compared !== void 0) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      if (seen) {
        if (!arraySome(other, function(othValue2, othIndex) {
          if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }
    stack["delete"](array);
    stack["delete"](other);
    return result;
  }
  _equalArrays = equalArrays;
  return _equalArrays;
}
var _mapToArray;
var hasRequired_mapToArray;
function require_mapToArray() {
  if (hasRequired_mapToArray) return _mapToArray;
  hasRequired_mapToArray = 1;
  function mapToArray(map2) {
    var index2 = -1, result = Array(map2.size);
    map2.forEach(function(value, key) {
      result[++index2] = [key, value];
    });
    return result;
  }
  _mapToArray = mapToArray;
  return _mapToArray;
}
var _setToArray;
var hasRequired_setToArray;
function require_setToArray() {
  if (hasRequired_setToArray) return _setToArray;
  hasRequired_setToArray = 1;
  function setToArray(set2) {
    var index2 = -1, result = Array(set2.size);
    set2.forEach(function(value) {
      result[++index2] = value;
    });
    return result;
  }
  _setToArray = setToArray;
  return _setToArray;
}
var _equalByTag;
var hasRequired_equalByTag;
function require_equalByTag() {
  if (hasRequired_equalByTag) return _equalByTag;
  hasRequired_equalByTag = 1;
  var Symbol2 = require_Symbol(), Uint8Array = require_Uint8Array(), eq = requireEq(), equalArrays = require_equalArrays(), mapToArray = require_mapToArray(), setToArray = require_setToArray();
  var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
  var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
  var symbolProto = Symbol2 ? Symbol2.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
  function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag:
        if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;
      case arrayBufferTag:
        if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
          return false;
        }
        return true;
      case boolTag:
      case dateTag:
      case numberTag:
        return eq(+object, +other);
      case errorTag:
        return object.name == other.name && object.message == other.message;
      case regexpTag:
      case stringTag:
        return object == other + "";
      case mapTag:
        var convert = mapToArray;
      case setTag:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
        convert || (convert = setToArray);
        if (object.size != other.size && !isPartial) {
          return false;
        }
        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG;
        stack.set(object, other);
        var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack["delete"](object);
        return result;
      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object) == symbolValueOf.call(other);
        }
    }
    return false;
  }
  _equalByTag = equalByTag;
  return _equalByTag;
}
var _arrayPush;
var hasRequired_arrayPush;
function require_arrayPush() {
  if (hasRequired_arrayPush) return _arrayPush;
  hasRequired_arrayPush = 1;
  function arrayPush(array, values) {
    var index2 = -1, length = values.length, offset = array.length;
    while (++index2 < length) {
      array[offset + index2] = values[index2];
    }
    return array;
  }
  _arrayPush = arrayPush;
  return _arrayPush;
}
var _baseGetAllKeys;
var hasRequired_baseGetAllKeys;
function require_baseGetAllKeys() {
  if (hasRequired_baseGetAllKeys) return _baseGetAllKeys;
  hasRequired_baseGetAllKeys = 1;
  var arrayPush = require_arrayPush(), isArray = requireIsArray();
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
  }
  _baseGetAllKeys = baseGetAllKeys;
  return _baseGetAllKeys;
}
var _arrayFilter;
var hasRequired_arrayFilter;
function require_arrayFilter() {
  if (hasRequired_arrayFilter) return _arrayFilter;
  hasRequired_arrayFilter = 1;
  function arrayFilter(array, predicate) {
    var index2 = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
    while (++index2 < length) {
      var value = array[index2];
      if (predicate(value, index2, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  _arrayFilter = arrayFilter;
  return _arrayFilter;
}
var stubArray_1;
var hasRequiredStubArray;
function requireStubArray() {
  if (hasRequiredStubArray) return stubArray_1;
  hasRequiredStubArray = 1;
  function stubArray() {
    return [];
  }
  stubArray_1 = stubArray;
  return stubArray_1;
}
var _getSymbols;
var hasRequired_getSymbols;
function require_getSymbols() {
  if (hasRequired_getSymbols) return _getSymbols;
  hasRequired_getSymbols = 1;
  var arrayFilter = require_arrayFilter(), stubArray = requireStubArray();
  var objectProto = Object.prototype;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };
  _getSymbols = getSymbols;
  return _getSymbols;
}
var _nativeKeys;
var hasRequired_nativeKeys;
function require_nativeKeys() {
  if (hasRequired_nativeKeys) return _nativeKeys;
  hasRequired_nativeKeys = 1;
  var overArg = require_overArg();
  var nativeKeys = overArg(Object.keys, Object);
  _nativeKeys = nativeKeys;
  return _nativeKeys;
}
var _baseKeys;
var hasRequired_baseKeys;
function require_baseKeys() {
  if (hasRequired_baseKeys) return _baseKeys;
  hasRequired_baseKeys = 1;
  var isPrototype = require_isPrototype(), nativeKeys = require_nativeKeys();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }
  _baseKeys = baseKeys;
  return _baseKeys;
}
var keys_1;
var hasRequiredKeys;
function requireKeys() {
  if (hasRequiredKeys) return keys_1;
  hasRequiredKeys = 1;
  var arrayLikeKeys = require_arrayLikeKeys(), baseKeys = require_baseKeys(), isArrayLike = requireIsArrayLike();
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }
  keys_1 = keys;
  return keys_1;
}
var _getAllKeys;
var hasRequired_getAllKeys;
function require_getAllKeys() {
  if (hasRequired_getAllKeys) return _getAllKeys;
  hasRequired_getAllKeys = 1;
  var baseGetAllKeys = require_baseGetAllKeys(), getSymbols = require_getSymbols(), keys = requireKeys();
  function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols);
  }
  _getAllKeys = getAllKeys;
  return _getAllKeys;
}
var _equalObjects;
var hasRequired_equalObjects;
function require_equalObjects() {
  if (hasRequired_equalObjects) return _equalObjects;
  hasRequired_equalObjects = 1;
  var getAllKeys = require_getAllKeys();
  var COMPARE_PARTIAL_FLAG = 1;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index2 = objLength;
    while (index2--) {
      var key = objProps[index2];
      if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
        return false;
      }
    }
    var objStacked = stack.get(object);
    var othStacked = stack.get(other);
    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);
    var skipCtor = isPartial;
    while (++index2 < objLength) {
      key = objProps[index2];
      var objValue = object[key], othValue = other[key];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
      }
      if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor, othCtor = other.constructor;
      if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack["delete"](object);
    stack["delete"](other);
    return result;
  }
  _equalObjects = equalObjects;
  return _equalObjects;
}
var _DataView;
var hasRequired_DataView;
function require_DataView() {
  if (hasRequired_DataView) return _DataView;
  hasRequired_DataView = 1;
  var getNative = require_getNative(), root = require_root();
  var DataView = getNative(root, "DataView");
  _DataView = DataView;
  return _DataView;
}
var _Promise;
var hasRequired_Promise;
function require_Promise() {
  if (hasRequired_Promise) return _Promise;
  hasRequired_Promise = 1;
  var getNative = require_getNative(), root = require_root();
  var Promise2 = getNative(root, "Promise");
  _Promise = Promise2;
  return _Promise;
}
var _Set;
var hasRequired_Set;
function require_Set() {
  if (hasRequired_Set) return _Set;
  hasRequired_Set = 1;
  var getNative = require_getNative(), root = require_root();
  var Set2 = getNative(root, "Set");
  _Set = Set2;
  return _Set;
}
var _WeakMap;
var hasRequired_WeakMap;
function require_WeakMap() {
  if (hasRequired_WeakMap) return _WeakMap;
  hasRequired_WeakMap = 1;
  var getNative = require_getNative(), root = require_root();
  var WeakMap = getNative(root, "WeakMap");
  _WeakMap = WeakMap;
  return _WeakMap;
}
var _getTag;
var hasRequired_getTag;
function require_getTag() {
  if (hasRequired_getTag) return _getTag;
  hasRequired_getTag = 1;
  var DataView = require_DataView(), Map2 = require_Map(), Promise2 = require_Promise(), Set2 = require_Set(), WeakMap = require_WeakMap(), baseGetTag = require_baseGetTag(), toSource = require_toSource();
  var mapTag = "[object Map]", objectTag = "[object Object]", promiseTag = "[object Promise]", setTag = "[object Set]", weakMapTag = "[object WeakMap]";
  var dataViewTag = "[object DataView]";
  var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map2), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set2), weakMapCtorString = toSource(WeakMap);
  var getTag = baseGetTag;
  if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
    getTag = function(value) {
      var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag;
          case mapCtorString:
            return mapTag;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag;
          case weakMapCtorString:
            return weakMapTag;
        }
      }
      return result;
    };
  }
  _getTag = getTag;
  return _getTag;
}
var _baseIsEqualDeep;
var hasRequired_baseIsEqualDeep;
function require_baseIsEqualDeep() {
  if (hasRequired_baseIsEqualDeep) return _baseIsEqualDeep;
  hasRequired_baseIsEqualDeep = 1;
  var Stack = require_Stack(), equalArrays = require_equalArrays(), equalByTag = require_equalByTag(), equalObjects = require_equalObjects(), getTag = require_getTag(), isArray = requireIsArray(), isBuffer2 = requireIsBuffer(), isTypedArray = requireIsTypedArray();
  var COMPARE_PARTIAL_FLAG = 1;
  var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;
    var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
    if (isSameTag && isBuffer2(object)) {
      if (!isBuffer2(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack());
      return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack());
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }
  _baseIsEqualDeep = baseIsEqualDeep;
  return _baseIsEqualDeep;
}
var _baseIsEqual;
var hasRequired_baseIsEqual;
function require_baseIsEqual() {
  if (hasRequired_baseIsEqual) return _baseIsEqual;
  hasRequired_baseIsEqual = 1;
  var baseIsEqualDeep = require_baseIsEqualDeep(), isObjectLike = requireIsObjectLike();
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }
  _baseIsEqual = baseIsEqual;
  return _baseIsEqual;
}
var isEqual_1;
var hasRequiredIsEqual;
function requireIsEqual() {
  if (hasRequiredIsEqual) return isEqual_1;
  hasRequiredIsEqual = 1;
  var baseIsEqual = require_baseIsEqual();
  function isEqual2(value, other) {
    return baseIsEqual(value, other);
  }
  isEqual_1 = isEqual2;
  return isEqual_1;
}
var isEqualExports = requireIsEqual();
const isEqual = /* @__PURE__ */ getDefaultExportFromCjs(isEqualExports);
const getChangeType = (oldVal, newVal) => {
  if (oldVal === void 0) {
    return "added";
  }
  if (newVal === void 0) {
    return "removed";
  }
  if (isEqual(oldVal, newVal)) {
    return "unchanged";
  }
  return "changed";
};
class Data {
  constructor(name2, data = /* @__PURE__ */ Object.create(null)) {
    this.name = name2;
    this.data = data;
    this.dataPath = "";
  }
  get size() {
    return Object.keys(this.data).length;
  }
  get js() {
    return this.data;
  }
  get json() {
    return this.data;
  }
  toJSON = (data, format) => JSON.stringify(data, null, format);
  get = (path) => get(this.data, path);
  set(path, newVal) {
    const oldVal = get(this.data, path);
    const data = set(this.data, path, newVal);
    const callbackPath = Array.isArray(path) ? path.join(".") : path;
    const callBackGroups = Object.keys(this.setCallbacks).filter((setKey) => new RegExp(setKey).test(callbackPath));
    const cbArgs = { newVal, oldVal, path };
    for (const cbGroup of callBackGroups) {
      for (const cb of this.setCallbacks[cbGroup]) {
        cb(cbArgs);
      }
    }
    if (!this.disableEvents) {
      const evtData = {
        entity: this,
        dataPath: this.dataPath.replace(/\.+$/, ""),
        changePath: this.dataPath + path,
        value: newVal,
        data,
        changeType: getChangeType(oldVal, newVal),
        src: this.dom
      };
      if (oldVal) {
        evtData.previousValue = oldVal;
      }
      events.formeoUpdated(evtData);
      if (this.name) {
        const componentEventMap = {
          stage: EVENT_FORMEO_UPDATED_STAGE,
          row: EVENT_FORMEO_UPDATED_ROW,
          column: EVENT_FORMEO_UPDATED_COLUMN,
          field: EVENT_FORMEO_UPDATED_FIELD
        };
        const specificEvent = componentEventMap[this.name];
        if (specificEvent) {
          events.formeoUpdated(evtData, specificEvent);
        }
      }
    }
    return data;
  }
  addSetCallback(path, cb) {
    if (this.setCallbacks[path]) {
      this.setCallbacks[path].push(cb);
    } else {
      this.setCallbacks[path] = [cb];
    }
  }
  removeSetCallback(path, cb) {
    this.setCallbacks[path] = this.setCallbacks[path].filter((setCb) => setCb !== cb);
  }
  add = (id, data = /* @__PURE__ */ Object.create(null)) => {
    const { id: dataId } = data;
    const elemId = id || dataId || uuid();
    return this.set(elemId, data);
  };
  remove = (path) => {
    const delPath = splitAddress(path);
    const delItem = delPath.pop();
    const parent = this.get(delPath);
    if (Array.isArray(parent)) {
      parent.splice(Number(delItem), 1);
    } else if (parent) {
      delete parent[delItem];
    }
    return parent;
  };
  empty() {
    this.data = /* @__PURE__ */ Object.create(null);
  }
  getData = () => {
    return Object.entries(this.data).reduce((acc, [key, val]) => {
      acc[key] = val?.data ? val.getData() : val;
      return acc;
    }, {});
  };
  setCallbacks = {};
  configVal = /* @__PURE__ */ Object.create(null);
}
class ComponentData extends Data {
  load = (dataArg) => {
    const data = parseData(dataArg);
    this.empty();
    for (const [key, val] of Object.entries(data)) {
      this.add(key, val);
    }
    return this.data;
  };
  /**
   * Retrieves data from the specified path or adds new data if no path is provided.
   *
   * @param {string} [path] - The path to retrieve data from. If not provided, new data will be added.
   * @returns {*} The data retrieved from the specified path or the result of adding new data.
   */
  get = (path) => path ? get(this.data, path) : this.add();
  /**
   * Adds a new component with the given id and data.
   *
   * @param {string} id - The unique identifier for the component. If not provided, a new UUID will be generated.
   * @param {Object} [data=Object.create(null)] - The data to initialize the component with.
   * @returns {Object} The newly created component.
   */
  add = (id, data = /* @__PURE__ */ Object.create(null)) => {
    const elemId = id || uuid();
    const component = this.Component({ ...data, id: elemId });
    this.data[elemId] = component;
    this.active = component;
    const componentEventMap = {
      row: EVENT_FORMEO_ADDED_ROW,
      column: EVENT_FORMEO_ADDED_COLUMN,
      field: EVENT_FORMEO_ADDED_FIELD
    };
    const addEvent = componentEventMap[this.name];
    if (addEvent) {
      events.formeoUpdated(
        {
          entity: component,
          componentId: elemId,
          componentType: this.name,
          data: component.data
        },
        addEvent
      );
    }
    return component;
  };
  /**
   * removes a component form the index
   * @param {String|Array} componentId
   */
  remove = (componentId) => {
    if (Array.isArray(componentId)) {
      for (const id of componentId) {
        this.get(id).remove();
      }
    } else {
      this.get(componentId).remove();
    }
    return this.data;
  };
  /**
   * Deletes a component from the data object.
   *
   * @param {string} componentId - The ID of the component to delete.
   * @returns {string} The ID of the deleted component.
   */
  delete = (componentId) => {
    delete this.data[componentId];
    return componentId;
  };
  /**
   * Clears all instances from the store
   * @param {Object} evt
   */
  clearAll = (isAnimated = true) => {
    const promises = Object.values(this.data).map((component) => component.empty(isAnimated));
    return Promise.all(promises);
  };
  /**
   * Extends the configVal for a component type,
   * eventually read by Component
   * @return {Object} configVal
   */
  set config(config) {
    this.configVal = merge(this.configVal, clone$1(config));
  }
  /**
   * Reads configVal for a component type
   * @return {Object} configVal
   */
  get config() {
    return this.configVal;
  }
  conditionMap = /* @__PURE__ */ new Map();
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    if (i2 % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof = function(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof(obj);
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = arguments[i2];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i2;
  for (i2 = 0; i2 < sourceKeys.length; i2++) {
    key = sourceKeys[i2];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i2;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
      key = sourceSymbolKeys[i2];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
var version = "1.15.3";
function userAgent(pattern) {
  if (typeof window !== "undefined" && window.navigator) {
    return !!/* @__PURE__ */ navigator.userAgent.match(pattern);
  }
}
var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
var Edge = userAgent(/Edge/i);
var FireFox = userAgent(/firefox/i);
var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
var IOS = userAgent(/iP(ad|od|hone)/i);
var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
var captureMode = {
  capture: false,
  passive: false
};
function on(el, event, fn) {
  el.addEventListener(event, fn, !IE11OrLess && captureMode);
}
function off(el, event, fn) {
  el.removeEventListener(event, fn, !IE11OrLess && captureMode);
}
function matches(el, selector) {
  if (!selector) return;
  selector[0] === ">" && (selector = selector.substring(1));
  if (el) {
    try {
      if (el.matches) {
        return el.matches(selector);
      } else if (el.msMatchesSelector) {
        return el.msMatchesSelector(selector);
      } else if (el.webkitMatchesSelector) {
        return el.webkitMatchesSelector(selector);
      }
    } catch (_) {
      return false;
    }
  }
  return false;
}
function getParentOrHost(el) {
  return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
}
function closest(el, selector, ctx, includeCTX) {
  if (el) {
    ctx = ctx || document;
    do {
      if (selector != null && (selector[0] === ">" ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
        return el;
      }
      if (el === ctx) break;
    } while (el = getParentOrHost(el));
  }
  return null;
}
var R_SPACE = /\s+/g;
function toggleClass(el, name2, state) {
  if (el && name2) {
    if (el.classList) {
      el.classList[state ? "add" : "remove"](name2);
    } else {
      var className = (" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name2 + " ", " ");
      el.className = (className + (state ? " " + name2 : "")).replace(R_SPACE, " ");
    }
  }
}
function css(el, prop, val) {
  var style = el && el.style;
  if (style) {
    if (val === void 0) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        val = document.defaultView.getComputedStyle(el, "");
      } else if (el.currentStyle) {
        val = el.currentStyle;
      }
      return prop === void 0 ? val : val[prop];
    } else {
      if (!(prop in style) && prop.indexOf("webkit") === -1) {
        prop = "-webkit-" + prop;
      }
      style[prop] = val + (typeof val === "string" ? "" : "px");
    }
  }
}
function matrix(el, selfOnly) {
  var appliedTransforms = "";
  if (typeof el === "string") {
    appliedTransforms = el;
  } else {
    do {
      var transform = css(el, "transform");
      if (transform && transform !== "none") {
        appliedTransforms = transform + " " + appliedTransforms;
      }
    } while (!selfOnly && (el = el.parentNode));
  }
  var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
  return matrixFn && new matrixFn(appliedTransforms);
}
function find(ctx, tagName, iterator) {
  if (ctx) {
    var list = ctx.getElementsByTagName(tagName), i2 = 0, n = list.length;
    if (iterator) {
      for (; i2 < n; i2++) {
        iterator(list[i2], i2);
      }
    }
    return list;
  }
  return [];
}
function getWindowScrollingElement() {
  var scrollingElement = document.scrollingElement;
  if (scrollingElement) {
    return scrollingElement;
  } else {
    return document.documentElement;
  }
}
function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
  if (!el.getBoundingClientRect && el !== window) return;
  var elRect, top, left, bottom, right, height, width;
  if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
    elRect = el.getBoundingClientRect();
    top = elRect.top;
    left = elRect.left;
    bottom = elRect.bottom;
    right = elRect.right;
    height = elRect.height;
    width = elRect.width;
  } else {
    top = 0;
    left = 0;
    bottom = window.innerHeight;
    right = window.innerWidth;
    height = window.innerHeight;
    width = window.innerWidth;
  }
  if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
    container = container || el.parentNode;
    if (!IE11OrLess) {
      do {
        if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
          var containerRect = container.getBoundingClientRect();
          top -= containerRect.top + parseInt(css(container, "border-top-width"));
          left -= containerRect.left + parseInt(css(container, "border-left-width"));
          bottom = top + elRect.height;
          right = left + elRect.width;
          break;
        }
      } while (container = container.parentNode);
    }
  }
  if (undoScale && el !== window) {
    var elMatrix = matrix(container || el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
    if (elMatrix) {
      top /= scaleY;
      left /= scaleX;
      width /= scaleX;
      height /= scaleY;
      bottom = top + height;
      right = left + width;
    }
  }
  return {
    top,
    left,
    bottom,
    right,
    width,
    height
  };
}
function isScrolledPast(el, elSide, parentSide) {
  var parent = getParentAutoScrollElement(el, true), elSideVal = getRect(el)[elSide];
  while (parent) {
    var parentSideVal = getRect(parent)[parentSide], visible2 = void 0;
    {
      visible2 = elSideVal >= parentSideVal;
    }
    if (!visible2) return parent;
    if (parent === getWindowScrollingElement()) break;
    parent = getParentAutoScrollElement(parent, false);
  }
  return false;
}
function getChild(el, childNum, options, includeDragEl) {
  var currentChild = 0, i2 = 0, children = el.children;
  while (i2 < children.length) {
    if (children[i2].style.display !== "none" && children[i2] !== Sortable.ghost && (includeDragEl || children[i2] !== Sortable.dragged) && closest(children[i2], options.draggable, el, false)) {
      if (currentChild === childNum) {
        return children[i2];
      }
      currentChild++;
    }
    i2++;
  }
  return null;
}
function lastChild(el, selector) {
  var last = el.lastElementChild;
  while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
    last = last.previousElementSibling;
  }
  return last || null;
}
function index$8(el, selector) {
  var index2 = 0;
  if (!el || !el.parentNode) {
    return -1;
  }
  while (el = el.previousElementSibling) {
    if (el.nodeName.toUpperCase() !== "TEMPLATE" && el !== Sortable.clone && (!selector || matches(el, selector))) {
      index2++;
    }
  }
  return index2;
}
function getRelativeScrollOffset(el) {
  var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
  if (el) {
    do {
      var elMatrix = matrix(el), scaleX = elMatrix.a, scaleY = elMatrix.d;
      offsetLeft += el.scrollLeft * scaleX;
      offsetTop += el.scrollTop * scaleY;
    } while (el !== winScroller && (el = el.parentNode));
  }
  return [offsetLeft, offsetTop];
}
function indexOfObject(arr, obj) {
  for (var i2 in arr) {
    if (!arr.hasOwnProperty(i2)) continue;
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === arr[i2][key]) return Number(i2);
    }
  }
  return -1;
}
function getParentAutoScrollElement(el, includeSelf) {
  if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
  var elem = el;
  var gotSelf = false;
  do {
    if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
      var elemCSS = css(elem);
      if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
        if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
        if (gotSelf || includeSelf) return elem;
        gotSelf = true;
      }
    }
  } while (elem = elem.parentNode);
  return getWindowScrollingElement();
}
function extend(dst, src) {
  if (dst && src) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        dst[key] = src[key];
      }
    }
  }
  return dst;
}
function isRectEqual(rect1, rect2) {
  return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
}
var _throttleTimeout;
function throttle(callback, ms) {
  return function() {
    if (!_throttleTimeout) {
      var args = arguments, _this = this;
      if (args.length === 1) {
        callback.call(_this, args[0]);
      } else {
        callback.apply(_this, args);
      }
      _throttleTimeout = setTimeout(function() {
        _throttleTimeout = void 0;
      }, ms);
    }
  };
}
function cancelThrottle() {
  clearTimeout(_throttleTimeout);
  _throttleTimeout = void 0;
}
function scrollBy(el, x, y) {
  el.scrollLeft += x;
  el.scrollTop += y;
}
function clone(el) {
  var Polymer = window.Polymer;
  var $ = window.jQuery || window.Zepto;
  if (Polymer && Polymer.dom) {
    return Polymer.dom(el).cloneNode(true);
  } else if ($) {
    return $(el).clone(true)[0];
  } else {
    return el.cloneNode(true);
  }
}
function getChildContainingRectFromElement(container, options, ghostEl2) {
  var rect = {};
  Array.from(container.children).forEach(function(child) {
    var _rect$left, _rect$top, _rect$right, _rect$bottom;
    if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl2) return;
    var childRect = getRect(child);
    rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity, childRect.left);
    rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity, childRect.top);
    rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity, childRect.right);
    rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity, childRect.bottom);
  });
  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}
var expando = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
function AnimationStateManager() {
  var animationStates = [], animationCallbackId;
  return {
    captureAnimationState: function captureAnimationState() {
      animationStates = [];
      if (!this.options.animation) return;
      var children = [].slice.call(this.el.children);
      children.forEach(function(child) {
        if (css(child, "display") === "none" || child === Sortable.ghost) return;
        animationStates.push({
          target: child,
          rect: getRect(child)
        });
        var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
        if (child.thisAnimationDuration) {
          var childMatrix = matrix(child, true);
          if (childMatrix) {
            fromRect.top -= childMatrix.f;
            fromRect.left -= childMatrix.e;
          }
        }
        child.fromRect = fromRect;
      });
    },
    addAnimationState: function addAnimationState(state) {
      animationStates.push(state);
    },
    removeAnimationState: function removeAnimationState(target) {
      animationStates.splice(indexOfObject(animationStates, {
        target
      }), 1);
    },
    animateAll: function animateAll(callback) {
      var _this = this;
      if (!this.options.animation) {
        clearTimeout(animationCallbackId);
        if (typeof callback === "function") callback();
        return;
      }
      var animating = false, animationTime = 0;
      animationStates.forEach(function(state) {
        var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
        if (targetMatrix) {
          toRect.top -= targetMatrix.f;
          toRect.left -= targetMatrix.e;
        }
        target.toRect = toRect;
        if (target.thisAnimationDuration) {
          if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
          (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
            time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
          }
        }
        if (!isRectEqual(toRect, fromRect)) {
          target.prevFromRect = fromRect;
          target.prevToRect = toRect;
          if (!time) {
            time = _this.options.animation;
          }
          _this.animate(target, animatingRect, toRect, time);
        }
        if (time) {
          animating = true;
          animationTime = Math.max(animationTime, time);
          clearTimeout(target.animationResetTimer);
          target.animationResetTimer = setTimeout(function() {
            target.animationTime = 0;
            target.prevFromRect = null;
            target.fromRect = null;
            target.prevToRect = null;
            target.thisAnimationDuration = null;
          }, time);
          target.thisAnimationDuration = time;
        }
      });
      clearTimeout(animationCallbackId);
      if (!animating) {
        if (typeof callback === "function") callback();
      } else {
        animationCallbackId = setTimeout(function() {
          if (typeof callback === "function") callback();
        }, animationTime);
      }
      animationStates = [];
    },
    animate: function animate2(target, currentRect, toRect, duration) {
      if (duration) {
        css(target, "transition", "");
        css(target, "transform", "");
        var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
        target.animatingX = !!translateX;
        target.animatingY = !!translateY;
        css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
        this.forRepaintDummy = repaint(target);
        css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
        css(target, "transform", "translate3d(0,0,0)");
        typeof target.animated === "number" && clearTimeout(target.animated);
        target.animated = setTimeout(function() {
          css(target, "transition", "");
          css(target, "transform", "");
          target.animated = false;
          target.animatingX = false;
          target.animatingY = false;
        }, duration);
      }
    }
  };
}
function repaint(target) {
  return target.offsetWidth;
}
function calculateRealTime(animatingRect, fromRect, toRect, options) {
  return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
}
var plugins = [];
var defaults$3 = {
  initializeByDefault: true
};
var PluginManager = {
  mount: function mount(plugin) {
    for (var option2 in defaults$3) {
      if (defaults$3.hasOwnProperty(option2) && !(option2 in plugin)) {
        plugin[option2] = defaults$3[option2];
      }
    }
    plugins.forEach(function(p) {
      if (p.pluginName === plugin.pluginName) {
        throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
      }
    });
    plugins.push(plugin);
  },
  pluginEvent: function pluginEvent(eventName, sortable, evt) {
    var _this = this;
    this.eventCanceled = false;
    evt.cancel = function() {
      _this.eventCanceled = true;
    };
    var eventNameGlobal = eventName + "Global";
    plugins.forEach(function(plugin) {
      if (!sortable[plugin.pluginName]) return;
      if (sortable[plugin.pluginName][eventNameGlobal]) {
        sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
          sortable
        }, evt));
      }
      if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
        sortable[plugin.pluginName][eventName](_objectSpread2({
          sortable
        }, evt));
      }
    });
  },
  initializePlugins: function initializePlugins(sortable, el, defaults2, options) {
    plugins.forEach(function(plugin) {
      var pluginName = plugin.pluginName;
      if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
      var initialized = new plugin(sortable, el, sortable.options);
      initialized.sortable = sortable;
      initialized.options = sortable.options;
      sortable[pluginName] = initialized;
      _extends(defaults2, initialized.defaults);
    });
    for (var option2 in sortable.options) {
      if (!sortable.options.hasOwnProperty(option2)) continue;
      var modified = this.modifyOption(sortable, option2, sortable.options[option2]);
      if (typeof modified !== "undefined") {
        sortable.options[option2] = modified;
      }
    }
  },
  getEventProperties: function getEventProperties(name2, sortable) {
    var eventProperties = {};
    plugins.forEach(function(plugin) {
      if (typeof plugin.eventProperties !== "function") return;
      _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name2));
    });
    return eventProperties;
  },
  modifyOption: function modifyOption(sortable, name2, value) {
    var modifiedValue;
    plugins.forEach(function(plugin) {
      if (!sortable[plugin.pluginName]) return;
      if (plugin.optionListeners && typeof plugin.optionListeners[name2] === "function") {
        modifiedValue = plugin.optionListeners[name2].call(sortable[plugin.pluginName], value);
      }
    });
    return modifiedValue;
  }
};
function dispatchEvent(_ref) {
  var sortable = _ref.sortable, rootEl2 = _ref.rootEl, name2 = _ref.name, targetEl = _ref.targetEl, cloneEl2 = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex2 = _ref.oldIndex, newIndex2 = _ref.newIndex, oldDraggableIndex2 = _ref.oldDraggableIndex, newDraggableIndex2 = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
  sortable = sortable || rootEl2 && rootEl2[expando];
  if (!sortable) return;
  var evt, options = sortable.options, onName = "on" + name2.charAt(0).toUpperCase() + name2.substr(1);
  if (window.CustomEvent && !IE11OrLess && !Edge) {
    evt = new CustomEvent(name2, {
      bubbles: true,
      cancelable: true
    });
  } else {
    evt = document.createEvent("Event");
    evt.initEvent(name2, true, true);
  }
  evt.to = toEl || rootEl2;
  evt.from = fromEl || rootEl2;
  evt.item = targetEl || rootEl2;
  evt.clone = cloneEl2;
  evt.oldIndex = oldIndex2;
  evt.newIndex = newIndex2;
  evt.oldDraggableIndex = oldDraggableIndex2;
  evt.newDraggableIndex = newDraggableIndex2;
  evt.originalEvent = originalEvent;
  evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
  var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name2, sortable));
  for (var option2 in allEventProperties) {
    evt[option2] = allEventProperties[option2];
  }
  if (rootEl2) {
    rootEl2.dispatchEvent(evt);
  }
  if (options[onName]) {
    options[onName].call(sortable, evt);
  }
}
var _excluded = ["evt"];
var pluginEvent2 = function pluginEvent3(eventName, sortable) {
  var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
  PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
    dragEl,
    parentEl,
    ghostEl,
    rootEl,
    nextEl,
    lastDownEl,
    cloneEl,
    cloneHidden,
    dragStarted: moved,
    putSortable,
    activeSortable: Sortable.active,
    originalEvent,
    oldIndex,
    oldDraggableIndex,
    newIndex,
    newDraggableIndex,
    hideGhostForTarget: _hideGhostForTarget,
    unhideGhostForTarget: _unhideGhostForTarget,
    cloneNowHidden: function cloneNowHidden() {
      cloneHidden = true;
    },
    cloneNowShown: function cloneNowShown() {
      cloneHidden = false;
    },
    dispatchSortableEvent: function dispatchSortableEvent(name2) {
      _dispatchEvent({
        sortable,
        name: name2,
        originalEvent
      });
    }
  }, data));
};
function _dispatchEvent(info) {
  dispatchEvent(_objectSpread2({
    putSortable,
    cloneEl,
    targetEl: dragEl,
    rootEl,
    oldIndex,
    oldDraggableIndex,
    newIndex,
    newDraggableIndex
  }, info));
}
var dragEl, parentEl, ghostEl, rootEl, nextEl, lastDownEl, cloneEl, cloneHidden, oldIndex, newIndex, oldDraggableIndex, newDraggableIndex, activeGroup, putSortable, awaitingDragStarted = false, ignoreNextClick = false, sortables = [], tapEvt, touchEvt, lastDx, lastDy, tapDistanceLeft, tapDistanceTop, moved, lastTarget, lastDirection, pastFirstInvertThresh = false, isCircumstantialInvert = false, targetMoveDistance, ghostRelativeParent, ghostRelativeParentInitialScroll = [], _silent = false, savedInputChecked = [];
var documentExists = typeof document !== "undefined", PositionGhostAbsolutely = IOS, CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float", supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div"), supportCssPointerEvents = (function() {
  if (!documentExists) return;
  if (IE11OrLess) {
    return false;
  }
  var el = document.createElement("x");
  el.style.cssText = "pointer-events:auto";
  return el.style.pointerEvents === "auto";
})(), _detectDirection = function _detectDirection2(el, options) {
  var elCSS = css(el), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el, 0, options), child2 = getChild(el, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
  if (elCSS.display === "flex") {
    return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
  }
  if (elCSS.display === "grid") {
    return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
  }
  if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
    var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
    return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
  }
  return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
}, _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
  var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
  return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
}, _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y) {
  var ret;
  sortables.some(function(sortable) {
    var threshold = sortable[expando].options.emptyInsertThreshold;
    if (!threshold || lastChild(sortable)) return;
    var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
    if (insideHorizontally && insideVertically) {
      return ret = sortable;
    }
  });
  return ret;
}, _prepareGroup = function _prepareGroup2(options) {
  function toFn(value, pull) {
    return function(to, from, dragEl2, evt) {
      var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
      if (value == null && (pull || sameGroup)) {
        return true;
      } else if (value == null || value === false) {
        return false;
      } else if (pull && value === "clone") {
        return value;
      } else if (typeof value === "function") {
        return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
      } else {
        var otherGroup = (pull ? to : from).options.group.name;
        return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
      }
    };
  }
  var group = {};
  var originalGroup = options.group;
  if (!originalGroup || _typeof(originalGroup) != "object") {
    originalGroup = {
      name: originalGroup
    };
  }
  group.name = originalGroup.name;
  group.checkPull = toFn(originalGroup.pull, true);
  group.checkPut = toFn(originalGroup.put);
  group.revertClone = originalGroup.revertClone;
  options.group = group;
}, _hideGhostForTarget = function _hideGhostForTarget2() {
  if (!supportCssPointerEvents && ghostEl) {
    css(ghostEl, "display", "none");
  }
}, _unhideGhostForTarget = function _unhideGhostForTarget2() {
  if (!supportCssPointerEvents && ghostEl) {
    css(ghostEl, "display", "");
  }
};
if (documentExists && !ChromeForAndroid) {
  document.addEventListener("click", function(evt) {
    if (ignoreNextClick) {
      evt.preventDefault();
      evt.stopPropagation && evt.stopPropagation();
      evt.stopImmediatePropagation && evt.stopImmediatePropagation();
      ignoreNextClick = false;
      return false;
    }
  }, true);
}
var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
  if (dragEl) {
    evt = evt.touches ? evt.touches[0] : evt;
    var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
    if (nearest) {
      var event = {};
      for (var i2 in evt) {
        if (evt.hasOwnProperty(i2)) {
          event[i2] = evt[i2];
        }
      }
      event.target = event.rootEl = nearest;
      event.preventDefault = void 0;
      event.stopPropagation = void 0;
      nearest[expando]._onDragOver(event);
    }
  }
};
var _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
  if (dragEl) {
    dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
  }
};
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
    throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
  }
  this.el = el;
  this.options = options = _extends({}, options);
  el[expando] = this;
  var defaults2 = {
    group: null,
    sort: true,
    disabled: false,
    store: null,
    handle: null,
    draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
    swapThreshold: 1,
    // percentage; 0 <= x <= 1
    invertSwap: false,
    // invert always
    invertedSwapThreshold: null,
    // will be set to same as swapThreshold if default
    removeCloneOnHide: true,
    direction: function direction() {
      return _detectDirection(el, this.options);
    },
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    dragClass: "sortable-drag",
    ignore: "a, img",
    filter: null,
    preventOnFilter: true,
    animation: 0,
    easing: null,
    setData: function setData(dataTransfer, dragEl2) {
      dataTransfer.setData("Text", dragEl2.textContent);
    },
    dropBubble: false,
    dragoverBubble: false,
    dataIdAttr: "data-id",
    delay: 0,
    delayOnTouchOnly: false,
    touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
    forceFallback: false,
    fallbackClass: "sortable-fallback",
    fallbackOnBody: false,
    fallbackTolerance: 0,
    fallbackOffset: {
      x: 0,
      y: 0
    },
    supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && !Safari,
    emptyInsertThreshold: 5
  };
  PluginManager.initializePlugins(this, el, defaults2);
  for (var name2 in defaults2) {
    !(name2 in options) && (options[name2] = defaults2[name2]);
  }
  _prepareGroup(options);
  for (var fn in this) {
    if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
      this[fn] = this[fn].bind(this);
    }
  }
  this.nativeDraggable = options.forceFallback ? false : supportDraggable;
  if (this.nativeDraggable) {
    this.options.touchStartThreshold = 1;
  }
  if (options.supportPointer) {
    on(el, "pointerdown", this._onTapStart);
  } else {
    on(el, "mousedown", this._onTapStart);
    on(el, "touchstart", this._onTapStart);
  }
  if (this.nativeDraggable) {
    on(el, "dragover", this);
    on(el, "dragenter", this);
  }
  sortables.push(this.el);
  options.store && options.store.get && this.sort(options.store.get(this) || []);
  _extends(this, AnimationStateManager());
}
Sortable.prototype = /** @lends Sortable.prototype */
{
  constructor: Sortable,
  _isOutsideThisEl: function _isOutsideThisEl(target) {
    if (!this.el.contains(target) && target !== this.el) {
      lastTarget = null;
    }
  },
  _getDirection: function _getDirection(evt, target) {
    return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
  },
  _onTapStart: function _onTapStart(evt) {
    if (!evt.cancelable) return;
    var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
    _saveInputCheckedState(el);
    if (dragEl) {
      return;
    }
    if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
      return;
    }
    if (originalTarget.isContentEditable) {
      return;
    }
    if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") {
      return;
    }
    target = closest(target, options.draggable, el, false);
    if (target && target.animated) {
      return;
    }
    if (lastDownEl === target) {
      return;
    }
    oldIndex = index$8(target);
    oldDraggableIndex = index$8(target, options.draggable);
    if (typeof filter === "function") {
      if (filter.call(this, evt, target, this)) {
        _dispatchEvent({
          sortable: _this,
          rootEl: originalTarget,
          name: "filter",
          targetEl: target,
          toEl: el,
          fromEl: el
        });
        pluginEvent2("filter", _this, {
          evt
        });
        preventOnFilter && evt.cancelable && evt.preventDefault();
        return;
      }
    } else if (filter) {
      filter = filter.split(",").some(function(criteria) {
        criteria = closest(originalTarget, criteria.trim(), el, false);
        if (criteria) {
          _dispatchEvent({
            sortable: _this,
            rootEl: criteria,
            name: "filter",
            targetEl: target,
            fromEl: el,
            toEl: el
          });
          pluginEvent2("filter", _this, {
            evt
          });
          return true;
        }
      });
      if (filter) {
        preventOnFilter && evt.cancelable && evt.preventDefault();
        return;
      }
    }
    if (options.handle && !closest(originalTarget, options.handle, el, false)) {
      return;
    }
    this._prepareDragStart(evt, touch, target);
  },
  _prepareDragStart: function _prepareDragStart(evt, touch, target) {
    var _this = this, el = _this.el, options = _this.options, ownerDocument = el.ownerDocument, dragStartFn;
    if (target && !dragEl && target.parentNode === el) {
      var dragRect = getRect(target);
      rootEl = el;
      dragEl = target;
      parentEl = dragEl.parentNode;
      nextEl = dragEl.nextSibling;
      lastDownEl = target;
      activeGroup = options.group;
      Sortable.dragged = dragEl;
      tapEvt = {
        target: dragEl,
        clientX: (touch || evt).clientX,
        clientY: (touch || evt).clientY
      };
      tapDistanceLeft = tapEvt.clientX - dragRect.left;
      tapDistanceTop = tapEvt.clientY - dragRect.top;
      this._lastX = (touch || evt).clientX;
      this._lastY = (touch || evt).clientY;
      dragEl.style["will-change"] = "all";
      dragStartFn = function dragStartFn2() {
        pluginEvent2("delayEnded", _this, {
          evt
        });
        if (Sortable.eventCanceled) {
          _this._onDrop();
          return;
        }
        _this._disableDelayedDragEvents();
        if (!FireFox && _this.nativeDraggable) {
          dragEl.draggable = true;
        }
        _this._triggerDragStart(evt, touch);
        _dispatchEvent({
          sortable: _this,
          name: "choose",
          originalEvent: evt
        });
        toggleClass(dragEl, options.chosenClass, true);
      };
      options.ignore.split(",").forEach(function(criteria) {
        find(dragEl, criteria.trim(), _disableDraggable);
      });
      on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "mouseup", _this._onDrop);
      on(ownerDocument, "touchend", _this._onDrop);
      on(ownerDocument, "touchcancel", _this._onDrop);
      if (FireFox && this.nativeDraggable) {
        this.options.touchStartThreshold = 4;
        dragEl.draggable = true;
      }
      pluginEvent2("delayStart", this, {
        evt
      });
      if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
        if (Sortable.eventCanceled) {
          this._onDrop();
          return;
        }
        on(ownerDocument, "mouseup", _this._disableDelayedDrag);
        on(ownerDocument, "touchend", _this._disableDelayedDrag);
        on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
        on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
        on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
        options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
        _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
      } else {
        dragStartFn();
      }
    }
  },
  _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e2) {
    var touch = e2.touches ? e2.touches[0] : e2;
    if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
      this._disableDelayedDrag();
    }
  },
  _disableDelayedDrag: function _disableDelayedDrag() {
    dragEl && _disableDraggable(dragEl);
    clearTimeout(this._dragStartTimer);
    this._disableDelayedDragEvents();
  },
  _disableDelayedDragEvents: function _disableDelayedDragEvents() {
    var ownerDocument = this.el.ownerDocument;
    off(ownerDocument, "mouseup", this._disableDelayedDrag);
    off(ownerDocument, "touchend", this._disableDelayedDrag);
    off(ownerDocument, "touchcancel", this._disableDelayedDrag);
    off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
    off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
    off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
  },
  _triggerDragStart: function _triggerDragStart(evt, touch) {
    touch = touch || evt.pointerType == "touch" && evt;
    if (!this.nativeDraggable || touch) {
      if (this.options.supportPointer) {
        on(document, "pointermove", this._onTouchMove);
      } else if (touch) {
        on(document, "touchmove", this._onTouchMove);
      } else {
        on(document, "mousemove", this._onTouchMove);
      }
    } else {
      on(dragEl, "dragend", this);
      on(rootEl, "dragstart", this._onDragStart);
    }
    try {
      if (document.selection) {
        _nextTick(function() {
          document.selection.empty();
        });
      } else {
        window.getSelection().removeAllRanges();
      }
    } catch (err) {
    }
  },
  _dragStarted: function _dragStarted(fallback, evt) {
    awaitingDragStarted = false;
    if (rootEl && dragEl) {
      pluginEvent2("dragStarted", this, {
        evt
      });
      if (this.nativeDraggable) {
        on(document, "dragover", _checkOutsideTargetEl);
      }
      var options = this.options;
      !fallback && toggleClass(dragEl, options.dragClass, false);
      toggleClass(dragEl, options.ghostClass, true);
      Sortable.active = this;
      fallback && this._appendGhost();
      _dispatchEvent({
        sortable: this,
        name: "start",
        originalEvent: evt
      });
    } else {
      this._nulling();
    }
  },
  _emulateDragOver: function _emulateDragOver() {
    if (touchEvt) {
      this._lastX = touchEvt.clientX;
      this._lastY = touchEvt.clientY;
      _hideGhostForTarget();
      var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
      var parent = target;
      while (target && target.shadowRoot) {
        target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        if (target === parent) break;
        parent = target;
      }
      dragEl.parentNode[expando]._isOutsideThisEl(target);
      if (parent) {
        do {
          if (parent[expando]) {
            var inserted = void 0;
            inserted = parent[expando]._onDragOver({
              clientX: touchEvt.clientX,
              clientY: touchEvt.clientY,
              target,
              rootEl: parent
            });
            if (inserted && !this.options.dragoverBubble) {
              break;
            }
          }
          target = parent;
        } while (parent = getParentOrHost(parent));
      }
      _unhideGhostForTarget();
    }
  },
  _onTouchMove: function _onTouchMove(evt) {
    if (tapEvt) {
      var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
      if (!Sortable.active && !awaitingDragStarted) {
        if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
          return;
        }
        this._onDragStart(evt, true);
      }
      if (ghostEl) {
        if (ghostMatrix) {
          ghostMatrix.e += dx - (lastDx || 0);
          ghostMatrix.f += dy - (lastDy || 0);
        } else {
          ghostMatrix = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: dx,
            f: dy
          };
        }
        var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
        css(ghostEl, "webkitTransform", cssMatrix);
        css(ghostEl, "mozTransform", cssMatrix);
        css(ghostEl, "msTransform", cssMatrix);
        css(ghostEl, "transform", cssMatrix);
        lastDx = dx;
        lastDy = dy;
        touchEvt = touch;
      }
      evt.cancelable && evt.preventDefault();
    }
  },
  _appendGhost: function _appendGhost() {
    if (!ghostEl) {
      var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
      if (PositionGhostAbsolutely) {
        ghostRelativeParent = container;
        while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) {
          ghostRelativeParent = ghostRelativeParent.parentNode;
        }
        if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
          if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
          rect.top += ghostRelativeParent.scrollTop;
          rect.left += ghostRelativeParent.scrollLeft;
        } else {
          ghostRelativeParent = getWindowScrollingElement();
        }
        ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
      }
      ghostEl = dragEl.cloneNode(true);
      toggleClass(ghostEl, options.ghostClass, false);
      toggleClass(ghostEl, options.fallbackClass, true);
      toggleClass(ghostEl, options.dragClass, true);
      css(ghostEl, "transition", "");
      css(ghostEl, "transform", "");
      css(ghostEl, "box-sizing", "border-box");
      css(ghostEl, "margin", 0);
      css(ghostEl, "top", rect.top);
      css(ghostEl, "left", rect.left);
      css(ghostEl, "width", rect.width);
      css(ghostEl, "height", rect.height);
      css(ghostEl, "opacity", "0.8");
      css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
      css(ghostEl, "zIndex", "100000");
      css(ghostEl, "pointerEvents", "none");
      Sortable.ghost = ghostEl;
      container.appendChild(ghostEl);
      css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
    }
  },
  _onDragStart: function _onDragStart(evt, fallback) {
    var _this = this;
    var dataTransfer = evt.dataTransfer;
    var options = _this.options;
    pluginEvent2("dragStart", this, {
      evt
    });
    if (Sortable.eventCanceled) {
      this._onDrop();
      return;
    }
    pluginEvent2("setupClone", this);
    if (!Sortable.eventCanceled) {
      cloneEl = clone(dragEl);
      cloneEl.removeAttribute("id");
      cloneEl.draggable = false;
      cloneEl.style["will-change"] = "";
      this._hideClone();
      toggleClass(cloneEl, this.options.chosenClass, false);
      Sortable.clone = cloneEl;
    }
    _this.cloneId = _nextTick(function() {
      pluginEvent2("clone", _this);
      if (Sortable.eventCanceled) return;
      if (!_this.options.removeCloneOnHide) {
        rootEl.insertBefore(cloneEl, dragEl);
      }
      _this._hideClone();
      _dispatchEvent({
        sortable: _this,
        name: "clone"
      });
    });
    !fallback && toggleClass(dragEl, options.dragClass, true);
    if (fallback) {
      ignoreNextClick = true;
      _this._loopId = setInterval(_this._emulateDragOver, 50);
    } else {
      off(document, "mouseup", _this._onDrop);
      off(document, "touchend", _this._onDrop);
      off(document, "touchcancel", _this._onDrop);
      if (dataTransfer) {
        dataTransfer.effectAllowed = "move";
        options.setData && options.setData.call(_this, dataTransfer, dragEl);
      }
      on(document, "drop", _this);
      css(dragEl, "transform", "translateZ(0)");
    }
    awaitingDragStarted = true;
    _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
    on(document, "selectstart", _this);
    moved = true;
    if (Safari) {
      css(document.body, "user-select", "none");
    }
  },
  // Returns true - if no further action is needed (either inserted or another condition)
  _onDragOver: function _onDragOver(evt) {
    var el = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
    if (_silent) return;
    function dragOverEvent(name2, extra) {
      pluginEvent2(name2, _this, _objectSpread2({
        evt,
        isOwner,
        axis: vertical ? "vertical" : "horizontal",
        revert,
        dragRect,
        targetRect,
        canSort,
        fromSortable,
        target,
        completed,
        onMove: function onMove(target2, after2) {
          return _onMove(rootEl, el, dragEl, dragRect, target2, getRect(target2), evt, after2);
        },
        changed
      }, extra));
    }
    function capture() {
      dragOverEvent("dragOverAnimationCapture");
      _this.captureAnimationState();
      if (_this !== fromSortable) {
        fromSortable.captureAnimationState();
      }
    }
    function completed(insertion) {
      dragOverEvent("dragOverCompleted", {
        insertion
      });
      if (insertion) {
        if (isOwner) {
          activeSortable._hideClone();
        } else {
          activeSortable._showClone(_this);
        }
        if (_this !== fromSortable) {
          toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
          toggleClass(dragEl, options.ghostClass, true);
        }
        if (putSortable !== _this && _this !== Sortable.active) {
          putSortable = _this;
        } else if (_this === Sortable.active && putSortable) {
          putSortable = null;
        }
        if (fromSortable === _this) {
          _this._ignoreWhileAnimating = target;
        }
        _this.animateAll(function() {
          dragOverEvent("dragOverAnimationComplete");
          _this._ignoreWhileAnimating = null;
        });
        if (_this !== fromSortable) {
          fromSortable.animateAll();
          fromSortable._ignoreWhileAnimating = null;
        }
      }
      if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
        lastTarget = null;
      }
      if (!options.dragoverBubble && !evt.rootEl && target !== document) {
        dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
        !insertion && nearestEmptyInsertDetectEvent(evt);
      }
      !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
      return completedFired = true;
    }
    function changed() {
      newIndex = index$8(dragEl);
      newDraggableIndex = index$8(dragEl, options.draggable);
      _dispatchEvent({
        sortable: _this,
        name: "change",
        toEl: el,
        newIndex,
        newDraggableIndex,
        originalEvent: evt
      });
    }
    if (evt.preventDefault !== void 0) {
      evt.cancelable && evt.preventDefault();
    }
    target = closest(target, options.draggable, el, true);
    dragOverEvent("dragOver");
    if (Sortable.eventCanceled) return completedFired;
    if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
      return completed(false);
    }
    ignoreNextClick = false;
    if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
      vertical = this._getDirection(evt, target) === "vertical";
      dragRect = getRect(dragEl);
      dragOverEvent("dragOverValid");
      if (Sortable.eventCanceled) return completedFired;
      if (revert) {
        parentEl = rootEl;
        capture();
        this._hideClone();
        dragOverEvent("revert");
        if (!Sortable.eventCanceled) {
          if (nextEl) {
            rootEl.insertBefore(dragEl, nextEl);
          } else {
            rootEl.appendChild(dragEl);
          }
        }
        return completed(true);
      }
      var elLastChild = lastChild(el, options.draggable);
      if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
        if (elLastChild === dragEl) {
          return completed(false);
        }
        if (elLastChild && el === evt.target) {
          target = elLastChild;
        }
        if (target) {
          targetRect = getRect(target);
        }
        if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
          capture();
          if (elLastChild && elLastChild.nextSibling) {
            el.insertBefore(dragEl, elLastChild.nextSibling);
          } else {
            el.appendChild(dragEl);
          }
          parentEl = el;
          changed();
          return completed(true);
        }
      } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
        var firstChild = getChild(el, 0, options, true);
        if (firstChild === dragEl) {
          return completed(false);
        }
        target = firstChild;
        targetRect = getRect(target);
        if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
          capture();
          el.insertBefore(dragEl, firstChild);
          parentEl = el;
          changed();
          return completed(true);
        }
      } else if (target.parentNode === el) {
        targetRect = getRect(target);
        var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
        if (lastTarget !== target) {
          targetBeforeFirstSwap = targetRect[side1];
          pastFirstInvertThresh = false;
          isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
        }
        direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
        var sibling;
        if (direction !== 0) {
          var dragIndex = index$8(dragEl);
          do {
            dragIndex -= direction;
            sibling = parentEl.children[dragIndex];
          } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
        }
        if (direction === 0 || sibling === target) {
          return completed(false);
        }
        lastTarget = target;
        lastDirection = direction;
        var nextSibling = target.nextElementSibling, after = false;
        after = direction === 1;
        var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
        if (moveVector !== false) {
          if (moveVector === 1 || moveVector === -1) {
            after = moveVector === 1;
          }
          _silent = true;
          setTimeout(_unsilent, 30);
          capture();
          if (after && !nextSibling) {
            el.appendChild(dragEl);
          } else {
            target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
          }
          if (scrolledPastTop) {
            scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
          }
          parentEl = dragEl.parentNode;
          if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
            targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
          }
          changed();
          return completed(true);
        }
      }
      if (el.contains(dragEl)) {
        return completed(false);
      }
    }
    return false;
  },
  _ignoreWhileAnimating: null,
  _offMoveEvents: function _offMoveEvents() {
    off(document, "mousemove", this._onTouchMove);
    off(document, "touchmove", this._onTouchMove);
    off(document, "pointermove", this._onTouchMove);
    off(document, "dragover", nearestEmptyInsertDetectEvent);
    off(document, "mousemove", nearestEmptyInsertDetectEvent);
    off(document, "touchmove", nearestEmptyInsertDetectEvent);
  },
  _offUpEvents: function _offUpEvents() {
    var ownerDocument = this.el.ownerDocument;
    off(ownerDocument, "mouseup", this._onDrop);
    off(ownerDocument, "touchend", this._onDrop);
    off(ownerDocument, "pointerup", this._onDrop);
    off(ownerDocument, "touchcancel", this._onDrop);
    off(document, "selectstart", this);
  },
  _onDrop: function _onDrop(evt) {
    var el = this.el, options = this.options;
    newIndex = index$8(dragEl);
    newDraggableIndex = index$8(dragEl, options.draggable);
    pluginEvent2("drop", this, {
      evt
    });
    parentEl = dragEl && dragEl.parentNode;
    newIndex = index$8(dragEl);
    newDraggableIndex = index$8(dragEl, options.draggable);
    if (Sortable.eventCanceled) {
      this._nulling();
      return;
    }
    awaitingDragStarted = false;
    isCircumstantialInvert = false;
    pastFirstInvertThresh = false;
    clearInterval(this._loopId);
    clearTimeout(this._dragStartTimer);
    _cancelNextTick(this.cloneId);
    _cancelNextTick(this._dragStartId);
    if (this.nativeDraggable) {
      off(document, "drop", this);
      off(el, "dragstart", this._onDragStart);
    }
    this._offMoveEvents();
    this._offUpEvents();
    if (Safari) {
      css(document.body, "user-select", "");
    }
    css(dragEl, "transform", "");
    if (evt) {
      if (moved) {
        evt.cancelable && evt.preventDefault();
        !options.dropBubble && evt.stopPropagation();
      }
      ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
      if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") {
        cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
      }
      if (dragEl) {
        if (this.nativeDraggable) {
          off(dragEl, "dragend", this);
        }
        _disableDraggable(dragEl);
        dragEl.style["will-change"] = "";
        if (moved && !awaitingDragStarted) {
          toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
        }
        toggleClass(dragEl, this.options.chosenClass, false);
        _dispatchEvent({
          sortable: this,
          name: "unchoose",
          toEl: parentEl,
          newIndex: null,
          newDraggableIndex: null,
          originalEvent: evt
        });
        if (rootEl !== parentEl) {
          if (newIndex >= 0) {
            _dispatchEvent({
              rootEl: parentEl,
              name: "add",
              toEl: parentEl,
              fromEl: rootEl,
              originalEvent: evt
            });
            _dispatchEvent({
              sortable: this,
              name: "remove",
              toEl: parentEl,
              originalEvent: evt
            });
            _dispatchEvent({
              rootEl: parentEl,
              name: "sort",
              toEl: parentEl,
              fromEl: rootEl,
              originalEvent: evt
            });
            _dispatchEvent({
              sortable: this,
              name: "sort",
              toEl: parentEl,
              originalEvent: evt
            });
          }
          putSortable && putSortable.save();
        } else {
          if (newIndex !== oldIndex) {
            if (newIndex >= 0) {
              _dispatchEvent({
                sortable: this,
                name: "update",
                toEl: parentEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "sort",
                toEl: parentEl,
                originalEvent: evt
              });
            }
          }
        }
        if (Sortable.active) {
          if (newIndex == null || newIndex === -1) {
            newIndex = oldIndex;
            newDraggableIndex = oldDraggableIndex;
          }
          _dispatchEvent({
            sortable: this,
            name: "end",
            toEl: parentEl,
            originalEvent: evt
          });
          this.save();
        }
      }
    }
    this._nulling();
  },
  _nulling: function _nulling() {
    pluginEvent2("nulling", this);
    rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
    savedInputChecked.forEach(function(el) {
      el.checked = true;
    });
    savedInputChecked.length = lastDx = lastDy = 0;
  },
  handleEvent: function handleEvent(evt) {
    switch (evt.type) {
      case "drop":
      case "dragend":
        this._onDrop(evt);
        break;
      case "dragenter":
      case "dragover":
        if (dragEl) {
          this._onDragOver(evt);
          _globalDragOver(evt);
        }
        break;
      case "selectstart":
        evt.preventDefault();
        break;
    }
  },
  /**
   * Serializes the item into an array of string.
   * @returns {String[]}
   */
  toArray: function toArray() {
    var order = [], el, children = this.el.children, i2 = 0, n = children.length, options = this.options;
    for (; i2 < n; i2++) {
      el = children[i2];
      if (closest(el, options.draggable, this.el, false)) {
        order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
      }
    }
    return order;
  },
  /**
   * Sorts the elements according to the array.
   * @param  {String[]}  order  order of the items
   */
  sort: function sort(order, useAnimation) {
    var items = {}, rootEl2 = this.el;
    this.toArray().forEach(function(id, i2) {
      var el = rootEl2.children[i2];
      if (closest(el, this.options.draggable, rootEl2, false)) {
        items[id] = el;
      }
    }, this);
    useAnimation && this.captureAnimationState();
    order.forEach(function(id) {
      if (items[id]) {
        rootEl2.removeChild(items[id]);
        rootEl2.appendChild(items[id]);
      }
    });
    useAnimation && this.animateAll();
  },
  /**
   * Save the current sorting
   */
  save: function save() {
    var store = this.options.store;
    store && store.set && store.set(this);
  },
  /**
   * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
   * @param   {HTMLElement}  el
   * @param   {String}       [selector]  default: `options.draggable`
   * @returns {HTMLElement|null}
   */
  closest: function closest$1(el, selector) {
    return closest(el, selector || this.options.draggable, this.el, false);
  },
  /**
   * Set/get option
   * @param   {string} name
   * @param   {*}      [value]
   * @returns {*}
   */
  option: function option(name2, value) {
    var options = this.options;
    if (value === void 0) {
      return options[name2];
    } else {
      var modifiedValue = PluginManager.modifyOption(this, name2, value);
      if (typeof modifiedValue !== "undefined") {
        options[name2] = modifiedValue;
      } else {
        options[name2] = value;
      }
      if (name2 === "group") {
        _prepareGroup(options);
      }
    }
  },
  /**
   * Destroy
   */
  destroy: function destroy() {
    pluginEvent2("destroy", this);
    var el = this.el;
    el[expando] = null;
    off(el, "mousedown", this._onTapStart);
    off(el, "touchstart", this._onTapStart);
    off(el, "pointerdown", this._onTapStart);
    if (this.nativeDraggable) {
      off(el, "dragover", this);
      off(el, "dragenter", this);
    }
    Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), function(el2) {
      el2.removeAttribute("draggable");
    });
    this._onDrop();
    this._disableDelayedDragEvents();
    sortables.splice(sortables.indexOf(this.el), 1);
    this.el = el = null;
  },
  _hideClone: function _hideClone() {
    if (!cloneHidden) {
      pluginEvent2("hideClone", this);
      if (Sortable.eventCanceled) return;
      css(cloneEl, "display", "none");
      if (this.options.removeCloneOnHide && cloneEl.parentNode) {
        cloneEl.parentNode.removeChild(cloneEl);
      }
      cloneHidden = true;
    }
  },
  _showClone: function _showClone(putSortable2) {
    if (putSortable2.lastPutMode !== "clone") {
      this._hideClone();
      return;
    }
    if (cloneHidden) {
      pluginEvent2("showClone", this);
      if (Sortable.eventCanceled) return;
      if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
        rootEl.insertBefore(cloneEl, dragEl);
      } else if (nextEl) {
        rootEl.insertBefore(cloneEl, nextEl);
      } else {
        rootEl.appendChild(cloneEl);
      }
      if (this.options.group.revertClone) {
        this.animate(dragEl, cloneEl);
      }
      css(cloneEl, "display", "");
      cloneHidden = false;
    }
  }
};
function _globalDragOver(evt) {
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = "move";
  }
  evt.cancelable && evt.preventDefault();
}
function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
  var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
  if (window.CustomEvent && !IE11OrLess && !Edge) {
    evt = new CustomEvent("move", {
      bubbles: true,
      cancelable: true
    });
  } else {
    evt = document.createEvent("Event");
    evt.initEvent("move", true, true);
  }
  evt.to = toEl;
  evt.from = fromEl;
  evt.dragged = dragEl2;
  evt.draggedRect = dragRect;
  evt.related = targetEl || toEl;
  evt.relatedRect = targetRect || getRect(toEl);
  evt.willInsertAfter = willInsertAfter;
  evt.originalEvent = originalEvent;
  fromEl.dispatchEvent(evt);
  if (onMoveFn) {
    retVal = onMoveFn.call(sortable, evt, originalEvent);
  }
  return retVal;
}
function _disableDraggable(el) {
  el.draggable = false;
}
function _unsilent() {
  _silent = false;
}
function _ghostIsFirst(evt, vertical, sortable) {
  var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
  var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
  var spacer = 10;
  return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
}
function _ghostIsLast(evt, vertical, sortable) {
  var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
  var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
  var spacer = 10;
  return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
}
function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
  var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
  if (!invertSwap) {
    if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
      if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
        pastFirstInvertThresh = true;
      }
      if (!pastFirstInvertThresh) {
        if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) {
          return -lastDirection;
        }
      } else {
        invert = true;
      }
    } else {
      if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
        return _getInsertDirection(target);
      }
    }
  }
  invert = invert || invertSwap;
  if (invert) {
    if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
      return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
    }
  }
  return 0;
}
function _getInsertDirection(target) {
  if (index$8(dragEl) < index$8(target)) {
    return 1;
  } else {
    return -1;
  }
}
function _generateId(el) {
  var str = el.tagName + el.className + el.src + el.href + el.textContent, i2 = str.length, sum = 0;
  while (i2--) {
    sum += str.charCodeAt(i2);
  }
  return sum.toString(36);
}
function _saveInputCheckedState(root) {
  savedInputChecked.length = 0;
  var inputs = root.getElementsByTagName("input");
  var idx = inputs.length;
  while (idx--) {
    var el = inputs[idx];
    el.checked && savedInputChecked.push(el);
  }
}
function _nextTick(fn) {
  return setTimeout(fn, 0);
}
function _cancelNextTick(id) {
  return clearTimeout(id);
}
if (documentExists) {
  on(document, "touchmove", function(evt) {
    if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
      evt.preventDefault();
    }
  });
}
Sortable.utils = {
  on,
  off,
  css,
  find,
  is: function is(el, selector) {
    return !!closest(el, selector, el, false);
  },
  extend,
  throttle,
  closest,
  toggleClass,
  clone,
  index: index$8,
  nextTick: _nextTick,
  cancelNextTick: _cancelNextTick,
  detectDirection: _detectDirection,
  getChild,
  expando
};
Sortable.get = function(element) {
  return element[expando];
};
Sortable.mount = function() {
  for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
    plugins2[_key] = arguments[_key];
  }
  if (plugins2[0].constructor === Array) plugins2 = plugins2[0];
  plugins2.forEach(function(plugin) {
    if (!plugin.prototype || !plugin.prototype.constructor) {
      throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
    }
    if (plugin.utils) Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
    PluginManager.mount(plugin);
  });
};
Sortable.create = function(el, options) {
  return new Sortable(el, options);
};
Sortable.version = version;
var autoScrolls = [], scrollEl, scrollRootEl, scrolling = false, lastAutoScrollX, lastAutoScrollY, touchEvt$1, pointerElemChangedInterval;
function AutoScrollPlugin() {
  function AutoScroll() {
    this.defaults = {
      scroll: true,
      forceAutoScrollFallback: false,
      scrollSensitivity: 30,
      scrollSpeed: 10,
      bubbleScroll: true
    };
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
  }
  AutoScroll.prototype = {
    dragStarted: function dragStarted(_ref) {
      var originalEvent = _ref.originalEvent;
      if (this.sortable.nativeDraggable) {
        on(document, "dragover", this._handleAutoScroll);
      } else {
        if (this.options.supportPointer) {
          on(document, "pointermove", this._handleFallbackAutoScroll);
        } else if (originalEvent.touches) {
          on(document, "touchmove", this._handleFallbackAutoScroll);
        } else {
          on(document, "mousemove", this._handleFallbackAutoScroll);
        }
      }
    },
    dragOverCompleted: function dragOverCompleted(_ref2) {
      var originalEvent = _ref2.originalEvent;
      if (!this.options.dragOverBubble && !originalEvent.rootEl) {
        this._handleAutoScroll(originalEvent);
      }
    },
    drop: function drop3() {
      if (this.sortable.nativeDraggable) {
        off(document, "dragover", this._handleAutoScroll);
      } else {
        off(document, "pointermove", this._handleFallbackAutoScroll);
        off(document, "touchmove", this._handleFallbackAutoScroll);
        off(document, "mousemove", this._handleFallbackAutoScroll);
      }
      clearPointerElemChangedInterval();
      clearAutoScrolls();
      cancelThrottle();
    },
    nulling: function nulling() {
      touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
      autoScrolls.length = 0;
    },
    _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
      this._handleAutoScroll(evt, true);
    },
    _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
      var _this = this;
      var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
      touchEvt$1 = evt;
      if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
        autoScroll(evt, this.options, elem, fallback);
        var ogElemScroller = getParentAutoScrollElement(elem, true);
        if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
          pointerElemChangedInterval && clearPointerElemChangedInterval();
          pointerElemChangedInterval = setInterval(function() {
            var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
            if (newElem !== ogElemScroller) {
              ogElemScroller = newElem;
              clearAutoScrolls();
            }
            autoScroll(evt, _this.options, newElem, fallback);
          }, 10);
          lastAutoScrollX = x;
          lastAutoScrollY = y;
        }
      } else {
        if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
          clearAutoScrolls();
          return;
        }
        autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
      }
    }
  };
  return _extends(AutoScroll, {
    pluginName: "scroll",
    initializeByDefault: true
  });
}
function clearAutoScrolls() {
  autoScrolls.forEach(function(autoScroll2) {
    clearInterval(autoScroll2.pid);
  });
  autoScrolls = [];
}
function clearPointerElemChangedInterval() {
  clearInterval(pointerElemChangedInterval);
}
var autoScroll = throttle(function(evt, options, rootEl2, isFallback) {
  if (!options.scroll) return;
  var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
  var scrollThisInstance = false, scrollCustomFn;
  if (scrollRootEl !== rootEl2) {
    scrollRootEl = rootEl2;
    clearAutoScrolls();
    scrollEl = options.scroll;
    scrollCustomFn = options.scrollFn;
    if (scrollEl === true) {
      scrollEl = getParentAutoScrollElement(rootEl2, true);
    }
  }
  var layersOut = 0;
  var currentParent = scrollEl;
  do {
    var el = currentParent, rect = getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el.scrollWidth, scrollHeight = el.scrollHeight, elCSS = css(el), scrollPosX = el.scrollLeft, scrollPosY = el.scrollTop;
    if (el === winScroller) {
      canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
      canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
    } else {
      canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
      canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
    }
    var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
    var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
    if (!autoScrolls[layersOut]) {
      for (var i2 = 0; i2 <= layersOut; i2++) {
        if (!autoScrolls[i2]) {
          autoScrolls[i2] = {};
        }
      }
    }
    if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
      autoScrolls[layersOut].el = el;
      autoScrolls[layersOut].vx = vx;
      autoScrolls[layersOut].vy = vy;
      clearInterval(autoScrolls[layersOut].pid);
      if (vx != 0 || vy != 0) {
        scrollThisInstance = true;
        autoScrolls[layersOut].pid = setInterval((function() {
          if (isFallback && this.layer === 0) {
            Sortable.active._onTouchMove(touchEvt$1);
          }
          var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
          var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
          if (typeof scrollCustomFn === "function") {
            if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") {
              return;
            }
          }
          scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
        }).bind({
          layer: layersOut
        }), 24);
      }
    }
    layersOut++;
  } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
  scrolling = scrollThisInstance;
}, 30);
var drop = function drop2(_ref) {
  var originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, dragEl2 = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
  if (!originalEvent) return;
  var toSortable = putSortable2 || activeSortable;
  hideGhostForTarget();
  var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  unhideGhostForTarget();
  if (toSortable && !toSortable.el.contains(target)) {
    dispatchSortableEvent("spill");
    this.onSpill({
      dragEl: dragEl2,
      putSortable: putSortable2
    });
  }
};
function Revert() {
}
Revert.prototype = {
  startIndex: null,
  dragStart: function dragStart(_ref2) {
    var oldDraggableIndex2 = _ref2.oldDraggableIndex;
    this.startIndex = oldDraggableIndex2;
  },
  onSpill: function onSpill(_ref3) {
    var dragEl2 = _ref3.dragEl, putSortable2 = _ref3.putSortable;
    this.sortable.captureAnimationState();
    if (putSortable2) {
      putSortable2.captureAnimationState();
    }
    var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
    if (nextSibling) {
      this.sortable.el.insertBefore(dragEl2, nextSibling);
    } else {
      this.sortable.el.appendChild(dragEl2);
    }
    this.sortable.animateAll();
    if (putSortable2) {
      putSortable2.animateAll();
    }
  },
  drop
};
_extends(Revert, {
  pluginName: "revertOnSpill"
});
function Remove() {
}
Remove.prototype = {
  onSpill: function onSpill2(_ref4) {
    var dragEl2 = _ref4.dragEl, putSortable2 = _ref4.putSortable;
    var parentSortable = putSortable2 || this.sortable;
    parentSortable.captureAnimationState();
    dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
    parentSortable.animateAll();
  },
  drop
};
_extends(Remove, {
  pluginName: "removeOnSpill"
});
Sortable.mount(new AutoScrollPlugin());
Sortable.mount(Remove, Revert);
const animate = {
  /**
   * Get the computed style for DOM element
   * @param  {Object}  elem     dom element
   * @param  {Boolean} property style eg. width, height, opacity
   * @return {String}           computed style
   */
  getStyle: (elem, property = false) => {
    let style;
    if (window.getComputedStyle) {
      style = window.getComputedStyle(elem, null);
    } else if (elem.currentStyle) {
      style = elem.currentStyle;
    }
    return property ? style[property] : style;
  },
  fadeOut: (elem, duration = 250) => {
    const increment = 1 / (duration / 60);
    elem.style.opacity = 1;
    (function fade() {
      const val = Number(elem.style.opacity) - increment;
      if (val > 0) {
        elem.style.opacity = val;
        window.requestAnimationFrame(fade);
      } else {
        elem.remove();
      }
    })();
  },
  slideDown: (elem, duration = 250, cb = false) => {
    elem.style.display = "block";
    const style = animate.getStyle(elem);
    const height = Number.parseInt(style.height, 10);
    const increment = height / (duration / 60);
    elem.style.height = "0px";
    (function slideDown() {
      const curHeight = Number.parseFloat(elem.style.height);
      const val = curHeight + increment;
      if (curHeight < height) {
        elem.style.height = `${val}px`;
        window.requestAnimationFrame(slideDown);
      } else {
        elem.style.height = "auto";
        if (cb) {
          cb(elem);
        }
      }
    })();
  },
  slideUp: (elem, duration = 250, cb = false) => {
    const style = animate.getStyle(elem);
    const height = Number.parseInt(style.height, 10);
    const overFlowBack = style.overflow;
    elem.style.overflow = "hidden";
    elem.style.height = `${height}px`;
    const defMinHeight = style.minHeight;
    elem.style.minHeight = "auto";
    const increment = parseFloat(height / (duration / 60)).toFixed(2);
    (function slideUp() {
      const curHeight = Number.parseInt(elem.style.height, 10);
      const val = curHeight - increment;
      if (val > 0) {
        elem.style.height = `${val}px`;
        window.requestAnimationFrame(slideUp);
      } else {
        elem.style.overflow = overFlowBack;
        elem.style.display = "none";
        elem.style.minHeight = defMinHeight;
        delete elem.style.height;
        if (cb) {
          cb(elem);
        }
      }
    })();
  },
  slideToggle: (elem, duration = 250, open = animate.getStyle(elem, "display") === "none") => {
    if (open) {
      animate.slideDown(elem, duration);
    } else {
      animate.slideUp(elem, duration);
    }
  }
};
const isInt = (n) => Number.isInteger(Number(n));
const indexOfNode = (node) => {
  let index2 = 0;
  let currentNode = node;
  while (currentNode?.previousElementSibling) {
    currentNode = currentNode.previousElementSibling;
    index2++;
  }
  return index2;
};
const orderObjectsBy = (elements, order, path) => {
  const splitPath = path.split("||");
  const newOrder = unique(order).map(
    (key) => elements.find((elem) => {
      const newPath = splitPath.find((p) => !!get(elem, p));
      return newPath && get(elem, newPath) === key;
    })
  ).filter(Boolean);
  const orderedElements = newOrder.concat(elements);
  return unique(orderedElements);
};
const forEach = (arr, cb, scope) => {
  for (let i2 = 0; i2 < arr.length; i2++) {
    cb.call(scope, arr[i2], i2);
  }
};
const map = (arr, cb) => {
  const newArray = [];
  forEach(arr, (elem, i2) => newArray.push(cb(elem, i2)));
  return newArray;
};
const sanitizedAttributeNames = {};
const safeAttrName = (name2) => {
  const attributeMap = {
    className: "class"
  };
  if (sanitizedAttributeNames[name2]) {
    return sanitizedAttributeNames[name2];
  }
  const attributeName = attributeMap[name2] || name2;
  const sanitizedAttributeName = attributeName.replace(/^\d+/, "").replace(/[^a-zA-Z0-9-:]/g, "");
  sanitizedAttributeNames[name2] = sanitizedAttributeName;
  return sanitizedAttributeName;
};
const capitalize = (str) => str.replace(/\b\w/g, (m) => m.toUpperCase());
const copyObj = (obj) => window.JSON.parse(window.JSON.stringify(obj));
const subtract = (arr, from) => from.filter((a) => !~arr.indexOf(a));
const helpers = {
  capitalize,
  safeAttrName,
  forEach,
  copyObj,
  // basic map that can be used on nodeList
  map,
  subtract,
  indexOfNode,
  isInt,
  get,
  orderObjectsBy
};
const loaded = {
  js: /* @__PURE__ */ new Set(),
  css: /* @__PURE__ */ new Set(),
  formeoSprite: null
};
const ajax = (fileUrl, callback, onError = noop) => {
  return new Promise((resolve) => {
    return fetch(fileUrl).then((data) => {
      if (!data.ok) {
        return resolve(onError(data));
      }
      resolve(callback ? callback(data) : data);
    }).catch((err) => onError(err));
  });
};
const onLoadStylesheet = (elem, cb) => {
  elem.removeEventListener("load", onLoadStylesheet);
  cb(elem.src);
};
const onLoadJavascript = (elem, cb) => {
  elem.removeEventListener("load", onLoadJavascript);
  cb(elem.src);
};
const insertScript = (src) => {
  return new Promise((resolve, reject) => {
    if (loaded.js.has(src)) {
      return resolve(src);
    }
    loaded.js.add(src);
    const script = dom.create({
      tag: "script",
      attrs: {
        type: "text/javascript",
        async: true,
        src
      },
      action: {
        load: () => onLoadJavascript(script, resolve),
        error: () => reject(new Error(`${src} failed to load.`))
      }
    });
    document.head.appendChild(script);
  });
};
const insertStyle = (srcs) => {
  srcs = Array.isArray(srcs) ? srcs : [srcs];
  const promises = srcs.map(
    (src) => new Promise((resolve, reject) => {
      if (loaded.css.has(src)) {
        return resolve(src);
      }
      loaded.css.add(src);
      const styleLink = dom.create({
        tag: "link",
        attrs: {
          rel: "stylesheet",
          href: src
        },
        action: {
          load: () => onLoadStylesheet(styleLink, resolve),
          error: () => reject(new Error(`${(void 0).src} failed to load.`))
        }
      });
      document.head.appendChild(styleLink);
    })
  );
  return Promise.all(promises);
};
const insertScripts = (srcs) => {
  srcs = Array.isArray(srcs) ? srcs : [srcs];
  const promises = srcs.map((src) => insertScript(src));
  return Promise.all(promises);
};
const insertStyles = (srcs) => {
  srcs = Array.isArray(srcs) ? srcs : [srcs];
  const promises = srcs.map((src) => insertStyle(src));
  return Promise.all(promises);
};
const insertIcons = (iconSvgStr) => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(iconSvgStr, "image/svg+xml");
  loaded.formeoSprite = svgDoc.documentElement;
  return loaded.formeoSprite;
};
const fetchIcons = async (iconSpriteUrl = SVG_SPRITE_URL) => {
  if (loaded.formeoSprite) {
    return loaded.formeoSprite;
  }
  if (!iconSpriteUrl) {
    return insertIcons(BUNDLED_SVG_SPRITE);
  }
  const parseResp = async (resp) => insertIcons(await resp.text());
  return ajax(iconSpriteUrl, parseResp, () => ajax(FALLBACK_SVG_SPRITE_URL, parseResp));
};
const LOADER_MAP = {
  js: insertScripts,
  css: insertStyles
};
const fetchDependencies = (dependencies) => {
  const promises = Object.entries(dependencies).map(([type, src]) => {
    return LOADER_MAP[type](src);
  });
  return Promise.all(promises);
};
const fetchFormeoStyle = async (cssUrl) => {
  if (!loaded.css.has(cssUrl)) {
    await insertStyle(cssUrl);
    if (!loaded.css.has(FALLBACK_CSS_URL)) {
      return await insertStyle(FALLBACK_CSS_URL);
    }
  }
};
const iconFontTemplates = {
  glyphicons: (icon) => `<span class="glyphicon glyphicon-${icon}" aria-hidden="true"></span>`,
  "font-awesome": (icon) => {
    const [style, name2] = icon.split(" ");
    return `<i class="${style} fa-${name2}"></i>`;
  },
  fontello: (icon) => `<i class="${iconPrefix}${icon}">${icon}</i>`
};
const inputTags = /* @__PURE__ */ new Set(["input", "textarea", "select"]);
const getName = (elem = {}) => {
  let name2 = elem?.attrs?.name || elem?.name;
  if (name2) {
    return name2;
  }
  const id = uuid(elem);
  let label = elem.config?.label || elem.attrs?.label || elem?.label;
  if (label) {
    if (typeof label === "object") {
      label = dom.create(label).textContent;
    }
    if (/^<.+>.+<.+>$/gim.test(label)) {
      label = extractTextFromHtml(label);
    }
    name2 = `${id}-${slugify(truncateByWord(label, 24, null))}`;
  }
  return name2 || id;
};
class DOM {
  /**
   * Set defaults, store references to key elements
   * like stages, rows, columns etc
   */
  constructor(options = /* @__PURE__ */ Object.create(null)) {
    this.options = options;
  }
  set setOptions(options) {
    this.options = merge(this.options, options);
  }
  /**
   * Ensure elements have proper tagName
   * @param  {Object|String} elem
   * @return {Object} valid element object
   */
  processElemArg(elemArg) {
    let elem = elemArg;
    let tagName;
    if (typeof elem === "string") {
      tagName = elem;
      elem = { tag: tagName };
      return elem;
    }
    if (elem.attrs) {
      const { tag, ...restAttrs } = elem.attrs;
      if (tag) {
        if (typeof tag === "string") {
          tagName = tag;
        } else {
          const selectedTag = tag.find((t) => t.selected === true) || tag[0];
          tagName = selectedTag.value;
        }
      }
      elem.attrs = restAttrs;
    }
    elem.tag = tagName || elem.tag || "div";
    return elem;
  }
  /**
   * Wraps dom.create to modify data
   * Used when rendering components in form- not editor
   */
  render = (elem) => {
    elem.id = `f-${elem.id || uuid()}`;
    return this.create(elem);
  };
  /**
   * Creates DOM elements
   * @param  {Object}  elem      element config object
   * @param  {Boolean} isPreview generating element for preview or render?
   * @return {Object}            DOM Object
   */
  create = (elemArg, isPreview = false) => {
    if (!elemArg) {
      return;
    }
    if (this.isDOMElement(elemArg)) {
      return elemArg;
    }
    const _this = this;
    const processed = ["children", "content"];
    const { className, options, dataset, ...elem } = this.processElemArg(elemArg);
    processed.push("tag");
    let childType;
    const { tag } = elem;
    let i2;
    const wrap = {
      attrs: {},
      className: [helpers.get(elem, "config.inputWrap")],
      children: [],
      config: {}
    };
    let element = document.createElement(tag);
    const appendChildren = {
      string: (children) => {
        element.innerHTML += children;
      },
      object: (children) => {
        return children && element.appendChild(_this.create(children, isPreview));
      },
      node: (children) => {
        return element.appendChild(children);
      },
      component: (children) => {
        return element.appendChild(children.dom);
      },
      array: (children) => {
        for (const child of children) {
          childType = _this.childType(child);
          appendChildren[childType](child);
        }
      },
      function: (children) => {
        children = children();
        childType = _this.childType(children);
        appendChildren[childType](children);
      },
      undefined: () => null,
      boolean: () => null
    };
    if (className) {
      elem.attrs = merge(elem.attrs, { className });
    }
    if (options) {
      const processedOptions = this.processOptions(options, elem, isPreview);
      if (this.holdsContent(element) && tag !== "button") {
        appendChildren.array.call(this, processedOptions);
        elem.content = void 0;
      } else {
        helpers.forEach(processedOptions, (option2) => {
          wrap.children.push(_this.create(option2, isPreview));
        });
        if (elem.attrs.className) {
          wrap.className = elem.attrs.className;
        }
        wrap.id = elem.id;
        wrap.config = { ...elem.config };
        return this.create(wrap, isPreview);
      }
      processed.push("options");
    }
    if (elem.attrs) {
      _this.processAttrs(elem, element, isPreview);
      processed.push("attrs");
    }
    if (elem.config) {
      if (elem.config.label && (elem.config.label && tag !== "button" || ["radio", "checkbox"].includes(helpers.get(elem, "attrs.type"))) && !isPreview) {
        const label = _this.label(elem);
        if (!elem.config.hideLabel) {
          const wrapContent = [label, element];
          if (_this.labelAfter(elem)) {
            wrapContent.reverse();
          }
          wrap.children.push(wrapContent);
        }
      }
      processed.push("config");
    }
    if (elem.content || elem.children) {
      const children = elem.content || elem.children;
      childType = _this.childType(children);
      if (!appendChildren[childType]) {
        console.error(`childType: ${childType} is not supported`);
      }
      appendChildren[childType].call(this, children);
    }
    if (dataset) {
      for (const data in dataset) {
        if (Object.hasOwn(dataset, data)) {
          element.dataset[data] = typeof dataset[data] === "function" ? dataset[data]() : dataset[data];
        }
      }
      processed.push("dataset");
    }
    if (elem.action) {
      this.actionHandler(element, elem.action);
      processed.push("action");
    }
    const remaining = helpers.subtract(processed, Object.keys(elem));
    for (i2 = remaining.length - 1; i2 >= 0; i2--) {
      element[remaining[i2]] = elem[remaining[i2]];
    }
    if (wrap.children.length) {
      element = this.create(wrap);
    }
    return element;
  };
  onRender = (node, cb, timeout = ANIMATION_SPEED_BASE) => {
    const start = Date.now();
    const checkParent = () => {
      if (!node.parentElement && Date.now() - start < timeout) {
        window.requestAnimationFrame(checkParent);
      } else if (node.parentElement) {
        cb(node);
      }
    };
    checkParent();
  };
  /**
   * Processes element config object actions (click, onRender etc)
   */
  actionHandler(node, actions2) {
    const handlers = {
      onRender: dom.onRender,
      render: dom.onRender
    };
    const useCaptureEvts = ["focus", "blur"];
    const defaultHandler = (event) => (node2, cb) => node2.addEventListener(event, cb, useCaptureEvts.includes(event));
    return Object.entries(actions2).map(([event, cb]) => {
      const cbs = Array.isArray(cb) ? cb : [cb];
      return cbs.map((cb2) => {
        const action = handlers[event] || defaultHandler(event);
        return action(node, cb2);
      });
    });
  }
  get icons() {
    if (this.iconSymbols) {
      return this.iconSymbols;
    }
    const iconSymbolNodes = loaded.formeoSprite.querySelectorAll("svg symbol");
    const createSvgIconConfig = (symbol) => {
      const viewBox = symbol.getAttribute("viewBox") || "0 0 24 24";
      const children = Array.from(symbol.children).map((child) => {
        const clonedNode = child.cloneNode(true);
        return clonedNode.outerHTML;
      }).join("");
      return {
        tag: "svg",
        attrs: {
          className: ["svg-icon", symbol.id],
          viewBox,
          xmlns: "http://www.w3.org/2000/svg"
        },
        children
      };
    };
    this.iconSymbols = Array.from(iconSymbolNodes).reduce((acc, symbol) => {
      const name2 = symbol.id.replace(iconPrefix, "");
      acc[name2] = createSvgIconConfig(symbol);
      return acc;
    }, {});
    this.cachedIcons = {};
    return this.iconSymbols;
  }
  /**
   * Create and SVG or font icon.
   * Simple string concatenation instead of DOM.create because:
   *  - we don't need the perks of having icons be DOM objects at this stage
   *  - it forces the icon to be appended using innerHTML which helps svg render
   * @param  {String} name - icon name
   * @param  {Function} config - dom element config object
   * @return {String} icon markup
   */
  icon(name2, config) {
    if (!name2) {
      return;
    }
    const cacheKey = `${name2}?${new URLSearchParams(config).toString()}`;
    if (this.cachedIcons?.[cacheKey]) {
      return this.cachedIcons[cacheKey];
    }
    const iconConfig = this.icons[name2];
    if (iconConfig) {
      if (config) {
        const mergedConfig = merge(iconConfig, config);
        this.cachedIcons[cacheKey] = dom.create(mergedConfig).outerHTML;
        return this.cachedIcons[cacheKey];
      }
      this.cachedIcons[cacheKey] = dom.create(iconConfig).outerHTML;
      return this.cachedIcons[cacheKey];
    }
    return iconFontTemplates[dom.options.iconFont]?.(name2) || name2;
  }
  /**
   * JS Object to DOM attributes
   * @param  {Object} elem    element config object
   * @param  {Object} element DOM element we are building
   * @param  {Boolean} isPreview
   * @return {void}
   */
  processAttrs(elem, element, isPreview) {
    const { attrs = {} } = elem;
    if (!isPreview && !attrs.name && attrs.name !== null && this.isInput(elem.tag)) {
      const name2 = getName(elem);
      if (name2) {
        element.setAttribute("name", name2);
      }
    }
    for (const attr of Object.keys(attrs)) {
      const safeAttrName2 = helpers.safeAttrName(attr);
      const value = this.processAttrValue(attrs[attr]);
      if (value !== false) {
        element.setAttribute(safeAttrName2, value);
      }
    }
  }
  processAttrValue(valueArg) {
    if (typeof valueArg === "function") {
      return valueArg();
    }
    if (typeof valueArg === "boolean") {
      if (valueArg) {
        return "";
      }
      return valueArg;
    }
    let value = valueArg || "";
    if (Array.isArray(value)) {
      if (typeof value[0] === "object") {
        const selected = value.filter((t) => t.selected === true);
        value = selected.length ? selected[0].value : value[0].value;
      } else {
        value = value.join(" ");
      }
    }
    return value;
  }
  /**
   * Hide or show an Array or HTMLCollection of elements
   * @param  {Array} elems
   * @param  {String} term  match textContent to this term
   * @return {Array}        filtered elements
   */
  toggleElementsByStr = (elems, term) => {
    const filteredElems = [];
    const containsTextCb = (elem, contains) => {
      if (contains) {
        elem.style.display = "block";
        filteredElems.push(elem);
      } else {
        elem.style.display = "none";
      }
    };
    dom.elementsContainText(elems, term, containsTextCb);
    return filteredElems;
  };
  elementsContainText = (collection, term, cb) => {
    const elementsContainingText = [];
    forEach(collection, (elem) => {
      const txt = elem.textContent.toLowerCase();
      const contains = txt.indexOf(term.toLowerCase()) !== -1;
      cb?.(elem, contains);
      contains && elementsContainingText.push(elem);
    });
    return elementsContainingText;
  };
  generateOption = ({ type = "option", label, value, i: i2 = 0, selected }) => {
    const isOption = type === "option";
    return {
      tag: isOption ? "option" : "input",
      attrs: {
        type,
        value: value || `${type}-${i2}`,
        [type === "option" ? "selected" : "checked"]: selected || !i2
      },
      config: {
        label: label || mi18n.get("labelCount", {
          label: mi18n.get("option"),
          count: i2
        })
      }
    };
  };
  /**
   * Extend Array of option config objects
   * @param  {Array} options
   * @param  {Object} elem element config object
   * @param  {Boolean} isPreview
   * @return {Array} option config objects
   */
  processOptions(options, elem, isPreview) {
    const { action, attrs = {} } = elem;
    const fieldType = attrs.type || elem.tag;
    const id = attrs.id || elem.id;
    const optionMap = (option2, i2) => {
      const { label, value, ...rest } = option2;
      const defaultInput = () => {
        const input = {
          tag: "input",
          attrs: {
            name: id,
            type: fieldType,
            value: value || "",
            id: `${id}-${i2}`,
            ...rest
          },
          action
        };
        const optionLabel = {
          tag: "label",
          attrs: {
            for: `${id}-${i2}`
          },
          children: label
        };
        const inputWrap = {
          children: [input, optionLabel],
          className: [`f-${fieldType}`]
        };
        if (attrs.className) {
          elem.config.inputWrap = attrs.className;
        }
        if (elem.config.inline) {
          inputWrap.className.push(`f-${fieldType}-inline`);
        }
        if (option2.selected) {
          input.attrs.checked = true;
        }
        if (isPreview) {
          optionLabel.attrs.contenteditable = true;
        }
        return inputWrap;
      };
      const optionMarkup = {
        select: () => {
          const defaultAttrs = option2.attrs || option2;
          const mergedOption = { attrs: defaultAttrs, ...option2, ...defaultAttrs };
          const { label: label2, checked, selected, attrs: attrs2 } = mergedOption;
          return {
            tag: "option",
            attrs: { ...attrs2, selected: !!(checked || selected) },
            children: label2
          };
        },
        button: (option3) => {
          const { type, label: label2, className, id: id2 } = option3;
          return {
            ...elem,
            attrs: {
              type
            },
            className,
            id: id2 || uuid(),
            options: void 0,
            children: label2,
            action: elem.action
          };
        },
        checkbox: defaultInput,
        radio: defaultInput
      };
      return optionMarkup[fieldType]?.(option2);
    };
    const mappedOptions = options.map(optionMap);
    return mappedOptions;
  }
  /**
   * Checks if there is a closing tag, if so it can hold content
   * @param  {Object} element DOM element
   * @return {Boolean} holdsContent
   */
  holdsContent(element) {
    return element.outerHTML.indexOf("/") !== -1;
  }
  /**
   * Is this a textarea, select or other block input
   * also isContentEditable
   * @param  {Object}  element
   * @return {Boolean}
   */
  isBlockInput(element) {
    return !this.isInput(element) && this.holdsContent(element);
  }
  /**
   * Determine if an element is an input field
   * @param  {String|Object} tag tagName or DOM element
   * @return {Boolean} isInput
   */
  isInput(tagArg) {
    let tag = tagArg;
    if (typeof tag !== "string") {
      tag = tag.tagName;
    }
    return inputTags.has(tag);
  }
  /**
   * Converts escaped HTML into usable HTML
   * @param  {String} html escaped HTML
   * @return {String}      parsed HTML
   */
  parsedHtml(html) {
    const escapeElement = document.createElement("textarea");
    escapeElement.innerHTML = html;
    return escapeElement.textContent;
  }
  /**
   * Test if label should be display before or after an element
   * @param  {Object} elem config
   * @return {Boolean} labelAfter
   */
  labelAfter(elem) {
    const type = helpers.get(elem, "attrs.type");
    const labelAfter = helpers.get(elem, "config.labelAfter");
    const isCB = type === "checkbox" || type === "radio";
    return labelAfter !== void 0 ? labelAfter : isCB;
  }
  requiredMark = () => ({
    tag: "span",
    className: "text-error",
    children: "*"
  });
  /**
   * Generate a label
   * @param  {Object} elem config object
   * @param  {String} fMap map to label's value in formData
   * @return {Object}      config object
   */
  label(elem, fMap) {
    const required = helpers.get(elem, "attrs.required");
    let {
      config: { label: labelText = "" }
    } = elem;
    const { id: elemId, attrs } = elem;
    if (typeof labelText === "function") {
      labelText = labelText();
    }
    const fieldLabel = {
      tag: "label",
      attrs: {
        for: elemId || attrs?.id
      },
      className: [],
      children: [labelText, required && this.requiredMark()],
      action: {}
    };
    if (fMap) {
      fieldLabel.attrs.for = void 0;
      fieldLabel.attrs.contenteditable = true;
      fieldLabel.fMap = fMap;
    }
    return fieldLabel;
  }
  /**
   * Determine content type
   * @param  {Node | String | Array | Object} content
   * @return {String}
   */
  childType(content) {
    if (content === void 0) {
      return content;
    }
    return [
      ["array", (content2) => Array.isArray(content2)],
      ["node", (content2) => content2 instanceof window.Node || content2 instanceof window.HTMLElement],
      ["component", () => content?.dom],
      [typeof content, () => true]
    ].find((typeCondition) => typeCondition[1](content))[0];
  }
  /**
   * Get the computed style for DOM element
   * @param  {Object}  elem     dom element
   * @param  {Boolean} property style eg. width, height, opacity
   * @return {String}           computed style
   */
  getStyle(elem, property = false) {
    let style;
    if (window.getComputedStyle) {
      style = window.getComputedStyle(elem, null);
    } else if (elem.currentStyle) {
      style = elem.currentStyle;
    }
    return property ? style[property] : style;
  }
  /**
   * Retrieves an element by config object, string id,
   * or existing reference
   * @param  {Object|String|Node} elem
   * @return {Object}             DOM element
   */
  getElement(elem) {
    const getElement = {
      node: () => elem,
      object: () => document.getElementById(elem.id),
      string: () => document.getElementById(elem)
    };
    const type = this.childType(elem);
    const element = getElement[type]();
    return element;
  }
  /**
   * Util to remove contents of DOM Object
   * @param  {Object} elem
   * @return {Object} element with its children removed
   */
  empty(elem) {
    while (elem.firstChild) {
      this.remove(elem.firstChild);
    }
    return elem;
  }
  /**
   * Remove elements without f children
   * @param  {Object} element DOM element
   * @return {Object} formData
   */
  removeEmpty = (element) => {
    const parent = element.parentElement;
    const type = componentType(element);
    const children = parent.getElementsByClassName(`formeo-${type}`);
    this.remove(element);
    if (!children.length) {
      if (!this.isStage(parent)) {
        return this.removeEmpty(parent);
      }
      return this.emptyClass(parent);
    }
  };
  /**
   * Removes element from DOM and data
   * @param  {Object} elem
   * @return  {Object} parent element
   */
  remove(elem) {
    const type = componentType(elem);
    if (type) {
      return components.remove(`${type}s.${elem.id}`);
    }
    return elem.parentElement.removeChild(elem);
  }
  /**
   * Removes a class or classes from nodeList
   *
   * @param  {NodeList|Node} nodeList
   * @param  {String | Array} className
   */
  removeClasses(nodeList, className) {
    const removeClass = {
      string: (elem) => elem.classList.remove(className),
      array: (elem) => {
        for (const name2 of className) {
          elem.classList.remove(name2);
        }
      }
    };
    removeClass.object = removeClass.string;
    helpers.forEach(nodeList, removeClass[this.childType(className)]);
  }
  /**
   * Adds a class or classes from nodeList
   *
   * @param  {NodeList} nodeList
   * @param  {String | Array} className
   */
  addClasses(nodeList, className) {
    const addClass = {
      string: (elem) => elem.classList.add(className),
      array: (elem) => {
        for (const name2 of className) {
          elem.classList.add(name2);
        }
      }
    };
    helpers.forEach(nodeList, addClass[this.childType(className)]);
  }
  /**
   * Wrap content in a formGroup
   * @param  {Object|Array|String} content
   * @param  {String} className
   * @return {Object} formGroup config
   */
  formGroup(content, className = "") {
    return {
      className: ["f-field-group", className],
      children: content
    };
  }
  /**
   * Returns the {x, y} coordinates for the
   * center of a given element
   * @param  {DOM} element
   * @return {Object}      {x,y} coordinates
   */
  coords(element) {
    const elemPosition = element.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    return {
      pageX: elemPosition.left + elemPosition.width / 2,
      pageY: elemPosition.top - bodyRect.top - elemPosition.height / 2
    };
  }
  /**
   * Removes all fields and resets a stage
   * @param  {DOM} stage DOM element
   */
  clearStage(stage) {
    stage.classList.add("removing-all-fields");
    const resetStage = () => {
      dom.empty(stage);
      stage.classList.remove("removing-all-fields");
      dom.emptyClass(stage);
      animate.slideDown(stage, 300);
    };
    animate.slideUp(stage, 600, resetStage);
  }
  /**
   * Toggles a sortables `disabled` option.
   * @param  {Object} elem DOM element
   * @param  {Boolean} state
   */
  toggleSortable(elem, stateArg) {
    let state = stateArg;
    const fType = componentType(elem);
    if (!fType) {
      return;
    }
    const pFtype = componentType(elem.parentElement);
    const sortable = dom[fType].get(elem.id).sortable;
    if (!state) {
      state = !sortable.option("disabled");
    }
    sortable.option("disabled", state);
    if (pFtype && ["rows", "columns", "stages"].includes(pFtype)) {
      this.toggleSortable(elem.parentElement, state);
    }
  }
  /**
   * Apply empty class to element if does not have children
   * @param  {Object} elem
   */
  emptyClass(elem) {
    const children = elem.getElementsByClassName(CHILD_CLASSNAME_MAP.get(elem.classList.item(0)));
    elem.classList.toggle("empty", !children.length);
  }
  btnTemplate = ({ title = "", ...rest }) => ({
    tag: "button",
    attrs: {
      type: "button",
      title
    },
    ...rest
  });
  isControls = (node) => componentType(node) === CONTROL_GROUP_CLASSNAME;
  isStage = (node) => componentType(node) === STAGE_CLASSNAME;
  isRow = (node) => componentType(node) === ROW_CLASSNAME;
  isColumn = (node) => componentType(node) === COLUMN_CLASSNAME;
  isField = (node) => componentType(node) === FIELD_CLASSNAME;
  asComponent = (elem) => components[`${componentType(elem)}s`].get(elem.id);
  isDOMElement(variable) {
    return variable instanceof window.Element || variable instanceof window.HTMLElement || !!(variable && typeof variable === "object" && variable.nodeType === 1 && typeof variable.nodeName === "string");
  }
}
const dom = new DOM();
const BASE_NAME = "f-autocomplete";
const DISPLAY_FIELD_CLASSNAME = `${BASE_NAME}-display-field`;
const LIST_CLASSNAME = `${BASE_NAME}-list`;
const HIGHLIGHT_CLASSNAME = "highlight-component";
const LIST_ITEM_CLASSNAME = `${LIST_CLASSNAME}-item`;
const labelCount = (arr, label) => {
  const count = arr.reduce((n, x) => n + (x === label), 0);
  return count > 1 ? `(${count})` : "";
};
const fieldLabelPaths = ["config.label", "config.controlId"];
const rowLabelPaths = ["config.legend", "name"];
const componentLabelPaths = [...fieldLabelPaths, ...rowLabelPaths];
const resolveFieldLabel = (field2) => {
  return fieldLabelPaths.reduce((acc, path) => {
    if (!acc) {
      return field2.get(path);
    }
    return acc;
  }, null);
};
const resolveComponentLabel = (component) => {
  return componentLabelPaths.reduce((acc, path) => {
    if (!acc) {
      return component.get(path);
    }
    return acc;
  }, null) || toTitleCase(component.name);
};
const labelResolverMap = /* @__PURE__ */ new Map([
  ["condition.source", resolveFieldLabel],
  ["if.condition.source", resolveFieldLabel],
  ["if.condition.target", resolveFieldLabel],
  ["then.condition.target", resolveComponentLabel],
  ["condition.target", resolveComponentLabel]
]);
const getComponentLabel = ({ id, ...component }, key) => {
  const { name: name2, label } = component;
  if (!name2) {
    return label;
  }
  const labelResolver = labelResolverMap.get(key);
  const resolvedLabel = labelResolver(component);
  return resolvedLabel;
};
const makeOptionData = ({ selectedId, ...option2 }) => {
  if (option2.value === selectedId) {
    option2.selected = true;
  }
  return option2;
};
const realTarget = (target) => {
  if (!target.classList.contains(LIST_ITEM_CLASSNAME)) {
    target = target.parentElement;
  }
  return target;
};
const makeListItem = ({ value, textLabel, htmlLabel, componentType: componentType2, depth = 0 }, autocomplete) => {
  const optionConfig = {
    tag: "li",
    children: htmlLabel,
    dataset: {
      value,
      label: textLabel
    },
    className: [LIST_ITEM_CLASSNAME, `${LIST_ITEM_CLASSNAME}-depth-${depth}`, `component-type-${componentType2}`],
    action: {
      mousedown: ({ target }) => {
        target = realTarget(target);
        autocomplete.setValue(target);
        autocomplete.selectOption(target);
        autocomplete.hideList();
      },
      mouseover: ({ target }) => {
        target = realTarget(target);
        autocomplete.removeHighlight();
        autocomplete.highlightComponent(target);
      },
      mouseleave: ({ target }) => {
        target = realTarget(target);
        autocomplete.removeHighlight();
      }
    }
  };
  return dom.create(optionConfig);
};
const makeComponentOptionsList = (component, autocomplete) => {
  const items = component.data.options.map((option2, index2) => {
    const value = `${component.address}.options[${index2}]`;
    const textLabel = option2.label;
    const htmlLabel = option2.label;
    return makeListItem({ value, textLabel, htmlLabel, componentType: "option", depth: 1 }, autocomplete);
  });
  const list = dom.create({
    tag: "ul",
    attrs: { className: [LIST_CLASSNAME, "options-list"] },
    children: items
  });
  return list;
};
const componentOptions = (autocomplete) => {
  const selectedId = autocomplete.value;
  const labels = [];
  const flatList = components.flatList();
  const options = Object.entries(flatList).reduce((acc, [value, component]) => {
    const label = getComponentLabel(component, autocomplete.key);
    if (label) {
      const componentType2 = component.name;
      const typeConfig = {
        tag: "span",
        content: ` ${toTitleCase(componentType2)}`,
        className: "component-type"
      };
      const labelKey = `${componentType2}.${label}`;
      labels.push(labelKey);
      const count = labelCount(labels, labelKey);
      const countConfig = {
        tag: "span",
        content: count,
        className: "component-label-count"
      };
      const htmlLabel = [`${label} `, countConfig, typeConfig];
      const textLabel = [label, count].join(" ").trim();
      if (component.isCheckable) {
        const componentOptionsList = makeComponentOptionsList(component, autocomplete);
        htmlLabel.push(componentOptionsList);
      }
      const optionData = makeOptionData({ value, textLabel, htmlLabel, componentType: componentType2, selectedId });
      acc.push(makeListItem(optionData, autocomplete));
    }
    return acc;
  }, []);
  return options;
};
class Autocomplete {
  lastCache = Date.now();
  optionsCache = null;
  /**
   * Create an Autocomplete instance
   * @param {String} key - The key for the autocomplete instance
   * @param {String} value - The initial value for the autocomplete input
   */
  constructor({ key, value, className, onChange = noop }) {
    this.key = key;
    this.className = [className || this.key.replace(/\./g, "-")].flat();
    this.value = value;
    this.onChange = onChange || noop;
    this.events = [];
    this.build();
  }
  createProxy() {
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        if (prop in target.dom) {
          const value = target.dom[prop];
          return typeof value === "function" ? value.bind(target.dom) : value;
        }
        return void 0;
      },
      set(target, prop, value) {
        if (prop in target) {
          target[prop] = value;
        } else {
          target.dom[prop] = value;
        }
        return true;
      }
    });
  }
  get isAddress() {
    return isAddress(this.value);
  }
  get valueComponent() {
    return isAddress(this.value) && components.getAddress(this.value);
  }
  /**
   * build a text DOM element, supporting other jquery text form-control's
   * @return {Object} DOM Element to be injected into the form.
   */
  build() {
    const keyboardNav = (e2) => {
      const list = this.list;
      const activeOption = this.getActiveOption();
      const keyCodeMap = /* @__PURE__ */ new Map([
        [
          38,
          // up arrow
          () => {
            const previous = this.getPreviousOption(activeOption);
            if (previous) {
              this.selectOption(previous);
            }
          }
        ],
        [
          40,
          // down arrow
          () => {
            const next = this.getNextOption(activeOption);
            if (next) {
              this.selectOption(next);
            }
          }
        ],
        [
          13,
          // enter
          () => {
            if (activeOption) {
              this.selectOption(activeOption);
              this.setValue(activeOption);
              if (list.style.display === "none") {
                this.showList(activeOption);
              } else {
                this.hideList();
              }
            }
            e2.preventDefault();
          }
        ],
        [
          27,
          // escape
          () => {
            this.hideList();
          }
        ]
      ]);
      let direction = keyCodeMap.get(e2.keyCode);
      if (!direction) {
        direction = () => false;
      }
      return direction();
    };
    const autoCompleteInputActions = {
      focus: ({ target }) => {
        this.updateOptions();
        target.parentElement.classList.add(`${BASE_NAME}-focused`);
        const filteredOptions = dom.toggleElementsByStr(
          this.list.querySelectorAll(`.${LIST_ITEM_CLASSNAME}-depth-0`),
          target.value
        );
        target.addEventListener("keydown", keyboardNav);
        const selectedOption = this.list.querySelector(".active-option") || filteredOptions[0];
        this.showList(selectedOption);
      },
      blur: ({ target }) => {
        target.parentElement.classList.remove(`${BASE_NAME}-focused`);
        target.removeEventListener("keydown", keyboardNav);
        this.hideList();
      },
      input: (evt) => {
        const { value } = evt.target;
        const filteredOptions = dom.toggleElementsByStr(this.list.querySelectorAll("li"), value);
        if (value.length === 0) {
          this.clearValue();
        }
        if (filteredOptions.length === 0) {
          this.hideList();
        } else {
          const activeOption = this.getActiveOption() || filteredOptions[0];
          this.showList(activeOption);
        }
        this.setValue({ dataset: { label: value, value } });
      }
    };
    this.displayField = dom.create({
      tag: "input",
      autocomplete: "off",
      action: autoCompleteInputActions,
      attrs: {
        type: "text",
        className: DISPLAY_FIELD_CLASSNAME,
        value: this.label || this.value,
        placeholder: mi18n.get(`${this.key}.placeholder`)
      }
    });
    this.hiddenField = dom.create({
      tag: "input",
      attrs: { type: "hidden", className: BASE_NAME, value: this.value }
    });
    this.list = dom.create({
      tag: "ul",
      attrs: { className: LIST_CLASSNAME }
    });
    this.clearButton = dom.create({
      tag: "span",
      content: dom.icon("remove"),
      className: "clear-button hidden",
      action: { click: () => this.clearValue() }
    });
    this.dom = dom.create({
      children: [this.displayField, this.clearButton, this.hiddenField],
      className: [BASE_NAME, this.className].flat(),
      action: {
        onRender: (element) => {
          this.stage = element.closest(".formeo-stage");
          if (this.value) {
            this.displayField.value = this.label;
          }
          this.clearButton.classList.toggle("hidden", !this.value.length);
        }
      }
    });
    return this.dom;
  }
  get label() {
    if (!isAddress(this.value)) {
      return this.value;
    }
    const component = this.value && components.getAddress(this.value);
    return component && getComponentLabel(component, `${this.key}`) || this.value;
  }
  updateOptions() {
    let options = this.optionsCache;
    const now = Date.now();
    if (now - this.lastCache > ANIMATION_SPEED_SLOW * 5 || !options) {
      dom.empty(this.list);
      options = this.generateOptions();
      this.lastCache = now;
    }
    if (!this.list.children.length) {
      this.list.append(...options);
    }
  }
  generateOptions() {
    this.optionsCache = componentOptions(this);
    return this.optionsCache;
  }
  setListPosition() {
    const { offsetHeight, offsetWidth } = this.displayField;
    const containerRect = this.displayField.closest(".formeo-stage").getBoundingClientRect();
    const triggerRect = this.displayField.getBoundingClientRect();
    const listStyle = {
      position: "absolute",
      top: `${triggerRect.y + offsetHeight - containerRect.y}px`,
      left: `${triggerRect.x + window.scrollX - containerRect.x + 2}px`,
      width: `${offsetWidth}px`
    };
    Object.assign(this.list.style, listStyle);
  }
  /**
   * Shows autocomplete list. Automatically selects 'selectedOption'
   * @param {Object} list - list of autocomplete options
   * @param {Object} selectedOption - option to be selected
   */
  showList(selectedOption, list = this.list) {
    if (!this.stage.contains(this.list)) {
      this.stage.appendChild(this.list);
    }
    this.setListPosition();
    this.selectOption(selectedOption);
    animate.slideDown(list, ANIMATION_SPEED_FAST);
  }
  /**
   * Hides autocomplete list and deselects all the options
   * @param {Object} list - list of autocomplete options
   */
  hideList(list = this.list) {
    animate.slideUp(list, ANIMATION_SPEED_FAST);
    this.removeHighlight();
    if (this.stage.contains(this.list)) {
      this.stage.removeChild(this.list);
    }
  }
  /**
   * Returns first option from autocomplete list with 'active-option' class
   * @param {Object} list - list of autocomplete options
   * @return {Object} first list option with 'active-option' class
   */
  getActiveOption(list = this.list) {
    const activeOption = list.querySelector(".active-option");
    if (activeOption?.style.display !== "none") {
      return activeOption;
    }
    return null;
  }
  /**
   * Previous next option to the current option
   * @param {Object} current - currently selected option
   * @return {Object} previous option to the current option or null if previous doesn't exist
   */
  getPreviousOption(current) {
    let previous = current;
    do {
      previous = previous ? previous.previousSibling : null;
    } while (previous != null && previous.style.display === "none");
    return previous;
  }
  /**
   * Returns next option to the current option
   * @param {Object} current - currently selected option
   * @return {Object} next option to the current option or null if next doesn't exist
   */
  getNextOption(current) {
    let next = current;
    do {
      next = next ? next.nextSibling : null;
    } while (next != null && next.style.display === "none");
    return next;
  }
  /**
   * Selects option in autocomplete list. Removes class 'active-option' from all options
   * and then adds that class to 'selected' option. If 'selected' is null then no option is selected
   * @param {Object} list - list of autocomplete options
   * @param {Object} selectedOption - option - 'li' element - to be selected in autocomplete list
   */
  selectOption(selectedOption, list = this.list) {
    const options = list.querySelectorAll("li");
    for (const option2 of options) {
      const {
        dataset: { value }
      } = option2;
      option2.classList.remove("active-option");
      if (isAddress(value)) {
        const component = components.getAddress(value);
        component?.dom?.classList.remove(HIGHLIGHT_CLASSNAME);
      }
    }
    if (selectedOption) {
      selectedOption.classList.add("active-option");
      this.highlightComponent(selectedOption);
    }
  }
  /**
   * removes the highlight from
   */
  removeHighlight() {
    const highlightedComponents = document.getElementsByClassName(HIGHLIGHT_CLASSNAME);
    for (const component of highlightedComponents) {
      component.classList.remove(HIGHLIGHT_CLASSNAME);
    }
  }
  /**
   * Highlight a component that maps to the option
   */
  highlightComponent(option2) {
    const {
      dataset: { value }
    } = option2;
    if (isAddress(value)) {
      const { componentAddress, isOptionAddress, optionIndex } = splitAddress(value).reduce(
        (acc, cur) => {
          if (cur === "options") {
            acc.isOptionAddress = true;
            return acc;
          }
          if (!acc.isOptionAddress) {
            acc.componentAddress.push(cur);
            return acc;
          }
          acc.optionIndex = +cur;
          return acc;
        },
        {
          componentAddress: [],
          optionIndex: null,
          isOptionAddress: false
        }
      );
      const component = components.getAddress(componentAddress);
      if (component?.dom) {
        component.dom.classList.add(HIGHLIGHT_CLASSNAME);
        if (isOptionAddress) {
          const checkboxes = component.dom.querySelectorAll(".field-preview .f-checkbox, .field-preview .f-radio");
          checkboxes[optionIndex]?.classList.add(HIGHLIGHT_CLASSNAME);
        }
      }
    }
  }
  /**
   * Clears the autocomplete values and fires onChange event
   */
  clearValue() {
    this.selectOption(null);
    this.setValue({ dataset: { label: "", value: "" } });
    this.displayField.focus();
  }
  /**
   * Sets the hidden and display values
   * @param {String} label display text
   * @param {String} value display text
   */
  setValue(target) {
    const { label, value } = target.dataset;
    this.displayField.value = label;
    this.hiddenField.value = value;
    this.value = value;
    this.clearButton.classList.toggle("hidden", !value.length);
    this.onChange?.({ target: this.hiddenField });
  }
}
function inputConfigBase({ key, value, type = "text", checked }) {
  const config = {
    tag: "input",
    attrs: {
      type,
      value,
      placeholder: mi18n.get(`${key}.placeholder`) || toTitleCase(key)
    },
    className: [key.replace(/\./g, "-")],
    config: {}
  };
  if (checked) {
    config.attrs.checked = true;
  }
  return config;
}
function labelHelper(key) {
  const labelText = mi18n.get(key);
  if (labelText) {
    return labelText;
  }
  const splitKey = key.split(".");
  return mi18n.get(splitKey[splitKey.length - 1]);
}
const ITEM_INPUT_TYPE_MAP = {
  autocomplete: (...args) => new Autocomplete(...args).createProxy(),
  string: ({ key, value }) => inputConfigBase({ key, value }),
  boolean: ({ key, value }) => {
    const type = key === "selected" ? "radio" : "checkbox";
    return inputConfigBase({ key, value, type, checked: !!value });
  },
  number: ({ key, value }) => inputConfigBase({ key, value, type: "number" }),
  array: ({ key, value }) => {
    return {
      tag: "select",
      attrs: {
        placeholder: labelHelper(`placeholder.${key}`)
      },
      className: [key.replace(/\./g, "-")],
      options: value
    };
  },
  object: (valObj) => {
    return Object.entries(valObj).map(([key, value]) => {
      return ITEM_INPUT_TYPE_MAP[dom.childType(value)]({ key, value });
    });
  }
};
const INPUT_TYPE_ACTION = {
  boolean: (dataKey, field2) => ({
    click: ({ target }) => {
      if (target.type === "radio") {
        const updatedOptions = field2.data.options.map((option2) => ({ ...option2, selected: false }));
        field2.set("options", updatedOptions);
      }
      field2.set(dataKey, target.checked);
      field2.updatePreview();
    }
  }),
  string: (dataKey, field2) => ({
    input: ({ target: { value } }) => {
      field2.set(dataKey, value);
      field2.debouncedUpdatePreview();
    }
  }),
  number: (dataKey, field2) => ({
    input: ({ target: { value } }) => {
      field2.set(dataKey, Number(value));
      field2.debouncedUpdatePreview();
    }
  }),
  array: (dataKey, field2) => ({
    change: ({ target: { value } }) => {
      field2.set(dataKey, value);
      field2.debouncedUpdatePreview();
    }
  }),
  object: () => ({})
};
const hiddenPropertyClassname = "hidden-property";
const hiddenOptionClassname = "hidden-option";
const optionsAddressRegex = /\.options\[\d+\]$/;
const optionDataMap = {
  "if-sourceProperty": objectFromStringArray(PROPERTY_OPTIONS, CHECKABLE_OPTIONS, VISIBLE_OPTIONS),
  "if-targetProperty": objectFromStringArray(PROPERTY_OPTIONS),
  "then-targetProperty": objectFromStringArray(PROPERTY_OPTIONS, CHECKABLE_OPTIONS, VISIBLE_OPTIONS),
  ...Object.entries(OPERATORS).reduce((acc, [key, value]) => {
    acc[`if-${key}`] = value;
    acc[`then-${key}`] = value;
    return acc;
  }, {})
};
const segmentTypes = {
  assignment: createConditionSelect,
  comparison: createConditionSelect,
  logical: createConditionSelect,
  source: ({ key: keyArg, value, onChange, conditionType }) => {
    const componentInput = ITEM_INPUT_TYPE_MAP.autocomplete({
      key: `${conditionType}.condition.${keyArg}`,
      value,
      onChange,
      className: `condition-${keyArg}`
    });
    return componentInput;
  },
  sourceProperty: createConditionSelect,
  targetProperty: createConditionSelect,
  target: (args) => segmentTypes.source(args),
  value: ({ key, value, onChange }, _conditionValues) => {
    const valueField = ITEM_INPUT_TYPE_MAP.string({ key: `condition.${key}`, value });
    valueField.action = {
      input: onChange
    };
    return valueField;
  }
};
function getOptionConfigs({ key: fieldName, value: fieldValue, conditionType }) {
  const optionDataKey = `${conditionType}-${fieldName}`;
  const data = optionDataMap[optionDataKey];
  return Object.entries(data || {}).map(
    ([key, optionValue]) => makeOptionDomConfig({ fieldName, fieldValue, key, optionValue })
  );
}
function makeOptionDomConfig({ fieldName, fieldValue, key, optionValue }) {
  return {
    label: mi18n.get(`${fieldName}.${key}`) || toTitleCase(key).toLowerCase(),
    value: optionValue,
    selected: optionValue === fieldValue
  };
}
function createConditionSelect({ key, value, onChange, conditionType }) {
  const optionConfigs = getOptionConfigs({ key, value, conditionType });
  const propertyFieldConfig = ITEM_INPUT_TYPE_MAP.array({ key: `condition.${key}`, value: optionConfigs });
  propertyFieldConfig.action = {
    change: onChange
    // onRender: elem => onChangeCondition({ target: elem }),
  };
  return propertyFieldConfig;
}
const isVisible$1 = (elem) => {
  return !elem?.classList.contains(hiddenPropertyClassname);
};
const fieldVisibilityMap = {
  sourceProperty: (fields2) => {
    const source = fields2.get("source");
    const sourceProperty = fields2.get("sourceProperty");
    const sourceHasValue = !!source.value;
    const sourceIsCheckable = !!source.value.match(optionsAddressRegex);
    toggleCheckablePropertyOptions(sourceIsCheckable, sourceProperty);
    return !sourceHasValue;
  },
  comparison: (fields2) => {
    const source = fields2.get("source");
    const sourceProperty = fields2.get("sourceProperty");
    const sourceHasValue = !!source.value;
    const sourceValueIsCheckable = !!source.value.match(optionsAddressRegex);
    return !sourceHasValue || sourceValueIsCheckable || sourceProperty.value !== "value";
  },
  assignment: (fields2) => {
    const target = fields2.get("target");
    const targetProperty = fields2.get("targetProperty");
    const targetHasValue = !!target.value;
    return !targetHasValue || targetProperty.value.startsWith("is");
  },
  targetProperty: (fields2) => {
    const target = fields2.get("target");
    const targetProperty = fields2.get("targetProperty");
    const targetIsCheckable = !!target.value.match(optionsAddressRegex);
    toggleCheckablePropertyOptions(targetIsCheckable, targetProperty);
    return !isInternalAddress(target.value);
  },
  target: (fields2) => {
    const source = fields2.get("source");
    const sourceProperty = fields2.get("sourceProperty");
    const sourceHasValue = !!source?.value;
    if (sourceProperty && !sourceHasValue) {
      return true;
    }
    return sourceProperty && sourceProperty?.value !== "value";
  },
  value: (fields2) => {
    const target = fields2.get("target");
    const targetProperty = fields2.get("targetProperty");
    if (targetProperty === void 0) {
      return false;
    }
    if (target && !target.value) {
      return true;
    }
    if (!isVisible$1(fields2.get("comparison"))) {
      return true;
    }
    if (targetProperty.value === isCheckedValue) {
      return true;
    }
    return targetProperty.value.startsWith("is");
  }
};
const toggleFieldVisibility = (fields2) => {
  for (const [fieldName, field2] of fields2) {
    const shouldHide = !!fieldVisibilityMap[fieldName]?.(fields2) || false;
    field2.classList.toggle(hiddenPropertyClassname, shouldHide);
  }
};
const isCheckedValue = "isChecked";
const isCheckedOption = (option2) => option2.value.endsWith("Checked");
const toggleCheckablePropertyOptions = (isCheckable, propertyField) => {
  if (isCheckable && isCheckedOption(propertyField)) {
    return null;
  }
  const options = Array.from(propertyField.querySelectorAll("option"));
  const hiddenOptionValues = [];
  for (const option2 of options) {
    const optionIsChecked = isCheckedOption(option2);
    const shouldHide = isCheckable ? !optionIsChecked : optionIsChecked;
    if (shouldHide) {
      hiddenOptionValues.push(option2.value);
    }
    option2.classList.toggle(hiddenOptionClassname, shouldHide);
  }
  if (hiddenOptionValues.includes(propertyField.value)) {
    propertyField.value = isCheckable ? isCheckedValue : options.find((opt) => !isCheckedOption(opt))?.value || propertyField.value;
  }
};
function orderConditionValues(conditionValues, fieldOrder = CONDITION_INPUT_ORDER) {
  return fieldOrder.reduce((acc, fieldName) => {
    if (conditionValues[fieldName] !== void 0) {
      acc.push([fieldName, conditionValues[fieldName]]);
    }
    return acc;
  }, []);
}
class Condition {
  constructor({ conditionValues, conditionType, conditionCount, index: index2 }, parent) {
    this.values = new Map(orderConditionValues(conditionValues));
    this.conditionType = conditionType;
    this.parent = parent;
    this.baseAddress = `${parent.address}.${conditionType}`;
    this.fields = /* @__PURE__ */ new Map();
    this.conditionCount = conditionCount;
    this.index = index2;
    this.dom = this.generateDom();
  }
  setConditionIndex(index2) {
    this.index = index2;
  }
  get address() {
    return `${this.baseAddress}[${this.index}]`;
  }
  destroy() {
    const conditions = components.getAddress(this.baseAddress);
    conditions.splice(this.index, 1);
    components.setAddress(this.baseAddress, conditions);
    animate.slideUp(this.dom, ANIMATION_SPEED_FAST, () => {
      this.dom.remove();
    });
  }
  label() {
    if (this.index) {
      return null;
    }
    return {
      tag: "label",
      className: `condition-label ${this.conditionType}-condition-label`,
      content: mi18n.get(`condition.type.${this.conditionType}`)
    };
  }
  generateDom() {
    const fieldsDom = [];
    for (const [key, value] of this.values) {
      const onChange = (evt) => this.onChangeCondition({ key, target: evt.target });
      const fieldArgs = { key, value, conditionType: this.conditionType, onChange };
      const conditionField = segmentTypes[key](fieldArgs, this.values);
      const conditionFieldDom = conditionField.dom || dom.create(conditionField);
      this.fields.set(key, conditionField.dom ? conditionField : conditionFieldDom);
      fieldsDom.push(conditionFieldDom);
    }
    const conditionRowChildren = [this.label(), ...fieldsDom, ...this.generateConditionTypeActionButtons()];
    const conditionTypeRow = {
      children: conditionRowChildren,
      className: `f-condition-row ${this.conditionType}-condition-row display-none`,
      action: {
        onRender: (_elem) => {
          this.processUiState();
        }
      }
    };
    return dom.create(conditionTypeRow);
  }
  generateConditionTypeActionButtons() {
    const actionButtons = [];
    const manageConditionClassname = "manage-condition-type";
    const manageConditionActionClassname = (action) => `${action}-condition-type`;
    const removeConditionType = dom.btnTemplate({
      title: mi18n.get(`remove${this.conditionType}Condition`),
      className: [manageConditionClassname, manageConditionActionClassname("remove")],
      content: dom.icon("minus"),
      action: {
        click: () => this.destroy(),
        mouseover: (_evt) => {
          this.dom.classList.add("to-remove");
        },
        mouseout: (_evt) => {
          this.dom.classList.remove("to-remove");
        }
      }
    });
    actionButtons.push(removeConditionType);
    const addConditionType = dom.btnTemplate({
      title: mi18n.get(`add${this.conditionType}Condition`),
      className: [manageConditionClassname, manageConditionActionClassname("add")],
      content: dom.icon("plus"),
      action: {
        click: () => {
          const condition = this.parent.addConditionType(this.conditionType);
          const evtData = {
            changedProperty: null,
            dataPath: condition.address,
            value: condition.value,
            src: condition.dom
          };
          this.updateDataDebounced(evtData);
        }
      }
    });
    actionButtons.push(addConditionType);
    return actionButtons;
  }
  get value() {
    return Array.from(this.fields).reduce((acc, [key, field2]) => {
      acc[key] = field2.value;
      return acc;
    }, {});
  }
  processUiState() {
    toggleFieldVisibility(this.fields);
    this.dom.classList.remove("display-none");
  }
  updateDataDebounced = debounce((evtData) => {
    events.formeoUpdated(evtData);
    components.setAddress(evtData.dataPath, evtData.value);
  });
  onChangeCondition = ({ key, target }) => {
    const evtData = {
      changedProperty: key,
      dataPath: this.address,
      value: this.value,
      src: target
    };
    toggleFieldVisibility(this.fields);
    this.updateDataDebounced(evtData);
  };
}
const panelDataKeyMap = /* @__PURE__ */ new Map([
  ["attrs", ({ itemKey }) => itemKey],
  ["options", ({ itemKey, key }) => `${itemKey}.${key}`]
]);
const toggleOptionMultiSelect = (isMultiple, field2) => {
  if (field2.controlId === "select") {
    const optionsPanel = field2.editPanels.get("options");
    const [fromCheckedType, toCheckedType] = isMultiple ? CHECKED_TYPES : REVERSED_CHECKED_TYPES;
    const updatedOptionsData = optionsPanel.data.map(({ [fromCheckedType]: val, ...option2 }) => ({
      [toCheckedType]: val,
      ...option2
    }));
    optionsPanel.setData(updatedOptionsData);
  }
};
const itemInputActions = /* @__PURE__ */ new Map([
  [
    "attrs-multiple",
    (editPanelItem) => ({
      change: ({ target }) => {
        if (editPanelItem.field.controlId === "select") {
          toggleOptionMultiSelect(target.checked, editPanelItem.field);
        }
      }
    })
  ]
]);
class EditPanelItem {
  /**
   * Set defaults and load panelData
   * @param  {String} itemKey attribute name or options index
   * @param  {Object} itemData existing field ID
   * @param  {String} field
   * @return {Object} field object
   */
  constructor({ key, index: index2, field: field2, panel, data }) {
    this.field = field2;
    this.itemKey = key;
    this.itemIndex = index2;
    this.panel = panel;
    this.panelName = panel.name;
    this.isDisabled = field2.isDisabledProp(key, this.panelName);
    this.isHidden = this.isDisabled && field2.config.panels[this.panelName].hideDisabled;
    this.isLocked = field2.isLockedProp(key, this.panelName);
    this.address = `${field2.indexName}.${field2.id}.${key}`;
    this.itemSlug = slugifyAddress(key);
    this.conditionTypeWrap = /* @__PURE__ */ new Map();
    if (data !== void 0 && this.field.get(this.itemKey) === void 0) {
      this.field.set(this.itemKey, data);
    }
    const liClassList = [`field-${this.itemSlug}`, "prop-wrap"];
    if (this.isHidden) {
      liClassList.push("hidden-property");
    }
    this.dom = dom.create({
      tag: "li",
      className: liClassList,
      children: { className: "component-prop", children: [this.itemInputs(), this.itemControls] }
    });
  }
  get itemValues() {
    const val = this.field.get(this.itemKey);
    if (val?.constructor === Object) {
      return orderObjectsBy(Object.entries(val), CHECKED_TYPES, "0");
    }
    return [[this.itemKey, val]];
  }
  findOrCreateConditionTypeWrap(conditionType) {
    let conditionTypeWrap = this.conditionTypeWrap.get(conditionType);
    if (conditionTypeWrap) {
      return conditionTypeWrap;
    }
    conditionTypeWrap = dom.create({
      className: `type-conditions-wrap ${conditionType}-conditions-wrap`
    });
    this.conditionTypeWrap.set(conditionType, conditionTypeWrap);
    return conditionTypeWrap;
  }
  itemInputs() {
    const inputs = dom.create({
      className: `${this.panelName}-prop-inputs prop-inputs f-input-group`,
      children: this.itemValues.map(([key, val]) => {
        if (this.panelName === "conditions") {
          return this.generateConditionFields(key, val);
        }
        return this.itemInput(key, val);
      })
    });
    if (this.inputs) {
      this.inputs.replaceWith(inputs);
    }
    this.inputs = inputs;
    return inputs;
  }
  addConditionType = (conditionType, conditionArg) => {
    const conditionTypeWrap = this.findOrCreateConditionTypeWrap(conditionType);
    let condition = conditionArg;
    if (!condition) {
      const [newConditionData] = CONDITION_TEMPLATE()[conditionType];
      const conditionCount = conditionTypeWrap.children.length;
      if (conditionType === conditionTypeIf) {
        newConditionData.logical = "||";
      }
      condition = { conditionValues: newConditionData, conditionCount, index: conditionCount };
    }
    const conditionField = new Condition({ conditionType, ...condition }, this);
    conditionTypeWrap.appendChild(conditionField.dom);
    return conditionField;
  };
  removeConditionType = (conditionType, index2) => {
    const conditionTypeWrap = this.conditionTypeWrap.get(conditionType);
    const conditionField = conditionTypeWrap.children[index2];
    conditionField.destroy();
    conditionTypeWrap.removeChild(conditionField.dom);
  };
  generateConditionFields = (conditionType, conditionVals) => {
    this.conditions = /* @__PURE__ */ new Map();
    conditionVals.forEach((condition, index2) => {
      const conditionField = this.addConditionType(conditionType, {
        index: index2,
        conditionCount: conditionVals.length,
        conditionValues: condition
      });
      this.conditions.set(index2, conditionField);
    });
    return this.findOrCreateConditionTypeWrap(conditionType);
  };
  get itemControls() {
    if (this.isLocked) {
      const controls2 = {
        className: `${this.panelName}-prop-controls prop-controls`,
        content: []
      };
      return controls2;
    }
    const remove2 = {
      tag: "button",
      attrs: {
        type: "button",
        className: "prop-remove prop-control"
      },
      action: {
        click: () => {
          animate.slideUp(this.dom, ANIMATION_SPEED_BASE, (elem) => {
            this.field.remove(this.itemKey);
            elem.remove();
            this.panel.updateProps();
          });
        },
        mouseover: (_evt) => {
          this.dom.classList.add("to-remove");
        },
        mouseout: (_evt) => {
          this.dom.classList.remove("to-remove");
        }
      },
      content: dom.icon("remove")
    };
    const controls = {
      className: `${this.panelName}-prop-controls prop-controls`,
      content: [remove2]
    };
    return controls;
  }
  itemInput(key, value) {
    const valType = dom.childType(value) || "string";
    const dataKey = panelDataKeyMap.get(this.panelName)?.({ itemKey: this.itemKey, key }) || this.itemKey;
    const labelKey = dataKey.split(".").filter(Number.isNaN).join(".") || key;
    const baseConfig = ITEM_INPUT_TYPE_MAP[valType]({ key, value });
    const name2 = `${this.field.shortId}-${slugifyAddress(dataKey).replace(/-\d+-(selected)/g, "-$1")}`;
    const config = {
      label: this.panelName !== "options" && (labelHelper(labelKey) || toTitleCase(labelKey)),
      labelAfter: false
    };
    const attrs = {
      name: baseConfig.attrs.type === "checkbox" ? `${name2}[]` : name2
    };
    attrs.disabled = this.isDisabled;
    attrs.locked = this.isLocked;
    const itemInputAction = itemInputActions.get(this.itemSlug)?.(this);
    const action = mergeActions(INPUT_TYPE_ACTION[valType](dataKey, this.field), itemInputAction || {});
    const inputConfig = merge(ITEM_INPUT_TYPE_MAP[valType]({ key, value }), { action, attrs, config });
    if (CHECKED_TYPES.includes(key)) {
      return {
        className: "f-addon",
        children: inputConfig
      };
    }
    return inputConfig;
  }
}
const addAttributeActions = {
  multiple: (val, field2) => {
    toggleOptionMultiSelect(!!val, field2);
  }
};
class EditPanel {
  /**
   * Set defaults and load panelData
   * @param  {Object} panelData existing field ID
   * @param  {String} panelName name of panel
   * @param  {String} component
   * @return {Object} field object
   */
  constructor(panelData, panelName, component) {
    this.type = dom.childType(panelData);
    this.name = panelName;
    this.component = component;
    this.panelConfig = this.getPanelConfig(this.data);
  }
  get data() {
    const data = this.component.get(this.name);
    return this.type === "object" ? Object.entries(data) : data;
  }
  getPanelConfig(data) {
    this.props = this.createProps(data);
    this.editButtons = this.createEditButtons();
    return {
      config: {
        label: mi18n.get(`panel.label.${this.name}`)
      },
      attrs: {
        className: `${PANEL_CLASSNAME} ${this.name}-panel`
      },
      children: [this.props, this.editButtons]
    };
  }
  /**
   * Generates the edit panel for attrs, meta and options for a fields(s)
   * @param  {String} panelName
   * @param  {Object} dataObj   field config object
   * @return {Object}           formeo DOM config object
   */
  createProps(data = this.data) {
    this.editPanelItems = Array.from(data).map((dataVal, index2) => {
      const isArray = this.type === "array";
      const key = isArray ? `[${index2}]` : `.${dataVal[0]}`;
      const val = isArray ? dataVal : { [dataVal[0]]: dataVal[1] };
      return new EditPanelItem({
        key: `${this.name}${key}`,
        data: val,
        field: this.component,
        index: index2,
        panel: this
      });
    });
    const editGroupConfig = {
      tag: "ul",
      attrs: {
        className: ["edit-group", `${this.component.name}-edit-group`, `${this.component.name}-edit-${this.name}`]
      },
      editGroup: this.name,
      isSortable: this.name === "options",
      content: this.editPanelItems
    };
    return dom.create(editGroupConfig);
  }
  updateProps() {
    const newProps = this.createProps();
    this.props.replaceWith(newProps);
    this.props = newProps;
  }
  /**
   * Generate edit buttons for interacting with attrs and options panel
   * @return {Object} panel edit buttons config
   */
  createEditButtons() {
    const type = this.name;
    const btnTitle = mi18n.get(`panelEditButtons.${type}`);
    const addActions = {
      attrs: this.addAttribute,
      options: this.addOption,
      conditions: this.addCondition
    };
    const editPanelButtons = [];
    if (type === "conditions") {
      if (mi18n.current && !mi18n.current.clearAll) {
        mi18n.put("clearAll", "Clear All");
      }
      const clearAllBtn = {
        ...dom.btnTemplate({
          content: [dom.icon("bin"), mi18n.get("clearAll")],
          title: mi18n.get("clearAll")
        }),
        className: `clear-all-${type}`,
        action: {
          click: () => {
            this.clearAllItems();
          }
        }
      };
      editPanelButtons.push(clearAllBtn);
    }
    const addBtn = {
      ...dom.btnTemplate({ content: btnTitle, title: btnTitle }),
      className: `add-${type}`,
      action: {
        click: (evt) => {
          const addEvt = {
            btnCoords: dom.coords(evt.target),
            addAction: addActions[type]
          };
          if (type === "attrs") {
            addEvt.isDisabled = this.component.isDisabledProp;
            addEvt.isLocked = this.component.isLockedProp;
            addEvt.message = {
              attr: mi18n.get(`action.add.${type}.attr`),
              value: mi18n.get(`action.add.${type}.value`)
            };
          }
          const eventType = toTitleCase(type);
          const customEvt = new window.CustomEvent(`onAdd${eventType}`, {
            detail: addEvt
          });
          actions.add[type](addEvt);
          document.dispatchEvent(customEvt);
        }
      }
    };
    editPanelButtons.push(addBtn);
    const panelEditButtonsWrap = {
      className: "panel-action-buttons",
      content: editPanelButtons
    };
    return panelEditButtonsWrap;
  }
  /**
   * Add a new attribute to the attrs panels
   * @param {String} attr
   * @param {String|Array} val
   */
  addAttribute = (attr, valArg) => {
    let val = valArg;
    const safeAttr = safeAttrName(attr);
    const itemKey = `attrs.${safeAttr}`;
    if (!mi18n.current[itemKey]) {
      mi18n.put(itemKey, capitalize(attr));
    }
    if (typeof val === "string" && ["true", "false"].includes(val)) {
      val = JSON.parse(val);
    }
    this.component.set(`attrs.${attr}`, val);
    addAttributeActions[safeAttr]?.(val, this.component);
    const existingAttr = this.props.querySelector(`.${this.component.name}-attrs-${safeAttr}`);
    const newAttr = new EditPanelItem({
      key: itemKey,
      data: { [safeAttr]: val },
      field: this.component,
      panel: this
    });
    if (existingAttr) {
      existingAttr.replaceWith(newAttr.dom);
    } else {
      this.props.appendChild(newAttr.dom);
    }
    this.component.resizePanelWrap();
  };
  /**
   * Add option to options panel
   */
  addOption = () => {
    const controlId = this.component.data.config.controlId;
    const fieldOptionData = this.component.get("options");
    const type = controlId === "select" ? "option" : controlId;
    const newOptionLabel = mi18n.get("newOptionLabel", { type }) || "New Option";
    const itemKey = `${this.name}[${this.data.length}]`;
    const lastOptionData = fieldOptionData[fieldOptionData.length - 1];
    const optionTemplate = fieldOptionData.length ? lastOptionData : {};
    const itemData = { ...optionTemplate, label: newOptionLabel };
    if (controlId !== "button") {
      itemData.value = slugify(newOptionLabel);
    }
    const newOption = new EditPanelItem({
      key: itemKey,
      data: itemData,
      field: this.component,
      index: this.props.children.length,
      panel: this
    });
    this.editPanelItems.push(newOption);
    this.props.appendChild(newOption.dom);
    this.component.debouncedUpdatePreview();
    this.component.resizePanelWrap();
  };
  addCondition = (evt) => {
    const currentConditions = this.component.get("conditions");
    const itemKey = `conditions[${currentConditions.length}]`;
    const newCondition = new EditPanelItem({ key: itemKey, data: evt.template, field: this.component, panel: this });
    this.props.appendChild(newCondition.dom);
    this.component.set(itemKey, evt.template);
    this.component.resizePanelWrap();
  };
  /**
   * Clears all items from the component property based on its type.
   * Sets the property to an empty array for 'array' type or empty object for other types.
   * Executes removal action hooks and dispatches a custom removal event.
   *
   * @method clearAllItems
   * @fires CustomEvent#onRemove{PropertyName} - Dispatched when items are cleared
   * @returns {void}
   */
  clearAllItems = () => {
    const emptyValue = this.type === "array" ? [] : {};
    const removeEvt = {
      type: this.name,
      removeAction: () => {
        this.component.set(this.name, emptyValue);
        this.updateProps();
      }
    };
    actions.remove[this.name](removeEvt);
    const eventType = toTitleCase(this.name);
    const customEvt = new window.CustomEvent(`onRemove${eventType}`, {
      detail: removeEvt
    });
    document.dispatchEvent(customEvt);
  };
  setData(val) {
    this.data = val;
    this.component.set(this.name, val);
    this.updateProps();
  }
}
const defaults$2 = Object.freeze({
  type: "field",
  displayType: "slider"
});
const getTransition = (val) => {
  const translateXVal = val ? `${val}px` : 0;
  return { transform: `translateX(${translateXVal})` };
};
class Panels {
  /**
   * Panels initial setup
   * @param  {Object} options Panels config
   * @return {Object} Panels
   */
  constructor(options) {
    this.opts = merge(defaults$2, options);
    this.panelDisplay = this.opts.displayType;
    this.activePanelIndex = 0;
    this.panelNav = this.createPanelNav();
    const panelsWrap = this.createPanelsWrap();
    this.nav = this.navActions();
    this.nav.groupChange(this.activePanelIndex);
    const resizeObserver = new window.ResizeObserver(
      ([
        {
          contentRect: { width }
        }
      ]) => {
        if (this.currentWidth !== width) {
          this.toggleTabbedLayout();
          this.currentWidth = width;
          this.nav.setTranslateX(this.activePanelIndex, false);
        }
      }
    );
    const observeTimeout = window.setTimeout(() => {
      resizeObserver.observe(panelsWrap);
      window.clearTimeout(observeTimeout);
    }, ANIMATION_SPEED_SLOW);
  }
  getPanelDisplay() {
    const column = this.panelsWrap;
    const width = Number.parseInt(dom.getStyle(column, "width"), 10);
    const autoDisplayType = width > 390 ? "tabbed" : "slider";
    const isAuto = this.opts.displayType === "auto";
    this.panelDisplay = isAuto ? autoDisplayType : this.opts.displayType || defaults$2.displayType;
    return this.panelDisplay;
  }
  toggleTabbedLayout = () => {
    this.getPanelDisplay();
    const isTabbed = this.isTabbed;
    this.panelsWrap.parentElement?.classList.toggle("tabbed-panels", isTabbed);
    if (isTabbed) {
      this.panelNav.removeAttribute("style");
    }
    return isTabbed;
  };
  /**
   * Resize the panel after its contents change in height
   * @return {String} panel's height in pixels
   */
  resizePanels = () => {
    this.toggleTabbedLayout();
  };
  /**
   * Wrap a panel and make properties sortable
   * if the panel belongs to a field
   * @return {Object} DOM element
   */
  createPanelsWrap() {
    const panelsWrap = dom.create({
      className: "panels",
      content: this.opts.panels.map(({ config: _config, ...panel }) => panel)
    });
    if (this.opts.type === "field") {
      this.sortableProperties(panelsWrap);
    }
    this.panelsWrap = panelsWrap;
    this.panels = panelsWrap.children;
    this.currentPanel = this.panels[this.activePanelIndex];
    return panelsWrap;
  }
  /**
   * Sortable panel properties
   * @param  {Array} panels
   * @return {Array} panel groups
   */
  sortableProperties(panels) {
    const groups = panels.getElementsByClassName("field-edit-group");
    return helpers.forEach(groups, (group) => {
      group.fieldId = this.opts.id;
      if (group.isSortable) {
        Sortable.create(group, {
          animation: 150,
          group: {
            name: `edit-${group.editGroup}`,
            pull: true,
            put: ["properties"]
          },
          sort: true,
          handle: ".prop-order",
          onSort: (evt) => {
            this.propertySave(evt.to);
            this.resizePanels();
          }
        });
      }
    });
  }
  createPanelNavLabels() {
    const labels = this.opts.panels.map((panel) => ({
      tag: "h5",
      action: {
        click: (evt) => {
          const index2 = indexOfNode(evt.target);
          this.nav.setTranslateX(index2, false);
          this.nav.groupChange(index2);
        }
      },
      content: panel.config.label
    }));
    const panelLabels = {
      className: "panel-labels",
      content: {
        content: labels
      }
    };
    const [firstLabel] = labels;
    firstLabel.className = "active-tab";
    return dom.create(panelLabels);
  }
  /**
   * Panel navigation, tabs and arrow buttons for slider
   * @return {Object} DOM object for panel navigation wrapper
   */
  createPanelNav() {
    this.labels = this.createPanelNavLabels();
    const next = {
      tag: "button",
      attrs: {
        className: "next-group",
        title: mi18n.get("controlGroups.nextGroup"),
        type: "button"
      },
      dataset: {
        toggle: "tooltip",
        placement: "top"
      },
      action: {
        click: (e2) => this.nav.nextGroup(e2)
      },
      content: dom.icon("triangle-right")
    };
    const prev = {
      tag: "button",
      attrs: {
        className: "prev-group",
        title: mi18n.get("controlGroups.prevGroup"),
        type: "button"
      },
      dataset: {
        toggle: "tooltip",
        placement: "top"
      },
      action: {
        click: (e2) => this.nav.prevGroup(e2)
      },
      content: dom.icon("triangle-left")
    };
    return dom.create({
      tag: "nav",
      attrs: {
        className: "panel-nav"
      },
      content: [prev, this.labels, next]
    });
  }
  get isTabbed() {
    return this.panelDisplay === "tabbed";
  }
  /**
   * Handlers for navigating between panel groups
   * @todo refactor to use requestAnimationFrame instead of css transitions
   * @return {Object} actions that control panel groups
   */
  navActions() {
    const action = {};
    const groupParent = this.currentPanel.parentElement;
    const labelWrap = this.labels.firstChild;
    const panelTabs = labelWrap.children;
    const siblingGroups = this.currentPanel.parentElement.childNodes;
    this.activePanelIndex = indexOfNode(this.currentPanel);
    let offset = { nav: 0, panel: 0 };
    let lastOffset = { ...offset };
    action.groupChange = (newIndex2) => {
      this.activePanelIndex = newIndex2;
      this.currentPanel = siblingGroups[newIndex2];
      dom.removeClasses(siblingGroups, "active-panel");
      dom.removeClasses(panelTabs, "active-tab");
      this.currentPanel.classList.add("active-panel");
      panelTabs[newIndex2].classList.add("active-tab");
      return this.currentPanel;
    };
    const getOffset = (index2) => {
      return {
        nav: -labelWrap.offsetWidth * index2,
        panel: -groupParent.offsetWidth * index2
      };
    };
    const translateX = ({ offset: offset2, reset, duration = ANIMATION_SPEED_FAST, animate: animate2 = !this.isTabbed }) => {
      const panelQueue = [getTransition(lastOffset.panel), getTransition(offset2.panel)];
      const navQueue = [getTransition(lastOffset.nav), getTransition(this.isTabbed ? 0 : offset2.nav)];
      if (reset) {
        const [panelStart] = panelQueue;
        const [navStart] = navQueue;
        panelQueue.push(panelStart);
        navQueue.push(navStart);
      }
      const animationOptions = {
        easing: "ease-in-out",
        duration: animate2 ? duration : 0,
        fill: "forwards"
      };
      const panelTransition = groupParent.animate(panelQueue, animationOptions);
      labelWrap.animate(navQueue, animationOptions);
      const handleFinish = () => {
        panelTransition.removeEventListener("finish", handleFinish);
        if (!reset) {
          lastOffset = offset2;
        }
      };
      panelTransition.addEventListener("finish", handleFinish);
    };
    action.setTranslateX = (panelIndex = this.activePanelIndex, animate2 = true) => {
      offset = getOffset(panelIndex);
      translateX({ offset, animate: animate2 });
    };
    action.refresh = (newIndex2 = this.activePanelIndex) => {
      if (this.activePanelIndex !== newIndex2) {
        action.groupChange(newIndex2);
      }
      action.setTranslateX(this.activePanelIndex, false);
      this.resizePanels();
    };
    action.nextGroup = () => {
      const newIndex2 = this.activePanelIndex + 1;
      if (newIndex2 !== siblingGroups.length) {
        const nextPanel = siblingGroups[newIndex2];
        offset = {
          nav: -labelWrap.offsetWidth * newIndex2,
          panel: -nextPanel.offsetLeft
        };
        translateX({ offset });
        action.groupChange(newIndex2);
      } else {
        offset = {
          nav: lastOffset.nav - 8,
          panel: lastOffset.panel - 8
        };
        translateX({ offset, reset: true });
      }
      return this.currentPanel;
    };
    action.prevGroup = () => {
      if (this.activePanelIndex !== 0) {
        const newIndex2 = this.activePanelIndex - 1;
        const prevPanel = siblingGroups[newIndex2];
        offset = {
          nav: -labelWrap.offsetWidth * newIndex2,
          panel: -prevPanel.offsetLeft
        };
        translateX({ offset });
        action.groupChange(newIndex2);
      } else {
        offset = {
          nav: 8,
          panel: 8
        };
        translateX({ offset, reset: true });
      }
    };
    return action;
  }
}
let Controls$3 = null;
const propertyOptions = objectFromStringArray(PROPERTY_OPTIONS);
class Component extends Data {
  constructor(name2, dataArg = {}) {
    const data = { ...dataArg, id: dataArg.id || uuid() };
    super(name2, data);
    this.id = data.id;
    this.shortId = this.id.slice(0, this.id.indexOf("-"));
    this.name = name2;
    this.indexName = `${name2}s`;
    this.config = components[`${this.name}s`].config;
    merge(this.config, data.config);
    this.address = `${this.name}s.${this.id}`;
    this.dataPath = `${this.address}.`;
    this.editPanels = /* @__PURE__ */ new Map();
    this.eventListeners = /* @__PURE__ */ new Map();
    this.initEventHandlers();
  }
  /**
   * Initialize event handlers based on config
   */
  initEventHandlers() {
    if (!this.config.events) {
      return;
    }
    Object.entries(this.config.events).forEach(([eventName, handler]) => {
      this.addEventListener(eventName, handler);
    });
  }
  /**
   * Add an event listener to this component
   * @param {string} eventName - Name of the event
   * @param {function} handler - Event handler function
   */
  addEventListener(eventName, handler) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(handler);
  }
  /**
   * Remove an event listener from this component
   * @param {string} eventName - Name of the event
   * @param {function} handler - Event handler function to remove
   */
  removeEventListener(eventName, handler) {
    if (!this.eventListeners?.has(eventName)) {
      return;
    }
    const handlers = this.eventListeners.get(eventName);
    const index2 = handlers.indexOf(handler);
    if (index2 > -1) {
      handlers.splice(index2, 1);
    }
  }
  /**
   * Dispatch a component event to all registered listeners
   * @param {string} eventName - Name of the event to dispatch
   * @param {object} eventData - Data to pass to event handlers
   */
  dispatchComponentEvent(eventName, eventData = {}) {
    const fullEventData = {
      component: this,
      target: this,
      type: eventName,
      timestamp: Date.now(),
      ...eventData
    };
    if (this.eventListeners?.has(eventName)) {
      this.eventListeners.get(eventName).forEach((handler) => {
        try {
          if (typeof handler === "function") {
            handler(fullEventData);
          }
        } catch (error) {
          console.error(`Error in ${eventName} event handler for ${this.name} ${this.id}:`, error);
        }
      });
    }
    return fullEventData;
  }
  /**
   * Override Data.set to dispatch component update events
   */
  set(path, newVal) {
    const oldVal = this.get(path);
    const result = super.set(path, newVal);
    if (oldVal !== newVal && this.dom) {
      this.dispatchComponentEvent("onUpdate", {
        path,
        oldValue: oldVal,
        newValue: newVal
      });
    }
    return result;
  }
  // mutationHandler = mutations =>
  //   mutations.map(mutation => {
  //     @todo pull handler form config see dom.create.onRender for implementation pattern
  //   })
  // observe(container) {
  //   this.observer.disconnect()
  //   this.observer.observe(container, { childList: true })
  // }
  get js() {
    return this.data;
  }
  get json() {
    return this.data;
  }
  remove = (path) => {
    if (path) {
      const delPath = splitAddress(path);
      const delItem = delPath.pop();
      const parent2 = this.get(delPath);
      if (Array.isArray(parent2)) {
        if (isInt(delItem)) {
          parent2.splice(Number(delItem), 1);
        } else {
          this.set(
            delPath,
            parent2.filter((item) => item !== delItem)
          );
        }
      } else {
        delete parent2[delItem];
      }
      return parent2;
    }
    if (this.name === "stage") {
      return null;
    }
    const parent = this.parent;
    const children = this.children;
    this.dispatchComponentEvent("onRemove", {
      path,
      parent,
      children: [...children]
      // copy array since children will be modified
    });
    forEach(children, (child) => child.remove());
    this.dom.parentElement.removeChild(this.dom);
    remove(components.getAddress(`${parent.name}s.${parent.id}.children`), this.id);
    if (!parent.children.length) {
      parent.emptyClass();
    }
    if (parent.name === "row") {
      parent.autoColumnWidths();
    }
    const componentEventMap = {
      row: EVENT_FORMEO_REMOVED_ROW,
      column: EVENT_FORMEO_REMOVED_COLUMN,
      field: EVENT_FORMEO_REMOVED_FIELD
    };
    const removeEvent = componentEventMap[this.name];
    if (removeEvent) {
      events.formeoUpdated(
        {
          componentId: this.id,
          componentType: this.name,
          parent
        },
        removeEvent
      );
    }
    return components[`${this.name}s`].delete(this.id);
  };
  /**
   * Removes element from DOM and data
   * @return  {Object} parent element
   */
  empty() {
    const removed = this.children.map((child) => {
      child.remove();
      return child;
    });
    this.dom.classList.add("empty");
    return removed;
  }
  /**
   * Apply empty class to element if does not have children
   */
  emptyClass = () => this.dom.classList.toggle("empty", !this.children.length);
  /**
   * Move, close, and edit buttons for row, column and field
   * @return {Object} element config object
   */
  getActionButtons() {
    const hoverClassnames = [`hovering-${this.name}`, "hovering"];
    return {
      className: [`${this.name}-actions`, "group-actions"],
      action: {
        mouseenter: () => {
          components.stages.active.dom.classList.add(`active-hover-${this.name}`);
          this.dom.classList.add(...hoverClassnames);
        },
        mouseleave: ({ target }) => {
          this.dom.classList.remove(...hoverClassnames);
          components.stages.active.dom.classList.remove(`active-hover-${this.name}`);
          target.removeAttribute("style");
        }
      },
      children: [
        {
          ...dom.btnTemplate({ content: dom.icon(`handle-${this.name}`) }),
          className: ["component-handle", `${this.name}-handle`]
        },
        {
          className: ["action-btn-wrap", `${this.name}-action-btn-wrap`],
          children: this.buttons
        }
      ]
    };
  }
  getComponentTag = () => {
    return dom.create({
      tag: "span",
      className: ["component-tag", `${this.name}-tag`],
      children: [dom.icon(`handle-${this.name}`), toTitleCase(this.name)].filter(Boolean)
    });
  };
  /**
   * Toggles the edit window
   * @param {Boolean} open whether to open or close the edit window
   */
  toggleEdit(open = !this.isEditing) {
    this.isEditing = open;
    const element = this.dom;
    const editingClassName = "editing";
    const editingComponentClassname = `${editingClassName}-${this.name}`;
    const editWindow = this.dom.querySelector(`.${this.name}-edit`);
    animate.slideToggle(editWindow, ANIMATION_SPEED_BASE, open);
    if (this.name === "field") {
      animate.slideToggle(this.preview, ANIMATION_SPEED_BASE, !open);
      element.parentElement.classList.toggle(`column-${editingComponentClassname}`, open);
    }
    element.classList.toggle(editingClassName, open);
    element.classList.toggle(editingComponentClassname, open);
  }
  get buttons() {
    if (this.actionButtons) {
      return this.actionButtons;
    }
    const buttonConfig = {
      handle: (icon = `handle-${this.name}`) => ({
        ...dom.btnTemplate({ content: dom.icon(icon) }),
        className: ["component-handle"]
      }),
      move: (icon = "move") => {
        return {
          ...dom.btnTemplate({ content: dom.icon(icon) }),
          className: ["item-move"],
          meta: {
            id: "move"
          }
        };
      },
      edit: (icon = "edit") => {
        return {
          ...dom.btnTemplate({ content: dom.icon(icon) }),
          className: ["edit-toggle"],
          meta: {
            id: "edit"
          },
          action: {
            click: () => {
              this.toggleEdit();
            }
          }
        };
      },
      remove: (icon = "remove") => {
        return {
          ...dom.btnTemplate({ content: dom.icon(icon) }),
          className: ["item-remove"],
          meta: {
            id: "remove"
          },
          action: {
            click: () => {
              animate.slideUp(this.dom, ANIMATION_SPEED_BASE, () => {
                if (this.name === "column") {
                  const row = this.parent;
                  row.autoColumnWidths();
                  this.remove();
                } else {
                  this.remove();
                }
              });
            }
          }
        };
      },
      clone: (icon = "copy") => {
        return {
          ...dom.btnTemplate({ content: dom.icon(icon) }),
          className: ["item-clone"],
          meta: {
            id: "clone"
          },
          action: {
            click: () => {
              this.clone(this.parent);
              if (this.name === "column") {
                this.parent.autoColumnWidths();
              }
            }
          }
        };
      }
    };
    const { buttons, disabled } = this.config.actionButtons;
    const activeButtons = buttons.filter((btn) => !disabled.includes(btn));
    const actionButtonsConfigs = activeButtons.map((btn) => buttonConfig[btn]?.() || btn);
    this.actionButtons = actionButtonsConfigs;
    return this.actionButtons;
  }
  /**
   * helper that returns the index of the node minus the offset.
   */
  get index() {
    return indexOfNode(this.dom);
  }
  /**
   * Removes a class or classes from nodeList
   * @param  {String | Array} className
   */
  removeClasses = (className) => {
    const removeClass = {
      string: () => this.dom.classList.remove(className),
      array: () => className.map((name2) => this.dom.classList.remove(name2))
    };
    removeClass.object = removeClass.string;
    return removeClass[dom.childType(className)](this.dom);
  };
  get parentType() {
    return PARENT_TYPE_MAP.get(this.name);
  }
  get parent() {
    const parentType = this.parentType;
    if (!this.dom || !parentType) {
      return null;
    }
    const parentDom = this.dom.closest(`.${COMPONENT_TYPE_CLASSNAMES[parentType]}`);
    return parentDom && dom.asComponent(parentDom);
  }
  get children() {
    if (!this.dom) {
      return [];
    }
    const domChildren = this.domChildren;
    const childGroup = CHILD_TYPE_MAP.get(this.name);
    return map(domChildren, (child) => components.getAddress(`${childGroup}s.${child.id}`)).filter(Boolean);
  }
  loadChildren = (children = this.data.children) => children.map((rowId) => this.addChild({ id: rowId }));
  get domChildren() {
    const childWrap = this.dom.querySelector(".children");
    return childWrap ? childWrap.children : [];
  }
  /**
   * Adds a child to the component
   * @param {Object|String} childData
   * @param {Number} index
   * @return {Object} child DOM element
   */
  addChild(childData = {}, index2 = this.domChildren.length) {
    let data = childData;
    if (typeof childData !== "object") {
      data = { id: data };
    }
    const childWrap = this.dom.querySelector(".children");
    const { id: childId = uuid() } = data;
    const childGroup = CHILD_TYPE_MAP.get(this.name);
    if (!childGroup) {
      return null;
    }
    const childComponentType = `${childGroup}s`;
    const child = components.getAddress(`${childComponentType}.${childId}`) || components[childComponentType].add(childId, data);
    if (index2 >= childWrap.children.length) {
      childWrap.appendChild(child.dom);
    } else {
      childWrap.children[index2].before(child.dom);
    }
    this.dispatchComponentEvent("onAddChild", {
      parent: this,
      target: child,
      child,
      index: index2
    });
    child.dispatchComponentEvent("onAdd", {
      parent: this,
      target: child,
      index: index2,
      addedVia: "addChild"
      // indicate how the component was added
    });
    this.config.events?.onAddChild?.({ parent: this, child });
    const grandChildren = child.get("children");
    if (grandChildren?.length) {
      child.loadChildren(grandChildren);
    }
    this.removeClasses("empty");
    this.saveChildOrder();
    return child;
  }
  /**
   * Updates the children order for the current component
   */
  saveChildOrder = () => {
    if (this.render) {
      return;
    }
    const newChildOrder = this.children.map(({ id }) => id);
    this.set("children", newChildOrder);
    return newChildOrder;
  };
  /**
   * Method for handling onAdd for all components
   * @todo improve readability of this method
   * @param  {Object} evt
   * @return {Object} Component
   */
  onAdd({ from, to, item, newIndex: newIndex2 }) {
    if (!from.classList.contains(CONTROL_GROUP_CLASSNAME)) {
      from = from.parentElement;
    }
    const fromType = componentType(from);
    const toType = componentType(to.parentElement);
    const defaultOnAdd = () => {
      this.saveChildOrder();
      this.removeClasses("empty");
    };
    const depthMap = /* @__PURE__ */ new Map([
      [
        -2,
        () => {
          const newChild = this.addChild({}, newIndex2).addChild();
          return newChild.addChild.bind(newChild);
        }
      ],
      [
        -1,
        () => {
          const newChild = this.addChild({}, newIndex2);
          return newChild.addChild.bind(newChild);
        }
      ],
      [0, () => this.addChild.bind(this)],
      [
        1,
        (controlData) => {
          const currentIndex = indexOfNode(this.dom);
          return () => this.parent.addChild(controlData, currentIndex + 1);
        }
      ],
      [2, (controlData) => () => this.parent.parent.addChild(controlData)]
    ]);
    const onAddConditions = {
      controls: async () => {
        if (!Controls$3) {
          const { default: ControlsData } = await Promise.resolve().then(() => index$7);
          Controls$3 = ControlsData;
        }
        const {
          controlData: {
            meta: { id: metaId },
            ...elementData
          }
        } = Controls$3.get(item.id);
        set(elementData, "config.controlId", metaId);
        const controlType = metaId.startsWith("layout-") ? metaId.replace(/^layout-/, "") : "field";
        const targets = {
          stage: {
            row: 0,
            column: -1,
            field: -2
          },
          row: {
            row: 1,
            column: 0,
            field: -1
          },
          column: {
            row: 2,
            column: 1,
            field: 0
          },
          field: 1
        };
        const depth = get(targets, `${this.name}.${controlType}`);
        const action = depthMap.get(depth)();
        dom.remove(item);
        const component2 = action(elementData, newIndex2);
        return component2;
      },
      row: () => {
        const targets = {
          stage: -1,
          row: 0,
          column: 1
        };
        const action = (depthMap.get(targets[toType]) || identity)();
        return action?.({ id: item.id }, newIndex2);
      },
      column: () => {
        const targets = {
          stage: -2,
          row: -1
        };
        const action = (depthMap.get(targets[toType]) || identity)();
        return action?.(item.id);
      }
    };
    const component = onAddConditions[fromType]?.(item, newIndex2);
    this.dispatchComponentEvent("onAdd", {
      from,
      to,
      item,
      newIndex: newIndex2,
      fromType,
      toType,
      addedComponent: component,
      addedVia: "dragDrop"
      // indicate how the component was added
    });
    defaultOnAdd();
    return component;
  }
  /**
   * Save updated child order
   * @return {Array} updated child order
   */
  onSort = () => {
    return this.saveChildOrder();
  };
  /**
   * Handler for removing content from a sortable component
   * @param  {Object} evt
   * @return {Array} updated child order
   */
  onRemove({ from: { parentElement: from } }) {
    if (from.classList.contains(COLUMN_CLASSNAME)) {
      from.classList.remove("column-editing-field");
    }
    if (this.name !== "stage" && !this.children.length) {
      return this.remove();
    }
    this.emptyClass();
    return this.saveChildOrder();
  }
  /**
   * Callback for when dragging ends
   * @param  {Object} evt
   */
  onEnd = ({ to: { parentElement: to }, from: { parentElement: from } }) => {
    to?.classList.remove(`hovering-${componentType(to)}`);
    from?.classList.remove(`hovering-${componentType(from)}`);
  };
  /**
   * Callback for onRender, executes any defined onRender for component
   */
  onRender() {
    this.dispatchComponentEvent("onRender", {
      dom: this.dom
    });
    const { events: events2 } = this.config;
    if (!events2) {
      return null;
    }
    events2.onRender && dom.onRender(this.dom, events2.onRender);
  }
  /**
   * Sets the configuration for the component. See src/demo/js/options/config.js for example
   * @param {Object} config - Configuration object with possible structures:
   * @param {Object} [config.all] - Global configuration applied to all components
   * @param {Object} [config[controlId]] - Configuration specific to a control type
   * @param {Object} [config[id]] - Configuration specific to a component instance
   * @description Merges configurations in order of precedence:
   * 1. Existing config (this.configVal)
   * 2. Global config (all)
   * 3. Control type specific config
   * 4. Instance specific config
   * The merged result is stored in this.configVal
   */
  set config(config) {
    const allConfig = get(config, "all");
    const controlId = get(this.data, "config.controlId");
    const typeConfig = controlId && get(config, controlId);
    const idConfig = get(config, this.id);
    const mergedConfig = [allConfig, typeConfig, idConfig].reduce(
      (acc, cur) => cur ? merge(acc, cur) : acc,
      this.configVal
    );
    this.configVal = mergedConfig;
  }
  get config() {
    return this.configVal;
  }
  // @todo remove, but first verify no longer needed
  runConditions = () => {
    const conditionsList = this.get("conditions");
    if (!conditionsList?.length) {
      return null;
    }
    const processedConditions = conditionsList.map((conditions) => {
      const ifCondition = this.processConditions(conditions.if);
      const thenResult = this.processResults(conditions.then);
      return ifCondition.map((conditions2) => {
        return this.evaluateConditions(conditions2) && this.execResults(thenResult);
      });
    });
    return processedConditions;
  };
  getComponent(path) {
    const [type, id] = path.split(".");
    const group = components[type];
    return id === this.id ? this : group?.get(id);
  }
  value = (path, val) => {
    const splitPath = path.split(".");
    const component = this.getComponent(path);
    const property = component && splitPath.slice(2, splitPath.length).join(".");
    if ([!component, !property, !propertyOptions[property]].some(Boolean)) {
      return path;
    }
    return val ? component.set(propertyOptions[property], val) : component.get(propertyOptions[property]);
  };
  /**
   * Maps operators to their respective handler
   * @param {String} operator
   * @return {Function} action
   */
  getResult = (operator) => {
    const operatorMap = {
      "=": (target, propertyPath, value) => target.set(propertyPath, value)
    };
    return operatorMap[operator];
  };
  processResults = (results) => {
    return results.map(({ operator, target, value }) => {
      const targetComponent = this.getComponent(target);
      const propertyPath = targetComponent && target.split(".").slice(2, target.length).join(".");
      const processedResult = {
        target: targetComponent,
        propertyPath,
        action: this.getResult(operator),
        value: this.value(value)
      };
      return processedResult;
    });
  };
  execResults = (results) => {
    const promises = results.map((result) => {
      return this.execResult(result);
    });
    return Promise.all(promises);
  };
  execResult = ({ target, action, value, _propertyPath }) => {
    return new Promise((resolve, reject) => {
      try {
        return resolve(action(target, value));
      } catch (err) {
        return reject(err);
      }
    });
  };
  cloneData = () => {
    const clonedData = { ...clone$1(this.data), id: uuid() };
    if (this.name !== "field") {
      clonedData.children = [];
    }
    return clonedData;
  };
  clone = (parent = this.parent) => {
    const newClone = parent.addChild(this.cloneData(), this.index + 1);
    if (this.name !== "field") {
      this.cloneChildren(newClone);
    }
    this.dispatchComponentEvent("onClone", {
      original: this,
      clone: newClone,
      parent
    });
    return newClone;
  };
  cloneChildren(toParent) {
    for (const child of this.children) {
      child?.clone(toParent);
    }
  }
  createChildWrap = (children) => dom.create({
    tag: "ul",
    attrs: {
      className: "children"
    },
    children
  });
  get isRow() {
    return this.name === COMPONENT_TYPE_MAP.row;
  }
  get isColumn() {
    return this.name === COMPONENT_TYPE_MAP.column;
  }
  get isField() {
    return this.name === COMPONENT_TYPE_MAP.field;
  }
  /**
   * Checks if attribute is allowed to be edited
   * @param  {String}  propName
   * @return {Boolean}
   */
  isDisabledProp = (propName, kind = "attrs") => {
    const propKind = this.config.panels[kind];
    if (!propKind) {
      return false;
    }
    const disabledAttrs = propKind.disabled.concat(this.get("config.disabled"));
    return disabledAttrs.includes(propName);
  };
  /**
   * Checks if property can be removed
   * @param  {String}  propName
   * @return {Boolean}
   */
  isLockedProp = (propName, kind = "attrs") => {
    const propKind = this.config.panels[kind];
    if (!propKind) {
      return false;
    }
    const lockedAttrs = propKind.locked.concat(this.get("config.locked"));
    return lockedAttrs.includes(propName);
  };
  /**
   * Generate the markup for field edit mode
   * @return {Object} fieldEdit element config
   */
  get editWindow() {
    const editWindow = {
      className: ["component-edit", `${this.name}-edit`, "slide-toggle", "formeo-panels-wrap"]
    };
    const editPanelLength = this.editPanels.size;
    if (editPanelLength) {
      editWindow.className.push(`panel-count-${editPanelLength}`);
      editWindow.content = [this.panels.panelNav, this.panels.panelsWrap];
      this.panelNav = this.panels.nav;
      this.resizePanelWrap = this.panels.nav.refresh;
    }
    editWindow.action = {
      onRender: () => {
        if (editPanelLength === 0) {
          const editToggle = this.dom.querySelector(".edit-toggle");
          const fieldActions = this.dom.querySelector(`.${this.name}-actions`);
          const actionButtons = fieldActions.getElementsByTagName("button");
          fieldActions.style.maxWidth = `${actionButtons.length * actionButtons[0].clientWidth}px`;
          dom.remove(editToggle);
        } else {
          this.resizePanelWrap();
        }
      }
    };
    return dom.create(editWindow);
  }
  updateEditPanels = () => {
    if (!this.config) {
      return null;
    }
    const editable = ["object", "array"];
    const panelOrder = unique([...this.config.panels.order, ...Object.keys(this.data)]);
    const noPanels = ["children", "config", "meta", "action", "events", ...this.config.panels.disabled];
    const allowedPanels = panelOrder.filter((panelName) => !noPanels.includes(panelName));
    for (const panelName of allowedPanels) {
      const panelData = this.get(panelName);
      const propType = dom.childType(panelData);
      if (editable.includes(propType)) {
        const editPanel = new EditPanel(panelData, panelName, this);
        this.editPanels.set(editPanel.name, editPanel);
      }
    }
    const panelsData = {
      panels: Array.from(this.editPanels.values()).map(({ panelConfig }) => panelConfig),
      id: this.id,
      displayType: "auto"
    };
    this.panels = new Panels(panelsData);
    if (this.dom) {
      this.dom.querySelector(".panel-nav").replaceWith(this.panels.panelNav);
      this.dom.querySelector(".panels").replaceWith(this.panels.panelsWrap);
    }
  };
}
class ResizeColumn {
  /**
   * Binds the event handlers to the instance.
   */
  constructor() {
    this.onMove = this.onMove.bind(this);
    this.onStop = this.onStop.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }
  /**
   * Calculates the total width of a row excluding the gaps between columns.
   * @param {HTMLElement} row - The row element.
   * @returns {number} - The total width of the row.
   */
  getRowWidth(row) {
    const rowChildren = row.querySelector(".children");
    if (!rowChildren) return 0;
    const numberOfColumns = rowChildren.children.length;
    const gapSize = dom.getStyle(rowChildren, "gap") || "0px";
    const gapPixels = parseFloat(gapSize, 10) || 0;
    this.totalGapWidth = gapPixels * (numberOfColumns - 1);
    return rowChildren.offsetWidth - this.totalGapWidth;
  }
  /**
   * Validates if the resize target columns are valid.
   * @param {HTMLElement} column - The column being resized.
   * @param {HTMLElement} sibling - The sibling column.
   * @returns {boolean} - True if both columns are valid, false otherwise.
   */
  validateResizeTarget(column, sibling) {
    return column && sibling && column.offsetWidth && sibling.offsetWidth;
  }
  /**
   * Handles the start of the resize event.
   * @param {Event} evt - The event object.
   */
  onStart(evt) {
    evt.preventDefault();
    this.resized = false;
    if (evt.button !== 0) return;
    const column = evt.target.parentElement;
    const sibling = column.nextSibling || column.previousSibling;
    const row = column.closest(`.${ROW_CLASSNAME}`);
    if (!this.validateResizeTarget(column, sibling)) {
      console.warn("Invalid resize targets");
      this.cleanup();
      return;
    }
    this.startX = evt.type === "touchstart" ? evt.touches[0].clientX : evt.clientX;
    row.classList.add(COLUMN_RESIZE_CLASSNAME);
    this.columnPreset = row.querySelector(`.${COLUMN_PRESET_CLASSNAME}`);
    this.originalColumnClass = column.className;
    this.originalSiblingClass = sibling.className;
    column.className = column.className.replace(bsColRegExp, "");
    sibling.className = sibling.className.replace(bsColRegExp, "");
    this.colStartWidth = column.offsetWidth;
    this.sibStartWidth = sibling.offsetWidth;
    this.rowWidth = this.getRowWidth(row);
    if (this.rowWidth <= 0) {
      console.warn("Invalid row width calculated");
      this.cleanup();
      return;
    }
    this.column = column;
    this.sibling = sibling;
    this.row = row;
    try {
      window.addEventListener("pointermove", this.onMove, false);
      window.addEventListener("pointerup", this.onStop, false);
    } catch (error) {
      console.error("Failed to initialize resize listeners:", error);
      this.cleanup();
    }
  }
  /**
   * Calculates the new widths for the columns based on the mouse position.
   * @param {number} clientX - The current X position of the mouse.
   * @returns {Object|null} - The new widths for the columns or null if invalid.
   */
  calculateNewWidths(clientX) {
    const newColWidth = this.colStartWidth + clientX - this.startX;
    const newSibWidth = this.sibStartWidth - clientX + this.startX;
    const colWidthPercent = parseFloat(percent(newColWidth, this.rowWidth));
    const sibWidthPercent = parseFloat(percent(newSibWidth, this.rowWidth));
    if (colWidthPercent < 10 || sibWidthPercent < 10) {
      return null;
    }
    return {
      colWidth: numToPercent(colWidthPercent.toFixed(1)),
      siblingColWidth: numToPercent(sibWidthPercent.toFixed(1))
    };
  }
  /**
   * Handles the movement during the resize event.
   * @param {Event} evt - The event object.
   */
  onMove(evt) {
    evt.preventDefault();
    const { column, sibling } = this;
    const clientX = evt.type === "touchmove" ? evt.touches[0].clientX : evt.clientX;
    const newWidths = this.calculateNewWidths(clientX);
    if (!newWidths) return;
    const { colWidth, siblingColWidth } = newWidths;
    column.dataset.colWidth = colWidth;
    sibling.dataset.colWidth = siblingColWidth;
    column.style.width = colWidth;
    sibling.style.width = siblingColWidth;
    this.resized = true;
  }
  onStop() {
    const { column, sibling } = this;
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onStop);
    if (!this.resized) {
      return;
    }
    this.setCustomWidthValue();
    components.setAddress(`columns.${column.id}.config.width`, column.dataset.colWidth);
    components.setAddress(`columns.${sibling.id}.config.width`, sibling.dataset.colWidth);
    this.row.classList.remove(COLUMN_RESIZE_CLASSNAME);
    this.resized = false;
    this.cleanup();
  }
  // Helper method to clean up if resize fails
  cleanup() {
    if (this.column && this.originalColumnClass) {
      this.column.className = this.originalColumnClass;
    }
    if (this.sibling && this.originalSiblingClass) {
      this.sibling.className = this.originalSiblingClass;
    }
    if (this.row) {
      this.row.classList.remove(COLUMN_RESIZE_CLASSNAME);
    }
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onStop);
  }
  /**
   * Adds a custom option from the column width present selecy
   * @param {Node} row
   */
  setCustomWidthValue() {
    const columnPreset = this.columnPreset;
    let customOption = columnPreset.querySelector(`.${CUSTOM_COLUMN_OPTION_CLASSNAME}`);
    const cols = this.row.querySelector(".children").children;
    const widths = map(cols, (col) => percent(col.clientWidth, this.rowWidth).toFixed(1));
    const value = widths.join(",");
    const content = widths.join(" | ");
    if (!customOption) {
      customOption = dom.create({
        tag: "option",
        attrs: {
          className: CUSTOM_COLUMN_OPTION_CLASSNAME,
          value,
          selected: true
        },
        content
      });
      columnPreset.append(customOption);
    }
    customOption.value = value;
    customOption.textContent = content;
    return value;
  }
}
const DEFAULT_DATA$3 = () => Object.freeze({
  config: {
    width: "100%"
  },
  children: [],
  className: [COLUMN_CLASSNAME]
});
const DOM_CONFIGS = {
  resizeHandle: (columnRisizer) => ({
    className: "resize-x-handle",
    action: {
      pointerdown: columnRisizer.onStart.bind(columnRisizer)
    },
    content: [dom.icon("triangle-down"), dom.icon("triangle-up")]
  }),
  editWindow: () => ({
    className: "column-edit group-config"
  })
};
class Column extends Component {
  /**
   * Set defaults and/or load existing columns
   * @param  {Object} columnData
   * @return {Object} Column config object
   */
  constructor(columnData) {
    super("column", { ...DEFAULT_DATA$3(), ...columnData });
    const childWrap = this.createChildWrap();
    this.dom = dom.create({
      tag: "li",
      className: [COLUMN_CLASSNAME, "empty"],
      dataset: {
        hoverTag: mi18n.get("column")
      },
      id: this.id,
      content: [
        this.getComponentTag(),
        this.getActionButtons(),
        DOM_CONFIGS.editWindow(),
        DOM_CONFIGS.resizeHandle(new ResizeColumn()),
        childWrap
      ]
    });
    this.processConfig();
    events.columnResized = new window.CustomEvent("columnResized", {
      detail: {
        column: this.dom,
        instance: this
      }
    });
    Sortable.create(childWrap, {
      animation: 150,
      fallbackClass: "field-moving",
      forceFallback: true,
      group: {
        name: "column",
        pull: true,
        put: ["column", "controls"]
      },
      sort: true,
      disabled: false,
      onEnd: this.onEnd.bind(this),
      onAdd: this.onAdd.bind(this),
      onSort: this.onSort.bind(this),
      onRemove: this.onRemove.bind(this),
      // Attempt to drag a filtered element
      onMove: (evt) => {
        if (evt.from !== evt.to) {
          evt.from.classList.remove("hovering-column");
        }
      },
      draggable: `.${FIELD_CLASSNAME}`,
      handle: ".item-move"
    });
  }
  /**
   * Process column configuration data
   * @param  {Object} column
   */
  processConfig() {
    const columnWidth = helpers.get(this.data, "config.width");
    if (columnWidth) {
      this.setDomWidth(columnWidth);
    }
  }
  // loops through children and refresh their edit panels
  refreshFieldPanels = () => {
    for (const field2 of this.children) {
      field2.panels.nav.refresh();
    }
  };
  /**
   * Sets the width data and style for the column
   * @param {string} width - The width value to be set for the column
   * @returns {void}
   */
  setDomWidth = (width) => {
    this.dom.dataset.colWidth = width;
    this.dom.style.width = width;
  };
  /**
   * Sets a columns width
   * @param {String} width percent or pixel
   */
  setWidth = (width) => {
    this.setDomWidth(width);
    return this.set("config.width", width);
  };
}
const DEFAULT_CONFIG$3 = {
  actionButtons: {
    buttons: ["clone", "move", "remove"],
    disabled: []
  }
};
let Columns$1 = class Columns extends ComponentData {
  constructor(columnData) {
    super("columns", columnData);
    this.config = { all: DEFAULT_CONFIG$3 };
  }
  Component(data) {
    return new Column(data);
  }
};
const columns = new Columns$1();
const DEFAULT_DATA$2 = () => Object.freeze({
  config: {
    fieldset: false,
    // wrap contents of row in fieldset
    legend: "",
    // Legend for fieldset
    inputGroup: false
    // is repeatable input-group?
  },
  children: [],
  className: [ROW_CLASSNAME]
});
class Row extends Component {
  /**
   * Set default and generate dom for row in editor
   * @param  {String} dataID
   * @return {Object}
   */
  constructor(rowData) {
    super("row", { ...DEFAULT_DATA$2(), ...rowData });
    const children = this.createChildWrap();
    this.dom = dom.create({
      tag: "li",
      className: [ROW_CLASSNAME, "empty"],
      dataset: {
        hoverTag: mi18n.get("row"),
        editingHoverTag: mi18n.get("editing.row")
      },
      id: this.id,
      content: [this.getComponentTag(), this.getActionButtons(), this.editWindow, children]
    });
    Sortable.create(children, {
      animation: 150,
      fallbackClass: "column-moving",
      forceFallback: true,
      group: {
        name: "row",
        pull: true,
        put: ["row", "column", "controls"]
      },
      sort: true,
      disabled: false,
      onRemove: this.onRemove.bind(this),
      onEnd: this.onEnd.bind(this),
      onAdd: this.onAdd.bind(this),
      onSort: this.onSort.bind(this),
      // filter: '.resize-x-handle', // use filter for frozen columns
      draggable: `.${COLUMN_CLASSNAME}`,
      handle: ".item-move"
    });
  }
  /**
   * Edit window for Row
   * @return {Object} edit window dom config for Row
   */
  get editWindow() {
    const fieldsetInput = {
      tag: "input",
      id: `${this.id}-fieldset`,
      attrs: {
        type: "checkbox",
        checked: this.get("config.fieldset"),
        ariaLabel: mi18n.get("row.settings.fieldsetWrap.aria")
      },
      action: {
        click: ({ target: { checked } }) => {
          this.set("config.fieldset", Boolean(checked));
        }
      },
      config: {
        label: mi18n.get("row.settings.fieldsetWrap")
      }
    };
    const inputGroupInput = {
      tag: "input",
      id: `${this.id}-inputGroup`,
      attrs: {
        type: "checkbox",
        checked: this.get("config.inputGroup"),
        ariaLabel: mi18n.get("row.settings.inputGroup.aria")
      },
      action: {
        click: ({ target: { checked } }) => this.set("config.inputGroup", checked)
      },
      config: {
        label: mi18n.get("row.makeInputGroup"),
        description: mi18n.get("row.makeInputGroupDesc")
      }
    };
    const rowTitleTooltip = {
      tag: "span",
      content: " ⓘ",
      dataset: {
        tooltip: "Row title will be used as the legend for the fieldset"
      }
    };
    const legendInput = {
      tag: "input",
      attrs: {
        type: "text",
        ariaLabel: "Legend for fieldset",
        value: this.get("config.legend"),
        placeholder: "Title"
      },
      config: {
        label: {
          children: ["Row Title", rowTitleTooltip]
        }
      },
      action: {
        input: ({ target: { value } }) => this.set("config.legend", value)
      },
      className: ""
    };
    const fieldsetInputGroup = {
      className: "input-group",
      content: legendInput
    };
    const fieldSetControls = dom.formGroup([fieldsetInput, fieldsetInputGroup]);
    const columnSettingsPresetLabel = {
      tag: "label",
      content: mi18n.get("defineColumnWidths"),
      className: "col-sm-4 form-control-label"
    };
    this.columnPresetControl = dom.create(this.columnPresetControlConfig);
    const columnSettingsPresetSelect = {
      className: "col-sm-8",
      content: this.columnPresetControl,
      action: {
        onRender: () => {
          this.updateColumnPreset();
        }
      }
    };
    const columnSettingsPreset = dom.formGroup([columnSettingsPresetLabel, columnSettingsPresetSelect], "row");
    const editWindowContents = [inputGroupInput, "hr", fieldSetControls, "hr", columnSettingsPreset];
    const editWindow = dom.create({
      className: `${this.name}-edit group-config`,
      action: {
        onRender: (editWindow2) => {
          const elements = editWindowContents.map((elem) => dom.create(elem));
          editWindow2.append(...elements);
        }
      }
    });
    return editWindow;
  }
  onAdd(...args) {
    super.onAdd(...args);
    this.autoColumnWidths();
  }
  onRemove(...args) {
    super.onRemove(...args);
    this.autoColumnWidths();
  }
  /**
   * Read columns and generate bootstrap cols
   * @param {Object} row DOM element
   */
  autoColumnWidths = () => {
    const columns2 = this.children;
    if (!columns2.length) {
      return;
    }
    const width = Number.parseFloat((100 / columns2.length).toFixed(1)) / 1;
    for (const column of columns2) {
      column.removeClasses(bsColRegExp);
      const colDom = column.dom;
      const newColWidth = numToPercent(width);
      column.set("config.width", newColWidth);
      colDom.style.width = newColWidth;
      colDom.dataset.colWidth = newColWidth;
      const refreshTimeout = setTimeout(() => {
        clearTimeout(refreshTimeout);
        column.refreshFieldPanels();
      }, ANIMATION_SPEED_FAST);
      document.dispatchEvent(events.columnResized);
    }
    this.updateColumnPreset();
  };
  /**
   * Updates the column preset <select>
   * @return {Object} columnPresetConfig
   */
  updateColumnPreset = () => {
    this.columnPresetControl.innerHTML = "";
    const presetOptions = this.getColumnPresetOptions.map(
      ({ label, ...attrs }) => dom.create({
        tag: "option",
        content: label,
        attrs
      })
    );
    this.columnPresetControl.append(...presetOptions);
  };
  /**
   * Set the widths of columns in a row
   * @param {Object} row DOM element
   * @param {String} widths
   */
  setColumnWidths = (widths) => {
    if (typeof widths === "string") {
      widths = widths.split(",");
    }
    this.children.forEach((column, i2) => {
      column.setWidth(`${widths[i2]}%`);
      column.refreshFieldPanels();
    });
  };
  /**
   * Retrieves the preset options for columns based on the current configuration.
   *
   * @returns {Array<Object>} An array of option objects for column presets. Each object contains:
   * - `value` {string}: The comma-separated string of column widths.
   * - `label` {string}: The display label for the option, with widths separated by ' | '.
   * - `className` {string}: The CSS class name for custom column options.
   * - `selected` {boolean} [optional]: Indicates if the option is the current value.
   */
  get getColumnPresetOptions() {
    const columns2 = this.children;
    const pMap = COLUMN_TEMPLATES;
    const pMapVal = pMap.get(columns2.length - 1) || [];
    const curVal = columns2.map((Column2) => {
      const width = Column2.get("config.width") || "";
      return Number(width.replace("%", "")).toFixed(1);
    }).join(",");
    if (pMapVal.length) {
      const options = pMapVal.slice();
      const isCustomVal = !options.find((val) => val.value === curVal);
      if (isCustomVal) {
        options.push({
          value: curVal,
          label: curVal.replace(/,/g, " | "),
          className: CUSTOM_COLUMN_OPTION_CLASSNAME
        });
      }
      return options.map((val) => {
        const option2 = { ...val };
        option2.selected = val.value === curVal;
        return option2;
      });
    }
    return [];
  }
  /**
   * Generates the element config for column layout in row
   * @return {Object} columnPresetControlConfig
   */
  get columnPresetControlConfig() {
    const layoutPreset = {
      tag: "select",
      attrs: {
        ariaLabel: mi18n.get("defineColumnLayout"),
        className: COLUMN_PRESET_CLASSNAME
      },
      action: {
        change: ({ target }) => {
          const { value } = target;
          this.setColumnWidths(value);
        }
      },
      options: this.getColumnPresetOptions
    };
    return layoutPreset;
  }
}
const DEFAULT_CONFIG$2 = {
  actionButtons: {
    buttons: ["move", "edit", "clone", "remove"],
    disabled: []
  }
};
let Rows$1 = class Rows extends ComponentData {
  constructor(rowData) {
    super("rows", rowData);
    this.config = { all: DEFAULT_CONFIG$2 };
  }
  Component(data) {
    return new Row(data);
  }
};
const rows = new Rows$1();
const DEFAULT_DATA$1 = () => ({ conditions: [CONDITION_TEMPLATE()], children: [] });
class Stage extends Component {
  /**
   * Process options and load existing fields from data to the stage
   * @param  {Object} formeoOptions
   * @param  {String} stageData uuid
   * @return {Object} DOM element
   */
  constructor(stageData) {
    super("stage", { ...DEFAULT_DATA$1(), ...stageData });
    this.updateEditPanels();
    this.debouncedUpdateEditPanels = debounce(this.updateEditPanels);
    ({
      children: [
        {
          tag: "input",
          id: "form-title",
          attrs: {
            className: "form-title",
            placeholder: mi18n.get("Untitled Form"),
            value: mi18n.get("Untitled Form"),
            type: "text"
          },
          config: {
            label: mi18n.get("Form Title") || "Stage Title"
          }
        },
        {
          tag: "input",
          id: "form-novalidate",
          attrs: {
            className: "form-novalidate",
            value: false,
            type: "checkbox"
          },
          config: {
            label: mi18n.get("Form novalidate")
          }
        },
        {
          tag: "input",
          id: "form-tags",
          attrs: {
            className: "form-tags",
            type: "text"
          },
          config: {
            label: mi18n.get("Tags")
          }
        }
      ]
    });
    const children = this.createChildWrap();
    this.dom = dom.create({
      attrs: {
        className: [STAGE_CLASSNAME, "empty"],
        id: this.id
      },
      children: [this.getComponentTag(), this.getActionButtons(), this.editWindow, children]
    });
    Sortable.create(children, {
      animation: 150,
      fallbackClass: "row-moving",
      group: {
        name: "stage",
        pull: true,
        put: ["row", "column", "controls"]
      },
      sort: true,
      disabled: false,
      onAdd: this.onAdd.bind(this),
      onRemove: this.onRemove.bind(this),
      onStart: () => {
        stages.active = this;
      },
      onSort: this.onSort.bind(this),
      draggable: `.${ROW_CLASSNAME}`,
      handle: ".item-move"
    });
  }
  empty(isAnimated = true) {
    return new Promise((resolve) => {
      if (isAnimated) {
        this.dom.classList.add("removing-all-fields");
        animate.slideUp(this.dom, ANIMATION_SPEED_BASE, () => {
          resolve(super.empty(isAnimated));
          this.dom.classList.remove("removing-all-fields");
          animate.slideDown(this.dom, ANIMATION_SPEED_BASE);
        });
      } else {
        resolve(super.empty());
      }
    });
  }
  onAdd(...args) {
    const component = super.onAdd(...args);
    if (component?.name === "column") {
      component.parent.autoColumnWidths();
    }
  }
}
const DEFAULT_CONFIG$1 = () => ({
  actionButtons: {
    buttons: ["edit"],
    disabled: []
  },
  panels: {
    disabled: [],
    // The 'order' array specifies the sequence in which the panels should be displayed.
    // Each string in the array represents a panel type, such as 'attrs', 'options', or 'conditions'.
    // By default, these panels are ordered as you see below, but can be override via formeo options.
    order: ["attrs", "options", "conditions"]
  }
});
let Stages$1 = class Stages extends ComponentData {
  constructor(stageData) {
    super("stages", stageData);
    this.config = { all: DEFAULT_CONFIG$1() };
  }
  Component(data) {
    return new Stage(data);
  }
};
const stages = new Stages$1();
class Control {
  controlCache = /* @__PURE__ */ new Set();
  /**
   * Constructs a new Control instance.
   *
   * @param {Object} [config={}] - The configuration object.
   * @param {Object} [config.events={}] - The events associated with the control. ex { click: () => {} }
   * @param {Object} [config.dependencies={}] - The dependencies required by the control. ex { js: 'https://example.com/script.js', css: 'https://example.com/style.css' }
   * @param {...Object} [controlData] - Additional configuration properties. ex { meta: {}, config: { label: 'Control Name' } }
   */
  constructor({ events: events2 = {}, dependencies = {}, controlAction, ...controlData }) {
    this.events = events2;
    this.controlData = controlData;
    this.controlAction = controlAction;
    this.dependencies = dependencies;
    this.id = controlData.id || uuid();
  }
  get controlId() {
    return this.controlData.meta?.id || this.controlData.config?.controlId;
  }
  get dom() {
    const { meta, config } = this.controlData;
    const controlLabel = this.i18n(config.label) || config.label;
    const button = {
      tag: "button",
      attrs: {
        type: "button"
      },
      content: [
        { tag: "span", className: "control-icon", children: dom.icon(meta.icon) },
        { tag: "span", className: "control-label", content: controlLabel }
      ],
      action: {
        // Prevent button from receiving focus on mousedown (which would trigger panel switch)
        // but still allow keyboard focus for accessibility
        mousedown: (evt) => {
          evt.preventDefault();
        },
        // this is used for keyboard navigation. when tabbing through controls it
        // will auto navigated between the groups
        focus: ({ target }) => {
          if (Controls$2.isDragging) {
            return;
          }
          const group = target.closest(`.${CONTROL_GROUP_CLASSNAME}`);
          return group && Controls$2.panels.nav.refresh(indexOfNode(group));
        },
        click: ({ target }) => {
          const controlId = target.closest(".field-control")?.id;
          if (controlId) {
            Controls$2.addElement(controlId);
          }
        }
      }
    };
    return dom.create({
      tag: "li",
      id: this.id,
      className: ["field-control", `${meta.group}-control`, `${meta.id}-control`],
      content: button,
      meta,
      action: this.controlAction
    });
  }
  promise() {
    return fetchDependencies(this.dependencies);
  }
  /**
   * Retrieve a translated string
   * By default looks for translations defined against the class (for plugin controls)
   * Expects {locale1: {type: label}, locale2: {type: label}}, or {default: label}, or {local1: label, local2: label2}
   * @param {String} lookup string to retrieve the label / translated string for
   * @param {Object|Number|String} args - string or key/val pairs for string lookups with variables
   * @return {String} the translated label
   */
  i18n(lookup, args) {
    const locale2 = mi18n.locale;
    const controlTranslations = this.definition?.i18n;
    const localeTranslations = controlTranslations?.[locale2] || {};
    return (localeTranslations[lookup]?.() ?? localeTranslations[lookup]) || mi18n.get(lookup, args);
  }
}
const defaultOptions = Object.freeze({
  sortable: true,
  elementOrder: {},
  groupOrder: [],
  groups: [
    {
      id: "layout",
      label: "controls.groups.layout",
      elementOrder: ["row", "column"]
    },
    {
      id: "common",
      label: "controls.groups.form",
      elementOrder: ["button", "checkbox"]
    },
    {
      id: "html",
      label: "controls.groups.html",
      elementOrder: ["header", "block-text"]
    }
  ],
  disable: {
    groups: [],
    elements: [],
    formActions: []
  },
  elements: [],
  container: null,
  panels: { displayType: "slider" }
});
let Controls$1 = class Controls {
  constructor() {
    this.data = /* @__PURE__ */ new Map();
    this.isDragging = false;
    this.buttonActions = {
      // this is used for keyboard navigation. when tabbing through controls it
      // will auto navigated between the groups
      focus: ({ target }) => {
        if (this.isDragging) {
          return;
        }
        const group = target.closest(`.${CONTROL_GROUP_CLASSNAME}`);
        return group && this.panels.nav.refresh(indexOfNode(group));
      },
      click: ({ target }) => {
        this.addElement(target.parentElement.id);
      }
    };
  }
  /**
   * Methods to be called on initialization
   * @param {Object} controlOptions
   */
  async init(controlOptions, sticky = false) {
    await this.applyOptions(controlOptions);
    this.buildDOM(sticky);
    return this;
  }
  /**
   * Generate control config for UI and bind actions
   * @return {Array} elementControls
   */
  registerControls(elements) {
    this.controls = [];
    return elements.map((Element) => {
      const isControlClass = typeof Element === "function";
      const control = isControlClass ? new Element() : new Control(Element);
      this.add(control);
      this.controls.push(control.dom);
      return control.promise();
    });
  }
  groupLabel = (key) => mi18n.get(key) || key || "";
  /**
   * Group elements into their respective control group
   * @return {Array} allGroups
   */
  groupElements() {
    let groups = this.options.groups.slice();
    let elements = this.controls.slice();
    let allGroups = [];
    const usedElementIds = [];
    groups = orderObjectsBy(groups, this.groupOrder, "id");
    groups = groups.filter((group) => match(group.id, this.options.disable.groups));
    allGroups = groups.map((group) => {
      const groupConfig = {
        tag: "ul",
        attrs: {
          className: [CONTROL_GROUP_CLASSNAME, PANEL_CLASSNAME],
          id: `${group.id}-${CONTROL_GROUP_CLASSNAME}`
        },
        config: {
          label: this.groupLabel(group.label)
        }
      };
      if (this.options.elementOrder[group.id]) {
        const userOrder = this.options.elementOrder[group.id];
        const newOrder = unique(userOrder.concat(group.elementOrder));
        group.elementOrder = newOrder;
      }
      elements = orderObjectsBy(elements, group.elementOrder, "meta.id");
      groupConfig.content = elements.filter((control) => {
        const { controlData: field2 } = this.get(control.id);
        const controlId = field2.meta.id || "";
        const filters = [
          match(controlId, this.options.disable.elements),
          field2.meta.group === group.id,
          !usedElementIds.includes(controlId)
        ];
        let shouldFilter = true;
        shouldFilter = filters.every((val) => val === true);
        if (shouldFilter) {
          usedElementIds.push(controlId);
        }
        return shouldFilter;
      });
      return groupConfig;
    });
    return allGroups;
  }
  add(control = /* @__PURE__ */ Object.create(null)) {
    const controlConfig = clone$1(control);
    this.data.set(controlConfig.id, controlConfig);
    if (controlConfig.controlData.meta.id) {
      this.data.set(controlConfig.controlData.meta.id, controlConfig.controlData);
    }
    return controlConfig;
  }
  get(controlId) {
    return clone$1(this.data.get(controlId));
  }
  /**
   * Generate the DOM config for form actions like settings, save and clear
   * @return {Object} form action buttons config
   */
  formActions() {
    if (this.options.disable.formActions === true) {
      return null;
    }
    const clearBtn = {
      ...dom.btnTemplate({ content: [dom.icon("bin"), mi18n.get("clear")], title: mi18n.get("clearAll") }),
      className: ["clear-form"],
      action: {
        click: (evt) => {
          if (rows.size) {
            events.confirmClearAll = new window.CustomEvent("confirmClearAll", {
              detail: {
                confirmationMessage: mi18n.get("confirmClearAll"),
                clearAllAction: () => {
                  stages.clearAll().then(() => {
                    const evtData = {
                      src: evt.target
                    };
                    events.formeoCleared(evtData);
                  });
                },
                btnCoords: dom.coords(evt.target)
              }
            });
            document.dispatchEvent(events.confirmClearAll);
          } else {
            window.alert(mi18n.get("cannotClearFields"));
          }
        }
      }
    };
    const saveBtn = {
      ...dom.btnTemplate({ content: [dom.icon("floppy-disk"), mi18n.get("save")], title: mi18n.get("save") }),
      className: ["save-form"],
      action: {
        click: async ({ target }) => {
          const { default: Components2 } = await Promise.resolve().then(() => index$6);
          const { formData } = Components2;
          const saveEvt = {
            action: () => {
            },
            coords: dom.coords(target),
            message: "",
            button: target
          };
          actions.click.btn(saveEvt);
          return actions.save.form(formData);
        }
      }
    };
    const formActions = {
      className: "form-actions f-btn-group",
      content: Object.entries({ clearBtn, saveBtn }).reduce((acc, [key, value]) => {
        if (!this.options.disable.formActions.includes(key)) {
          acc.push(value);
        }
        return acc;
      }, [])
    };
    return formActions;
  }
  /**
   * Returns the markup for the form controls/fields
   * @return {DOM}
   */
  buildDOM(sticky) {
    const groupedFields = this.groupElements();
    const formActions = this.formActions();
    const { displayType } = this.options.panels;
    this.panels = new Panels({ panels: groupedFields, type: "controls", displayType });
    const groupsWrapClasses = ["control-groups", "formeo-panels-wrap", `panel-count-${groupedFields.length}`];
    const groupsWrap = dom.create({
      className: groupsWrapClasses,
      content: [this.panels.panelNav, this.panels.panelsWrap]
    });
    const controlClasses = ["formeo-controls"];
    if (sticky) {
      controlClasses.push("formeo-sticky");
    }
    const element = dom.create({
      className: controlClasses,
      content: [groupsWrap, formActions]
    });
    const groups = element.getElementsByClassName("control-group");
    this.dom = element;
    this.groups = groups;
    const [firstGroup] = groups;
    this.currentGroup = firstGroup;
    this.actions = {
      filter: (term) => {
        const filtering = term !== "";
        const fields2 = this.controls;
        let filteredTerm = groupsWrap.querySelector(".filtered-term");
        dom.toggleElementsByStr(fields2, term);
        if (filtering) {
          const filteredStr = mi18n.get("controls.filteringTerm", term);
          element.classList.add("filtered");
          if (filteredTerm) {
            filteredTerm.textContent = filteredStr;
          } else {
            filteredTerm = dom.create({
              tag: "h5",
              className: "filtered-term",
              content: filteredStr
            });
            groupsWrap.insertBefore(filteredTerm, groupsWrap.firstChild);
          }
        } else if (filteredTerm) {
          element.classList.remove("filtered");
          filteredTerm.remove();
        }
      },
      addElement: this.addElement,
      // @todo finish the addGroup method
      addGroup: (group) => console.log(group)
    };
    for (let i2 = groups.length - 1; i2 >= 0; i2--) {
      const storeID = `formeo-controls-${groups[i2]}`;
      if (!this.options.sortable) {
        globalThis.localStorage.removeItem(storeID);
      }
      Sortable.create(groups[i2], {
        animation: 150,
        fallbackClass: "control-moving",
        fallbackOnBody: true,
        forceFallback: true,
        fallbackTolerance: 5,
        group: {
          name: "controls",
          pull: "clone",
          put: false,
          revertClone: true
        },
        onClone: ({ clone: clone2, item }) => {
          clone2.id = item.id;
          if (this.options.ghostPreview) {
            const { controlData } = this.get(item.id);
            Promise.resolve().then(() => field).then(({ default: Field2 }) => {
              clone2.innerHTML = "";
              clone2.appendChild(new Field2(controlData).preview);
            });
          }
        },
        onStart: () => {
          this.isDragging = true;
          this.originalDocumentOverflow = document.documentElement.style.overflow;
          document.documentElement.style.overflow = "hidden";
        },
        onEnd: ({ from, item, clone: clone2 }) => {
          if (from.contains(clone2)) {
            from.replaceChild(item, clone2);
          }
          document.documentElement.style.overflow = this.originalDocumentOverflow;
          this.originalDocumentOverflow = null;
          window.setTimeout(() => {
            this.isDragging = false;
          }, 100);
        },
        sort: this.options.sortable,
        store: {
          /**
           * Get the order of elements.
           * @param   {Sortable}  sortable
           * @return {Array}
           */
          get: () => {
            const order = globalThis.localStorage.getItem(storeID);
            return order ? order.split("|") : [];
          },
          /**
           * Save the order of elements.
           * @param {Sortable}  sortable
           */
          set: (sortable) => {
            const order = sortable.toArray();
            globalThis.localStorage.setItem(storeID, order.join("|"));
          }
        }
      });
    }
    return element;
  }
  layoutTypes = {
    row: () => stages.active.addChild(),
    column: () => this.layoutTypes.row().addChild(),
    field: (controlData) => this.layoutTypes.column().addChild(controlData)
  };
  /**
   * Append an element to the stage
   * @param {String} id of elements
   */
  addElement = (id) => {
    const {
      meta: { group, id: metaId },
      ...elementData
    } = get(this.get(id), "controlData");
    set(elementData, "config.controlId", metaId);
    if (group === "layout") {
      return this.layoutTypes[metaId.replace("layout-", "")]();
    }
    return this.layoutTypes.field(elementData);
  };
  applyOptions = async (controlOptions = {}) => {
    const { container, elements, groupOrder, ...options } = merge(defaultOptions, controlOptions);
    this.container = container;
    this.groupOrder = unique(groupOrder.concat(["common", "html", "layout"]));
    this.options = options;
    const [layoutControls, formControls, htmlControls] = await Promise.all([
      Promise.resolve().then(() => index$5),
      Promise.resolve().then(() => index$3),
      Promise.resolve().then(() => index$1)
    ]);
    const allControls = [layoutControls.default, formControls.default, htmlControls.default].flat();
    return Promise.all(this.registerControls([...allControls, ...elements]));
  };
};
const Controls$2 = new Controls$1();
const index$7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Controls: Controls$1,
  default: Controls$2
}, Symbol.toStringTag, { value: "Module" }));
const DEFAULT_DATA = () => ({
  conditions: [CONDITION_TEMPLATE()]
});
const checkableTypes = /* @__PURE__ */ new Set(["checkbox", "radio"]);
const isSelectableType = /* @__PURE__ */ new Set(["radio", "checkbox", "select-one", "select-multiple"]);
class Field extends Component {
  /**
   * Set defaults and load fieldData
   * @param  {Object} fieldData existing field ID
   * @return {Object} field object
   */
  constructor(fieldData = /* @__PURE__ */ Object.create(null)) {
    super("field", { ...DEFAULT_DATA(), ...fieldData });
    this.debouncedUpdateEditPanels = debounce(this.updateEditPanels);
    this.debouncedUpdatePreview = debounce(this.updatePreview);
    this.label = dom.create(this.labelConfig);
    this.preview = this.fieldPreview();
    this.controlId = this.get("config.controlId") || this.get("meta.id");
    const actionButtons = this.getActionButtons();
    const hasEditButton = this.actionButtons.some((child) => child.meta?.id === "edit");
    this.updateEditPanels();
    const field2 = dom.create({
      tag: "li",
      attrs: {
        className: FIELD_CLASSNAME
      },
      id: this.id,
      children: [
        this.label,
        this.getComponentTag(),
        actionButtons,
        hasEditButton && this.editWindow,
        // fieldEdit window,
        this.preview
      ].filter(Boolean),
      panelNav: this.panelNav,
      dataset: {
        hoverTag: mi18n.get("field")
      }
    });
    this.dom = field2;
    this.isEditing = false;
  }
  get labelConfig() {
    const hideLabel = !!this.get("config.hideLabel");
    if (hideLabel) {
      return null;
    }
    const labelVal = this.get("config.editorLabel") || this.get("config.label");
    const required = this.get("attrs.required");
    const disableHTML = this.config.label.disableHTML;
    const labelConfig = () => {
      const config = {
        tag: "label",
        attrs: {}
      };
      if (disableHTML) {
        config.tag = "input";
        config.attrs.value = labelVal;
        return config;
      }
      config.attrs.contenteditable = true;
      config.children = labelVal;
      return config;
    };
    const label = {
      ...labelConfig(),
      action: {
        input: ({ target: { innerHTML, innerText } }) => {
          super.set("config.label", disableHTML ? innerText : innerHTML);
        }
      }
    };
    const labelWrap = {
      className: "prev-label",
      children: [label, required && dom.requiredMark()]
    };
    return labelWrap;
  }
  setData = (path, value) => {
    return super.set(path, value);
  };
  /**
   * wrapper for Data.set
   */
  set(path, value) {
    const data = this.setData(path, value);
    this.debouncedUpdatePreview();
    return data;
  }
  /**
   * Update the label dom when label data changes
   */
  updateLabel() {
    if (!this.label) {
      return null;
    }
    const newLabel = dom.create(this.labelConfig);
    this.label.replaceWith(newLabel);
    this.label = newLabel;
  }
  /**
   * Updates a field's preview
   * @return {Object} fresh preview
   */
  updatePreview = () => {
    this.updateLabel();
    const newPreview = this.fieldPreview();
    this.preview.replaceWith(newPreview);
    this.preview = newPreview;
  };
  get defaultPreviewActions() {
    return {
      change: (evt) => {
        const { target } = evt;
        const { type } = target;
        if (isSelectableType.has(type)) {
          const selectedOptions = this.preview.querySelectorAll(":checked");
          const optionsData = this.get("options");
          const checkedType = optionsData?.[0]?.selected !== void 0 ? "selected" : "checked";
          const optionsDataMap = optionsData.reduce((acc, option2) => {
            acc[option2.value] = option2;
            acc[option2.value][checkedType] = false;
            return acc;
          }, {});
          for (const option2 of selectedOptions) {
            optionsDataMap[option2.value][checkedType] = option2.value === optionsDataMap[option2.value].value;
          }
          super.set("options", Object.values(optionsDataMap));
          return this.debouncedUpdateEditPanels();
        }
      },
      click: (evt) => {
        if (evt.target.contentEditable === "true") {
          evt.preventDefault();
        }
      },
      input: ({ target }) => {
        if (["input", "meter", "progress", "button"].includes(target.tagName.toLowerCase())) {
          super.set("attrs.value", target.value);
          return this.debouncedUpdateEditPanels();
        }
        if (target.contentEditable && !target.type?.startsWith("select-")) {
          const parentClassList = target.parentElement.classList;
          const isOption = parentClassList.contains("f-checkbox") || parentClassList.contains("f-radio");
          if (isOption) {
            const option2 = target.parentElement;
            const optionIndex = indexOfNode(option2);
            this.setData(`options[${optionIndex}].label`, target.innerHTML);
            return this.debouncedUpdateEditPanels();
          }
          this.setData("content", target.innerHTML || target.value);
        }
      }
    };
  }
  /**
   * Generate field preview config
   * @return {Object} fieldPreview
   */
  fieldPreview() {
    const { action = {}, ...prevData } = clone$1(this.data);
    prevData.id = `prev-${this.id}`;
    prevData.action = Object.entries(action).reduce((acc, [key, value]) => {
      acc[key] = value.bind(this);
      return acc;
    }, {});
    if (this.data?.config.editableContent) {
      prevData.attrs = { ...prevData.attrs, contenteditable: true };
    }
    const fieldPreview = {
      attrs: {
        className: "field-preview",
        style: this.isEditing && "display: none;"
      },
      content: dom.create(prevData, true),
      action: this.defaultPreviewActions
    };
    return dom.create(fieldPreview, true);
  }
  get isCheckable() {
    return checkableTypes.has(this.get("config.controlId"));
  }
}
const field = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Field
}, Symbol.toStringTag, { value: "Module" }));
const DEFAULT_CONFIG = () => ({
  actionButtons: {
    buttons: ["move", "edit", "clone", "remove"],
    disabled: []
  },
  panels: {
    disabled: [],
    attrs: {
      disabled: ["type"],
      hideDisabled: true,
      locked: []
    },
    order: ["attrs", "options", "conditions"]
  },
  label: {
    disableHTML: false
  }
});
let Fields$1 = class Fields extends ComponentData {
  constructor(fieldData) {
    super("fields", fieldData);
    this.config = { all: DEFAULT_CONFIG() };
  }
  Component(data) {
    return new Field(data);
  }
  get = (path) => {
    let found = path && get(this.data, path);
    if (!found) {
      const control = Controls$2.get(path);
      if (control) {
        found = this.add(null, control.controlData);
      }
    }
    return found;
  };
  getData = () => {
    return Object.entries(this.data).reduce((acc, [key, val]) => {
      const { conditions, ...data } = val?.getData() || val;
      if (conditions?.length) {
        let hasConditions = true;
        if (conditions.length === 1) {
          const [firstCondition] = conditions;
          hasConditions = Boolean(firstCondition.if[0].source);
        }
        if (hasConditions) {
          data.conditions = conditions;
        }
      }
      acc[key] = data;
      return acc;
    }, {});
  };
  load = (dataArg = /* @__PURE__ */ Object.create(null)) => {
    const allFieldData = parseData(dataArg);
    this.empty();
    for (const [key, val] of Object.entries(allFieldData)) {
      const { meta, ...data } = val;
      if (meta?.id) {
        set(data, "config.controlId", meta?.id);
      }
      this.add(key, data);
    }
    return this.data;
  };
};
const fields = new Fields$1();
const Stages2 = stages;
const Rows2 = rows;
const Columns2 = columns;
const Fields2 = fields;
const Controls2 = Controls$2;
const getFormData = (formData, useSessionStorage = false) => {
  if (formData) {
    return clone$1(parseData(formData));
  }
  if (useSessionStorage) {
    return sessionStorage.get(SESSION_FORMDATA_KEY) || DEFAULT_FORMDATA();
  }
  return DEFAULT_FORMDATA();
};
class Components extends Data {
  constructor() {
    super("components");
    this.disableEvents = true;
    this.stages = Stages2;
    this.rows = Rows2;
    this.columns = Columns2;
    this.fields = Fields2;
    this.controls = Controls2;
  }
  load = (formDataArg, opts) => {
    this.empty();
    const formData = getFormData(formDataArg, opts.sessionStorage);
    this.opts = opts;
    this.set("id", formData.id);
    this.add("stages", Stages2.load(formData.stages));
    this.add("rows", Rows2.load(formData.rows));
    this.add("columns", Columns2.load(formData.columns));
    this.add("fields", Fields2.load(formData.fields));
    for (const stage of Object.values(this.get("stages"))) {
      stage.loadChildren();
    }
    return this.data;
  };
  /**
   * flattens the component tree
   * @returns {Object} where keys contains component type
   */
  flatList() {
    const result = {};
    for (const stageId of Object.keys(this.data.stages)) {
      buildFlatDataStructure(this.data, stageId, "stages", result);
    }
    return result;
  }
  getChildData = ({ type, id }) => {
    const component = this.get(type, id);
    if (component) {
      return component.getData();
    }
  };
  get json() {
    return window.JSON.stringify({
      $schema: `https://cdn.jsdelivr.net/npm/formeo@${version$1}/dist/formData_schema.json`,
      ...this.formData
    });
  }
  get formData() {
    return {
      id: this.get("id"),
      stages: stages.getData(),
      rows: rows.getData(),
      columns: columns.getData(),
      fields: fields.getData()
    };
  }
  set config(config) {
    const { stages: stages2, rows: rows2, columns: columns2, fields: fields2 } = config;
    Stages2.config = stages2;
    Rows2.config = rows2;
    Columns2.config = columns2;
    Fields2.config = fields2;
  }
  getIndex(type) {
    return this[type] || this[COMPONENT_INDEX_TYPE_MAP.get(type)];
  }
  /**
   * call `set` on a component in memory
   */
  setAddress(fullAddress, value) {
    if (!isAddress(fullAddress)) {
      return;
    }
    const [type, id, ...localAddress] = Array.isArray(fullAddress) ? fullAddress : splitAddress(fullAddress);
    const componentIndex = this.getIndex(type);
    const component = componentIndex.get(id);
    component?.set(localAddress, value);
    return component;
  }
  /**
   * Fetch a component from memory by address
   */
  getAddress(fullAddress) {
    if (!isAddress(fullAddress)) {
      return;
    }
    const [type, id, ...localAddress] = Array.isArray(fullAddress) ? fullAddress : splitAddress(fullAddress);
    const componentIndex = this.getIndex(type);
    const component = componentIndex.get(id);
    if (localAddress.length && !component) {
      return;
    }
    return localAddress.length ? component.get(localAddress) : component;
  }
}
const components = new Components();
const index$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Columns: Columns2,
  Components,
  Controls: Controls2,
  Fields: Fields2,
  Rows: Rows2,
  Stages: Stages2,
  default: components
}, Symbol.toStringTag, { value: "Module" }));
const NO_TRANSITION_CLASS_NAME = "no-transition";
const defaults$1 = {
  debug: false,
  // enable debug mode
  bubbles: true,
  // bubble events from components
  formeoLoaded: (_evt) => {
  },
  onAdd: () => {
  },
  onChange: (evt) => events.opts?.debug && console.log(evt),
  onUpdate: (evt) => events.opts?.debug && console.log(evt),
  onUpdateStage: (evt) => events.opts?.debug && console.log(evt),
  onUpdateRow: (evt) => events.opts?.debug && console.log(evt),
  onUpdateColumn: (evt) => events.opts?.debug && console.log(evt),
  onUpdateField: (evt) => events.opts?.debug && console.log(evt),
  onAddRow: (evt) => events.opts?.debug && console.log(evt),
  onAddColumn: (evt) => events.opts?.debug && console.log(evt),
  onAddField: (evt) => events.opts?.debug && console.log(evt),
  onRemoveRow: (evt) => events.opts?.debug && console.log(evt),
  onRemoveColumn: (evt) => events.opts?.debug && console.log(evt),
  onRemoveField: (evt) => events.opts?.debug && console.log(evt),
  onRender: (evt) => events.opts?.debug && console.log(evt),
  onSave: (_evt) => {
  },
  confirmClearAll: (evt) => {
    if (window.confirm(evt.confirmationMessage)) {
      evt.clearAllAction(evt);
    }
  }
};
const defaultCustomEvent = ({ src, ...evtData }, type = EVENT_FORMEO_UPDATED) => {
  const evt = new window.CustomEvent(type, {
    detail: evtData,
    bubbles: events.opts?.debug || events.opts?.bubbles
  });
  evt.data = (src || document).dispatchEvent(evt);
  if (type === EVENT_FORMEO_UPDATED) {
    const changedEvt = new window.CustomEvent(EVENT_FORMEO_CHANGED, {
      detail: evtData,
      bubbles: events.opts?.debug || events.opts?.bubbles
    });
    (src || document).dispatchEvent(changedEvt);
  }
  return evt;
};
const events = {
  init: function(options) {
    this.opts = { ...defaults$1, ...options };
    return this;
  },
  formeoSaved: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_SAVED),
  formeoUpdated: (evt, eventType) => defaultCustomEvent(evt, eventType || EVENT_FORMEO_UPDATED),
  formeoCleared: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_CLEARED),
  formeoOnRender: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_ON_RENDER),
  formeoConditionUpdated: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_CONDITION_UPDATED),
  formeoAddedRow: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_ADDED_ROW),
  formeoAddedColumn: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_ADDED_COLUMN),
  formeoAddedField: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_ADDED_FIELD),
  formeoRemovedRow: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_REMOVED_ROW),
  formeoRemovedColumn: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_REMOVED_COLUMN),
  formeoRemovedField: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_REMOVED_FIELD)
};
const formeoUpdatedThrottled = throttle$1(() => {
  const eventData = {
    timeStamp: window.performance.now(),
    type: EVENT_FORMEO_UPDATED,
    detail: components.formData
  };
  events.opts.onUpdate(eventData);
  if (events.opts.onChange !== events.opts.onUpdate) {
    events.opts.onChange(eventData);
  }
}, ANIMATION_SPEED_FAST);
document.addEventListener(EVENT_FORMEO_UPDATED, formeoUpdatedThrottled);
document.addEventListener(EVENT_FORMEO_UPDATED_STAGE, (evt) => {
  const { timeStamp, type, detail } = evt;
  const eventData = { timeStamp, type, detail };
  events.opts.onUpdate(eventData);
  events.opts.onUpdateStage(eventData);
});
document.addEventListener(EVENT_FORMEO_UPDATED_ROW, (evt) => {
  const { timeStamp, type, detail } = evt;
  const eventData = { timeStamp, type, detail };
  events.opts.onUpdate(eventData);
  events.opts.onUpdateRow(eventData);
});
document.addEventListener(EVENT_FORMEO_UPDATED_COLUMN, (evt) => {
  const { timeStamp, type, detail } = evt;
  const eventData = { timeStamp, type, detail };
  events.opts.onUpdate(eventData);
  events.opts.onUpdateColumn(eventData);
});
document.addEventListener(EVENT_FORMEO_UPDATED_FIELD, (evt) => {
  const { timeStamp, type, detail } = evt;
  const eventData = { timeStamp, type, detail };
  events.opts.onUpdate(eventData);
  events.opts.onUpdateField(eventData);
});
document.addEventListener(EVENT_FORMEO_ADDED_ROW, (evt) => {
  const { timeStamp, type, detail } = evt;
  const eventData = { timeStamp, type, detail };
  events.opts.onAddRow(eventData);
});
document.addEventListener(EVENT_FORMEO_ADDED_COLUMN, (evt) => {
  const { timeStamp, type, detail } = evt;
  const eventData = { timeStamp, type, detail };
  events.opts.onAddColumn(eventData);
});
document.addEventListener(EVENT_FORMEO_ADDED_FIELD, (evt) => {
  const { timeStamp, type, detail } = evt;
  const eventData = { timeStamp, type, detail };
  events.opts.onAddField(eventData);
});
document.addEventListener(EVENT_FORMEO_REMOVED_ROW, (evt) => {
  const { timeStamp, type, detail } = evt;
  const eventData = { timeStamp, type, detail };
  events.opts.onRemoveRow(eventData);
});
document.addEventListener(EVENT_FORMEO_REMOVED_COLUMN, (evt) => {
  const { timeStamp, type, detail } = evt;
  const eventData = { timeStamp, type, detail };
  events.opts.onRemoveColumn(eventData);
});
document.addEventListener(EVENT_FORMEO_REMOVED_FIELD, (evt) => {
  const { timeStamp, type, detail } = evt;
  const eventData = { timeStamp, type, detail };
  events.opts.onRemoveField(eventData);
});
document.addEventListener(EVENT_FORMEO_ON_RENDER, (evt) => {
  const { timeStamp, type, detail } = evt;
  events.opts.onRender({
    timeStamp,
    type,
    detail
  });
});
document.addEventListener("confirmClearAll", (evt) => {
  evt = {
    timeStamp: evt.timeStamp,
    type: evt.type,
    confirmationMessage: evt.detail.confirmationMessage,
    clearAllAction: evt.detail.clearAllAction,
    btnCoords: evt.detail.btnCoords
  };
  events.opts.confirmClearAll(evt);
});
document.addEventListener(EVENT_FORMEO_SAVED, ({ timeStamp, type, detail: { formData } }) => {
  const evt = {
    timeStamp,
    type,
    formData
  };
  events.opts.onSave(evt);
});
document.addEventListener("formeoLoaded", (evt) => {
  events.opts.formeoLoaded(evt.detail.formeo);
});
let throttling;
function onResizeWindow() {
  throttling = throttling || window.requestAnimationFrame(() => {
    throttling = false;
    for (const column of Object.values(Columns2.data)) {
      column.dom.classList.add(NO_TRANSITION_CLASS_NAME);
      Controls2.dom.classList.add(NO_TRANSITION_CLASS_NAME);
      Controls2.panels.nav.refresh();
      column.refreshFieldPanels();
    }
  });
}
window.addEventListener("resize", onResizeWindow);
const defaultActions = {
  add: {
    attr: (evt) => {
      const attr = window.prompt(evt.message.attr);
      if (attr && evt.isDisabled(attr)) {
        window.alert(mi18n.get("attributeNotPermitted", attr || ""));
        return actions.add.attrs(evt);
      }
      let val;
      if (attr) {
        val = String(window.prompt(evt.message.value, ""));
        evt.addAction(attr, val);
      }
    },
    option: (evt) => {
      evt.addAction();
    },
    condition: (evt) => {
      evt.addAction(evt);
    }
  },
  remove: {
    attrs: (evt) => {
      evt.removeAction();
    },
    options: (evt) => {
      evt.removeAction();
    },
    conditions: (evt) => {
      evt.removeAction();
    }
  },
  click: {
    btn: (evt) => {
      evt.action();
    }
  },
  save: {
    form: identity
  }
};
const actions = {
  init: function(options) {
    const actionKeys = Object.keys(defaultActions);
    this.opts = actionKeys.reduce((acc, key) => {
      acc[key] = { ...defaultActions[key], ...options[key] };
      return acc;
    }, options);
    return this;
  },
  add: {
    attrs: (evt) => {
      return actions.opts.add.attr(evt);
    },
    options: (evt) => {
      return actions.opts.add.option(evt);
    },
    conditions: (evt) => {
      evt.template = evt.template || CONDITION_TEMPLATE();
      return actions.opts.add.condition(evt);
    }
  },
  remove: {
    attrs: (evt) => {
      return actions.opts.remove.attrs(evt);
    },
    options: (evt) => {
      return actions.opts.remove.options(evt);
    },
    conditions: (evt) => {
      return actions.opts.remove.conditions(evt);
    }
  },
  click: {
    btn: (evt) => {
      return actions.opts.click.btn(evt);
    }
  },
  save: {
    form: (formData) => {
      if (actions.opts.sessionStorage) {
        sessionStorage.set(SESSION_FORMDATA_KEY, formData);
      }
      events.formeoSaved({ formData });
      return actions.opts.save.form(formData);
    }
  }
};
const e = { "en-US": { "en-US": "English", dir: "ltr", "af-ZA": "Afrikaans (South Africa)", "ar-TN": "Arabic (Tunisia)", "cs-CZ": "Czech (Czechia)", "de-DE": "German (Germany)", "es-ES": "European Spanish", "fa-IR": "Persian (Iran)", "fi-FI": "Finnish (Finland)", "fr-FR": "French (France)", "hu-HU": "Hungarian (Hungary)", "it-IT": "Italian (Italy)", "ja-JP": "Japanese (Japan)", "nb-NO": "Norwegian Bokmål (Norway)", "pl-PL": "Polish (Poland)", "pt-BR": "Brazilian Portuguese", "pt-PT": "European Portuguese", "ro-RO": "Romanian (Romania)", "ru-RU": "Russian (Russia)", "th-TH": "Thai (Thailand)", "tr-TR": "Turkish (Türkiye)", "zh-CN": "Chinese (China)", "zh-HK": "Chinese (Hong Kong SAR China)", "action.add.attrs.attr": "What attribute would you like to add?", "action.add.attrs.value": "Default Value", addOption: "Add Option", allFieldsRemoved: "All fields were removed.", allowSelect: "Allow Select", and: "and", attribute: "Attribute", attributeNotPermitted: 'Attribute "{attribute}" is not permitted, please choose another.', attributes: "Attributes", "attrs.class": "Class", "attrs.className": "Class", "attrs.dir": "Direction", "attrs.id": "Id", "attrs.required": "Required", "attrs.style": "Style", "attrs.title": "Title", "attrs.type": "Type", "attrs.value": "Value", autocomplete: "Autocomplete", button: "Button", cannotBeEmpty: "This field cannot be empty", cannotClearFields: "There are no fields to clear", checkbox: "Checkbox", checkboxes: "Checkboxes", class: "Class", clear: "Clear", clearAllMessage: "Are you sure you want to clear all fields?", close: "Close", column: "Column", "condition.target.placeholder": "target", "condition.type.and": "And", "condition.type.if": "If", "condition.type.or": "Or", "condition.type.then": "Then", "condition.value.placeholder": "value", confirmClearAll: "Are you sure you want to remove all fields?", content: "Content", control: "Control", "controlGroups.nextGroup": "Next Group", "controlGroups.prevGroup": "Previous Group", "controls.filteringTerm": 'Filtering "{term}"', "controls.form.button": "Button", "controls.form.checkbox-group": "Checkbox Group", "controls.form.input.date": "Date", "controls.form.input.email": "Email", "controls.form.input.file": "File Upload", "controls.form.input.hidden": "Hidden Input", "controls.form.input.number": "Number", "controls.form.input.text": "Text Input", "controls.form.radio-group": "Radio Group", "controls.form.select": "Select", "controls.form.textarea": "TextArea", "controls.groups.form": "Form Fields", "controls.groups.html": "HTML Elements", "controls.groups.layout": "Layout", "controls.html.divider": "Divider", "controls.html.header": "Header", "controls.html.paragraph": "Paragraph", "controls.layout.column": "Column", "controls.layout.row": "Row", copy: "Copy To Clipboard", danger: "Danger", defineColumnLayout: "Define a column layout", defineColumnWidths: "Define column widths", description: "Help Text", descriptionField: "Description", "editing.row": "Editing Row", editorTitle: "Form Elements", field: "Field", "field.property.invalid": "not valid", "field.property.isChecked": "is checked", "field.property.isNotVisible": "is not visible", "field.property.isVisible": "is visible", "field.property.label": "label", "field.property.valid": "valid", "field.property.value": "value", fieldNonEditable: "This field cannot be edited.", fieldRemoveWarning: "Are you sure you want to remove this field?", fileUpload: "File Upload", formUpdated: "Form Updated", getStarted: "Drag a field from the right to get started.", group: "Group", grouped: "Grouped", hidden: "Hidden Input", hide: "Edit", htmlElements: "HTML Elements", if: "If", "if.condition.source.placeholder": "source", "if.condition.target.placeholder": "target / value", info: "Info", "input.date": "Date", "input.text": "Text", label: "Label", labelCount: "{label} {count}", labelEmpty: "Field Label cannot be empty", "lang.af": "Afrikaans", "lang.ar": "Arabic", "lang.cs": "Czech", "lang.de": "German", "lang.en": "English", "lang.es": "Spanish", "lang.fa": "Persian", "lang.fi": "Finnish", "lang.fr": "French", "lang.hu": "Hungarian", "lang.it": "Italian", "lang.ja": "Japanese", "lang.nb": "Norwegian Bokmål", "lang.pl": "Polish", "lang.pt": "Portuguese", "lang.ro": "Romanian", "lang.ru": "Russian", "lang.th": "Thai", "lang.tr": "Turkish", "lang.zh": "Chinese", layout: "Layout", limitRole: "Limit access to one or more of the following roles:", mandatory: "Mandatory", maxlength: "Max Length", "meta.group": "Group", "meta.icon": "Ico", "meta.label": "Label", minOptionMessage: "This field requires a minimum of 2 options", name: "Name", newOptionLabel: "New {type}", no: "No", number: "Number", off: "Off", on: "On", "operator.contains": "contains", "operator.equals": "equals", "operator.notContains": "not contains", "operator.notEquals": "not equal", "operator.notVisible": "not visible", "operator.visible": "visible", option: "Option", optional: "optional", optionEmpty: "Option value required", optionLabel: "Option {count}", options: "Options", or: "or", order: "Order", "panel.label.attrs": "Attributes", "panel.label.conditions": "Conditions", "panel.label.config": "Configuration", "panel.label.meta": "Meta", "panel.label.options": "Options", "panelEditButtons.attrs": "+ Attribute", "panelEditButtons.conditions": "+ Condition", "panelEditButtons.options": "+ Option", placeholder: "Placeholder", "placeholder.className": "space separated classes", "placeholder.email": "Enter you email", "placeholder.label": "Label", "placeholder.password": "Enter your password", "placeholder.placeholder": "Placeholder", "placeholder.text": "Enter some Text", "placeholder.textarea": "Enter a lot of text", "placeholder.value": "Value", preview: "Preview", primary: "Primary", remove: "Remove", removeMessage: "Remove Element", removeType: "Remove {type}", required: "Required", reset: "Reset", richText: "Rich Text Editor", roles: "Access", row: "Row", "row.makeInputGroup": "Make this row an input group.", "row.makeInputGroupDesc": "Input Groups enable users to add sets of inputs at a time.", "row.settings.fieldsetWrap": "Wrap row in a &lt;fieldset&gt; tag", "row.settings.fieldsetWrap.aria": "Wrap Row in Fieldset", save: "Save", secondary: "Secondary", select: "Select", selectColor: "Select Color", selectionsMessage: "Allow Multiple Selections", selectOptions: "Options", separator: "Separator", settings: "Settings", size: "Size", sizes: "Sizes", "sizes.lg": "Large", "sizes.m": "Default", "sizes.sm": "Small", "sizes.xs": "Extra Small", style: "Style", styles: "Styles", "styles.btn": "Button Style", "styles.btn.danger": "Danger", "styles.btn.default": "Default", "styles.btn.info": "Info", "styles.btn.primary": "Primary", "styles.btn.success": "Success", "styles.btn.warning": "Warning", subtype: "Type", success: "Success", text: "Text Field", then: "Then", "then.condition.target.placeholder": "target", toggle: "Toggle", ungrouped: "Un-Grouped", warning: "Warning", yes: "Yes" } }, i = e["en-US"];
const locale = "en-US";
mi18n.addLanguage(locale, i);
mi18n.setCurrent(locale);
const defaults = {
  get editor() {
    return {
      stickyControls: false,
      allowEdit: true,
      dataType: "json",
      debug: false,
      sessionStorage: false,
      editorContainer: null,
      // element or selector to attach editor to
      svgSprite: null,
      // null = use bundled sprite, or provide custom URL
      style: CSS_URL,
      // change to null
      iconFont: null,
      // 'glyphicons' || 'font-awesome' || 'fontello'
      config: {},
      // stages, rows, columns, fields
      events: {},
      actions: {},
      controls: {},
      i18n: {
        location: "https://draggable.github.io/formeo/assets/lang/"
      },
      onLoad: () => {
      }
    };
  }
};
new SmartTooltip();
let FormeoEditor$1 = class FormeoEditor {
  /**
   * @param  {Object} options  formeo options
   * @param  {String|Object}   userFormData loaded formData
   * @return {Object}          formeo references and actions
   */
  constructor({ formData, ...options }, userFormData) {
    const mergedOptions = merge(defaults.editor, options);
    const { actions: actions$1, events: events$1, debug, config, editorContainer, ...opts } = mergedOptions;
    if (editorContainer) {
      this.editorContainer = typeof editorContainer === "string" ? document.querySelector(editorContainer) : editorContainer;
    }
    this.opts = opts;
    dom.setOptions = opts;
    components.config = config;
    this.userFormData = userFormData || formData;
    this.Components = components;
    this.dom = dom;
    events.init({ debug, ...events$1 });
    actions.init({ debug, sessionStorage: opts.sessionStorage, ...actions$1 });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", this.loadResources.bind(this));
    } else {
      this.loadResources();
    }
  }
  get formData() {
    return this.Components.formData;
  }
  set formData(data = {}) {
    this.userFormData = cleanFormData(data);
    this.load(this.userFormData, this.opts);
  }
  loadData(data = {}) {
    this.formData = data;
  }
  get json() {
    return this.Components.json;
  }
  /**
   * Clear the editor and reset to initial state
   * @return {void}
   */
  clear() {
    this.userFormData = DEFAULT_FORMDATA();
    this.Components.load(this.userFormData, this.opts);
    this.render();
  }
  /**
   * Load remote resources
   * @return {Promise} asynchronously loaded remote resources
   */
  async loadResources() {
    document.removeEventListener("DOMContentLoaded", this.loadResources);
    const promises = [];
    promises.push(
      fetchIcons(this.opts.svgSprite),
      fetchFormeoStyle(this.opts.style),
      mi18n.init({ ...this.opts.i18n, locale: globalThis.sessionStorage?.getItem(SESSION_LOCALE_KEY) })
    );
    await Promise.all(promises);
    if (this.opts.allowEdit) {
      this.init();
    }
  }
  /**
   * Formeo initializer
   * @return {Object} References to formeo instance,
   * dom elements, actions events and more.
   */
  init() {
    return Controls$2.init(this.opts.controls, this.opts.stickyControls).then((controls) => {
      this.controls = controls;
      this.load(this.userFormData, this.opts);
      this.formId = components.get("id");
      this.i18n = {
        setLang: (formeoLocale) => {
          window.sessionStorage?.setItem(SESSION_LOCALE_KEY, formeoLocale);
          const loadLang = mi18n.setCurrent(formeoLocale);
          loadLang.then(() => {
            this.init();
          }, console.error);
        }
      };
      this.opts.onLoad?.(this);
    });
  }
  load(formData = this.userFormData, opts = this.opts) {
    this.Components.load(formData, opts);
    this.render();
  }
  /**
   * Render the formeo sections
   * @return {void}
   */
  render() {
    if (!this.controls) {
      return window.requestAnimationFrame(() => this.render());
    }
    this.stages = Object.values(components.get("stages"));
    if (this.opts.controlOnLeft) {
      for (const stage of this.stages) {
        stage.dom.style.order = 1;
      }
    }
    const elemConfig = {
      attrs: {
        className: "formeo formeo-editor",
        id: this.formId
      },
      content: [this.stages.map(({ dom: dom2 }) => dom2)]
    };
    if (mi18n.current.dir) {
      elemConfig.attrs.dir = mi18n.current.dir;
      dom.dir = mi18n.current.dir;
    }
    this.editor = dom.create(elemConfig);
    const controlsContainer = this.controls.container || this.editor;
    controlsContainer.appendChild(this.controls.dom);
    if (this.editorContainer) {
      dom.empty(this.editorContainer);
      this.editorContainer.appendChild(this.editor);
    }
    events.formeoLoaded = new globalThis.CustomEvent("formeoLoaded", {
      detail: {
        formeo: this
      }
    });
    document.dispatchEvent(events.formeoLoaded);
  }
};
const RENDER_PREFIX = "f-";
const containerLookup = (container) => typeof container === "string" ? document.querySelector(container) : container;
const processOptions = ({ editorContainer, renderContainer, formData, ...opts }) => {
  const processedOptions = {
    renderContainer: containerLookup(renderContainer),
    editorContainer: containerLookup(editorContainer),
    formData: cleanFormData(formData)
  };
  return { elements: {}, ...opts, ...processedOptions };
};
const baseId = (id) => {
  const match2 = id.match(UUID_REGEXP);
  return match2?.[0] || id``;
};
const isVisible = (elem) => {
  if (!elem) return false;
  if (elem.hasAttribute("hidden") || elem.parentElement.hasAttribute("hidden")) {
    return false;
  }
  const computedStyle = window.getComputedStyle(elem);
  return !(computedStyle.display === "none" || computedStyle.visibility === "hidden" || computedStyle.opacity === "0");
};
const propertyMap = {
  isChecked: (elem) => {
    return elem.checked;
  },
  isNotChecked: (elem) => {
    return !elem.checked;
  },
  value: (elem) => {
    return elem.value;
  },
  isVisible: (elem) => {
    return isVisible(elem);
  },
  isNotVisible: (elem) => {
    return !isVisible(elem);
  }
};
const createRemoveButton = () => dom.btnTemplate({
  className: "remove-input-group",
  children: dom.icon("remove"),
  action: {
    mouseover: ({ target }) => target.parentElement.classList.add("will-remove"),
    mouseleave: ({ target }) => target.parentElement.classList.remove("will-remove"),
    click: ({ target }) => target.parentElement.remove()
  }
});
const comparisonHandlers = {
  equals: isEqual,
  notEquals: (source, target) => !isEqual(source, target),
  contains: (source, target) => source.includes(target),
  notContains: (source, target) => !source.includes(target)
};
const comparisonMap = Object.entries(COMPARISON_OPERATORS).reduce((acc, [key, value]) => {
  acc[value] = comparisonHandlers[key];
  acc[key] = comparisonHandlers[key];
  return acc;
}, {});
const assignmentHandlers = {
  equals: (elem, { targetProperty, value }) => {
    elem[`_${targetProperty}`] = elem[targetProperty];
    elem[targetProperty] = value;
  }
};
const assignmentMap = Object.entries(ASSIGNMENT_OPERATORS).reduce((acc, [key, value]) => {
  acc[value] = assignmentHandlers[key];
  acc[key] = assignmentHandlers[key];
  return acc;
}, {});
const targetPropertyMap = {
  isChecked: (elem) => {
    elem.checked = true;
  },
  isNotChecked: (elem) => {
    elem.checked = false;
  },
  value: (elem, { assignment, ...rest }) => {
    const assignmentAction = assignmentMap[assignment]?.(elem, rest);
    const event = new Event("input", { bubbles: true });
    elem.dispatchEvent(event);
    return assignmentAction;
  },
  isNotVisible: (elem) => {
    if (elem?._required === void 0) {
      elem._required = elem.required;
    }
    elem.parentElement.setAttribute("hidden", true);
    elem.required = false;
  },
  isVisible: (elem) => {
    elem.parentElement.removeAttribute("hidden");
    elem.required = elem._required;
  }
};
let FormeoRenderer$1 = class FormeoRenderer {
  constructor(opts, formDataArg) {
    const { renderContainer, elements, formData } = processOptions(opts);
    this.container = renderContainer;
    this.form = cleanFormData(formDataArg || formData);
    this.dom = dom;
    this.components = /* @__PURE__ */ Object.create(null);
    this.elements = elements;
  }
  get formData() {
    return this.form;
  }
  set formData(data) {
    this.form = cleanFormData(data);
  }
  get userData() {
    const userData = new FormData(this.renderedForm);
    const formDataObj = {};
    for (const [key, value] of userData.entries()) {
      if (formDataObj[key]) {
        if (Array.isArray(formDataObj[key])) {
          formDataObj[key].push(value);
        } else {
          formDataObj[key] = [formDataObj[key], value];
        }
      } else {
        formDataObj[key] = value;
      }
    }
    return formDataObj;
  }
  set userData(data = {}) {
    const form = this.container.querySelector("form");
    for (const key of Object.keys(data)) {
      const fields2 = form.elements[key];
      if (fields2.length && fields2[0].type === "checkbox") {
        const values = Array.isArray(data[key]) ? data[key] : [data[key]];
        for (const field2 of fields2) {
          field2.checked = values.includes(field2.value);
        }
      } else if (fields2.length && fields2[0].type === "radio") {
        for (const field2 of fields2) {
          field2.checked = field2.value === data[key];
        }
      } else if (fields2.type) {
        fields2.value = data[key];
      }
    }
  }
  /**
   * Renders the formData to a target Element
   * @param {Object} formData
   */
  render(formData = this.form) {
    const renderedForm = this.getRenderedForm(formData);
    const existingRenderedForm = this.container.querySelector(".formeo-render");
    if (existingRenderedForm) {
      existingRenderedForm.replaceWith(renderedForm);
    } else {
      this.container.appendChild(renderedForm);
    }
  }
  getRenderedForm(formData = this.form) {
    this.form = cleanFormData(formData);
    const renderCount = document.getElementsByClassName("formeo-render").length;
    const config = {
      tag: "form",
      id: this.form.id,
      className: `formeo-render formeo formeo-rendered-${renderCount}`,
      children: this.processedData
    };
    this.renderedForm = dom.render(config);
    this.applyConditions();
    return this.renderedForm;
  }
  get html() {
    const renderedForm = this.renderedForm || this.getRenderedForm();
    return renderedForm.outerHTML;
  }
  orderChildren = (type, order) => order.reduce((acc, cur) => {
    acc.push(this.form[type][cur]);
    return acc;
  }, []);
  prefixId = (id) => RENDER_PREFIX + id;
  /**
   * Convert sizes, apply styles for render
   * @param  {Object} columnData
   * @return {Object} processed column data
   */
  processColumn = ({ id, ...columnData }) => ({
    ...columnData,
    ...{
      id: this.prefixId(id),
      children: this.processFields(columnData.children),
      style: `width: ${columnData.config.width || "100%"}`
    }
  });
  processRows = (stageId) => this.orderChildren("rows", this.form.stages[stageId].children).reduce((acc, row) => {
    if (row) {
      acc.push(this.processRow(row));
    }
    return acc;
  }, []);
  cacheComponent = (data) => {
    this.components[baseId(data.id)] = data;
    return data;
  };
  /**
   * Applies a row's config
   * @param {Object} row data
   * @return {Object} row config object
   */
  processRow = (data, type = "row") => {
    const { config, id } = data;
    const className = [`formeo-${type}-wrap`];
    const rowData = { ...data, children: this.processColumns(data.id), id: this.prefixId(id) };
    this.cacheComponent(rowData);
    const configConditions = [
      { condition: config.legend, result: () => ({ tag: config.fieldset ? "legend" : "h3", children: config.legend }) },
      { condition: true, result: () => rowData },
      { condition: config.inputGroup, result: () => this.addButton(id) }
    ];
    const children = configConditions.reduce((acc, { condition, result }) => {
      if (condition) {
        acc.push(result());
      }
      return acc;
    }, []);
    if (config.inputGroup) {
      className.push(`${RENDER_PREFIX}input-group-wrap`);
    }
    return {
      tag: config.fieldset ? "fieldset" : "div",
      className,
      children
    };
  };
  cloneComponentData = (componentId) => {
    const { children = [], id, ...rest } = this.components[componentId];
    return {
      ...rest,
      id: uuid(id),
      children: children?.length && children.map(({ id: id2 }) => this.cloneComponentData(baseId(id2)))
    };
  };
  addButton = (id) => ({
    tag: "button",
    attrs: {
      className: "add-input-group btn pull-right",
      type: "button"
    },
    children: "Add +",
    action: {
      click: (e2) => {
        const fInputGroup = e2.target.parentElement;
        const elem = dom.create(this.cloneComponentData(id));
        fInputGroup.insertBefore(elem, fInputGroup.lastChild);
        const removeButton = dom.create(createRemoveButton());
        elem.appendChild(removeButton);
      }
    }
  });
  processColumns = (rowId) => {
    return this.orderChildren("columns", this.form.rows[rowId].children).map(
      (column) => this.cacheComponent(this.processColumn(column))
    );
  };
  processFields = (fieldIds) => this.orderChildren("fields", fieldIds).map(({ id, ...field2 }) => {
    const controlId = field2.config?.controlId || field2.meta?.id;
    const { action = {}, dependencies = {} } = this.elements[controlId] || {};
    if (dependencies) {
      fetchDependencies(dependencies);
    }
    const mergedFieldData = merge({ action }, field2);
    const cached = this.cacheComponent({ ...mergedFieldData, id: this.prefixId(id) });
    return cached;
  });
  get processedData() {
    return Object.values(this.form.stages).map((stage) => {
      stage.children = this.processRows(stage.id);
      stage.className = STAGE_CLASSNAME;
      this.components[baseId(stage.id)] = stage;
      return stage;
    });
  }
  /**
   * Evaulate and execute conditions for fields by creating listeners for input and changes
   * @return {Array} flattened array of conditions
   */
  handleComponentCondition = (component, ifRest, thenConditions) => {
    if (component.length) {
      for (const elem of component) {
        this.handleComponentCondition(elem, ifRest, thenConditions);
      }
      return;
    }
    const listenerEvent = LISTEN_TYPE_MAP(component);
    if (listenerEvent) {
      component.addEventListener(
        listenerEvent,
        (evt) => {
          if (this.evaluateCondition(ifRest, evt)) {
            for (const thenCondition of thenConditions) {
              this.execResult(thenCondition, evt);
            }
          } else {
            for (const thenCondition of thenConditions) {
              this.execResult(thenCondition, evt, true);
            }
          }
        },
        false
      );
    }
    const fakeEvt = { target: component };
    const result = this.evaluateCondition(ifRest, fakeEvt);
    if (result) {
      for (const thenCondition of thenConditions) {
        this.execResult(thenCondition, fakeEvt);
      }
    } else {
      for (const thenCondition of thenConditions) {
        this.execResult(thenCondition, fakeEvt, true);
      }
    }
  };
  applyConditions = () => {
    for (const [componentId, componentData] of Object.entries(this.components)) {
      const { conditions } = componentData;
      if (conditions) {
        for (const condition of conditions) {
          const { if: ifConditions, then: thenConditions } = condition;
          for (const ifCondition of ifConditions) {
            const { source, target } = ifCondition;
            if (isAddress(source)) {
              const { component, options } = this.getComponent(source);
              const sourceComponent = options || component;
              if (sourceComponent) {
                this.handleComponentCondition(sourceComponent, ifCondition, thenConditions);
              }
            }
            if (isAddress(target)) {
              const { component, options } = this.getComponent(target);
              const targetComponent = options || component;
              if (targetComponent) {
                this.handleComponentCondition(targetComponent, ifCondition, thenConditions);
              }
            }
          }
        }
      }
    }
  };
  /**
   * Evaulate conditions
   */
  evaluateCondition = ({ source, sourceProperty, targetProperty, comparison, target }) => {
    const sourceValue = this.getComponentProperty(source, sourceProperty);
    if (typeof sourceValue === "boolean") {
      return sourceValue;
    }
    const targetValue = String(isAddress(target) ? this.getComponentProperty(target, targetProperty) : target);
    const result = comparisonMap[comparison]?.(sourceValue, targetValue);
    return result;
  };
  execResult = ({ target, targetProperty, assignment, value }, _evt, executeOpposite = false) => {
    if (isAddress(target)) {
      const { component, option: option2 } = this.getComponent(target);
      const elem = option2 || component;
      const oppositePropertyMap = {
        isVisible: "isNotVisible",
        isNotVisible: "isVisible",
        isChecked: "isNotChecked",
        isNotChecked: "isChecked"
      };
      const effectiveProperty = executeOpposite && oppositePropertyMap[targetProperty] ? oppositePropertyMap[targetProperty] : targetProperty;
      if (elem && targetPropertyMap[effectiveProperty]) {
        targetPropertyMap[effectiveProperty](elem, { targetProperty: effectiveProperty, assignment, value });
      }
    }
  };
  getComponentProperty = (address, propertyName) => {
    const { component, option: option2, options } = this.getComponent(address);
    const elem = option2 || component;
    if (propertyName === "value" && options && options.length > 0 && !option2) {
      const checkedOption = Array.from(options).find((opt) => opt.checked);
      return checkedOption?.value || "";
    }
    if (option2 && (!propertyName || propertyName === "")) {
      return option2.value;
    }
    return propertyMap[propertyName]?.(elem) || elem[propertyName];
  };
  getComponent = (address) => {
    const result = {
      component: null
    };
    if (!isAddress(address)) {
      return null;
    }
    const [, componentId, optionsKey, optionIndex] = splitAddress(address);
    const component = this.renderedForm.querySelector(`#${RENDER_PREFIX}${componentId}`);
    if (!component) {
      return result;
    }
    result.component = component;
    if (optionsKey) {
      const options = component.querySelectorAll("input");
      const option2 = options[optionIndex];
      result.options = options;
      result.option = option2;
      return result;
    }
    const inputs = component.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    if (inputs.length > 0) {
      result.options = inputs;
      result.component = inputs[0];
    }
    return result;
  };
  getComponents = (address) => {
    const components2 = [];
    const componentId = address.slice(address.indexOf(".") + 1);
    components2.push(...this.renderedForm.querySelectorAll(`[name=f-${componentId}]`));
    return components2;
  };
};
const LISTEN_TYPE_MAP = (component) => {
  const typesMap = [
    ["input", (c) => ["textarea", "text"].includes(c.type)],
    ["change", (c) => ["select"].includes(c.tagName.toLowerCase()) || ["checkbox", "radio"].includes(c.type)]
  ];
  const [listenerEvent] = typesMap.find((typeMap) => typeMap[1](component)) || [false];
  return listenerEvent;
};
if (window !== void 0) {
  window.FormeoEditor = FormeoEditor$1;
  window.FormeoRenderer = FormeoRenderer$1;
}
const FormeoEditor2 = FormeoEditor$1;
const FormeoRenderer2 = FormeoRenderer$1;
const columnControl = {
  config: {
    label: "column"
  },
  meta: {
    group: "layout",
    icon: "columns",
    id: "layout-column"
  }
};
const rowControl = {
  config: {
    label: "row"
  },
  meta: {
    group: "layout",
    icon: "rows",
    id: "layout-row"
  }
};
const index$4 = [rowControl, columnControl];
const index$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$4
}, Symbol.toStringTag, { value: "Module" }));
const buttonTypes = ["button", "submit", "reset"].map((buttonType) => ({
  label: buttonType,
  value: buttonType
}));
buttonTypes[0].selected = true;
class ButtonControl extends Control {
  constructor(controlConfig = {}) {
    const buttonConfig = {
      tag: "button",
      attrs: {
        className: [
          { label: "grouped", value: "f-btn-group" },
          { label: "ungrouped", value: "f-field-group" }
        ]
      },
      config: {
        label: mi18n.get("controls.form.button"),
        hideLabel: true
      },
      meta: {
        group: "common",
        icon: "button",
        id: "button"
      },
      options: [
        {
          label: mi18n.get("button"),
          type: buttonTypes,
          className: [
            {
              label: "default",
              value: "",
              selected: true
            },
            {
              label: "primary",
              value: "primary"
            },
            {
              label: "danger",
              value: "error"
            },
            {
              label: "success",
              value: "success"
            },
            {
              label: "warning",
              value: "warning"
            }
          ]
        }
      ]
    };
    const mergedConfig = merge(buttonConfig, controlConfig);
    super(mergedConfig);
  }
}
const generateOptionConfig = ({ type, isMultiple = false, count = 3 }) => Array.from({ length: count }, (_v, k) => k + 1).map((i2) => {
  const selectedKey = type === "checkbox" || isMultiple ? "checked" : "selected";
  return {
    label: mi18n.get("labelCount", {
      label: toTitleCase(type),
      count: i2
    }),
    value: `${type}-${i2}`,
    [selectedKey]: !i2
  };
});
class CheckboxGroupControl extends Control {
  constructor() {
    const checkboxGroup = {
      tag: "input",
      attrs: {
        type: "checkbox",
        required: false
      },
      config: {
        label: mi18n.get("controls.form.checkbox-group"),
        disabledAttrs: ["type"]
      },
      meta: {
        group: "common",
        icon: "checkbox",
        id: "checkbox"
      },
      options: generateOptionConfig({ type: "checkbox", count: 1 })
    };
    super(checkboxGroup);
  }
}
class DateControl extends Control {
  constructor() {
    const dateInput = {
      tag: "input",
      attrs: {
        type: "date",
        required: false,
        className: ""
      },
      config: {
        label: mi18n.get("controls.form.input.date")
      },
      meta: {
        group: "common",
        icon: "calendar",
        id: "date-input"
      }
    };
    super(dateInput);
  }
}
class FileControl extends Control {
  constructor() {
    const fileInput = {
      tag: "input",
      attrs: {
        type: "file",
        required: false
      },
      config: {
        label: mi18n.get("fileUpload")
      },
      meta: {
        group: "common",
        icon: "upload",
        id: "upload"
      }
    };
    super(fileInput);
  }
}
class HiddenControl extends Control {
  constructor() {
    const hiddenInput = {
      tag: "input",
      attrs: {
        type: "hidden",
        value: ""
      },
      config: {
        label: mi18n.get("hidden"),
        hideLabel: true
      },
      meta: {
        group: "common",
        icon: "hidden",
        id: "hidden"
      }
    };
    super(hiddenInput);
  }
}
class NumberControl extends Control {
  constructor() {
    const numberInput = {
      tag: "input",
      attrs: {
        type: "number",
        required: false,
        className: ""
      },
      config: {
        label: mi18n.get("number")
      },
      meta: {
        group: "common",
        icon: "hash",
        id: "number"
      }
    };
    super(numberInput);
  }
}
class TextControl extends Control {
  constructor() {
    const textInput = {
      tag: "input",
      attrs: {
        required: false,
        type: "text",
        className: ""
      },
      config: {
        label: mi18n.get("controls.form.input.text")
      },
      meta: {
        group: "common",
        icon: "text-input",
        id: "text-input"
      }
    };
    super(textInput);
  }
}
class RadioGroupControl extends Control {
  constructor() {
    const radioGroup = {
      tag: "input",
      attrs: {
        type: "radio",
        required: false
      },
      config: {
        label: mi18n.get("controls.form.radio-group"),
        disabled: ["attrs.type"]
      },
      meta: {
        group: "common",
        icon: "radio-group",
        id: "radio"
      },
      options: generateOptionConfig({ type: "radio" })
    };
    super(radioGroup);
  }
}
class SelectControl extends Control {
  constructor(controlConfig = {}) {
    const selectConfig = {
      tag: "select",
      config: {
        label: mi18n.get("controls.form.select")
      },
      attrs: {
        required: false,
        className: "",
        multiple: false
      },
      meta: {
        group: "common",
        icon: "select",
        id: "select"
      },
      options: generateOptionConfig({ type: "option", isMultiple: controlConfig.attrs?.multiple })
    };
    const mergedConfig = merge(selectConfig, controlConfig);
    super(mergedConfig);
  }
}
class TextAreaControl extends Control {
  constructor() {
    const textAreaConfig = {
      tag: "textarea",
      config: {
        label: mi18n.get("controls.form.textarea")
      },
      meta: {
        group: "common",
        icon: "textarea",
        id: "textarea"
      },
      attrs: {
        required: false
      }
    };
    super(textAreaConfig);
  }
}
const index$2 = [
  ButtonControl,
  DateControl,
  HiddenControl,
  NumberControl,
  TextAreaControl,
  TextControl,
  FileControl,
  SelectControl,
  CheckboxGroupControl,
  RadioGroupControl
];
const index$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$2
}, Symbol.toStringTag, { value: "Module" }));
const headerTags = Array.from(Array(5).keys()).slice(1).map((key) => `h${key}`);
const headerKey = "controls.html.header";
class HeaderControl extends Control {
  constructor() {
    const header = {
      tag: headerTags[0],
      attrs: {
        tag: headerTags.map((tag, index2) => ({
          label: tag.toUpperCase(),
          value: tag,
          selected: !index2
        })),
        className: ""
      },
      config: {
        label: mi18n.get(headerKey),
        hideLabel: true,
        editableContent: true
      },
      meta: {
        group: "html",
        icon: "header",
        id: "html.header"
      },
      content: mi18n.get(headerKey),
      action: {
        // onRender: evt => {},
        // click: evt => {},
      }
    };
    super(header);
  }
  /**
   * class configuration
   */
  static get definition() {
    return {
      // i18n custom mappings (defaults to camelCase type)
      i18n: {
        "en-US": {
          header: "Custom English Header"
        }
      }
    };
  }
  get content() {
    return super.i18n(headerKey);
  }
}
class HRControl extends Control {
  constructor() {
    const hrConfig = {
      tag: "hr",
      config: {
        label: mi18n.get("controls.html.divider"),
        hideLabel: true
      },
      meta: {
        group: "html",
        icon: "divider",
        id: "divider"
      }
    };
    super(hrConfig);
  }
}
class ParagraphControl extends Control {
  constructor() {
    const paragraphConfig = {
      tag: "p",
      attrs: {
        className: ""
      },
      config: {
        label: mi18n.get("controls.html.paragraph"),
        hideLabel: true,
        editableContent: true
      },
      meta: {
        group: "html",
        icon: "paragraph",
        id: "paragraph"
      },
      // eslint-disable-next-line
      content: "Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment."
    };
    super(paragraphConfig);
  }
}
class TinyMCEControl extends Control {
  constructor(options) {
    const textAreaConfig = {
      tag: "textarea",
      config: {
        label: "WYSIWYG",
        editableContent: true
      },
      meta: {
        group: "html",
        icon: "rich-text",
        id: "tinymce"
      },
      attrs: {
        required: false
      },
      dependencies: { js: "https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/tinymce.min.js" },
      // this action is passed to the rendered control/element
      // useful for actions and events on the control preview
      action: {
        onRender: (elem) => {
          const selector = `#${elem.id}`;
          window.tinymce.remove(selector);
          window.tinymce.init({
            selector
          });
        }
      },
      controlAction: {
        // callback when control is clicked
        click: () => {
        },
        // callback for when control is rendered
        onRender: () => {
        }
      }
    };
    const mergedOptions = merge(textAreaConfig, options);
    super(mergedOptions);
  }
}
const index = [HeaderControl, ParagraphControl, HRControl, TinyMCEControl];
const index$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index
}, Symbol.toStringTag, { value: "Module" }));
export {
  FormeoEditor2 as FormeoEditor,
  FormeoRenderer2 as FormeoRenderer
};
