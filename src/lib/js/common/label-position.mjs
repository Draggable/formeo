// Where a field's label sits relative to its control (#243). Pure: no DOM and no editor state.

/** top and bottom stack; before and after sit side by side (mirrored in RTL). DOM order always matches visual order. */
export const LABEL_POSITIONS = ['top', 'bottom', 'before', 'after']

/** The class on a rendered field's label wrapper, and on the editor's label and preview wrapper */
export const FIELD_WRAP_CLASSNAME = 'f-field'

const warnedValues = new Set()

/**
 * A checkbox or radio input on its own, not a group of options: its label defaults to after it
 * @param {Object} field
 * @return {Boolean}
 */
const isLoneCheckable = ({ attrs, options } = {}) => ['checkbox', 'radio'].includes(attrs?.type) && !options

/**
 * The position a field's label renders in: a valid config.labelPosition, then legacy config.labelAfter, then the
 * default (after for a lone checkbox or radio, top for everything else)
 * @param {Object} [field] field data: { attrs, config, options }
 * @return {'top'|'bottom'|'before'|'after'}
 */
export const resolveLabelPosition = (field = {}) => {
  const { labelPosition, labelAfter } = field.config || {}
  if (LABEL_POSITIONS.includes(labelPosition)) {
    return labelPosition
  }
  if (labelPosition !== undefined && !warnedValues.has(String(labelPosition))) {
    warnedValues.add(String(labelPosition))
    console.warn(`formeo: unknown labelPosition "${labelPosition}"; use one of ${LABEL_POSITIONS.join(', ')}`)
  }
  const lone = isLoneCheckable(field)
  if (typeof labelAfter === 'boolean') {
    if (lone) {
      return labelAfter ? 'after' : 'before'
    }
    return labelAfter ? 'bottom' : 'top'
  }
  return lone ? 'after' : 'top'
}

/**
 * Whether the label comes after the control in the DOM (and on screen)
 * @param {String} position a label position
 * @return {Boolean}
 */
export const isLabelAfter = position => position === 'bottom' || position === 'after'

/**
 * The label wrapper's classes for a position
 * @param {String} position a label position
 * @return {String[]} ['f-field', 'f-label-<position>']
 */
export const labelWrapClassNames = position => [FIELD_WRAP_CLASSNAME, `f-label-${position}`]

/**
 * A field's config with legacy labelAfter, or an unknown labelPosition, replaced by the labelPosition it resolves to.
 * Returns the same object when there is nothing to convert. Never mutates the field.
 * @param {Object} field field data
 * @return {Object|undefined} config
 */
export const normalizeLabelConfig = (field = {}) => {
  const { config } = field
  if (!config) {
    return config
  }
  const hasLegacy = 'labelAfter' in config
  const hasUnknown = config.labelPosition !== undefined && !LABEL_POSITIONS.includes(config.labelPosition)
  if (!hasLegacy && !hasUnknown) {
    return config
  }
  const { labelAfter: _labelAfter, ...rest } = config
  return { ...rest, labelPosition: resolveLabelPosition(field) }
}
