
/**
formeo - https://formeo.io
Version: 3.1.4
Author: Draggable https://draggable.io
*/

"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
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
const DEFAULT_CONFIG$3 = {
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
  constructor(options = DEFAULT_CONFIG$3) {
    this.langs = /* @__PURE__ */ Object.create(null);
    this.loaded = [];
    this.processConfig(options);
  }
  /**
   * parse and format config
   * @param {Object} options
   */
  processConfig(options) {
    const { location, ...restOptions } = { ...DEFAULT_CONFIG$3, ...options };
    const parsedLocation = location.replace(/\/?$/, "/");
    this.config = { location: parsedLocation, ...restOptions };
    const { override, preloaded = {} } = this.config;
    const allLangs = Object.entries(this.langs).concat(Object.entries(override || preloaded));
    this.langs = allLangs.reduce((acc, [locale, lang]) => {
      acc[locale] = this.applyLanguage(locale, lang);
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
  addLanguage(locale, lang = {}) {
    lang = typeof lang === "string" ? I18N.processFile(lang) : lang;
    this.applyLanguage(locale, lang);
    this.config.langs.push("locale");
  }
  /**
   * get a string from a loaded language file
   * @param  {String} key  - the key for the string we are trying to retrieve
   * @param  {String} locale - locale to check for value
   * @return {String} language string or undefined
   */
  getValue(key, locale = this.locale) {
    var _a;
    const value = (_a = this.langs[locale]) == null ? void 0 : _a[key];
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
    for (let matches2, i = 0; i < lines.length; i++) {
      const regex = /^(.+?) *?= *?([^\n]+)/;
      matches2 = regex.exec(lines[i]);
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
  loadLang(locale, useCache = true) {
    const _this = this;
    return new Promise(function(resolve2, reject) {
      if (_this.loaded.indexOf(locale) !== -1 && useCache) {
        _this.applyLanguage(_this.langs[locale]);
        return resolve2(_this.langs[locale]);
      } else {
        const langFile = [_this.config.location, locale, _this.config.extension].join("");
        return fetchData(langFile).then((lang) => {
          const processedFile = I18N.processFile(lang);
          _this.applyLanguage(locale, processedFile);
          _this.loaded.push(locale);
          return resolve2(_this.langs[locale]);
        }).catch((err) => {
          console.error(err);
          const lang = _this.applyLanguage(locale);
          resolve2(lang);
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
  applyLanguage(locale, lang = {}) {
    const override = this.config.override[locale] || {};
    const existingLang = this.langs[locale] || {};
    this.langs[locale] = { ...existingLang, ...lang, ...override };
    return this.langs[locale];
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
  async setCurrent(locale = "en-US") {
    await this.loadLang(locale);
    this.locale = locale;
    this.current = this.langs[locale];
    return this.current;
  }
}
const mi18n = new I18N();
!function() {
  try {
    if ("undefined" != typeof document) {
      var o = document.createElement("style");
      o.appendChild(document.createTextNode('._3x4ZIcu-{position:absolute;background:#1f2937;color:#fff;padding:.75rem;border-radius:.375rem;max-width:200px;z-index:50;visibility:hidden;opacity:0;transition:opacity .2s;pointer-events:none;left:0;top:0}._3x4ZIcu-.JIt36hCJ{visibility:visible;opacity:1;pointer-events:all}._3x4ZIcu-:before{content:"";position:absolute;width:0;height:0;border:6px solid transparent}._3x4ZIcu-[data-position=top]:before{border-top-color:#1f2937;bottom:-12px;left:50%;transform:translate(-50%)}._3x4ZIcu-[data-position=bottom]:before{border-bottom-color:#1f2937;top:-12px;left:50%;transform:translate(-50%)}._3x4ZIcu-[data-position=left]:before{border-left-color:#1f2937;right:-12px;top:50%;transform:translateY(-50%)}._3x4ZIcu-[data-position=right]:before{border-right-color:#1f2937;left:-12px;top:50%;transform:translateY(-50%)}._3x4ZIcu-[data-position=top-left]:before{border-top-color:#1f2937;bottom:-12px;left:12px;transform:none}._3x4ZIcu-[data-position=top-right]:before{border-top-color:#1f2937;bottom:-12px;right:12px;left:auto;transform:none}._3x4ZIcu-[data-position=bottom-left]:before{border-bottom-color:#1f2937;top:-12px;left:12px;transform:none}._3x4ZIcu-[data-position=bottom-right]:before{border-bottom-color:#1f2937;top:-12px;right:12px;left:auto;transform:none}')), document.head.appendChild(o);
    }
  } catch (t) {
    console.error("vite-plugin-css-injected-by-js", t);
  }
}();
var __defProp2 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
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
    __publicField2(this, "triggerName");
    __publicField2(this, "tooltip");
    __publicField2(this, "activeTriggerType", null);
    __publicField2(this, "spacing", 12);
    __publicField2(this, "handleClick", (e) => {
      const triggerName = this.triggerName;
      const trigger = e.target.closest(`[${triggerName}][${triggerName}-type="click"]`);
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
    __publicField2(this, "handleMouseOver", (e) => {
      const triggerName = this.triggerName;
      const trigger = e.target.closest(`[${triggerName}]`);
      if (this.activeTriggerType !== "click" && (trigger == null ? void 0 : trigger.getAttribute(`${triggerName}-type`)) !== "click") {
        const content = trigger == null ? void 0 : trigger.getAttribute(`${triggerName}`);
        if (content) {
          this.show(trigger, content);
          this.activeTriggerType = "hover";
        }
      }
    });
    __publicField2(this, "handleMouseOut", (e) => {
      const triggerName = this.triggerName;
      const trigger = e.target.closest(`[${triggerName}]`);
      if (this.activeTriggerType !== "click" && (trigger == null ? void 0 : trigger.getAttribute(`${triggerName}-type`)) !== "click") {
        this.hide();
      }
    });
    __publicField2(this, "handleResize", () => {
      if (this.isVisible()) {
        this.hide();
      }
    });
    __publicField2(this, "handleScroll", () => {
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
const version$2 = "3.1.4";
const type = "module";
const main = "dist/formeo.cjs.js";
const module$1 = "dist/formeo.es.js";
const unpkg = "dist/formeo.umd.js";
const exports$1 = {
  ".": {
    "import": "./dist/formeo.es.js",
    require: "./dist/formeo.cjs.js",
    "default": "./dist/formeo.umd.js"
  }
};
const files = [
  "dist/*",
  "demo/**/*"
];
const homepage = "https://formeo.io";
const repository = {
  url: "https://github.com/Draggable/formeo",
  type: "git"
};
const author = "Draggable https://draggable.io";
const contributors = [
  {
    name: "Kevin Chappell",
    email: "kevin.b.chappell@gmail.com",
    url: "https://kevin-chappell.com"
  }
];
const bugs = {
  url: "https://github.com/draggable/formeo/issues"
};
const description = "A zero dependency JavaScript module for drag and drop form creation.";
const keywords = [
  "drag and drop",
  "form builder",
  "form maker",
  "forms"
];
const license = "MIT";
const ignore = [
  "**/*",
  "node_modules",
  "test"
];
const config = {
  files: {
    test: [
      "test/**/*.spec.js"
    ],
    "formeo-editor": {
      js: "src/js/editor.js"
    },
    "formeo-renderer": {
      js: "src/js/renderer.js"
    },
    site: [
      "demo/assets/sass/site.scss"
    ]
  }
};
const scripts = {
  dev: "vite",
  preview: "vite preview",
  "build:lib": "npm run build:lib:clean && npm run build:lib:unminified && npm run build:lib:minified",
  "build:lib:clean": "rm -rf dist",
  "build:lib:unminified": "vite build --config vite.config.lib.mjs --mode production",
  "build:lib:minified": "vite build --config vite.config.lib.mjs --mode production-minified",
  build: "npm-run-all -p build:icons build:demo",
  prebuild: "npm run build:lib",
  postbuild: "npm run generate:jsonSchema",
  "build:demo": "vite build --mode demo",
  "postbuild:demo": "node --no-warnings tools/copy-assets.mjs",
  "build:demo:watch": "vite build --mode demo --watch",
  "build:icons": "node ./tools/generate-sprite",
  lint: "eslint ./src --ext .js || true",
  test: "node --experimental-test-snapshots --require ./tools/test-setup.cjs --test --no-warnings src/**/*.test.{js,mjs}",
  "test:watch": "node --watch --experimental-test-snapshots --require ./tools/test-setup.cjs --test --no-warnings src/**/*.test.{js,mjs}",
  "test:updateSnapshots": "node --experimental-test-snapshots --test-update-snapshots --require ./tools/test-setup.cjs --test --no-warnings src/**/*.test.{js,mjs}",
  "test:ci": "npm test --coverage",
  start: "npm-run-all build:icons dev",
  "semantic-release": "semantic-release --ci --debug",
  "copy:lang": "node ./tools/copy-directory.mjs ./node_modules/formeo-i18n/dist/lang ./src/demo/assets/lang",
  "travis-deploy-once": "travis-deploy-once --pro",
  prepush: "npm test",
  prepare: "lefthook install",
  postmerge: "lefthook install",
  "generate:jsonSchema": "node --experimental-strip-types --no-warnings ./tools/generate-json-schema.ts"
};
const devDependencies = {
  "@biomejs/biome": "^1.9.3",
  "@commitlint/cli": "^19.5.0",
  "@commitlint/config-conventional": "^19.5.0",
  "@semantic-release/changelog": "^6.0.3",
  "@semantic-release/git": "^10.0.1",
  "@semantic-release/npm": "^12.0.1",
  "ace-builds": "^1.36.5",
  jsdom: "^25.0.1",
  lefthook: "^1.7.18",
  "npm-run-all": "^2.1.0",
  "sass-embedded": "^1.80.1",
  "semantic-release": "^24.1.2",
  "svg-sprite": "^2.0.4",
  vite: "^5.4.8",
  "vite-plugin-banner": "^0.8.0",
  "vite-plugin-compression": "^0.5.1",
  "vite-plugin-html": "^3.2.2",
  zod: "^3.23.8",
  "zod-to-json-schema": "^3.23.5"
};
const dependencies = {
  "@draggable/formeo-languages": "^3.1.3",
  "@draggable/i18n": "^1.0.7",
  "@draggable/tooltip": "^1.2.2",
  lodash: "^4.17.21",
  sortablejs: "^1.15.3"
};
const release = {
  branch: "master",
  verifyConditions: [
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git"
  ],
  prepare: [
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git"
  ]
};
const commitlint = {
  "extends": [
    "@commitlint/config-conventional"
  ],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test"
      ]
    ]
  }
};
const pkg = {
  name: name$1,
  version: version$2,
  type,
  main,
  module: module$1,
  unpkg,
  exports: exports$1,
  files,
  homepage,
  repository,
  author,
  contributors,
  bugs,
  description,
  keywords,
  license,
  ignore,
  config,
  scripts,
  devDependencies,
  dependencies,
  release,
  commitlint
};
const { env, resolve } = { url: typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("formeo.cjs.js", document.baseURI).href };
const name = pkg.name;
const version$1 = pkg.version;
const PACKAGE_NAME = name;
const formeoSpriteId = "formeo-sprite";
const POLYFILLS = [
  { name: "cssPreload", src: "//cdnjs.cloudflare.com/ajax/libs/loadCSS/2.0.1/cssrelpreload.min.js" },
  { name: "mutationObserver", src: "//cdn.jsdelivr.net/npm/mutationobserver-shim/dist/mutationobserver.min.js" },
  { name: "fetch", src: "https://unpkg.com/unfetch/polyfill" }
];
const relativeSpritePath = `../../lib/icons/${formeoSpriteId}.svg`;
const localSpriteUrl = typeof resolve === "function" ? resolve(relativeSpritePath) : relativeSpritePath;
const SVG_SPRITE_URL = (env == null ? void 0 : env.DEV) ? localSpriteUrl : `https://cdn.jsdelivr.net/npm/formeo@${version$1}/dist/${formeoSpriteId}.svg`;
const FALLBACK_SVG_SPRITE_URL = `https://draggable.github.io/formeo/assets/img/${formeoSpriteId}.svg`;
const CSS_URL = `https://cdn.jsdelivr.net/npm/formeo@${version$1}/dist/formeo.min.css`;
const FALLBACK_CSS_URL = "https://draggable.github.io/formeo/assets/css/formeo.min.css";
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
const COMPONENT_INDEX_TYPES = ["external", "stages", "rows", "columns", "fields"];
const COMPONENT_TYPES = ["stage", "row", "column", "field"].reduce((acc, type2) => ({ ...acc, [type2]: type2 }), {});
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
  (acc, [type2, className]) => ({
    ...acc,
    [className]: type2
  }),
  {}
);
const COMPONENT_TYPE_CLASSNAMES_ARRAY = Object.values(COMPONENT_TYPE_CLASSNAMES);
const COMPONENT_TYPE_CLASSNAMES_REGEXP = new RegExp(`${COMPONENT_TYPE_CLASSNAMES_ARRAY.join("|")}`, "g");
const childTypeMap = COMPONENT_TYPE_CONFIGS.map(({ name: name2 }, index2, arr) => {
  const { name: childName } = arr[index2 + 1] || {};
  return childName && [name2, childName];
}).filter(Boolean);
const parentTypeMap = childTypeMap.slice().map((typeMap) => typeMap.slice().reverse()).reverse();
const CHILD_TYPE_MAP = new Map(childTypeMap);
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
const CHANGE_TYPES = [{ type: "added", condition: (o, n) => Boolean(o === void 0 && n) }];
const SESSION_FORMDATA_KEY = `${name}-formData`;
const SESSION_LOCALE_KEY = `${name}-locale`;
const ANIMATION_SPEED_BASE = 333;
const ANIMATION_SPEED_FAST = Math.round(ANIMATION_SPEED_BASE / 2);
const ANIMATION_SPEED_SLOW = Math.round(ANIMATION_SPEED_BASE * 2);
const EVENT_FORMEO_SAVED = "formeoSaved";
const EVENT_FORMEO_UPDATED = "formeoUpdated";
const EVENT_FORMEO_UPDATED_STAGE = "formeoUpdatedStage";
const EVENT_FORMEO_UPDATED_ROW = "formeoUpdatedRow";
const EVENT_FORMEO_UPDATED_COLUMN = "formeoUpdatedColumn";
const EVENT_FORMEO_UPDATED_FIELD = "formeoUpdatedField";
const EVENT_FORMEO_CLEARED = "formeoCleared";
const EVENT_FORMEO_ON_RENDER = "formeoOnRender";
const EVENT_FORMEO_CONDITION_UPDATED = "formeoConditionUpdated";
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
const visiblityConfigs = {
  isVisible: "config.isVisible",
  isNotVisible: "config.isNotVisible"
};
const ASSIGNMENT_OPERATORS = {
  equals: "="
};
const CONDITION_INPUT_ORDER = [
  "label",
  "logical",
  "source",
  "thenTarget",
  "sourceProperty",
  "comparison",
  "target",
  "targetProperty",
  "assignment",
  "value"
];
const FIELD_PROPERTY_MAP = {
  value: "attrs.value",
  checked: "attrs.checked",
  ...visiblityConfigs
};
const OPERATORS = {
  comparison: COMPARISON_OPERATORS,
  assignment: ASSIGNMENT_OPERATORS,
  logical: LOGICAL_OPERATORS,
  property: FIELD_PROPERTY_MAP
};
const CONDITION_TEMPLATE = () => ({
  if: [
    {
      source: "",
      sourceProperty: "",
      comparison: "",
      target: "",
      targetProperty: ""
    }
  ],
  then: [
    {
      target: "",
      targetProperty: "",
      assignment: "",
      value: ""
    }
  ]
});
const UUID_REGEXP = /(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)/gi;
const bsColRegExp = /\bcol-\w+-\d+/g;
const iconPrefix = "f-i-";
const DEFAULT_FORMDATA = () => ({
  id: uuid(),
  stages: { [uuid()]: {} },
  rows: {},
  columns: {},
  fields: {}
});
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function listCacheClear$1() {
  this.__data__ = [];
  this.size = 0;
}
var _listCacheClear = listCacheClear$1;
function eq$5(value, other) {
  return value === other || value !== value && other !== other;
}
var eq_1 = eq$5;
var eq$4 = eq_1;
function assocIndexOf$4(array, key) {
  var length = array.length;
  while (length--) {
    if (eq$4(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var _assocIndexOf = assocIndexOf$4;
var assocIndexOf$3 = _assocIndexOf;
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete$1(key) {
  var data = this.__data__, index2 = assocIndexOf$3(data, key);
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
var _listCacheDelete = listCacheDelete$1;
var assocIndexOf$2 = _assocIndexOf;
function listCacheGet$1(key) {
  var data = this.__data__, index2 = assocIndexOf$2(data, key);
  return index2 < 0 ? void 0 : data[index2][1];
}
var _listCacheGet = listCacheGet$1;
var assocIndexOf$1 = _assocIndexOf;
function listCacheHas$1(key) {
  return assocIndexOf$1(this.__data__, key) > -1;
}
var _listCacheHas = listCacheHas$1;
var assocIndexOf = _assocIndexOf;
function listCacheSet$1(key, value) {
  var data = this.__data__, index2 = assocIndexOf(data, key);
  if (index2 < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index2][1] = value;
  }
  return this;
}
var _listCacheSet = listCacheSet$1;
var listCacheClear = _listCacheClear, listCacheDelete = _listCacheDelete, listCacheGet = _listCacheGet, listCacheHas = _listCacheHas, listCacheSet = _listCacheSet;
function ListCache$4(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
ListCache$4.prototype.clear = listCacheClear;
ListCache$4.prototype["delete"] = listCacheDelete;
ListCache$4.prototype.get = listCacheGet;
ListCache$4.prototype.has = listCacheHas;
ListCache$4.prototype.set = listCacheSet;
var _ListCache = ListCache$4;
var ListCache$3 = _ListCache;
function stackClear$1() {
  this.__data__ = new ListCache$3();
  this.size = 0;
}
var _stackClear = stackClear$1;
function stackDelete$1(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
var _stackDelete = stackDelete$1;
function stackGet$1(key) {
  return this.__data__.get(key);
}
var _stackGet = stackGet$1;
function stackHas$1(key) {
  return this.__data__.has(key);
}
var _stackHas = stackHas$1;
var freeGlobal$1 = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
var _freeGlobal = freeGlobal$1;
var freeGlobal = _freeGlobal;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root$8 = freeGlobal || freeSelf || Function("return this")();
var _root = root$8;
var root$7 = _root;
var Symbol$5 = root$7.Symbol;
var _Symbol = Symbol$5;
var Symbol$4 = _Symbol;
var objectProto$e = Object.prototype;
var hasOwnProperty$b = objectProto$e.hasOwnProperty;
var nativeObjectToString$1 = objectProto$e.toString;
var symToStringTag$1 = Symbol$4 ? Symbol$4.toStringTag : void 0;
function getRawTag$1(value) {
  var isOwn = hasOwnProperty$b.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var _getRawTag = getRawTag$1;
var objectProto$d = Object.prototype;
var nativeObjectToString = objectProto$d.toString;
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}
var _objectToString = objectToString$1;
var Symbol$3 = _Symbol, getRawTag = _getRawTag, objectToString = _objectToString;
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$3 ? Symbol$3.toStringTag : void 0;
function baseGetTag$6(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
var _baseGetTag = baseGetTag$6;
function isObject$8(value) {
  var type2 = typeof value;
  return value != null && (type2 == "object" || type2 == "function");
}
var isObject_1 = isObject$8;
var baseGetTag$5 = _baseGetTag, isObject$7 = isObject_1;
var asyncTag = "[object AsyncFunction]", funcTag$1 = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction$3(value) {
  if (!isObject$7(value)) {
    return false;
  }
  var tag = baseGetTag$5(value);
  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var isFunction_1 = isFunction$3;
var root$6 = _root;
var coreJsData$1 = root$6["__core-js_shared__"];
var _coreJsData = coreJsData$1;
var coreJsData = _coreJsData;
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked$1(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var _isMasked = isMasked$1;
var funcProto$2 = Function.prototype;
var funcToString$2 = funcProto$2.toString;
function toSource$2(func) {
  if (func != null) {
    try {
      return funcToString$2.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var _toSource = toSource$2;
var isFunction$2 = isFunction_1, isMasked = _isMasked, isObject$6 = isObject_1, toSource$1 = _toSource;
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto$1 = Function.prototype, objectProto$c = Object.prototype;
var funcToString$1 = funcProto$1.toString;
var hasOwnProperty$a = objectProto$c.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString$1.call(hasOwnProperty$a).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative$1(value) {
  if (!isObject$6(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction$2(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource$1(value));
}
var _baseIsNative = baseIsNative$1;
function getValue$1(object, key) {
  return object == null ? void 0 : object[key];
}
var _getValue = getValue$1;
var baseIsNative = _baseIsNative, getValue = _getValue;
function getNative$7(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : void 0;
}
var _getNative = getNative$7;
var getNative$6 = _getNative, root$5 = _root;
var Map$4 = getNative$6(root$5, "Map");
var _Map = Map$4;
var getNative$5 = _getNative;
var nativeCreate$4 = getNative$5(Object, "create");
var _nativeCreate = nativeCreate$4;
var nativeCreate$3 = _nativeCreate;
function hashClear$1() {
  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
  this.size = 0;
}
var _hashClear = hashClear$1;
function hashDelete$1(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var _hashDelete = hashDelete$1;
var nativeCreate$2 = _nativeCreate;
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$b = Object.prototype;
var hasOwnProperty$9 = objectProto$b.hasOwnProperty;
function hashGet$1(key) {
  var data = this.__data__;
  if (nativeCreate$2) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? void 0 : result;
  }
  return hasOwnProperty$9.call(data, key) ? data[key] : void 0;
}
var _hashGet = hashGet$1;
var nativeCreate$1 = _nativeCreate;
var objectProto$a = Object.prototype;
var hasOwnProperty$8 = objectProto$a.hasOwnProperty;
function hashHas$1(key) {
  var data = this.__data__;
  return nativeCreate$1 ? data[key] !== void 0 : hasOwnProperty$8.call(data, key);
}
var _hashHas = hashHas$1;
var nativeCreate = _nativeCreate;
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet$1(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED$1 : value;
  return this;
}
var _hashSet = hashSet$1;
var hashClear = _hashClear, hashDelete = _hashDelete, hashGet = _hashGet, hashHas = _hashHas, hashSet = _hashSet;
function Hash$1(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
Hash$1.prototype.clear = hashClear;
Hash$1.prototype["delete"] = hashDelete;
Hash$1.prototype.get = hashGet;
Hash$1.prototype.has = hashHas;
Hash$1.prototype.set = hashSet;
var _Hash = Hash$1;
var Hash = _Hash, ListCache$2 = _ListCache, Map$3 = _Map;
function mapCacheClear$1() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map$3 || ListCache$2)(),
    "string": new Hash()
  };
}
var _mapCacheClear = mapCacheClear$1;
function isKeyable$1(value) {
  var type2 = typeof value;
  return type2 == "string" || type2 == "number" || type2 == "symbol" || type2 == "boolean" ? value !== "__proto__" : value === null;
}
var _isKeyable = isKeyable$1;
var isKeyable = _isKeyable;
function getMapData$4(map2, key) {
  var data = map2.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
var _getMapData = getMapData$4;
var getMapData$3 = _getMapData;
function mapCacheDelete$1(key) {
  var result = getMapData$3(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
var _mapCacheDelete = mapCacheDelete$1;
var getMapData$2 = _getMapData;
function mapCacheGet$1(key) {
  return getMapData$2(this, key).get(key);
}
var _mapCacheGet = mapCacheGet$1;
var getMapData$1 = _getMapData;
function mapCacheHas$1(key) {
  return getMapData$1(this, key).has(key);
}
var _mapCacheHas = mapCacheHas$1;
var getMapData = _getMapData;
function mapCacheSet$1(key, value) {
  var data = getMapData(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
var _mapCacheSet = mapCacheSet$1;
var mapCacheClear = _mapCacheClear, mapCacheDelete = _mapCacheDelete, mapCacheGet = _mapCacheGet, mapCacheHas = _mapCacheHas, mapCacheSet = _mapCacheSet;
function MapCache$3(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
MapCache$3.prototype.clear = mapCacheClear;
MapCache$3.prototype["delete"] = mapCacheDelete;
MapCache$3.prototype.get = mapCacheGet;
MapCache$3.prototype.has = mapCacheHas;
MapCache$3.prototype.set = mapCacheSet;
var _MapCache = MapCache$3;
var ListCache$1 = _ListCache, Map$2 = _Map, MapCache$2 = _MapCache;
var LARGE_ARRAY_SIZE = 200;
function stackSet$1(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache$1) {
    var pairs = data.__data__;
    if (!Map$2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache$2(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
var _stackSet = stackSet$1;
var ListCache = _ListCache, stackClear = _stackClear, stackDelete = _stackDelete, stackGet = _stackGet, stackHas = _stackHas, stackSet = _stackSet;
function Stack$2(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack$2.prototype.clear = stackClear;
Stack$2.prototype["delete"] = stackDelete;
Stack$2.prototype.get = stackGet;
Stack$2.prototype.has = stackHas;
Stack$2.prototype.set = stackSet;
var _Stack = Stack$2;
var getNative$4 = _getNative;
var defineProperty$2 = function() {
  try {
    var func = getNative$4(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
}();
var _defineProperty$1 = defineProperty$2;
var defineProperty$1 = _defineProperty$1;
function baseAssignValue$3(object, key, value) {
  if (key == "__proto__" && defineProperty$1) {
    defineProperty$1(object, key, {
      "configurable": true,
      "enumerable": true,
      "value": value,
      "writable": true
    });
  } else {
    object[key] = value;
  }
}
var _baseAssignValue = baseAssignValue$3;
var baseAssignValue$2 = _baseAssignValue, eq$3 = eq_1;
function assignMergeValue$2(object, key, value) {
  if (value !== void 0 && !eq$3(object[key], value) || value === void 0 && !(key in object)) {
    baseAssignValue$2(object, key, value);
  }
}
var _assignMergeValue = assignMergeValue$2;
function createBaseFor$1(fromRight) {
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
var _createBaseFor = createBaseFor$1;
var createBaseFor = _createBaseFor;
var baseFor$1 = createBaseFor();
var _baseFor = baseFor$1;
var _cloneBuffer = { exports: {} };
_cloneBuffer.exports;
(function(module2, exports2) {
  var root2 = _root;
  var freeExports = exports2 && !exports2.nodeType && exports2;
  var freeModule = freeExports && true && module2 && !module2.nodeType && module2;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer2 = moduleExports ? root2.Buffer : void 0, allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
  function cloneBuffer2(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
    buffer.copy(result);
    return result;
  }
  module2.exports = cloneBuffer2;
})(_cloneBuffer, _cloneBuffer.exports);
var _cloneBufferExports = _cloneBuffer.exports;
var root$4 = _root;
var Uint8Array$2 = root$4.Uint8Array;
var _Uint8Array = Uint8Array$2;
var Uint8Array$1 = _Uint8Array;
function cloneArrayBuffer$1(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array$1(result).set(new Uint8Array$1(arrayBuffer));
  return result;
}
var _cloneArrayBuffer = cloneArrayBuffer$1;
var cloneArrayBuffer = _cloneArrayBuffer;
function cloneTypedArray$1(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
var _cloneTypedArray = cloneTypedArray$1;
function copyArray$1(source, array) {
  var index2 = -1, length = source.length;
  array || (array = Array(length));
  while (++index2 < length) {
    array[index2] = source[index2];
  }
  return array;
}
var _copyArray = copyArray$1;
var isObject$5 = isObject_1;
var objectCreate = Object.create;
var baseCreate$1 = /* @__PURE__ */ function() {
  function object() {
  }
  return function(proto) {
    if (!isObject$5(proto)) {
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
}();
var _baseCreate = baseCreate$1;
function overArg$2(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var _overArg = overArg$2;
var overArg$1 = _overArg;
var getPrototype$2 = overArg$1(Object.getPrototypeOf, Object);
var _getPrototype = getPrototype$2;
var objectProto$9 = Object.prototype;
function isPrototype$3(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$9;
  return value === proto;
}
var _isPrototype = isPrototype$3;
var baseCreate = _baseCreate, getPrototype$1 = _getPrototype, isPrototype$2 = _isPrototype;
function initCloneObject$1(object) {
  return typeof object.constructor == "function" && !isPrototype$2(object) ? baseCreate(getPrototype$1(object)) : {};
}
var _initCloneObject = initCloneObject$1;
function isObjectLike$7(value) {
  return value != null && typeof value == "object";
}
var isObjectLike_1 = isObjectLike$7;
var baseGetTag$4 = _baseGetTag, isObjectLike$6 = isObjectLike_1;
var argsTag$2 = "[object Arguments]";
function baseIsArguments$1(value) {
  return isObjectLike$6(value) && baseGetTag$4(value) == argsTag$2;
}
var _baseIsArguments = baseIsArguments$1;
var baseIsArguments = _baseIsArguments, isObjectLike$5 = isObjectLike_1;
var objectProto$8 = Object.prototype;
var hasOwnProperty$7 = objectProto$8.hasOwnProperty;
var propertyIsEnumerable$1 = objectProto$8.propertyIsEnumerable;
var isArguments$2 = baseIsArguments(/* @__PURE__ */ function() {
  return arguments;
}()) ? baseIsArguments : function(value) {
  return isObjectLike$5(value) && hasOwnProperty$7.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
};
var isArguments_1 = isArguments$2;
var isArray$7 = Array.isArray;
var isArray_1 = isArray$7;
var MAX_SAFE_INTEGER$1 = 9007199254740991;
function isLength$2(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}
var isLength_1 = isLength$2;
var isFunction$1 = isFunction_1, isLength$1 = isLength_1;
function isArrayLike$4(value) {
  return value != null && isLength$1(value.length) && !isFunction$1(value);
}
var isArrayLike_1 = isArrayLike$4;
var isArrayLike$3 = isArrayLike_1, isObjectLike$4 = isObjectLike_1;
function isArrayLikeObject$1(value) {
  return isObjectLike$4(value) && isArrayLike$3(value);
}
var isArrayLikeObject_1 = isArrayLikeObject$1;
var isBuffer$3 = { exports: {} };
function stubFalse() {
  return false;
}
var stubFalse_1 = stubFalse;
isBuffer$3.exports;
(function(module2, exports2) {
  var root2 = _root, stubFalse2 = stubFalse_1;
  var freeExports = exports2 && !exports2.nodeType && exports2;
  var freeModule = freeExports && true && module2 && !module2.nodeType && module2;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer2 = moduleExports ? root2.Buffer : void 0;
  var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
  var isBuffer2 = nativeIsBuffer || stubFalse2;
  module2.exports = isBuffer2;
})(isBuffer$3, isBuffer$3.exports);
var isBufferExports = isBuffer$3.exports;
var baseGetTag$3 = _baseGetTag, getPrototype = _getPrototype, isObjectLike$3 = isObjectLike_1;
var objectTag$3 = "[object Object]";
var funcProto = Function.prototype, objectProto$7 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
function isPlainObject$1(value) {
  if (!isObjectLike$3(value) || baseGetTag$3(value) != objectTag$3) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$6.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
var isPlainObject_1 = isPlainObject$1;
var baseGetTag$2 = _baseGetTag, isLength = isLength_1, isObjectLike$2 = isObjectLike_1;
var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag$1 = "[object Boolean]", dateTag$1 = "[object Date]", errorTag$1 = "[object Error]", funcTag = "[object Function]", mapTag$2 = "[object Map]", numberTag$1 = "[object Number]", objectTag$2 = "[object Object]", regexpTag$1 = "[object RegExp]", setTag$2 = "[object Set]", stringTag$1 = "[object String]", weakMapTag$1 = "[object WeakMap]";
var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$2 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag] = typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$2] = typedArrayTags[stringTag$1] = typedArrayTags[weakMapTag$1] = false;
function baseIsTypedArray$1(value) {
  return isObjectLike$2(value) && isLength(value.length) && !!typedArrayTags[baseGetTag$2(value)];
}
var _baseIsTypedArray = baseIsTypedArray$1;
function baseUnary$1(func) {
  return function(value) {
    return func(value);
  };
}
var _baseUnary = baseUnary$1;
var _nodeUtil = { exports: {} };
_nodeUtil.exports;
(function(module2, exports2) {
  var freeGlobal2 = _freeGlobal;
  var freeExports = exports2 && !exports2.nodeType && exports2;
  var freeModule = freeExports && true && module2 && !module2.nodeType && module2;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal2.process;
  var nodeUtil2 = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  }();
  module2.exports = nodeUtil2;
})(_nodeUtil, _nodeUtil.exports);
var _nodeUtilExports = _nodeUtil.exports;
var baseIsTypedArray = _baseIsTypedArray, baseUnary = _baseUnary, nodeUtil = _nodeUtilExports;
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray$3 = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
var isTypedArray_1 = isTypedArray$3;
function safeGet$2(object, key) {
  if (key === "constructor" && typeof object[key] === "function") {
    return;
  }
  if (key == "__proto__") {
    return;
  }
  return object[key];
}
var _safeGet = safeGet$2;
var baseAssignValue$1 = _baseAssignValue, eq$2 = eq_1;
var objectProto$6 = Object.prototype;
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
function assignValue$2(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$5.call(object, key) && eq$2(objValue, value)) || value === void 0 && !(key in object)) {
    baseAssignValue$1(object, key, value);
  }
}
var _assignValue = assignValue$2;
var assignValue$1 = _assignValue, baseAssignValue = _baseAssignValue;
function copyObject$1(source, props, object, customizer) {
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
      assignValue$1(object, key, newValue);
    }
  }
  return object;
}
var _copyObject = copyObject$1;
function baseTimes$1(n, iteratee) {
  var index2 = -1, result = Array(n);
  while (++index2 < n) {
    result[index2] = iteratee(index2);
  }
  return result;
}
var _baseTimes = baseTimes$1;
var MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex$3(value, length) {
  var type2 = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type2 == "number" || type2 != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var _isIndex = isIndex$3;
var baseTimes = _baseTimes, isArguments$1 = isArguments_1, isArray$6 = isArray_1, isBuffer$2 = isBufferExports, isIndex$2 = _isIndex, isTypedArray$2 = isTypedArray_1;
var objectProto$5 = Object.prototype;
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
function arrayLikeKeys$2(value, inherited) {
  var isArr = isArray$6(value), isArg = !isArr && isArguments$1(value), isBuff = !isArr && !isArg && isBuffer$2(value), isType = !isArr && !isArg && !isBuff && isTypedArray$2(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$4.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex$2(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
var _arrayLikeKeys = arrayLikeKeys$2;
function nativeKeysIn$1(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}
var _nativeKeysIn = nativeKeysIn$1;
var isObject$4 = isObject_1, isPrototype$1 = _isPrototype, nativeKeysIn = _nativeKeysIn;
var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function baseKeysIn$1(object) {
  if (!isObject$4(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype$1(object), result = [];
  for (var key in object) {
    if (!(key == "constructor" && (isProto || !hasOwnProperty$3.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}
var _baseKeysIn = baseKeysIn$1;
var arrayLikeKeys$1 = _arrayLikeKeys, baseKeysIn = _baseKeysIn, isArrayLike$2 = isArrayLike_1;
function keysIn$2(object) {
  return isArrayLike$2(object) ? arrayLikeKeys$1(object, true) : baseKeysIn(object);
}
var keysIn_1 = keysIn$2;
var copyObject = _copyObject, keysIn$1 = keysIn_1;
function toPlainObject$1(value) {
  return copyObject(value, keysIn$1(value));
}
var toPlainObject_1 = toPlainObject$1;
var assignMergeValue$1 = _assignMergeValue, cloneBuffer = _cloneBufferExports, cloneTypedArray = _cloneTypedArray, copyArray = _copyArray, initCloneObject = _initCloneObject, isArguments = isArguments_1, isArray$5 = isArray_1, isArrayLikeObject = isArrayLikeObject_1, isBuffer$1 = isBufferExports, isFunction = isFunction_1, isObject$3 = isObject_1, isPlainObject = isPlainObject_1, isTypedArray$1 = isTypedArray_1, safeGet$1 = _safeGet, toPlainObject = toPlainObject_1;
function baseMergeDeep$1(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet$1(object, key), srcValue = safeGet$1(source, key), stacked = stack.get(srcValue);
  if (stacked) {
    assignMergeValue$1(object, key, stacked);
    return;
  }
  var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
  var isCommon = newValue === void 0;
  if (isCommon) {
    var isArr = isArray$5(srcValue), isBuff = !isArr && isBuffer$1(srcValue), isTyped = !isArr && !isBuff && isTypedArray$1(srcValue);
    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray$5(objValue)) {
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
      } else if (!isObject$3(objValue) || isFunction(objValue)) {
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
  assignMergeValue$1(object, key, newValue);
}
var _baseMergeDeep = baseMergeDeep$1;
var Stack$1 = _Stack, assignMergeValue = _assignMergeValue, baseFor = _baseFor, baseMergeDeep = _baseMergeDeep, isObject$2 = isObject_1, keysIn = keysIn_1, safeGet = _safeGet;
function baseMerge$1(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    stack || (stack = new Stack$1());
    if (isObject$2(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge$1, customizer, stack);
    } else {
      var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
      if (newValue === void 0) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}
var _baseMerge = baseMerge$1;
function identity$3(value) {
  return value;
}
var identity_1 = identity$3;
function apply$1(func, thisArg, args) {
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
var _apply = apply$1;
var apply = _apply;
var nativeMax = Math.max;
function overRest$1(func, start, transform) {
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
var _overRest = overRest$1;
function constant$1(value) {
  return function() {
    return value;
  };
}
var constant_1 = constant$1;
var constant = constant_1, defineProperty = _defineProperty$1, identity$2 = identity_1;
var baseSetToString$1 = !defineProperty ? identity$2 : function(func, string) {
  return defineProperty(func, "toString", {
    "configurable": true,
    "enumerable": false,
    "value": constant(string),
    "writable": true
  });
};
var _baseSetToString = baseSetToString$1;
var HOT_COUNT = 800, HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut$1(func) {
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
var _shortOut = shortOut$1;
var baseSetToString = _baseSetToString, shortOut = _shortOut;
var setToString$1 = shortOut(baseSetToString);
var _setToString = setToString$1;
var identity$1 = identity_1, overRest = _overRest, setToString = _setToString;
function baseRest$1(func, start) {
  return setToString(overRest(func, start, identity$1), func + "");
}
var _baseRest = baseRest$1;
var eq$1 = eq_1, isArrayLike$1 = isArrayLike_1, isIndex$1 = _isIndex, isObject$1 = isObject_1;
function isIterateeCall$1(value, index2, object) {
  if (!isObject$1(object)) {
    return false;
  }
  var type2 = typeof index2;
  if (type2 == "number" ? isArrayLike$1(object) && isIndex$1(index2, object.length) : type2 == "string" && index2 in object) {
    return eq$1(object[index2], value);
  }
  return false;
}
var _isIterateeCall = isIterateeCall$1;
var baseRest = _baseRest, isIterateeCall = _isIterateeCall;
function createAssigner$1(assigner) {
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
var _createAssigner = createAssigner$1;
var baseMerge = _baseMerge, createAssigner = _createAssigner;
var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
  baseMerge(object, source, srcIndex, customizer);
});
var mergeWith_1 = mergeWith;
const mergeWith$1 = /* @__PURE__ */ getDefaultExportFromCjs(mergeWith_1);
const uuidv4 = () => crypto.randomUUID();
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
  var _a;
  const classMatch = (_a = node.className) == null ? void 0 : _a.match(COMPONENT_TYPE_CLASSNAMES_REGEXP);
  return classMatch && COMPONENT_TYPE_CLASSNAMES_LOOKUP[classMatch[0]];
};
const unique = (array) => Array.from(new Set(array));
const uuid = (elem) => {
  let id;
  if (elem) {
    const { attrs = {} } = elem;
    id = attrs.id || elem.id || uuidv4();
    elem.id = id;
  } else {
    id = uuidv4();
  }
  return id;
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
  return mergeWith$1({}, obj1, obj2, customizer);
};
const clone$1 = (obj) => {
  let copy;
  const isPromise = obj instanceof Promise;
  const isObject2 = typeof obj === "object";
  if (obj === null || !isObject2 || isPromise) {
    return obj;
  }
  if (obj instanceof Date) {
    copy = /* @__PURE__ */ new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  if (Array.isArray(obj)) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone$1(obj[i]);
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
      var _a;
      const itemValue = (_a = window.sessionStorage) == null ? void 0 : _a.getItem(key);
      try {
        return JSON.parse(itemValue);
      } catch (_err) {
        return itemValue;
      }
    }
  },
  set: {
    value: (key, itemValue) => {
      var _a;
      try {
        return (_a = window.sessionStorage) == null ? void 0 : _a.setItem(key, JSON.stringify(itemValue));
      } catch (error) {
        console.error(error);
      }
    }
  }
});
const isAddress = (str) => COMPONENT_INDEX_TYPES.some((indexType) => new RegExp(`^${indexType}.`).test(str));
const isExternalAddress = (str) => str.startsWith("external");
const isBoolKey = (key) => /^is|^has/.test(key);
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
function debounce(fn, delay = ANIMATION_SPEED_BASE) {
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
    } catch (e) {
      console.error("Invalid JSON string provided:", e);
      return /* @__PURE__ */ Object.create(null);
    }
  }
  return data;
}
const cleanFormData = (formData) => formData ? clone$1(parseData(formData)) : DEFAULT_FORMDATA();
var baseGetTag$1 = _baseGetTag, isObjectLike$1 = isObjectLike_1;
var symbolTag$1 = "[object Symbol]";
function isSymbol$3(value) {
  return typeof value == "symbol" || isObjectLike$1(value) && baseGetTag$1(value) == symbolTag$1;
}
var isSymbol_1 = isSymbol$3;
var isArray$4 = isArray_1, isSymbol$2 = isSymbol_1;
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
function isKey$1(value, object) {
  if (isArray$4(value)) {
    return false;
  }
  var type2 = typeof value;
  if (type2 == "number" || type2 == "symbol" || type2 == "boolean" || value == null || isSymbol$2(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var _isKey = isKey$1;
var MapCache$1 = _MapCache;
var FUNC_ERROR_TEXT = "Expected a function";
function memoize$1(func, resolver) {
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
  memoized.cache = new (memoize$1.Cache || MapCache$1)();
  return memoized;
}
memoize$1.Cache = MapCache$1;
var memoize_1 = memoize$1;
var memoize = memoize_1;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped$1(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var _memoizeCapped = memoizeCapped$1;
var memoizeCapped = _memoizeCapped;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath$1 = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match2, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match2);
  });
  return result;
});
var _stringToPath = stringToPath$1;
function arrayMap$1(array, iteratee) {
  var index2 = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index2 < length) {
    result[index2] = iteratee(array[index2], index2, array);
  }
  return result;
}
var _arrayMap = arrayMap$1;
var Symbol$2 = _Symbol, arrayMap = _arrayMap, isArray$3 = isArray_1, isSymbol$1 = isSymbol_1;
var INFINITY$1 = 1 / 0;
var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : void 0, symbolToString = symbolProto$1 ? symbolProto$1.toString : void 0;
function baseToString$1(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray$3(value)) {
    return arrayMap(value, baseToString$1) + "";
  }
  if (isSymbol$1(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY$1 ? "-0" : result;
}
var _baseToString = baseToString$1;
var baseToString = _baseToString;
function toString$1(value) {
  return value == null ? "" : baseToString(value);
}
var toString_1 = toString$1;
var isArray$2 = isArray_1, isKey = _isKey, stringToPath = _stringToPath, toString = toString_1;
function castPath$2(value, object) {
  if (isArray$2(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}
var _castPath = castPath$2;
var isSymbol = isSymbol_1;
var INFINITY = 1 / 0;
function toKey$2(value) {
  if (typeof value == "string" || isSymbol(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
var _toKey = toKey$2;
var assignValue = _assignValue, castPath$1 = _castPath, isIndex = _isIndex, isObject = isObject_1, toKey$1 = _toKey;
function baseSet$1(object, path, value, customizer) {
  if (!isObject(object)) {
    return object;
  }
  path = castPath$1(path, object);
  var index2 = -1, length = path.length, lastIndex = length - 1, nested = object;
  while (nested != null && ++index2 < length) {
    var key = toKey$1(path[index2]), newValue = value;
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
var _baseSet = baseSet$1;
var baseSet = _baseSet;
function set$1(object, path, value) {
  return object == null ? object : baseSet(object, path, value);
}
var set_1 = set$1;
const lodashSet = /* @__PURE__ */ getDefaultExportFromCjs(set_1);
var castPath = _castPath, toKey = _toKey;
function baseGet$1(object, path) {
  path = castPath(path, object);
  var index2 = 0, length = path.length;
  while (object != null && index2 < length) {
    object = object[toKey(path[index2++])];
  }
  return index2 && index2 == length ? object : void 0;
}
var _baseGet = baseGet$1;
var baseGet = _baseGet;
function get$1(object, path, defaultValue) {
  var result = object == null ? void 0 : baseGet(object, path);
  return result === void 0 ? defaultValue : result;
}
var get_1 = get$1;
const lodashGet = /* @__PURE__ */ getDefaultExportFromCjs(get_1);
const get = lodashGet;
const set = lodashSet;
const isInt = (n) => Number.isInteger(Number(n));
const indexOfNode = (node, parent) => {
  const parentElement = parent || node.parentElement;
  const nodeList = Array.prototype.slice.call(parentElement.childNodes);
  return nodeList.indexOf(node);
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
  for (let i = 0; i < arr.length; i++) {
    cb.call(scope, arr[i], i);
  }
};
const map = (arr, cb) => {
  const newArray = [];
  forEach(arr, (elem, i) => newArray.push(cb(elem, i)));
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
const isIE = () => window.navigator.userAgent.indexOf("MSIE ") !== -1;
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
  orderObjectsBy,
  isIE
};
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
    const height = parseInt(style.height, 10);
    const increment = height / (duration / 60);
    elem.style.height = "0px";
    (function slideDown() {
      const curHeight = parseFloat(elem.style.height);
      const val = curHeight + increment;
      if (curHeight < height) {
        elem.style.height = val + "px";
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
    const height = parseInt(style.height);
    const overFlowBack = style.overflow;
    elem.style.overflow = "hidden";
    elem.style.height = height + "px";
    const defMinHeight = style.minHeight;
    elem.style.minHeight = "auto";
    const increment = parseFloat(height / (duration / 60)).toFixed(2);
    (function slideUp() {
      const curHeight = parseInt(elem.style.height, 10);
      const val = curHeight - increment;
      if (val > 0) {
        elem.style.height = val + "px";
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
  // animation.translateX = (distance, duration = 250) => {
  //   var increment = distance / (duration / 60);
  //   (function translate() {
  //     var val = Number(elem.style.opacity) - increment;
  //     if (val > 0) {
  //       elem.style.transform = `translate(${distance}px, 0)`;
  //       requestAnimationFrame(translate);
  //     }
  //   })();
  // }
};
const NO_TRANSITION_CLASS_NAME = "no-transition";
const defaults$3 = {
  debug: false,
  // enable debug mode
  bubbles: true,
  // bubble events from components
  formeoLoaded: (evt) => {
  },
  onAdd: () => {
  },
  onUpdate: (evt) => {
    var _a;
    return ((_a = events.opts) == null ? void 0 : _a.debug) && console.log(evt);
  },
  onUpdateStage: (evt) => {
    var _a;
    return ((_a = events.opts) == null ? void 0 : _a.debug) && console.log(evt);
  },
  onUpdateRow: (evt) => {
    var _a;
    return ((_a = events.opts) == null ? void 0 : _a.debug) && console.log(evt);
  },
  onUpdateColumn: (evt) => {
    var _a;
    return ((_a = events.opts) == null ? void 0 : _a.debug) && console.log(evt);
  },
  onUpdateField: (evt) => {
    var _a;
    return ((_a = events.opts) == null ? void 0 : _a.debug) && console.log(evt);
  },
  onRender: (evt) => {
    var _a;
    return ((_a = events.opts) == null ? void 0 : _a.debug) && console.log(evt);
  },
  onSave: (evt) => {
  },
  confirmClearAll: (evt) => {
    if (window.confirm(evt.confirmationMessage)) {
      evt.clearAllAction(evt);
    }
  }
};
const defaultCustomEvent = ({ src, ...evtData }, type2 = EVENT_FORMEO_UPDATED) => {
  var _a, _b;
  const evt = new window.CustomEvent(type2, {
    detail: evtData,
    bubbles: ((_a = events.opts) == null ? void 0 : _a.debug) || ((_b = events.opts) == null ? void 0 : _b.bubbles)
  });
  evt.data = (src || document).dispatchEvent(evt);
  return evt;
};
const events = {
  init: function(options) {
    this.opts = { ...defaults$3, ...options };
    return this;
  },
  formeoSaved: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_SAVED),
  formeoUpdated: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_UPDATED),
  formeoCleared: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_CLEARED),
  formeoOnRender: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_ON_RENDER),
  formeoConditionUpdated: (evt) => defaultCustomEvent(evt, EVENT_FORMEO_CONDITION_UPDATED)
};
const formeoUpdatedThrottled = throttle$1(() => {
  events.opts.onUpdate({
    timeStamp: window.performance.now(),
    type: EVENT_FORMEO_UPDATED,
    detail: components.formData
  });
}, ANIMATION_SPEED_FAST);
document.addEventListener(EVENT_FORMEO_UPDATED, formeoUpdatedThrottled);
document.addEventListener(EVENT_FORMEO_UPDATED_STAGE, (evt) => {
  const { timeStamp, type: type2, detail } = evt;
  events.opts.onUpdate({
    timeStamp,
    type: type2,
    detail
  });
});
document.addEventListener(EVENT_FORMEO_UPDATED_ROW, (evt) => {
  const { timeStamp, type: type2, detail } = evt;
  events.opts.onUpdate({
    timeStamp,
    type: type2,
    detail
  });
});
document.addEventListener(EVENT_FORMEO_UPDATED_COLUMN, (evt) => {
  const { timeStamp, type: type2, detail } = evt;
  events.opts.onUpdate({
    timeStamp,
    type: type2,
    detail
  });
});
document.addEventListener(EVENT_FORMEO_UPDATED_FIELD, (evt) => {
  const { timeStamp, type: type2, detail } = evt;
  events.opts.onUpdate({
    timeStamp,
    type: type2,
    detail
  });
});
document.addEventListener(EVENT_FORMEO_ON_RENDER, (evt) => {
  const { timeStamp, type: type2, detail } = evt;
  events.opts.onRender({
    timeStamp,
    type: type2,
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
document.addEventListener(EVENT_FORMEO_SAVED, ({ timeStamp, type: type2, detail: { formData } }) => {
  const evt = {
    timeStamp,
    type: type2,
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
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd$1(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}
var _setCacheAdd = setCacheAdd$1;
function setCacheHas$1(value) {
  return this.__data__.has(value);
}
var _setCacheHas = setCacheHas$1;
var MapCache = _MapCache, setCacheAdd = _setCacheAdd, setCacheHas = _setCacheHas;
function SetCache$1(values) {
  var index2 = -1, length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();
  while (++index2 < length) {
    this.add(values[index2]);
  }
}
SetCache$1.prototype.add = SetCache$1.prototype.push = setCacheAdd;
SetCache$1.prototype.has = setCacheHas;
var _SetCache = SetCache$1;
function arraySome$1(array, predicate) {
  var index2 = -1, length = array == null ? 0 : array.length;
  while (++index2 < length) {
    if (predicate(array[index2], index2, array)) {
      return true;
    }
  }
  return false;
}
var _arraySome = arraySome$1;
function cacheHas$1(cache, key) {
  return cache.has(key);
}
var _cacheHas = cacheHas$1;
var SetCache = _SetCache, arraySome = _arraySome, cacheHas = _cacheHas;
var COMPARE_PARTIAL_FLAG$3 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
function equalArrays$2(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index2 = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$1 ? new SetCache() : void 0;
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
var _equalArrays = equalArrays$2;
function mapToArray$1(map2) {
  var index2 = -1, result = Array(map2.size);
  map2.forEach(function(value, key) {
    result[++index2] = [key, value];
  });
  return result;
}
var _mapToArray = mapToArray$1;
function setToArray$1(set2) {
  var index2 = -1, result = Array(set2.size);
  set2.forEach(function(value) {
    result[++index2] = value;
  });
  return result;
}
var _setToArray = setToArray$1;
var Symbol$1 = _Symbol, Uint8Array2 = _Uint8Array, eq = eq_1, equalArrays$1 = _equalArrays, mapToArray = _mapToArray, setToArray = _setToArray;
var COMPARE_PARTIAL_FLAG$2 = 1, COMPARE_UNORDERED_FLAG = 2;
var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag$1 = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag$1 = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
var arrayBufferTag = "[object ArrayBuffer]", dataViewTag$1 = "[object DataView]";
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
function equalByTag$1(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$1:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
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
    case mapTag$1:
      var convert = mapToArray;
    case setTag$1:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2;
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
      var result = equalArrays$1(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}
var _equalByTag = equalByTag$1;
function arrayPush$1(array, values) {
  var index2 = -1, length = values.length, offset = array.length;
  while (++index2 < length) {
    array[offset + index2] = values[index2];
  }
  return array;
}
var _arrayPush = arrayPush$1;
var arrayPush = _arrayPush, isArray$1 = isArray_1;
function baseGetAllKeys$1(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray$1(object) ? result : arrayPush(result, symbolsFunc(object));
}
var _baseGetAllKeys = baseGetAllKeys$1;
function arrayFilter$1(array, predicate) {
  var index2 = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index2 < length) {
    var value = array[index2];
    if (predicate(value, index2, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
var _arrayFilter = arrayFilter$1;
function stubArray$1() {
  return [];
}
var stubArray_1 = stubArray$1;
var arrayFilter = _arrayFilter, stubArray = stubArray_1;
var objectProto$3 = Object.prototype;
var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols$1 = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};
var _getSymbols = getSymbols$1;
var overArg = _overArg;
var nativeKeys$1 = overArg(Object.keys, Object);
var _nativeKeys = nativeKeys$1;
var isPrototype = _isPrototype, nativeKeys = _nativeKeys;
var objectProto$2 = Object.prototype;
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
function baseKeys$1(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$2.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
var _baseKeys = baseKeys$1;
var arrayLikeKeys = _arrayLikeKeys, baseKeys = _baseKeys, isArrayLike = isArrayLike_1;
function keys$1(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}
var keys_1 = keys$1;
var baseGetAllKeys = _baseGetAllKeys, getSymbols = _getSymbols, keys = keys_1;
function getAllKeys$1(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}
var _getAllKeys = getAllKeys$1;
var getAllKeys = _getAllKeys;
var COMPARE_PARTIAL_FLAG$1 = 1;
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function equalObjects$1(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index2 = objLength;
  while (index2--) {
    var key = objProps[index2];
    if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
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
var _equalObjects = equalObjects$1;
var getNative$3 = _getNative, root$3 = _root;
var DataView$1 = getNative$3(root$3, "DataView");
var _DataView = DataView$1;
var getNative$2 = _getNative, root$2 = _root;
var Promise$2 = getNative$2(root$2, "Promise");
var _Promise = Promise$2;
var getNative$1 = _getNative, root$1 = _root;
var Set$2 = getNative$1(root$1, "Set");
var _Set = Set$2;
var getNative = _getNative, root = _root;
var WeakMap$1 = getNative(root, "WeakMap");
var _WeakMap = WeakMap$1;
var DataView = _DataView, Map$1 = _Map, Promise$1 = _Promise, Set$1 = _Set, WeakMap = _WeakMap, baseGetTag = _baseGetTag, toSource = _toSource;
var mapTag = "[object Map]", objectTag$1 = "[object Object]", promiseTag = "[object Promise]", setTag = "[object Set]", weakMapTag = "[object WeakMap]";
var dataViewTag = "[object DataView]";
var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map$1), promiseCtorString = toSource(Promise$1), setCtorString = toSource(Set$1), weakMapCtorString = toSource(WeakMap);
var getTag$1 = baseGetTag;
if (DataView && getTag$1(new DataView(new ArrayBuffer(1))) != dataViewTag || Map$1 && getTag$1(new Map$1()) != mapTag || Promise$1 && getTag$1(Promise$1.resolve()) != promiseTag || Set$1 && getTag$1(new Set$1()) != setTag || WeakMap && getTag$1(new WeakMap()) != weakMapTag) {
  getTag$1 = function(value) {
    var result = baseGetTag(value), Ctor = result == objectTag$1 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
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
var _getTag = getTag$1;
var Stack = _Stack, equalArrays = _equalArrays, equalByTag = _equalByTag, equalObjects = _equalObjects, getTag = _getTag, isArray = isArray_1, isBuffer = isBufferExports, isTypedArray = isTypedArray_1;
var COMPARE_PARTIAL_FLAG = 1;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseIsEqualDeep$1(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;
  var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
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
var _baseIsEqualDeep = baseIsEqualDeep$1;
var baseIsEqualDeep = _baseIsEqualDeep, isObjectLike = isObjectLike_1;
function baseIsEqual$1(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$1, stack);
}
var _baseIsEqual = baseIsEqual$1;
var baseIsEqual = _baseIsEqual;
function isEqual(value, other) {
  return baseIsEqual(value, other);
}
var isEqual_1 = isEqual;
const isEqual$1 = /* @__PURE__ */ getDefaultExportFromCjs(isEqual_1);
class Data {
  constructor(name2, data = /* @__PURE__ */ Object.create(null)) {
    __publicField(this, "toJSON", (data, format) => JSON.stringify(data, null, format));
    __publicField(this, "get", (path) => get(this.data, path));
    __publicField(this, "getChangeType", (oldVal, newVal) => {
      const change = CHANGE_TYPES.find(({ condition }) => condition(oldVal, newVal)) || { type: "unknown" };
      change.desc = change.type === "added" ? `${oldVal} to ${newVal}` : newVal;
      return change;
    });
    __publicField(this, "add", (id, data = /* @__PURE__ */ Object.create(null)) => {
      const { id: dataId } = data;
      const elemId = id || dataId || uuid();
      return this.set(elemId, data);
    });
    __publicField(this, "remove", (path) => {
      const delPath = path.split(".");
      const delItem = delPath.pop();
      const parent = this.get(delPath);
      if (Array.isArray(parent)) {
        parent.splice(Number(delItem), 1);
      } else if (parent) {
        delete parent[delItem];
      }
      return parent;
    });
    __publicField(this, "getData", () => {
      return Object.entries(this.data).reduce((acc, [key, val]) => {
        acc[key] = (val == null ? void 0 : val.data) ? val.getData() : val;
        return acc;
      }, {});
    });
    __publicField(this, "setCallbacks", {});
    __publicField(this, "configVal", /* @__PURE__ */ Object.create(null));
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
  set(path, newVal) {
    const oldVal = get(this.data, path);
    if (isEqual$1(oldVal, newVal)) {
      return this.data;
    }
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
      const change = this.getChangeType(oldVal, newVal);
      const evtData = {
        entity: this,
        dataPath: this.dataPath.replace(/\.+$/, ""),
        changePath: this.dataPath + path,
        value: newVal,
        data,
        change: `${change.type}: ${change.desc}`,
        src: this.dom
      };
      if (oldVal) {
        evtData.previousValue = oldVal;
      }
      events.formeoUpdated(evtData);
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
  empty() {
    this.data = /* @__PURE__ */ Object.create(null);
  }
}
/**!
 * Sortable 1.15.3
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */
function ownKeys(object, enumerableOnly) {
  var keys2 = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys2.push.apply(keys2, symbols);
  }
  return keys2;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
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
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
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
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
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
    var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
    if (iterator) {
      for (; i < n; i++) {
        iterator(list[i], i);
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
  var currentChild = 0, i = 0, children = el.children;
  while (i < children.length) {
    if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
      if (currentChild === childNum) {
        return children[i];
      }
      currentChild++;
    }
    i++;
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
function index$6(el, selector) {
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
  for (var i in arr) {
    if (!arr.hasOwnProperty(i)) continue;
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
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
var defaults$2 = {
  initializeByDefault: true
};
var PluginManager = {
  mount: function mount(plugin) {
    for (var option2 in defaults$2) {
      if (defaults$2.hasOwnProperty(option2) && !(option2 in plugin)) {
        plugin[option2] = defaults$2[option2];
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
var documentExists = typeof document !== "undefined", PositionGhostAbsolutely = IOS, CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float", supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div"), supportCssPointerEvents = function() {
  if (!documentExists) return;
  if (IE11OrLess) {
    return false;
  }
  var el = document.createElement("x");
  el.style.cssText = "pointer-events:auto";
  return el.style.pointerEvents === "auto";
}(), _detectDirection = function _detectDirection2(el, options) {
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
      for (var i in evt) {
        if (evt.hasOwnProperty(i)) {
          event[i] = evt[i];
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
    var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type2 = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
    _saveInputCheckedState(el);
    if (dragEl) {
      return;
    }
    if (/mousedown|pointerdown/.test(type2) && evt.button !== 0 || options.disabled) {
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
    oldIndex = index$6(target);
    oldDraggableIndex = index$6(target, options.draggable);
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
  _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
    var touch = e.touches ? e.touches[0] : e;
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
      newIndex = index$6(dragEl);
      newDraggableIndex = index$6(dragEl, options.draggable);
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
          var dragIndex = index$6(dragEl);
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
    newIndex = index$6(dragEl);
    newDraggableIndex = index$6(dragEl, options.draggable);
    pluginEvent2("drop", this, {
      evt
    });
    parentEl = dragEl && dragEl.parentNode;
    newIndex = index$6(dragEl);
    newDraggableIndex = index$6(dragEl, options.draggable);
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
    var order = [], el, children = this.el.children, i = 0, n = children.length, options = this.options;
    for (; i < n; i++) {
      el = children[i];
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
    this.toArray().forEach(function(id, i) {
      var el = rootEl2.children[i];
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
  if (index$6(dragEl) < index$6(target)) {
    return 1;
  } else {
    return -1;
  }
}
function _generateId(el) {
  var str = el.tagName + el.className + el.src + el.href + el.textContent, i = str.length, sum = 0;
  while (i--) {
    sum += str.charCodeAt(i);
  }
  return sum.toString(36);
}
function _saveInputCheckedState(root2) {
  savedInputChecked.length = 0;
  var inputs = root2.getElementsByTagName("input");
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
  index: index$6,
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
      for (var i = 0; i <= layersOut; i++) {
        if (!autoScrolls[i]) {
          autoScrolls[i] = {};
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
      evt.template = CONDITION_TEMPLATE();
      return actions.opts.add.condition(evt);
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
const defaults$1 = Object.freeze({
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
    __publicField(this, "toggleTabbedLayout", () => {
      this.getPanelDisplay();
      const isTabbed = this.isTabbed;
      this.panelsWrap.parentElement.classList.toggle("tabbed-panels", isTabbed);
      if (isTabbed) {
        this.panelNav.removeAttribute("style");
      }
      return isTabbed;
    });
    /**
     * Resize the panel after its contents change in height
     * @return {String} panel's height in pixels
     */
    __publicField(this, "resizePanels", () => {
      this.toggleTabbedLayout();
      const panelStyle = this.panelsWrap.style;
      const activePanelHeight = dom.getStyle(this.currentPanel, "height");
      panelStyle.height = activePanelHeight;
      return activePanelHeight;
    });
    this.opts = merge(defaults$1, options);
    this.panelDisplay = this.opts.displayType;
    this.activePanelIndex = 0;
    this.panelNav = this.createPanelNav();
    const panelsWrap = this.createPanelsWrap();
    this.nav = this.navActions();
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
    const width = Number.parseInt(dom.getStyle(column, "width"));
    const autoDisplayType = width > 390 ? "tabbed" : "slider";
    const isAuto = this.opts.displayType === "auto";
    this.panelDisplay = isAuto ? autoDisplayType : this.opts.displayType || defaults$1.displayType;
    return this.panelDisplay;
  }
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
          const index2 = indexOfNode(evt.target, evt.target.parentElement);
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
        click: (e) => this.nav.nextGroup(e)
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
        click: (e) => this.nav.prevGroup(e)
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
    this.activePanelIndex = indexOfNode(this.currentPanel, groupParent);
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
        this.panelsWrap.style.height = dom.getStyle(this.currentPanel, "height");
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
const toTitleCaseLowers = "a an and as at but by for for from in into near nor of on onto or the to with".split(" ").map((lower) => `\\s${lower}\\s`);
const toTitleCaseRegex = new RegExp(
  `(?!${toTitleCaseLowers.join("|")})\\w\\S*`,
  "g"
);
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
const BASE_NAME = "f-autocomplete";
const HIGHLIGHT_CLASS_NAME = "highlight-component";
const labelCount = (arr, label) => {
  const count = arr.reduce((n, x) => n + (x === label), 0);
  return count > 1 ? `(${count})` : "";
};
const getComponentLabel = ({ name: name2, id, ...component }) => {
  const labelPaths = ["config.label", "config.controlId", "meta.id", "attrs.id"];
  const label = labelPaths.reduce((acc, cur) => {
    if (!acc) {
      return component.get(cur);
    }
    return acc;
  }, null);
  const externalLabel = (...externalAddress) => mi18n.get(externalAddress.join(".")) || toTitleCase(externalAddress.join(" "));
  return label || name2 === "external" && externalLabel(name2, id);
};
const makeOption = ({ id, textLabel, htmlLabel, selectedId }) => {
  const option2 = {
    value: id,
    textLabel,
    htmlLabel
  };
  if (id === selectedId) {
    option2.selected = true;
  }
  return option2;
};
const componentOptions = (selectedId) => {
  const labels = [];
  const flatList = components.flatList();
  const options = Object.entries(flatList).map(([id, component]) => {
    const label = getComponentLabel(component);
    if (label) {
      const typeConfig = {
        tag: "span",
        content: ` ${toTitleCase(component.name)}`,
        className: "component-type"
      };
      const labelKey = `${component.name}.${label}`;
      labels.push(labelKey);
      const count = labelCount(labels, labelKey);
      const countConfig = {
        tag: "span",
        content: count,
        className: "component-label-count"
      };
      const htmlLabel = [`${label} `, countConfig, typeConfig];
      const textLabel = [label, count].join(" ").trim();
      return makeOption({ id, textLabel, htmlLabel, selectedId });
    }
  });
  return options.filter(Boolean);
};
class Autocomplete {
  /**
   * Create an Autocomplete instance
   * @param {String} key - The key for the autocomplete instance
   * @param {String} value - The initial value for the autocomplete input
   * @param {String} i18nKey - The internationalization key for the autocomplete
   */
  constructor(key, value, i18nKey) {
    __publicField(this, "lastCache", Date.now());
    __publicField(this, "optionsCache", null);
    this.key = key;
    this.className = key.replace(/\./g, "-");
    this.value = value;
    this.events = [];
    this.i18nKey = i18nKey;
    this.build();
  }
  /**
   * build a text DOM element, supporting other jquery text form-control's
   * @return {Object} DOM Element to be injected into the form.
   */
  build() {
    const keyboardNav = (e) => {
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
            e.preventDefault();
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
      let direction = keyCodeMap.get(e.keyCode);
      if (!direction) {
        direction = () => false;
      }
      return direction();
    };
    const autoCompleteInputActions = {
      focus: ({ target }) => {
        this.updateOptions();
        target.parentElement.classList.add(`${this.className}-focused`);
        const filteredOptions = dom.toggleElementsByStr(this.list.querySelectorAll("li"), target.value);
        target.addEventListener("keydown", keyboardNav);
        const selectedOption = this.list.querySelector(".active-option") || filteredOptions[0];
        this.showList(selectedOption);
      },
      blur: ({ target }) => {
        target.parentElement.classList.remove(`${this.className}-focused`);
        target.removeEventListener("keydown", keyboardNav);
        this.hideList();
      },
      input: (evt) => {
        const filteredOptions = dom.toggleElementsByStr(this.list.querySelectorAll("li"), evt.target.value);
        if (evt.target.value.length === 0) {
          this.clearValue();
        }
        if (filteredOptions.length === 0) {
          this.hideList();
        } else {
          const activeOption = this.getActiveOption() || filteredOptions[0];
          this.showList(activeOption);
        }
        const value = evt.target.value.trim();
        this.hiddenField.value = value;
        this.value = value;
        this.setValue({ dataset: { label: value, value } });
      }
    };
    this.displayField = dom.create({
      tag: "input",
      autocomplete: "off",
      action: autoCompleteInputActions,
      attrs: {
        type: "text",
        className: `${BASE_NAME}-display-field`,
        value: this.label || this.value,
        placeholder: mi18n.get(`${this.i18nKey}.${this.key}.placeholder`)
      }
    });
    this.hiddenField = dom.create({
      tag: "input",
      attrs: { type: "hidden", className: this.className, value: this.value }
    });
    this.list = dom.create({
      tag: "ul",
      attrs: { className: `${BASE_NAME}-list` }
    });
    this.dom = dom.create({
      children: [this.displayField, this.hiddenField],
      className: this.className,
      action: {
        onRender: (element) => {
          this.stage = element.closest(".formeo-stage");
          const component = this.value && components.getAddress(this.value);
          this.label = component && getComponentLabel(component);
          if (this.label) {
            this.displayField.value = this.label;
          }
        }
      }
    });
    return this.dom;
  }
  updateOptions() {
    let options = this.optionsCache;
    const now = Date.now();
    if (!options || now - this.lastCache > ANIMATION_SPEED_SLOW * 10) {
      dom.empty(this.list);
      options = this.generateOptions();
      this.lastCache = now;
    }
    if (!this.list.children.length) {
      this.list.append(...options);
    }
  }
  generateOptions() {
    const options = componentOptions();
    const realTarget = (target) => {
      const targetClass = `${BASE_NAME}-list-item`;
      if (!target.classList.contains(targetClass)) {
        target = target.parentElement;
      }
      return target;
    };
    this.optionsCache = options.map((optionData) => {
      const { value, textLabel, htmlLabel } = optionData;
      const optionConfig = {
        tag: "li",
        children: htmlLabel,
        dataset: {
          value,
          label: textLabel
        },
        className: `${BASE_NAME}-list-item`,
        action: {
          mousedown: ({ target }) => {
            target = realTarget(target);
            this.setValue(target);
            this.selectOption(target);
            this.hideList();
          },
          mouseover: ({ target }) => {
            target = realTarget(target);
            this.removeHighlight();
            this.highlightComponent(target);
          }
        }
      };
      return dom.create(optionConfig);
    });
    return this.optionsCache;
  }
  setListPosition() {
    const { offsetHeight, offsetWidth } = this.displayField;
    const containerRect = this.displayField.closest(".formeo-stage").getBoundingClientRect();
    const triggerRect = this.displayField.getBoundingClientRect();
    const listStyle = {
      position: "absolute",
      top: `${triggerRect.y + offsetHeight + window.scrollY - containerRect.y}px`,
      left: `${triggerRect.x + window.scrollX - containerRect.x}px`,
      width: `${offsetWidth + 1}px`
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
    if ((activeOption == null ? void 0 : activeOption.style.display) !== "none") {
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
    var _a;
    const options = list.querySelectorAll("li");
    for (const option2 of options) {
      const {
        dataset: { value }
      } = option2;
      option2.classList.remove("active-option");
      if (value) {
        const component = components.getAddress(value);
        (_a = component.dom) == null ? void 0 : _a.classList.remove(HIGHLIGHT_CLASS_NAME);
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
    const highlightedComponents = document.getElementsByClassName(HIGHLIGHT_CLASS_NAME);
    for (const component of highlightedComponents) {
      component.classList.remove(HIGHLIGHT_CLASS_NAME);
    }
  }
  /**
   * Highlight a component that maps to the option
   */
  highlightComponent(option2) {
    var _a;
    const {
      dataset: { value }
    } = option2;
    if (value) {
      const component = components.getAddress(value);
      (_a = component.dom) == null ? void 0 : _a.classList.add(HIGHLIGHT_CLASS_NAME);
    }
  }
  /**
   * Clears the autocomplete values and fires onChange event
   */
  clearValue() {
    this.selectOption(null);
    this.displayField.value = "";
    this.hiddenField.value = "";
    this.value = "";
    this.runEvent("onChange", { target: this.hiddenField });
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
    this.runEvent("onChange", { target: this.hiddenField });
  }
  addEvent(key, event) {
    this.events.push([key, event]);
  }
  runEvent(eventName, evt) {
    for (const [key, event] of this.events) {
      if (key === eventName) {
        event(evt);
      }
    }
  }
}
const getOptionData = (key) => {
  const isExternal = isExternalAddress(key);
  const optionDataMap = {
    "field.property": FIELD_PROPERTY_MAP,
    ...OPERATORS
  };
  const externalOptionData = (address) => components.getAddress(address).getData();
  const data = isExternal ? externalOptionData(key) : optionDataMap[key];
  return Object.keys(data).reduce((acc, cur) => {
    acc[cur] = cur;
    return acc;
  }, {});
};
const createOptions = (fieldVal, selected) => {
  const data = getOptionData(fieldVal);
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (key !== "id") {
      const option2 = {
        tag: "option",
        content: mi18n.get(`${fieldVal}.${key}`) || key.toLowerCase(),
        attrs: {
          value
        }
      };
      if (selected === value) {
        option2.attrs.selected = true;
      }
      acc.push(dom.create(option2));
    }
    return acc;
  }, []);
};
const addOptions = (select, options) => {
  dom.empty(select);
  for (const option2 of options) {
    select.add(option2);
  }
};
const inputConfigBase = ({ key, value, type: type2 = "text", checked }) => {
  const config2 = {
    tag: "input",
    attrs: {
      type: type2,
      value,
      placeholder: mi18n.get(`${key}.placeholder`) || toTitleCase(key)
    },
    className: key.replace(/\./g, "-"),
    config: {}
  };
  if (checked) {
    config2.attrs.checked = true;
  }
  return config2;
};
const labelHelper = (key) => {
  const labelText = mi18n.get(key);
  if (labelText) {
    return labelText;
  }
  const splitKey = key.split(".");
  return mi18n.get(splitKey[splitKey.length - 1]);
};
const ITEM_INPUT_TYPE_MAP = {
  autocomplete: (key, val, type2) => new Autocomplete(key, val, type2),
  string: (key, val) => inputConfigBase({ key, value: val }),
  boolean: (key, val) => {
    const type2 = key === "selected" ? "radio" : "checkbox";
    return inputConfigBase({ key, value: val, type: type2, checked: val });
  },
  number: (key, val) => inputConfigBase({ key, value: val, type: "number" }),
  array: (key, vals = []) => {
    return {
      tag: "select",
      attrs: {
        placeholder: labelHelper(`placeholder.${key}`)
      },
      className: key.replace(/\./g, "-"),
      options: vals
    };
  },
  object: (val) => {
    return Object.entries(val).map(([key, val2]) => {
      return ITEM_INPUT_TYPE_MAP[dom.childType(val2)](key, val2);
    });
  }
};
const INPUT_ORDER = ["selected", "checked"];
const INPUT_TYPE_ACTION = {
  boolean: (dataKey, field) => ({
    click: ({ target: { checked } }) => {
      var _a, _b;
      if (((_b = (_a = field.data) == null ? void 0 : _a.attrs) == null ? void 0 : _b.type) === "radio") {
        field.set(
          "options",
          field.data.options.map((option2) => ({ ...option2, selected: false }))
        );
      }
      field.set(dataKey, checked);
    }
  }),
  string: (dataKey, field) => ({
    input: ({ target: { value } }) => {
      field.set(dataKey, value);
    }
  }),
  number: (dataKey, field) => ({
    input: ({ target: { value } }) => {
      field.set(dataKey, Number(value));
    }
  }),
  array: (dataKey, field) => ({
    change: ({ target: { value } }) => {
      field.set(dataKey, value);
    }
  }),
  object: () => ({})
};
class EditPanelItem {
  /**
   * Set defaults and load panelData
   * @param  {String} itemKey attribute name or options index
   * @param  {Object} itemData existing field ID
   * @param  {String} field
   * @return {Object} field object
   */
  constructor({ key, data, index: index2, field }) {
    __publicField(this, "generateConditionFields", (type2, vals) => {
      const label = {
        tag: "label",
        className: `condition-label ${type2}-condition-label`,
        content: mi18n.get(type2) || type2
      };
      return vals.map((condition, i) => {
        const conditionState = [];
        const fields2 = Object.entries(condition).map(([key, val]) => {
          const field = this.conditionInput(key, val, type2, i);
          field && conditionState.push([field.className, val.trim()].filter(Boolean).join("-"));
          return field;
        }).filter(Boolean);
        const orderedFields = orderObjectsBy(
          fields2,
          CONDITION_INPUT_ORDER.map((fieldName) => `condition-${fieldName}`),
          "className||dom.className"
        );
        this.processConditionUIState(orderedFields);
        if (!i) {
          orderedFields.unshift(label);
        }
        this.itemFieldGroups.push(orderedFields);
        return {
          children: orderedFields,
          className: `f-condition-row ${type2}-condition-row ${conditionState.join(" ")}`
        };
      });
    });
    __publicField(this, "processConditionUIState", (fields2) => {
      const findFields = (classNames) => {
        classNames = classNames.split("|");
        return fields2.filter((field) => classNames.includes(field.className));
      };
      const hideFields = (fields3) => {
        fields3 = Array.isArray(fields3) ? fields3 : [fields3];
        const hideFieldsTimeout = setTimeout(() => {
          fields3.forEach((field) => {
            if (field.dom) {
              field = field.dom;
            }
            field.style.display = "none";
          });
          clearTimeout(hideFieldsTimeout);
        }, ANIMATION_SPEED_BASE);
      };
      const showFields = (fields3) => {
        fields3 = Array.isArray(fields3) ? fields3 : [fields3];
        const showFieldsTimeout = setTimeout(() => {
          fields3.forEach((field) => {
            if (field.dom) {
              field = field.dom;
            }
            field.removeAttribute("style");
          });
          clearTimeout(showFieldsTimeout);
        }, ANIMATION_SPEED_BASE);
      };
      const actions2 = /* @__PURE__ */ new Map([
        [
          "condition-source",
          (field) => {
            const foundFields = findFields("condition-sourceProperty");
            const sourceProperty = foundFields[0];
            const key = isExternalAddress(field.value) ? field.value : "field.property";
            const externalProperties = createOptions(key, sourceProperty.value);
            addOptions(sourceProperty, externalProperties);
            if (field.value) {
              return showFields(foundFields);
            }
            return hideFields(foundFields);
          }
        ],
        [
          "condition-target",
          (field) => {
            const foundFields = findFields("condition-targetProperty");
            if (isAddress(field.value) && field.value) {
              return showFields(foundFields);
            }
            return hideFields(foundFields);
          }
        ],
        [
          "condition-sourceProperty",
          (field) => {
            const foundFields = findFields("condition-comparison|condition-targetProperty|condition-target");
            const val = field.value;
            const key = val.substring(val.lastIndexOf(".") + 1, val.length);
            if (!isBoolKey(key)) {
              return showFields(foundFields);
            }
            return hideFields(foundFields);
          }
        ]
      ]);
      for (const field of fields2) {
        const action = actions2.get(field.className);
        if (action) {
          action(field);
        }
      }
    });
    __publicField(this, "conditionInput", (key, val, conditionType, i) => {
      const field = this.field;
      const conditionPath = `${this.itemKey}.${conditionType}.${i}`;
      const conditionAddress = `${this.field.id}.${conditionPath}`;
      const dataPath = `${field.name}s.${conditionAddress}.${key}`;
      const createConditionSelect = (key2, propertyValue, i18nKey) => {
        const options = createOptions(i18nKey || key2, propertyValue);
        const propertyFieldConfig = ITEM_INPUT_TYPE_MAP.array(`condition.${key2}`);
        propertyFieldConfig.action = {
          change: conditionChangeAction,
          onRender: (elem) => conditionChangeAction({ target: elem })
        };
        const field2 = dom.create(propertyFieldConfig);
        addOptions(field2, options);
        return field2;
      };
      const conditionChangeAction = ({ target }) => {
        const conditionRow = target.closest(".f-condition-row");
        const regex = new RegExp(`${target.className}(?:\\S?)+`, "gm");
        conditionRow.className = conditionRow.className.replace(regex, "");
        const evtData = {
          dataPath,
          value: target.value,
          src: target
        };
        events.formeoUpdated(evtData);
        components.setAddress(dataPath, target.value);
        const rowIndex = indexOfNode(conditionRow);
        this.processConditionUIState(this.itemFieldGroups[rowIndex]);
      };
      const segmentTypes = {
        comparison: (value) => createConditionSelect("comparison", value),
        logical: (value) => createConditionSelect("logical", value),
        source: (value, type2 = "source") => {
          const componentInput = ITEM_INPUT_TYPE_MAP.autocomplete(`condition.${type2}`, value, conditionType);
          components.setConditionMap(value, field);
          componentInput.addEvent("onChange", (evt) => {
            components.removeConditionMap(components.getAddress(dataPath));
            conditionChangeAction(evt);
            components.setConditionMap(evt.target.value, field);
          });
          return componentInput;
        },
        sourceProperty: (value) => createConditionSelect("sourceProperty", value, "field.property"),
        targetProperty: (value) => createConditionSelect("targetProperty", value, "field.property"),
        target: (value) => segmentTypes.source(value, "target"),
        value: (value) => {
          const valueField = ITEM_INPUT_TYPE_MAP.string("condition.value", value);
          valueField.action = {
            input: conditionChangeAction
          };
          return dom.create(valueField);
        },
        assignment: (value) => createConditionSelect("assignment", value)
      };
      const conditionField = segmentTypes[key];
      if (conditionField) {
        return segmentTypes[key](val);
      }
      console.error(`${key}: invalid condition attribute`);
    });
    this.itemValues = orderObjectsBy(Object.entries(data), INPUT_ORDER, "0");
    const [panelName, item] = key.split(".");
    this.field = field;
    this.itemKey = key;
    this.itemIndex = index2;
    this.panelName = panelName;
    this.isDisabled = field.isDisabledProp(item, panelName);
    this.isHidden = this.isDisabled && field.config.panels[panelName].hideDisabled;
    this.isLocked = field.isLockedProp(item, panelName);
    this.dom = dom.create({
      tag: "li",
      className: [`field-${key.replace(/\./g, "-")}`, "prop-wrap", this.isHidden && "hidden-property"],
      children: { className: "field-prop", children: [this.itemInputs, this.itemControls] }
    });
  }
  get itemInputs() {
    this.itemFieldGroups = [];
    const inputs = {
      className: `${this.panelName}-prop-inputs prop-inputs f-input-group`,
      children: this.itemValues.map(([key, val]) => {
        let inputConfig = this.panelName === "conditions" ? this.generateConditionFields(key, val) : this.itemInput(key, val);
        if (["selected", "checked"].includes(key)) {
          inputConfig = {
            className: "f-addon",
            children: inputConfig
          };
        }
        return inputConfig;
      })
    };
    return inputs;
  }
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
          animate.slideUp(this.dom, 250, (elem) => {
            this.field.remove(this.itemKey);
            dom.remove(elem);
            this.field.resizePanelWrap();
          });
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
  itemInput(key, val) {
    const valType = dom.childType(val) || "string";
    const inputTypeConfig = { ...{ config: {}, attrs: {} }, ...ITEM_INPUT_TYPE_MAP[valType](key, val) };
    const dataKey = this.itemKey.replace(/.\d+$/, (index2) => `${index2}.${key}`);
    const labelKey = dataKey.split(".").filter(Number.isNaN).join(".") || key;
    const [id, name2] = [[...this.itemKey.split("."), key], [key]].map(
      (attrVars) => [this.field.id, ...attrVars].filter(Boolean).join("-")
    );
    inputTypeConfig.config = {
      ...inputTypeConfig.config,
      ...{
        label: this.panelName !== "options" && (labelHelper(labelKey) || toTitleCase(labelKey)),
        labelAfter: false
      }
    };
    inputTypeConfig.attrs = {
      ...inputTypeConfig.attrs,
      ...{
        name: inputTypeConfig.attrs.type === "checkbox" ? `${name2}[]` : name2,
        id,
        disabled: this.isDisabled,
        locked: this.isLocked
      }
    };
    inputTypeConfig.action = {
      ...INPUT_TYPE_ACTION[valType](dataKey, this.field)
    };
    return inputTypeConfig;
  }
}
class EditPanel {
  /**
   * Set defaults and load panelData
   * @param  {Object} panelData existing field ID
   * @param  {String} panelName name of panel
   * @param  {String} field
   * @return {Object} field object
   */
  constructor(panelData, panelName, field) {
    /**
     * Add a new attribute to the attrs panels
     * @param {String} attr
     * @param {String|Array} val
     */
    __publicField(this, "addAttribute", (attr, valArg) => {
      let val = valArg;
      const safeAttr = slugify(attr);
      const itemKey = `attrs.${safeAttr}`;
      if (!mi18n.current[itemKey]) {
        mi18n.put(itemKey, capitalize(attr));
      }
      if (typeof val === "string" && ["true", "false"].includes(val)) {
        val = JSON.parse(val);
      }
      this.field.set(`attrs.${attr}`, val);
      const existingAttr = this.props.querySelector(`.field-attrs-${safeAttr}`);
      const newAttr = new EditPanelItem({ key: itemKey, data: { [safeAttr]: val }, field: this.field });
      if (existingAttr) {
        this.props.replaceChild(newAttr.dom, existingAttr);
      } else {
        this.props.appendChild(newAttr.dom);
      }
      this.field.resizePanelWrap();
    });
    /**
     * Add option to options panel
     */
    __publicField(this, "addOption", () => {
      const controlId = this.field.data.config.controlId;
      const fieldOptionData = this.field.get("options");
      const type2 = controlId === "select" ? "option" : controlId;
      const newOptionLabel = mi18n.get("newOptionLabel", { type: type2 }) || "New Option";
      const itemKey = `options.${this.data.length}`;
      const lastOptionData = fieldOptionData[fieldOptionData.length - 1];
      const optionTemplate = fieldOptionData.length ? lastOptionData : {};
      const itemData = { ...optionTemplate, label: newOptionLabel };
      if (controlId !== "button") {
        itemData.value = slugify(newOptionLabel);
      }
      const newOption = new EditPanelItem({
        key: itemKey,
        data: itemData,
        field: this.field,
        index: this.props.children.length
      });
      this.editPanelItems.push(newOption);
      this.props.appendChild(newOption.dom);
      this.field.set(itemKey, itemData);
      this.field.resizePanelWrap();
    });
    __publicField(this, "addCondition", (evt) => {
      const currentConditions = this.field.get("conditions");
      const itemKey = `conditions.${currentConditions.length}`;
      const existingCondition = this.props.querySelector(`.field-${itemKey.replace(".", "-")}`);
      const newCondition = new EditPanelItem({ key: itemKey, data: evt.template, field: this.field });
      if (existingCondition) {
        this.props.replaceChild(newCondition.dom, existingCondition);
      } else {
        this.props.appendChild(newCondition.dom);
      }
      this.field.set(itemKey, evt.template);
      this.field.resizePanelWrap();
    });
    this.type = dom.childType(panelData);
    this.data = this.type === "object" ? Object.entries(panelData) : panelData;
    this.name = panelName;
    this.field = field;
    this.panelConfig = this.getPanelConfig(this.data);
  }
  getPanelConfig(data) {
    this.props = this.createProps(data);
    this.editButtons = this.createEditButtons();
    return {
      id: `${this.field.id}-${this.name}-panel`,
      config: {
        label: mi18n.get(`panel.label.${this.name}`)
      },
      attrs: {
        className: `f-panel ${this.name}-panel`
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
  createProps(data) {
    this.editPanelItems = Array.from(data).map((dataVal, index2) => {
      const isArray2 = this.type === "array";
      const itemKey = [this.name, isArray2 ? String(index2) : dataVal[0]].join(".");
      const itemData = isArray2 ? dataVal : { [dataVal[0]]: dataVal[1] };
      return new EditPanelItem({ key: itemKey, data: itemData, field: this.field });
    });
    const editGroupConfig = {
      tag: "ul",
      attrs: {
        className: ["field-edit-group", `field-edit-${this.name}`]
      },
      editGroup: this.name,
      isSortable: this.name === "options",
      content: this.editPanelItems
    };
    return dom.create(editGroupConfig);
  }
  /**
   * Generate edit buttons for interacting with attrs and options panel
   * @return {Object} panel edit buttons config
   */
  createEditButtons() {
    const _this = this;
    const type2 = this.name;
    const btnTitle = mi18n.get(`panelEditButtons.${type2}`);
    const addActions = {
      attrs: _this.addAttribute,
      options: _this.addOption,
      conditions: _this.addCondition
    };
    const addBtn = {
      ...dom.btnTemplate({ content: btnTitle, title: btnTitle }),
      className: `add-${type2}`,
      action: {
        click: (evt) => {
          const addEvt = {
            btnCoords: dom.coords(evt.target),
            addAction: addActions[type2]
          };
          if (type2 === "attrs") {
            addEvt.isDisabled = _this.field.isDisabledProp;
            addEvt.isLocked = _this.field.isLockedProp;
            addEvt.message = {
              attr: mi18n.get(`action.add.${type2}.attr`),
              value: mi18n.get(`action.add.${type2}.value`)
            };
          }
          const eventType = toTitleCase(type2);
          const customEvt = new window.CustomEvent(`onAdd${eventType}`, {
            detail: addEvt
          });
          actions.add[type2](addEvt);
          document.dispatchEvent(customEvt);
        }
      }
    };
    const panelEditButtons = {
      className: "panel-action-buttons",
      content: [addBtn]
    };
    return panelEditButtons;
  }
}
class Component extends Data {
  constructor(name2, dataArg = {}, render) {
    const data = { ...dataArg, id: dataArg.id || uuid() };
    super(name2, data);
    __publicField(this, "mutationHandler", (mutations) => mutations.map((mutation) => {
    }));
    __publicField(this, "remove", (path) => {
      if (path) {
        const delPath = path.split(".");
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
      forEach(children, (child) => child.remove());
      this.dom.parentElement.removeChild(this.dom);
      remove(components.getAddress(`${parent.name}s.${parent.id}.children`), this.id);
      if (!parent.children.length) {
        parent.emptyClass();
      }
      if (parent.name === "row") {
        parent.autoColumnWidths();
      }
      return components[`${this.name}s`].delete(this.id);
    });
    /**
     * Apply empty class to element if does not have children
     */
    __publicField(this, "emptyClass", () => this.dom.classList.toggle("empty", !this.children.length));
    __publicField(this, "getComponentTag", () => {
      return dom.create({
        tag: "span",
        className: ["component-tag", `${this.name}-tag`],
        children: [
          (this.isColumn || this.isField) && dom.icon("component-corner", { className: "bottom-left" }),
          dom.icon(`handle-${this.name}`),
          toTitleCase(this.name),
          (this.isColumn || this.isRow) && dom.icon("component-corner", { className: "bottom-right" })
        ].filter(Boolean)
      });
    });
    /**
     * Removes a class or classes from nodeList
     * @param  {String | Array} className
     */
    __publicField(this, "removeClasses", (className) => {
      const removeClass = {
        string: () => this.dom.classList.remove(className),
        array: () => className.map((name2) => this.dom.classList.remove(name2))
      };
      removeClass.object = removeClass.string;
      return removeClass[dom.childType(className)](this.dom);
    });
    __publicField(this, "loadChildren", (children = this.data.children) => children.map((rowId) => this.addChild({ id: rowId })));
    /**
     * Updates the children order for the current component
     */
    __publicField(this, "saveChildOrder", () => {
      if (this.render) {
        return;
      }
      const newChildOrder = this.children.map(({ id }) => id);
      this.set("children", newChildOrder);
      return newChildOrder;
    });
    /**
     * Save updated child order
     * @return {Array} updated child order
     */
    __publicField(this, "onSort", () => {
      return this.saveChildOrder();
    });
    /**
     * Callback for when dragging ends
     * @param  {Object} evt
     */
    __publicField(this, "onEnd", ({ to: { parentElement: to }, from: { parentElement: from } }) => {
      to == null ? void 0 : to.classList.remove(`hovering-${componentType(to)}`);
      from == null ? void 0 : from.classList.remove(`hovering-${componentType(from)}`);
    });
    __publicField(this, "runConditions", () => {
      const conditionsList = this.get("conditions");
      if (!(conditionsList == null ? void 0 : conditionsList.length)) {
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
    });
    __publicField(this, "value", (path, val) => {
      const splitPath = path.split(".");
      const component = this.getComponent(path);
      const property = component && splitPath.slice(2, splitPath.length).join(".");
      if ([!component, !property, !FIELD_PROPERTY_MAP[property]].some(Boolean)) {
        return path;
      }
      return val ? component.set(FIELD_PROPERTY_MAP[property], val) : component.get(FIELD_PROPERTY_MAP[property]);
    });
    /**
     * Maps operators to their respective handler
     * @param {String} operator
     * @return {Function} action
     */
    __publicField(this, "getResult", (operator) => {
      const operatorMap = {
        "=": (target, propertyPath, value) => target.set(propertyPath, value)
      };
      return operatorMap[operator];
    });
    __publicField(this, "processResults", (results) => {
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
    });
    __publicField(this, "execResults", (results) => {
      const promises = results.map((result) => {
        return this.execResult(result);
      });
      return Promise.all(promises);
    });
    __publicField(this, "execResult", ({ target, action, value, propertyPath }) => {
      return new Promise((resolve2, reject) => {
        try {
          return resolve2(action(target, value));
        } catch (err) {
          return reject(err);
        }
      });
    });
    __publicField(this, "cloneData", () => {
      const clonedData = { ...clone$1(this.data), id: uuid() };
      if (this.name !== "field") {
        clonedData.children = [];
      }
      return clonedData;
    });
    __publicField(this, "clone", (parent = this.parent) => {
      const newClone = parent.addChild(this.cloneData(), this.index + 1);
      if (this.name !== "field") {
        this.cloneChildren(newClone);
      }
      return newClone;
    });
    __publicField(this, "createChildWrap", (children) => dom.create({
      tag: "ul",
      attrs: {
        className: "children"
      },
      children
    }));
    this.id = data.id;
    this.name = name2;
    this.config = components[`${this.name}s`].config;
    merge(this.config, data.config);
    this.dataPath = `${this.name}s.${this.id}.`;
    this.observer = new window.MutationObserver(this.mutationHandler);
    this.render = render;
  }
  observe(container) {
    this.observer.disconnect();
    this.observer.observe(container, { childList: true });
  }
  get js() {
    return this.data;
  }
  get json() {
    return this.data;
  }
  /**
   * Removes element from DOM and data
   * @return  {Object} parent element
   */
  empty() {
    const removed = this.children.map((child) => {
      child.remove();
    });
    this.dom.classList.add("empty");
    return removed;
  }
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
          className: ["item-edit-toggle"],
          meta: {
            id: "edit"
          },
          action: {
            click: (evt) => {
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
            click: (evt, id) => {
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
    const actionButtonsConfigs = activeButtons.map((btn) => {
      var _a;
      return ((_a = buttonConfig[btn]) == null ? void 0 : _a.call(buttonConfig)) || btn;
    });
    this.actionButtons = actionButtonsConfigs;
    return this.actionButtons;
  }
  /**
   * helper that returns the index of the node minus the offset.
   */
  get index() {
    return indexOfNode(this.dom);
  }
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
    var _a, _b;
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
    childWrap.insertBefore(child.dom, childWrap.children[index2]);
    (_b = (_a = this.config.events) == null ? void 0 : _a.onAddChild) == null ? void 0 : _b.call(_a, { parent: this, child });
    const grandChildren = child.get("children");
    if (grandChildren == null ? void 0 : grandChildren.length) {
      child.loadChildren(grandChildren);
    }
    this.removeClasses("empty");
    this.saveChildOrder();
    return child;
  }
  /**
   * Method for handling onAdd for all components
   * @todo improve readability of this method
   * @param  {Object} evt
   * @return {Object} Component
   */
  onAdd({ from, to, item, newIndex: newIndex2 }) {
    var _a;
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
      controls: () => {
        const {
          controlData: {
            meta: { id: metaId },
            ...elementData
          }
        } = Controls$2.get(item.id);
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
        return action == null ? void 0 : action({ id: item.id }, newIndex2);
      },
      column: () => {
        const targets = {
          stage: -2,
          row: -1
        };
        const action = (depthMap.get(targets[toType]) || identity)();
        return action == null ? void 0 : action(item.id);
      }
    };
    const component = (_a = onAddConditions[fromType]) == null ? void 0 : _a.call(onAddConditions, item, newIndex2);
    defaultOnAdd();
    return component;
  }
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
   * Callback for onRender, executes any defined onRender for component
   */
  onRender() {
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
  set config(config2) {
    const allConfig = get(config2, "all");
    const controlId = get(this.data, "config.controlId");
    const typeConfig = controlId && get(config2, controlId);
    const idConfig = get(config2, this.id);
    const mergedConfig = [allConfig, typeConfig, idConfig].reduce(
      (acc, cur) => cur ? merge(acc, cur) : acc,
      this.configVal
    );
    this.configVal = mergedConfig;
  }
  get config() {
    return this.configVal;
  }
  getComponent(path) {
    const [type2, id] = path.split(".");
    const group = components[type2];
    return id === this.id ? this : group == null ? void 0 : group.get(id);
  }
  cloneChildren(toParent) {
    for (const child of this.children) {
      child == null ? void 0 : child.clone(toParent);
    }
  }
  get isRow() {
    return this.name === COMPONENT_TYPES.row;
  }
  get isColumn() {
    return this.name === COMPONENT_TYPES.column;
  }
  get isField() {
    return this.name === COMPONENT_TYPES.field;
  }
}
const DEFAULT_DATA$3 = () => ({
  conditions: [CONDITION_TEMPLATE()]
});
class Field extends Component {
  /**
   * Set defaults and load fieldData
   * @param  {Object} fieldData existing field ID
   * @return {Object} field object
   */
  constructor(fieldData = /* @__PURE__ */ Object.create(null)) {
    super("field", { ...DEFAULT_DATA$3(), ...fieldData });
    __publicField(this, "setData", (path, value) => {
      return super.set(path, value);
    });
    /**
     * Updates the conditions panel when linked field data changes
     */
    __publicField(this, "updateConditionsPanel", throttle$1(() => {
      const newConditionsPanel = this.editPanels.find(({ name: name2 }) => name2 === "conditions");
      if (!newConditionsPanel) {
        return null;
      }
      const newProps = newConditionsPanel.createProps();
      const currentConditionsProps = this.dom.querySelector(".field-edit-conditions");
      currentConditionsProps.parentElement.replaceChild(newProps, currentConditionsProps);
    }, ANIMATION_SPEED_BASE));
    /**
     * Updates a field's preview
     * @return {Object} fresh preview
     */
    __publicField(this, "updatePreview", () => {
      if (!this.preview.parentElement) {
        return null;
      }
      this.updateLabel();
      const newPreview = dom.create(this.fieldPreview(), true);
      this.preview.parentElement.replaceChild(newPreview, this.preview);
      this.preview = newPreview;
    });
    __publicField(this, "updateEditPanels", () => {
      this.editPanels = [];
      const editable = ["object", "array"];
      const panelOrder = unique([...this.config.panels.order, ...Object.keys(this.data)]);
      const noPanels = ["config", "meta", "action", "events", ...this.config.panels.disabled];
      const allowedPanels = panelOrder.filter((panelName) => !noPanels.includes(panelName));
      for (const panelName of allowedPanels) {
        const panelData = this.get(panelName);
        const propType = dom.childType(panelData);
        if (editable.includes(propType)) {
          const editPanel = new EditPanel(panelData, panelName, this);
          this.editPanels.push(editPanel);
        }
      }
      const panelsData = {
        panels: this.editPanels.map(({ panelConfig }) => panelConfig),
        id: this.id,
        displayType: "auto"
      };
      this.panels = new Panels(panelsData);
      if (this.dom) {
        this.dom.querySelector(".panel-nav").replaceWith(this.panels.panelNav);
        this.dom.querySelector(".panels").replaceWith(this.panels.panelsWrap);
      }
    });
    __publicField(this, "toggleCheckedOptions", (optionIndex, type2) => {
      const updatedOptionData = this.get("options").map((option2, index2) => {
        const isCurrentIndex = index2 === optionIndex;
        if (type2 === "radio") {
          option2.selected = isCurrentIndex;
        } else {
          option2.checked = isCurrentIndex ? !option2.checked : option2.checked;
        }
        return option2;
      });
      this.set("options", updatedOptionData);
    });
    /**
     * Checks if attribute is allowed to be edited
     * @param  {String}  propName
     * @return {Boolean}
     */
    __publicField(this, "isDisabledProp", (propName, kind = "attrs") => {
      const propKind = this.config.panels[kind];
      if (!propKind) {
        return false;
      }
      const disabledAttrs = propKind.disabled.concat(this.get(`config.disabled${toTitleCase(kind)}`));
      return disabledAttrs.includes(propName);
    });
    /**
     * Checks if property can be removed
     * @param  {String}  propName
     * @return {Boolean}
     */
    __publicField(this, "isLockedProp", (propName, kind = "attrs") => {
      const propKind = this.config.panels[kind];
      if (!propKind) {
        return false;
      }
      const lockedAttrs = propKind.locked.concat(this.get(`config.locked${toTitleCase(kind)}`));
      return lockedAttrs.includes(propName);
    });
    this.debouncedUpdateEditPanels = debounce(this.updateEditPanels);
    this.label = dom.create(this.labelConfig);
    this.preview = dom.create({});
    this.editPanels = [];
    const actionButtons = this.getActionButtons();
    const hasEditButton = this.actionButtons.some((child) => {
      var _a;
      return ((_a = child.meta) == null ? void 0 : _a.id) === "edit";
    });
    let field = {
      tag: "li",
      attrs: {
        className: FIELD_CLASSNAME
      },
      id: this.id,
      children: [
        this.label,
        this.getComponentTag(),
        actionButtons,
        hasEditButton && this.fieldEdit,
        // fieldEdit window,
        this.preview
      ].filter(Boolean),
      panelNav: this.panelNav,
      dataset: {
        hoverTag: mi18n.get("field")
      }
    };
    field = dom.create(field);
    this.observe(field);
    this.dom = field;
    this.isEditing = false;
    this.onRender(field);
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
      const config2 = {
        tag: "label",
        attrs: {}
      };
      if (disableHTML) {
        config2.tag = "input";
        config2.attrs.value = labelVal;
        return config2;
      }
      config2.attrs.contenteditable = true;
      config2.children = labelVal;
      return config2;
    };
    const label = {
      ...labelConfig(),
      action: {
        input: ({ target: { innerHTML, innerText, value } }) => {
          super.set("config.label", disableHTML ? value : innerHTML);
          const reverseConditionField = components.getConditionMap(`fields.${this.id}`);
          if (reverseConditionField) {
            return reverseConditionField.updateConditionSourceLabel(
              `${this.name}s.${this.id}`,
              disableHTML ? value : innerText
            );
          }
        }
      }
    };
    const labelWrap = {
      className: "prev-label",
      children: [label, required && dom.requiredMark()]
    };
    return labelWrap;
  }
  /**
   * Updates a source field's label without recreating conditions dom
   */
  updateConditionSourceLabel(value, label) {
    const newConditionsPanel = this.editPanels.find(({ name: name2 }) => name2 === "conditions");
    if (!newConditionsPanel) {
      return null;
    }
    for (const { itemFieldGroups } of newConditionsPanel.editPanelItems) {
      for (const fields2 of itemFieldGroups) {
        const autocomplete = fields2.find((field) => field.value === value);
        if (autocomplete) {
          autocomplete.displayField.value = label;
        }
      }
    }
  }
  /**
   * wrapper for Data.set
   */
  set(path, value) {
    const data = this.setData(path, value);
    this.updatePreview();
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
    this.label.parentElement.replaceChild(newLabel, this.label);
    this.label = newLabel;
  }
  /**
   * Generate the markup for field edit mode
   * @return {Object} fieldEdit element config
   */
  get fieldEdit() {
    const fieldEdit = {
      className: ["field-edit", "slide-toggle", "formeo-panels-wrap"]
    };
    this.updateEditPanels();
    const editPanelLength = this.editPanels.length;
    if (editPanelLength) {
      fieldEdit.className.push(`panel-count-${editPanelLength}`);
      fieldEdit.content = [this.panels.panelNav, this.panels.panelsWrap];
      this.panelNav = this.panels.nav;
      this.resizePanelWrap = this.panels.nav.refresh;
    }
    fieldEdit.action = {
      onRender: () => {
        if (editPanelLength === 0) {
          const field = this.dom;
          const editToggle = field.querySelector(".item-edit-toggle");
          const fieldActions = field.querySelector(".field-actions");
          const actionButtons = fieldActions.getElementsByTagName("button");
          fieldActions.style.maxWidth = `${actionButtons.length * actionButtons[0].clientWidth}px`;
          dom.remove(editToggle);
        } else {
          this.resizePanelWrap();
        }
      }
    };
    return dom.create(fieldEdit);
  }
  get defaultPreviewActions() {
    return {
      change: (evt) => {
        const { target } = evt;
        const { type: type2 } = target;
        if (["checkbox", "radio"].includes(type2)) {
          const optionIndex = +target.id.split("-").pop();
          this.toggleCheckedOptions(optionIndex, type2);
          this.debouncedUpdateEditPanels();
        }
      },
      click: (evt) => {
        if (evt.target.contentEditable === "true") {
          evt.preventDefault();
        }
      },
      input: (evt) => {
        if (["input", "meter", "progress", "button"].includes(evt.target.tagName.toLowerCase())) {
          super.set("attrs.value", evt.target.value);
          return this.debouncedUpdateEditPanels();
        }
        if (evt.target.contentEditable) {
          const target = evt.target;
          const parentClassList = target.parentElement.classList;
          const isOption = parentClassList.contains("f-checkbox") || parentClassList.contains("f-radio");
          if (isOption) {
            const option2 = target.parentElement;
            const optionWrap = option2.parentElement;
            const optionIndex = indexOfNode(option2, optionWrap);
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
    var _a;
    const prevData = clone$1(this.data);
    const { action = {} } = Controls$2.get(prevData.config.controlId);
    prevData.id = `prev-${this.id}`;
    prevData.action = Object.entries(action).reduce((acc, [key, value]) => {
      acc[key] = value.bind(this);
      return acc;
    }, {});
    if ((_a = this.data) == null ? void 0 : _a.config.editableContent) {
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
    return fieldPreview;
  }
}
const loaded = {
  js: /* @__PURE__ */ new Set(),
  css: /* @__PURE__ */ new Set()
};
const ajax = (fileUrl, callback, onError = noop) => {
  return new Promise((resolve2) => {
    return fetch(fileUrl).then((data) => {
      if (!data.ok) {
        return resolve2(onError(data));
      }
      resolve2(callback ? callback(data) : data);
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
  return new Promise((resolve2, reject) => {
    if (loaded.js.has(src)) {
      return resolve2(src);
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
        load: () => onLoadJavascript(script, resolve2),
        error: () => reject(new Error(`${src} failed to load.`))
      }
    });
    document.head.appendChild(script);
  });
};
const insertStyle = (srcs) => {
  srcs = Array.isArray(srcs) ? srcs : [srcs];
  const promises = srcs.map(
    (src) => new Promise((resolve2, reject) => {
      if (loaded.css.has(src)) {
        return resolve2(src);
      }
      loaded.css.add(src);
      const styleLink = dom.create({
        tag: "link",
        attrs: {
          rel: "stylesheet",
          href: src
        },
        action: {
          load: () => onLoadStylesheet(styleLink, resolve2),
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
  let iconSpriteWrap = document.getElementById(formeoSpriteId);
  if (!iconSpriteWrap) {
    iconSpriteWrap = dom.create({
      id: formeoSpriteId,
      children: iconSvgStr,
      attrs: {
        hidden: true,
        style: "display: none;"
      }
    });
    document.body.insertBefore(iconSpriteWrap, document.body.childNodes[0]);
  }
  return iconSpriteWrap;
};
const fetchIcons = async (iconSpriteUrl = SVG_SPRITE_URL) => {
  const formeoSprite = document.getElementById(formeoSpriteId);
  if (formeoSprite) {
    return;
  }
  const parseResp = async (resp) => insertIcons(await resp.text());
  return ajax(iconSpriteUrl, parseResp, () => ajax(FALLBACK_SVG_SPRITE_URL, parseResp));
};
const loadPolyfills = (polyfillConfig) => {
  const polyfills = Array.isArray(polyfillConfig) ? POLYFILLS.filter(({ name: name2 }) => polyfillConfig.indexOf(name2) !== -1) : POLYFILLS;
  return Promise.all(polyfills.map(({ src }) => insertScript(src)));
};
const LOADER_MAP = {
  js: insertScripts,
  css: insertStyles
};
const fetchDependencies = (dependencies2) => {
  const promises = Object.entries(dependencies2).map(([type2, src]) => {
    return LOADER_MAP[type2](src);
  });
  return Promise.all(promises);
};
const isCssLoaded = () => {
  const formeoSprite = document.getElementById(formeoSpriteId);
  const computedStyle = window.getComputedStyle(formeoSprite);
  return computedStyle.visibility === "hidden";
};
const fetchFormeoStyle = async (cssUrl) => {
  if (!isCssLoaded()) {
    await insertStyle(cssUrl);
    if (!isCssLoaded()) {
      return await insertStyle(FALLBACK_CSS_URL);
    }
  }
};
class Control {
  /**
   * Constructs a new Control instance.
   *
   * @param {Object} [config={}] - The configuration object.
   * @param {Object} [config.events={}] - The events associated with the control. ex { click: () => {} }
   * @param {Object} [config.dependencies={}] - The dependencies required by the control. ex { js: 'https://example.com/script.js', css: 'https://example.com/style.css' }
   * @param {...Object} [controlData] - Additional configuration properties. ex { meta: {}, config: { label: 'Control Name' } }
   */
  constructor({ events: events2 = {}, dependencies: dependencies2 = {}, controlAction, ...controlData }) {
    __publicField(this, "controlCache", /* @__PURE__ */ new Set());
    this.events = events2;
    this.controlData = controlData;
    this.controlAction = controlAction;
    this.dependencies = dependencies2;
    this.id = controlData.id || uuid();
  }
  get controlId() {
    var _a;
    return (_a = this.controlData.meta) == null ? void 0 : _a.id;
  }
  get dom() {
    const { meta, config: config2 } = this.controlData;
    const controlLabel = this.i18n(config2.label) || config2.label;
    const button = {
      tag: "button",
      attrs: {
        type: "button"
      },
      content: [{ tag: "span", className: "control-icon", children: dom.icon(meta.icon) }, controlLabel],
      action: {
        // this is used for keyboard navigation. when tabbing through controls it
        // will auto navigated between the groups
        focus: ({ target }) => {
          const group = target.closest(`.${CONTROL_GROUP_CLASSNAME}`);
          return group && Controls$2.panels.nav.refresh(indexOfNode(group));
        },
        click: ({ target }) => {
          Controls$2.addElement(target.parentElement.id);
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
    var _a, _b;
    const locale = mi18n.locale;
    const controlTranslations = (_a = this.definition) == null ? void 0 : _a.i18n;
    const localeTranslations = (controlTranslations == null ? void 0 : controlTranslations[locale]) || {};
    return (((_b = localeTranslations[lookup]) == null ? void 0 : _b.call(localeTranslations)) ?? localeTranslations[lookup]) || mi18n.get(lookup, args);
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
    __publicField(this, "groupLabel", (key) => mi18n.get(key) || key || "");
    __publicField(this, "layoutTypes", {
      row: () => Stages2.active.addChild(),
      column: () => this.layoutTypes.row().addChild(),
      field: (controlData) => this.layoutTypes.column().addChild(controlData)
    });
    /**
     * Append an element to the stage
     * @param {String} id of elements
     */
    __publicField(this, "addElement", (id) => {
      const {
        meta: { group, id: metaId },
        ...elementData
      } = get(this.get(id), "controlData");
      set(elementData, "config.controlId", metaId);
      if (group === "layout") {
        return this.layoutTypes[metaId.replace("layout-", "")]();
      }
      return this.layoutTypes.field(elementData);
    });
    __publicField(this, "applyOptions", async (controlOptions = {}) => {
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
    });
    this.data = /* @__PURE__ */ new Map();
    this.buttonActions = {
      // this is used for keyboard navigation. when tabbing through controls it
      // will auto navigated between the groups
      focus: ({ target }) => {
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
    return elements.map(async (Element) => {
      const isControl = typeof Element === "function";
      let control;
      if (isControl) {
        control = new Element();
      } else {
        control = new Control(Element);
      }
      this.add(control);
      this.controls.push(control.dom);
      return control.promise();
    });
  }
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
          className: CONTROL_GROUP_CLASSNAME,
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
        const { controlData: field } = this.get(control.id);
        const controlId = field.meta.id || "";
        const filters = [
          match(controlId, this.options.disable.elements),
          field.meta.group === group.id,
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
          if (Rows2.size) {
            events.confirmClearAll = new window.CustomEvent("confirmClearAll", {
              detail: {
                confirmationMessage: mi18n.get("confirmClearAll"),
                clearAllAction: () => {
                  Stages2.clearAll().then(() => {
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
        click: ({ target }) => {
          const { formData } = components;
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
    for (let i = groups.length - 1; i >= 0; i--) {
      const storeID = `formeo-controls-${groups[i]}`;
      if (!this.options.sortable) {
        window.localStorage.removeItem(storeID);
      }
      Sortable.create(groups[i], {
        animation: 150,
        forceFallback: true,
        fallbackClass: "control-moving",
        fallbackOnBody: true,
        group: {
          name: "controls",
          pull: "clone",
          put: false
        },
        onStart: ({ item }) => {
          const { controlData } = this.get(item.id);
          if (this.options.ghostPreview) {
            item.innerHTML = "";
            item.appendChild(new Field(controlData).preview);
          }
        },
        onEnd: ({ from, item, clone: clone2 }) => {
          if (from.contains(clone2)) {
            from.replaceChild(item, clone2);
          }
        },
        sort: this.options.sortable,
        store: {
          /**
           * Get the order of elements.
           * @param   {Sortable}  sortable
           * @return {Array}
           */
          get: () => {
            const order = window.localStorage.getItem(storeID);
            return order ? order.split("|") : [];
          },
          /**
           * Save the order of elements.
           * @param {Sortable}  sortable
           */
          set: (sortable) => {
            const order = sortable.toArray();
            window.localStorage.setItem(storeID, order.join("|"));
          }
        }
      });
    }
    return element;
  }
};
const Controls$2 = new Controls$1();
class ComponentData extends Data {
  constructor() {
    super(...arguments);
    __publicField(this, "load", (dataArg) => {
      const data = parseData(dataArg);
      this.empty();
      for (const [key, val] of Object.entries(data)) {
        this.add(key, val);
      }
      return this.data;
    });
    /**
     * Retrieves data from the specified path or adds new data if no path is provided.
     *
     * @param {string} [path] - The path to retrieve data from. If not provided, new data will be added.
     * @returns {*} The data retrieved from the specified path or the result of adding new data.
     */
    __publicField(this, "get", (path) => path ? get(this.data, path) : this.add());
    /**
     * Adds a new component with the given id and data.
     *
     * @param {string} id - The unique identifier for the component. If not provided, a new UUID will be generated.
     * @param {Object} [data=Object.create(null)] - The data to initialize the component with.
     * @returns {Object} The newly created component.
     */
    __publicField(this, "add", (id, data = /* @__PURE__ */ Object.create(null)) => {
      const elemId = id || uuid();
      const component = this.Component({ ...data, id: elemId });
      this.set(elemId, component);
      this.active = component;
      return component;
    });
    /**
     * removes a component form the index
     * @param {String|Array} componentId
     */
    __publicField(this, "remove", (componentId) => {
      if (Array.isArray(componentId)) {
        for (const id of componentId) {
          this.get(id).remove();
        }
      } else {
        this.get(componentId).remove();
      }
      return this.data;
    });
    /**
     * Deletes a component from the data object.
     *
     * @param {string} componentId - The ID of the component to delete.
     * @returns {string} The ID of the deleted component.
     */
    __publicField(this, "delete", (componentId) => {
      delete this.data[componentId];
      return componentId;
    });
    /**
     * Clears all instances from the store
     * @param {Object} evt
     */
    __publicField(this, "clearAll", (isAnimated = true) => {
      const promises = Object.values(this.data).map((component) => component.empty(isAnimated));
      return Promise.all(promises);
    });
    __publicField(this, "conditionMap", /* @__PURE__ */ new Map());
  }
  /**
   * Extends the configVal for a component type,
   * eventually read by Component
   * @return {Object} configVal
   */
  set config(config2) {
    this.configVal = merge(this.configVal, clone$1(config2));
  }
  /**
   * Reads configVal for a component type
   * @return {Object} configVal
   */
  get config() {
    return this.configVal;
  }
}
const DEFAULT_DATA$2 = () => Object.freeze({ children: [] });
class Stage extends Component {
  /**
   * Process options and load existing fields from data to the stage
   * @param  {Object} formeoOptions
   * @param  {String} stageData uuid
   * @return {Object} DOM element
   */
  constructor(stageData, render) {
    super("stage", { ...DEFAULT_DATA$2(), ...stageData }, render);
    const children = this.createChildWrap();
    this.dom = dom.create({
      attrs: {
        className: [STAGE_CLASSNAME, "empty"],
        id: this.id
      },
      children
    });
    Sortable.create(children, {
      animation: 150,
      fallbackClass: "row-moving",
      forceFallback: true,
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
    return new Promise((resolve2) => {
      if (isAnimated) {
        this.dom.classList.add("removing-all-fields");
        animate.slideUp(this.dom, ANIMATION_SPEED_BASE, () => {
          resolve2(super.empty(isAnimated));
          this.dom.classList.remove("removing-all-fields");
          animate.slideDown(this.dom, ANIMATION_SPEED_BASE);
        });
      } else {
        resolve2(super.empty());
      }
    });
  }
  onAdd(...args) {
    const component = super.onAdd(...args);
    if (component && component.name === "column") {
      component.parent.autoColumnWidths();
    }
  }
}
let Stages$1 = class Stages extends ComponentData {
  constructor(stageData) {
    super("stages", stageData);
  }
  Component(data) {
    return new Stage(data);
  }
};
const stages = new Stages$1();
const DEFAULT_DATA$1 = () => Object.freeze({
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
    super("row", { ...DEFAULT_DATA$1(), ...rowData });
    /**
     * Read columns and generate bootstrap cols
     * @param {Object} row DOM element
     */
    __publicField(this, "autoColumnWidths", () => {
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
    });
    /**
     * Updates the column preset <select>
     * @return {Object} columnPresetConfig
     */
    __publicField(this, "updateColumnPreset", () => {
      this.columnPresetControl.innerHTML = "";
      const presetOptions = this.getColumnPresetOptions.map(
        ({ label, ...attrs }) => dom.create({
          tag: "option",
          content: label,
          attrs
        })
      );
      this.columnPresetControl.append(...presetOptions);
    });
    /**
     * Set the widths of columns in a row
     * @param {Object} row DOM element
     * @param {String} widths
     */
    __publicField(this, "setColumnWidths", (widths) => {
      if (typeof widths === "string") {
        widths = widths.split(",");
      }
      this.children.forEach((column, i) => {
        column.setWidth(`${widths[i]}%`);
        column.refreshFieldPanels();
      });
    });
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
const DEFAULT_DATA = () => Object.freeze({
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
    super("column", { ...DEFAULT_DATA(), ...columnData });
    // loops through children and refresh their edit panels
    __publicField(this, "refreshFieldPanels", () => {
      for (const field of this.children) {
        field.panels.nav.refresh();
      }
    });
    /**
     * Sets the width data and style for the column
     * @param {string} width - The width value to be set for the column
     * @returns {void}
     */
    __publicField(this, "setDomWidth", (width) => {
      this.dom.dataset.colWidth = width;
      this.dom.style.width = width;
    });
    /**
     * Sets a columns width
     * @param {String} width percent or pixel
     */
    __publicField(this, "setWidth", (width) => {
      this.setDomWidth(width);
      return this.set("config.width", width);
    });
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
}
const DEFAULT_CONFIG$1 = {
  actionButtons: {
    buttons: ["clone", "move", "remove"],
    disabled: []
  }
};
let Columns$1 = class Columns extends ComponentData {
  constructor(columnData) {
    super("columns", columnData);
    this.config = { all: DEFAULT_CONFIG$1 };
  }
  Component(data) {
    return new Column(data);
  }
};
const columns = new Columns$1();
const DEFAULT_CONFIG = {
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
};
let Fields$1 = class Fields extends ComponentData {
  constructor(fieldData) {
    super("fields", fieldData);
    __publicField(this, "get", (path) => {
      let found = path && get(this.data, path);
      if (!found) {
        const control = Controls$2.get(path);
        if (control) {
          found = this.add(null, control.controlData);
        }
      }
      return found;
    });
    __publicField(this, "getData", () => {
      return Object.entries(this.data).reduce((acc, [key, val]) => {
        const { conditions, ...data } = (val == null ? void 0 : val.getData()) || val;
        if (conditions == null ? void 0 : conditions.length) {
          let hasConditions = true;
          if (conditions.length === 1) {
            const [firstCondition] = conditions;
            hasConditions = Boolean(firstCondition.if[0].source && firstCondition.then[0].target);
          }
          if (hasConditions) {
            data.conditions = conditions;
          }
        }
        acc[key] = data;
        return acc;
      }, {});
    });
    __publicField(this, "load", (dataArg = /* @__PURE__ */ Object.create(null)) => {
      const allFieldData = parseData(dataArg);
      this.empty();
      for (const [key, val] of Object.entries(allFieldData)) {
        const { meta, ...data } = val;
        if (meta == null ? void 0 : meta.id) {
          set(data, "config.controlId", meta == null ? void 0 : meta.id);
        }
        this.add(key, data);
      }
      return this.data;
    });
    this.config = { all: DEFAULT_CONFIG };
  }
  Component(data) {
    return new Field(data);
  }
};
const fields = new Fields$1();
let Externals$1 = class Externals extends ComponentData {
  constructor(externalData) {
    super("externals", externalData);
  }
  Component(data) {
    return new Component("external", data);
  }
};
const externals = new Externals$1();
const Stages2 = stages;
const Rows2 = rows;
const Columns2 = columns;
const Fields2 = fields;
const Controls2 = Controls$2;
const Externals2 = externals;
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
    __publicField(this, "load", (formDataArg, opts) => {
      this.empty();
      const formData = getFormData(formDataArg, opts.sessionStorage);
      this.opts = opts;
      this.set("id", formData.id);
      this.add("stages", Stages2.load(formData.stages));
      this.add("rows", Rows2.load(formData.rows));
      this.add("columns", Columns2.load(formData.columns));
      this.add("fields", Fields2.load(formData.fields));
      this.add("externals", Externals2.load(this.opts.external));
      for (const stage of Object.values(this.get("stages"))) {
        stage.loadChildren();
      }
      return this.data;
    });
    this.disableEvents = true;
    this.stages = Stages2;
    this.rows = Rows2;
    this.columns = Columns2;
    this.fields = Fields2;
    this.controls = Controls2;
    this.externals = Externals2;
  }
  /**
   * flattens the component tree
   * @returns {Object} where keys contains component type
   */
  flatList(data = this.data, acculumator = /* @__PURE__ */ Object.create(null)) {
    return Object.entries(data).reduce((acc, [type2, components2]) => {
      if (typeof components2 === "object") {
        for (const [id, component] of Object.entries(components2)) {
          acc[`${type2}.${id}`] = component;
        }
      }
      return acc;
    }, acculumator);
  }
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
  set config(config2) {
    const { stages: stages2, rows: rows2, columns: columns2, fields: fields2 } = config2;
    Stages2.config = stages2;
    Rows2.config = rows2;
    Columns2.config = columns2;
    Fields2.config = fields2;
  }
  /**
   * call `set` on a component in memory
   */
  setAddress(fullAddress, value) {
    const [type2, id, ...localAddress] = Array.isArray(fullAddress) ? fullAddress : fullAddress.split(".");
    const componentType2 = type2.replace(/s?$/, "s");
    const component = this[componentType2].get(id);
    component == null ? void 0 : component.set(localAddress, value);
    return component;
  }
  /**
   * Fetch a component from memory by address
   */
  getAddress(address) {
    if (!isAddress(address)) {
      return;
    }
    const [type2, id, ...path] = Array.isArray(address) ? address : address.split(".");
    const componentType2 = type2.replace(/s?$/, "s");
    const component = this[componentType2].get(id);
    return path.length ? component.get(path) : component;
  }
  getConditionMap(address) {
    if (isAddress(address)) {
      const splitAddress = address.split(".");
      return splitAddress.every((segment) => Boolean(segment)) && this[splitAddress[0]].conditionMap.get(splitAddress[1]);
    }
  }
  setConditionMap(address, component) {
    if (isAddress(address)) {
      const splitAddress = address.split(".");
      return splitAddress.every((segment) => Boolean(segment)) && this[splitAddress[0]].conditionMap.set(splitAddress[1], component);
    }
  }
  removeConditionMap(address) {
    if (isAddress(address)) {
      const splitAddress = address.split(".");
      return splitAddress.every((segment) => Boolean(segment)) && this[splitAddress[0]].conditionMap.delete(splitAddress[1]);
    }
  }
}
const components = new Components();
const iconFontTemplates = {
  glyphicons: (icon) => `<span class="glyphicon glyphicon-${icon}" aria-hidden="true"></span>`,
  "font-awesome": (icon) => {
    const [style, name2] = icon.split(" ");
    return `<i class="${style} fa-${name2}"></i>`;
  },
  fontello: (icon) => `<i class="${iconPrefix}${icon}">${icon}</i>`
};
const inputTags = /* @__PURE__ */ new Set(["input", "textarea", "select"]);
class DOM {
  /**
   * Set defaults, store references to key elements
   * like stages, rows, columns etc
   */
  constructor(options = /* @__PURE__ */ Object.create(null)) {
    /**
     * Wraps dom.create to modify data
     * Used when rendering components in form- not editor
     */
    __publicField(this, "render", (elem) => {
      elem.id = `f-${elem.id || uuid()}`;
      return this.create(elem);
    });
    /**
     * Creates DOM elements
     * @param  {Object}  elem      element config object
     * @param  {Boolean} isPreview generating element for preview or render?
     * @return {Object}            DOM Object
     */
    __publicField(this, "create", (elemArg, isPreview = false) => {
      if (!elemArg) {
        return;
      }
      const _this = this;
      const processed = ["children", "content"];
      const { className, options, dataset, ...elem } = this.processTagName(elemArg);
      processed.push("tag");
      let childType;
      const { tag } = elem;
      let i;
      const wrap = {
        attrs: {},
        className: [helpers.get(elem, "config.inputWrap") || "f-field-group"],
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
      for (i = remaining.length - 1; i >= 0; i--) {
        element[remaining[i]] = elem[remaining[i]];
      }
      if (wrap.children.length) {
        element = this.create(wrap);
      }
      return element;
    });
    __publicField(this, "onRender", (node, cb) => {
      if (!node.parentElement) {
        window.requestAnimationFrame(() => this.onRender(node, cb));
      } else {
        cb(node);
      }
    });
    /**
     * Hide or show an Array or HTMLCollection of elements
     * @param  {Array} elems
     * @param  {String} term  match textContent to this term
     * @return {Array}        filtered elements
     */
    __publicField(this, "toggleElementsByStr", (elems, term) => {
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
    });
    __publicField(this, "elementsContainText", (collection, term, cb) => {
      const elementsContainingText = [];
      forEach(collection, (elem) => {
        const txt = elem.textContent.toLowerCase();
        const contains = txt.indexOf(term.toLowerCase()) !== -1;
        cb == null ? void 0 : cb(elem, contains);
        contains && elementsContainingText.push(elem);
      });
      return elementsContainingText;
    });
    __publicField(this, "generateOption", ({ type: type2 = "option", label, value, i = 0, selected }) => {
      const isOption = type2 === "option";
      return {
        tag: isOption ? "option" : "input",
        attrs: {
          type: type2,
          value: value || `${type2}-${i}`,
          [type2 === "option" ? "selected" : "checked"]: selected || !i
        },
        config: {
          label: label || mi18n.get("labelCount", {
            label: mi18n.get("option"),
            count: i
          })
        }
      };
    });
    __publicField(this, "requiredMark", () => ({
      tag: "span",
      className: "text-error",
      children: "*"
    }));
    /**
     * Remove elements without f children
     * @param  {Object} element DOM element
     * @return {Object} formData
     */
    __publicField(this, "removeEmpty", (element) => {
      const parent = element.parentElement;
      const type2 = componentType(element);
      const children = parent.getElementsByClassName(`formeo-${type2}`);
      this.remove(element);
      if (!children.length) {
        if (!this.isStage(parent)) {
          return this.removeEmpty(parent);
        }
        return this.emptyClass(parent);
      }
    });
    __publicField(this, "btnTemplate", ({ title = "", ...rest }) => ({
      tag: "button",
      attrs: {
        type: "button",
        title
      },
      ...rest
    }));
    __publicField(this, "isControls", (node) => componentType(node) === CONTROL_GROUP_CLASSNAME);
    __publicField(this, "isStage", (node) => componentType(node) === STAGE_CLASSNAME);
    __publicField(this, "isRow", (node) => componentType(node) === ROW_CLASSNAME);
    __publicField(this, "isColumn", (node) => componentType(node) === COLUMN_CLASSNAME);
    __publicField(this, "isField", (node) => componentType(node) === FIELD_CLASSNAME);
    __publicField(this, "asComponent", (elem) => components[`${componentType(elem)}s`].get(elem.id));
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
  processTagName(elemArg) {
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
    const iconSymbolNodes = document.querySelectorAll(`#${formeoSpriteId} svg symbol`);
    const createSvgIconConfig = (symbolId) => ({
      tag: "svg",
      attrs: {
        className: ["svg-icon", symbolId]
      },
      children: [
        {
          tag: "use",
          attrs: {
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            "xlink:href": `#${symbolId}`
          }
        }
      ]
    });
    this.iconSymbols = Array.from(iconSymbolNodes).reduce((acc, symbol) => {
      const name2 = symbol.id.replace(iconPrefix, "");
      acc[name2] = createSvgIconConfig(symbol.id);
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
  icon(name2, config2) {
    var _a, _b;
    if (!name2) {
      return;
    }
    const cacheKey = `${name2}?${new URLSearchParams(config2).toString()}`;
    if ((_a = this.cachedIcons) == null ? void 0 : _a[cacheKey]) {
      return this.cachedIcons[cacheKey];
    }
    const iconConfig = this.icons[name2];
    if (iconConfig) {
      if (config2) {
        const mergedConfig = merge(iconConfig, config2);
        this.cachedIcons[cacheKey] = dom.create(mergedConfig).outerHTML;
        return this.cachedIcons[cacheKey];
      }
      this.cachedIcons[cacheKey] = dom.create(iconConfig).outerHTML;
      return this.cachedIcons[cacheKey];
    }
    return ((_b = iconFontTemplates[dom.options.iconFont]) == null ? void 0 : _b.call(iconFontTemplates, name2)) || name2;
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
    if (!isPreview && !attrs.name && this.isInput(elem.tag)) {
      element.setAttribute("name", uuid(elem));
    }
    for (const attr of Object.keys(attrs)) {
      const name2 = helpers.safeAttrName(attr);
      const value = this.processAttrValue(attrs[attr]);
      if (value) {
        element.setAttribute(name2, value === true ? "" : value);
      }
    }
  }
  processAttrValue(valueArg) {
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
   * Extend Array of option config objects
   * @param  {Array} options
   * @param  {Object} elem element config object
   * @param  {Boolean} isPreview
   * @return {Array} option config objects
   */
  processOptions(options, elem, isPreview) {
    const { action, attrs } = elem;
    const fieldType = attrs.type || elem.tag;
    const id = attrs.id || elem.id;
    const optionMap = (option2, i) => {
      var _a;
      const { label, ...rest } = option2;
      const defaultInput = () => {
        const input = {
          tag: "input",
          attrs: {
            name: id,
            type: fieldType,
            value: option2.value || "",
            id: `${id}-${i}`,
            ...rest
          },
          action
        };
        const optionLabel = {
          tag: "label",
          attrs: {
            for: `${id}-${i}`
          },
          config: {
            inputWrap: "form-check"
          },
          children: option2.label
        };
        const inputWrap = {
          children: [input, optionLabel],
          className: [`f-${fieldType}`]
        };
        if (elem.attrs.className) {
          elem.config.inputWrap = elem.attrs.className;
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
          return {
            tag: "option",
            attrs: option2,
            children: option2.label
          };
        },
        button: (option3) => {
          const { type: type2, label: label2, className, id: id2 } = option3;
          return {
            ...elem,
            attrs: {
              type: type2
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
      return (_a = optionMarkup[fieldType]) == null ? void 0 : _a.call(optionMarkup, option2);
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
    const type2 = helpers.get(elem, "attrs.type");
    const labelAfter = helpers.get(elem, "config.labelAfter");
    const isCB = type2 === "checkbox" || type2 === "radio";
    return labelAfter !== void 0 ? labelAfter : isCB;
  }
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
        for: elemId || (attrs == null ? void 0 : attrs.id)
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
      ["component", () => content == null ? void 0 : content.dom],
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
    const type2 = this.childType(elem);
    const element = getElement[type2]();
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
   * Removes element from DOM and data
   * @param  {Object} elem
   * @return  {Object} parent element
   */
  remove(elem) {
    const type2 = componentType(elem);
    if (type2) {
      return components.remove(`${type2}s.${elem.id}`);
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
}
const dom = new DOM();
const enUS = void 0;
mi18n.addLanguage("en-US", enUS);
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
      external: {},
      // assign external data to be used in conditions autolinker
      svgSprite: SVG_SPRITE_URL,
      // change to null
      style: CSS_URL,
      // change to null
      iconFont: null,
      // 'glyphicons' || 'font-awesome' || 'fontello'
      config: {},
      // stages, rows, columns, fields
      events: {},
      actions: {},
      controls: {},
      polyfills: isIE(),
      // loads csspreloadrel
      i18n: {
        location: "https://draggable.github.io/formeo/assets/lang/"
      },
      onLoad: () => {
      }
    };
  }
};
let FormeoEditor$1 = class FormeoEditor {
  /**
   * @param  {Object} options  formeo options
   * @param  {String|Object}   userFormData loaded formData
   * @return {Object}          formeo references and actions
   */
  constructor({ formData, ...options }, userFormData) {
    const mergedOptions = merge(defaults.editor, options);
    const { actions: actions$1, events: events$1, debug, config: config2, editorContainer, ...opts } = mergedOptions;
    if (editorContainer) {
      this.editorContainer = typeof editorContainer === "string" ? document.querySelector(editorContainer) : editorContainer;
    }
    this.opts = opts;
    dom.setOptions = opts;
    components.config = config2;
    this.userFormData = userFormData || formData;
    this.Components = components;
    this.dom = dom;
    events.init({ debug, ...events$1 });
    actions.init({ debug, sessionStorage: opts.sessionStorage, ...actions$1 });
    this.tooltip = new SmartTooltip();
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
  get json() {
    return this.Components.json;
  }
  /**
   * Load remote resources
   * @return {Promise} asynchronously loaded remote resources
   */
  async loadResources() {
    var _a;
    document.removeEventListener("DOMContentLoaded", this.loadResources);
    const promises = [];
    if (this.opts.polyfills) {
      loadPolyfills(this.opts.polyfills);
    }
    await fetchIcons(this.opts.svgSprite);
    promises.push(fetchFormeoStyle(this.opts.style));
    promises.push(mi18n.init({ ...this.opts.i18n, locale: (_a = window.sessionStorage) == null ? void 0 : _a.getItem(SESSION_LOCALE_KEY) }));
    const resolvedPromises = await Promise.all(promises);
    if (this.opts.allowEdit) {
      this.init();
    }
    return resolvedPromises;
  }
  /**
   * Formeo initializer
   * @return {Object} References to formeo instance,
   * dom elements, actions events and more.
   */
  init() {
    return Controls$2.init(this.opts.controls, this.opts.stickyControls).then((controls) => {
      var _a, _b;
      this.controls = controls;
      this.load(this.userFormData, this.opts);
      this.formId = components.get("id");
      this.i18n = {
        setLang: (formeoLocale) => {
          var _a2;
          (_a2 = window.sessionStorage) == null ? void 0 : _a2.setItem(SESSION_LOCALE_KEY, formeoLocale);
          const loadLang = mi18n.setCurrent(formeoLocale);
          loadLang.then(() => {
            this.init();
          }, console.error);
        }
      };
      (_b = (_a = this.opts).onLoad) == null ? void 0 : _b.call(_a, this);
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
    events.formeoLoaded = new window.CustomEvent("formeoLoaded", {
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
  return (match2 == null ? void 0 : match2[0]) || id;
};
const newUUID = (id) => id.replace(UUID_REGEXP, uuid());
const createRemoveButton = () => dom.render(
  dom.btnTemplate({
    className: "remove-input-group",
    children: dom.icon("remove"),
    action: {
      mouseover: ({ target }) => target.parentElement.classList.add("will-remove"),
      mouseleave: ({ target }) => target.parentElement.classList.remove("will-remove"),
      click: ({ target }) => target.parentElement.remove()
    }
  })
);
let FormeoRenderer$1 = class FormeoRenderer {
  constructor(opts, formDataArg) {
    /**
     * Renders the formData to a target Element
     * @param {Object} formData
     */
    __publicField(this, "render", (formData = this.form) => {
      this.form = cleanFormData(formData);
      const renderCount = document.getElementsByClassName("formeo-render").length;
      const config2 = {
        id: this.form.id,
        className: `formeo-render formeo formeo-rendered-${renderCount}`,
        children: this.processedData
      };
      this.renderedForm = dom.render(config2);
      this.applyConditions();
      const existingRenderedForm = this.container.querySelector(".formeo-render");
      if (existingRenderedForm) {
        existingRenderedForm.replaceWith(this.renderedForm);
      } else {
        this.container.appendChild(this.renderedForm);
      }
    });
    __publicField(this, "orderChildren", (type2, order) => order.reduce((acc, cur) => {
      acc.push(this.form[type2][cur]);
      return acc;
    }, []));
    __publicField(this, "prefixId", (id) => RENDER_PREFIX + id);
    /**
     * Convert sizes, apply styles for render
     * @param  {Object} columnData
     * @return {Object} processed column data
     */
    __publicField(this, "processColumn", ({ id, ...columnData }) => ({
      ...columnData,
      ...{
        id: this.prefixId(id),
        children: this.processFields(columnData.children),
        style: `width: ${columnData.config.width || "100%"}`
      }
    }));
    __publicField(this, "processRows", (stageId) => this.orderChildren("rows", this.form.stages[stageId].children).reduce((acc, row) => {
      if (row) {
        acc.push(this.processRow(row));
      }
      return acc;
    }, []));
    __publicField(this, "cacheComponent", (data) => {
      this.components[baseId(data.id)] = data;
      return data;
    });
    /**
     * Applies a row's config
     * @param {Object} row data
     * @return {Object} row config object
     */
    __publicField(this, "processRow", (data, type2 = "row") => {
      const { config: config2, id } = data;
      const className = [`formeo-${type2}-wrap`];
      const rowData = { ...data, children: this.processColumns(data.id), id: this.prefixId(id) };
      this.cacheComponent(rowData);
      const configConditions = [
        { condition: config2.legend, result: () => ({ tag: config2.fieldset ? "legend" : "h3", children: config2.legend }) },
        { condition: true, result: () => rowData },
        { condition: config2.inputGroup, result: () => this.addButton(id) }
      ];
      const children = configConditions.reduce((acc, { condition, result }) => {
        if (condition) {
          acc.push(result());
        }
        return acc;
      }, []);
      if (config2.inputGroup) {
        className.push(`${RENDER_PREFIX}input-group-wrap`);
      }
      return {
        tag: config2.fieldset ? "fieldset" : "div",
        id: uuid(),
        className,
        children
      };
    });
    __publicField(this, "cloneComponentData", (componentId) => {
      const { children = [], id, ...rest } = this.components[componentId];
      return Object.assign({}, rest, {
        id: newUUID(id),
        children: children.length && children.map(({ id: id2 }) => this.cloneComponentData(baseId(id2)))
      });
    });
    __publicField(this, "addButton", (id) => dom.render({
      tag: "button",
      attrs: {
        className: "add-input-group btn pull-right",
        type: "button"
      },
      children: "Add +",
      action: {
        click: (e) => {
          const fInputGroup = e.target.parentElement;
          const elem = dom.render(this.cloneComponentData(id));
          fInputGroup.insertBefore(elem, fInputGroup.lastChild);
          elem.appendChild(createRemoveButton());
        }
      }
    }));
    __publicField(this, "processColumns", (rowId) => {
      return this.orderChildren("columns", this.form.rows[rowId].children).map(
        (column) => this.cacheComponent(this.processColumn(column))
      );
    });
    __publicField(this, "processFields", (fieldIds) => this.orderChildren("fields", fieldIds).map(({ id, ...field }) => {
      var _a, _b;
      const controlId = ((_a = field.config) == null ? void 0 : _a.controlId) || ((_b = field.meta) == null ? void 0 : _b.id);
      const { action = {}, dependencies: dependencies2 = {} } = this.elements[controlId] || {};
      if (dependencies2) {
        fetchDependencies(dependencies2);
      }
      const mergedFieldData = merge({ action }, field);
      return this.cacheComponent({ ...mergedFieldData, id: this.prefixId(id) });
    }));
    /**
     * Evaulate and execute conditions for fields by creating listeners for input and changes
     * @return {Array} flattened array of conditions
     */
    __publicField(this, "handleComponentCondition", (component, ifRest, thenConditions) => {
      const listenerEvent = LISTEN_TYPE_MAP(component);
      if (listenerEvent) {
        component.addEventListener(
          listenerEvent,
          (evt) => {
            if (this.evaluateCondition(ifRest, evt)) {
              for (const thenCondition of thenConditions) {
                this.execResult(thenCondition, evt);
              }
            }
          },
          false
        );
      }
      const fakeEvt = { target: component };
      if (this.evaluateCondition(ifRest, fakeEvt)) {
        for (const thenCondition of thenConditions) {
          this.execResult(thenCondition, fakeEvt);
        }
      }
    });
    __publicField(this, "applyConditions", () => {
      for (const { conditions } of Object.values(this.components)) {
        if (conditions) {
          for (const condition of conditions) {
            const { if: ifConditions, then: thenConditions } = condition;
            for (const ifCondition of ifConditions) {
              const { source, ...ifRest } = ifCondition;
              if (isAddress(source)) {
                const components2 = this.getComponents(source);
                for (const component of components2) {
                  this.handleComponentCondition(component, ifRest, thenConditions);
                }
              }
            }
          }
        }
      }
    });
    /**
     * Evaulate conditions
     */
    __publicField(this, "evaluateCondition", ({ sourceProperty, targetProperty, comparison, target }, evt) => {
      var _a;
      const comparisonMap = {
        equals: isEqual$1,
        notEquals: (source, target2) => !isEqual$1(source, target2),
        contains: (source, target2) => source.includes(target2),
        notContains: (source, target2) => !source.includes(target2)
      };
      const sourceValue = String(evt.target[sourceProperty]);
      const targetValue = String(isAddress(target) ? this.getComponent(target)[targetProperty] : target);
      return (_a = comparisonMap[comparison]) == null ? void 0 : _a.call(comparisonMap, sourceValue, targetValue);
    });
    __publicField(this, "execResult", ({ assignment, target, targetProperty, value }) => {
      var _a;
      const assignMap = {
        equals: (elem) => {
          var _a2;
          const propMap = {
            value: () => {
              elem[targetProperty] = value;
            },
            isNotVisible: () => {
              elem.parentElement.setAttribute("hidden", true);
              elem.required = false;
            },
            isVisible: () => {
              elem.parentElement.removeAttribute("hidden");
              elem.required = elem._required;
            }
          };
          (_a2 = propMap[targetProperty]) == null ? void 0 : _a2.call(propMap);
        }
      };
      if (isAddress(target)) {
        const elem = this.getComponent(target);
        if (elem && elem._required === void 0) {
          elem._required = elem.required;
        }
        (_a = assignMap[assignment]) == null ? void 0 : _a.call(assignMap, elem);
      }
    });
    __publicField(this, "getComponent", (address) => {
      const componentId = address.slice(address.indexOf(".") + 1);
      const component = isExternalAddress(address) ? this.external[componentId] : this.renderedForm.querySelector(`#f-${componentId}`);
      return component;
    });
    __publicField(this, "getComponents", (address) => {
      const components2 = [];
      const componentId = address.slice(address.indexOf(".") + 1);
      if (isExternalAddress(address)) {
        components2.push(this.external[componentId]);
      } else {
        components2.push(...this.renderedForm.querySelectorAll(`[name=f-${componentId}]`));
      }
      return components2;
    });
    const { renderContainer, external, elements, formData } = processOptions(opts);
    this.container = renderContainer;
    this.form = cleanFormData(formDataArg || formData);
    this.external = external;
    this.dom = dom;
    this.components = /* @__PURE__ */ Object.create(null);
    this.elements = elements;
  }
  get processedData() {
    return Object.values(this.form.stages).map((stage) => {
      stage.children = this.processRows(stage.id);
      stage.className = STAGE_CLASSNAME;
      return dom.render(stage);
    });
  }
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
const index$4 = [rowControl, columnControl];
const index$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$4
}, Symbol.toStringTag, { value: "Module" }));
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
const generateOptionConfig = (type2, count = 3) => Array.from({ length: count }, (v, k) => k + 1).map((i) => {
  const selectedKey = type2 === "checkbox" ? "checked" : "selected";
  return {
    label: mi18n.get("labelCount", {
      label: toTitleCase(type2),
      count: i
    }),
    value: `${type2}-${i}`,
    [selectedKey]: !i
  };
});
class SelectControl extends Control {
  constructor() {
    const selectConfig = {
      tag: "select",
      config: {
        label: mi18n.get("controls.form.select")
      },
      attrs: {
        required: false,
        className: ""
      },
      meta: {
        group: "common",
        icon: "select",
        id: "select"
      },
      options: generateOptionConfig("option")
    };
    super(selectConfig);
  }
}
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
      options: generateOptionConfig("checkbox", 1)
    };
    super(checkboxGroup);
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
        disabledAttrs: ["type"]
      },
      meta: {
        group: "common",
        icon: "radio-group",
        id: "radio"
      },
      options: generateOptionConfig("radio")
    };
    super(radioGroup);
  }
}
class ButtonControl extends Control {
  constructor() {
    const buttonConfig = {
      tag: "button",
      attrs: {
        className: [{ label: "grouped", value: "f-btn-group" }, { label: "ungrouped", value: "f-field-group" }]
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
          type: ["button", "submit", "reset"].map((buttonType) => ({
            label: buttonType,
            type: buttonType
          })),
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
    super(buttonConfig);
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
exports.FormeoEditor = FormeoEditor2;
exports.FormeoRenderer = FormeoRenderer2;
