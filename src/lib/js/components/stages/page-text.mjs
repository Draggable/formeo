import i18n from '@draggable/i18n'

/**
 * English fallbacks for the editor's page tab strings (#122), for locales that don't translate them.
 * @draggable/formeo-languages ships the same en-US text from 3.6.0.
 */
export const PAGE_TEXT = Object.freeze({
  'pages.label': 'Pages',
  'pages.add': 'Add page',
  'pages.untitled': 'Page {n}',
  'pages.rename': 'Rename page',
  'pages.remove': 'Remove page "{title}"',
  'pages.removeConfirm': 'Remove "{title}" and everything on it?',
  'pages.moveTo': 'Move to page',
  'pages.move': 'Move',
  'pages.moved': 'Moved to {title}',
})

const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (token, name) => (name in vars ? String(vars[name]) : token))

/**
 * A page tab string in the current locale, or its English fallback, with `{tokens}` filled from `vars`.
 * Filled here rather than by `i18n.get(key, vars)`, whose string replacement would read `$&`, `$$`… in a title as
 * replacement patterns.
 * @param {String} key a `pages.*` key
 * @param {Object} [vars] token values, e.g. { n: 2 } or { title: 'Account' }
 * @return {String}
 */
export const pageText = (key, vars = {}) => fill(i18n.get(key) || PAGE_TEXT[key] || key, vars)
