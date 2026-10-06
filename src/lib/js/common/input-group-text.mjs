import i18n from '@draggable/i18n'
import { fillTokens } from './utils/string.mjs'

/**
 * English fallbacks for input groups' strings (#349 phase 3), for locales that don't have them yet.
 * @draggable/formeo-languages ships them from the release after Draggable/formeo-languages feat/table-repeat-keys.
 */
export const INPUT_GROUP_TEXT = Object.freeze({
  'inputGroup.add': 'Add +',
  'inputGroup.added': 'Group {n} added',
  'inputGroup.remove': 'Remove group {n}',
  'inputGroup.removed': 'Group {n} removed',
})

/**
 * An input group string in the current locale, or its English fallback, with `{tokens}` filled from `vars`
 * @param {String} key e.g. 'inputGroup.remove'
 * @param {Object} [vars] e.g. { n: 2 }
 * @return {String}
 */
export const inputGroupText = (key, vars = {}) => fillTokens(i18n.get(key) || INPUT_GROUP_TEXT[key] || key, vars)
