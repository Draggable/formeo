import i18n from '@draggable/i18n'
import { fillTokens } from '../../common/utils/string.mjs'

/**
 * English fallbacks for the editor's page tab strings (#122), for locales that don't translate them.
 * @draggable/formeo-languages ships these keys from 3.7.0.
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
  'pages.page': 'Page',
})

/**
 * A page tab string in the current locale, or its English fallback, with `{tokens}` filled from `vars`.
 * Filled here rather than by `i18n.get(key, vars)`, whose string replacement would read `$&`, `$$`… in a title as
 * replacement patterns.
 * @param {String} key a `pages.*` key
 * @param {Object} [vars] token values, e.g. { n: 2 } or { title: 'Account' }
 * @return {String}
 */
export const pageText = (key, vars = {}) => fillTokens(i18n.get(key) || PAGE_TEXT[key] || key, vars)
