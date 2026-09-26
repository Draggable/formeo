import { unique } from '../../common/utils/index.mjs'

/**
 * Returns the `config` of a registered control, whether the registry holds the Control
 * instance (keyed by uuid) or its plain controlData (keyed by meta.id).
 * @param {Object} [control]
 * @return {Object|undefined}
 */
export const getControlConfig = control => control?.controlData?.config ?? control?.config

/**
 * Maps control-level `disabledAttrs` / `lockedAttrs` onto the field panel config shape
 * used by Component#isDisabledProp / Component#isLockedProp.
 * Lists from every source are unioned; nothing here can un-disable or un-lock an attribute.
 * @param {...Object} sources objects that may carry disabledAttrs / lockedAttrs
 * @return {Object|null} `{ panels: { attrs: { disabled, locked } } }` or null when there is nothing to map
 */
export const controlAttrPanelConfig = (...sources) => {
  const collect = key => unique(sources.flatMap(source => (Array.isArray(source?.[key]) ? source[key] : [])))
  const disabled = collect('disabledAttrs')
  const locked = collect('lockedAttrs')

  if (!disabled.length && !locked.length) {
    return null
  }

  return { panels: { attrs: { disabled, locked } } }
}
