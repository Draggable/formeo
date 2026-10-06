import { HIDDEN_BY_CONDITION_SELECTOR } from '../constants.js'
import { SKIP_DISABLED_ATTR, SKIPPABLE_CONTROLS, suspendRequired } from './helpers.js'
import { SKIPPED_ATTR } from './pagination.js'

/**
 * What adding and removing rows share (#349 phase 3): a repeating table's rows and input groups' copies alike
 */

/** Fired on the table or input-group wrapper after a row or group is added or removed; the renderer's onChange hears it */
export const ROWS_CHANGE_EVENT = 'formeo:rowschange'

/** The most rows or groups the userData setter creates for one table or input group, whatever a saved key asks for */
export const SETTER_ROW_LIMIT = 500

/**
 * Says `message` through a live region. Cleared first and set on the next frame, so the same message twice is
 * announced twice.
 * @param {HTMLElement|null} region an element with role="status"
 * @param {String} message
 */
export function announce(region, message) {
  if (!region) {
    return
  }
  region.textContent = ''
  const view = region.ownerDocument.defaultView
  const set = () => {
    region.textContent = message
  }
  if (view?.requestAnimationFrame) {
    view.requestAnimationFrame(set)
  } else {
    setTimeout(set, 0)
  }
}

/**
 * After a remove, focus the remove button now at the removed index, else the previous one, else `fallback`
 * @param {Array<HTMLButtonElement|null>} buttons the remove buttons left, in order
 * @param {Number} index the removed row's index among them
 * @param {HTMLElement|null} fallback usually the Add button
 */
export function focusAfterRemove(buttons, index, fallback) {
  const target = [buttons[index], buttons[index - 1], fallback].find(elem => elem && !elem.disabled)
  target?.focus()
}

/**
 * @param {HTMLElement} target the table or input-group wrapper
 * @param {'add'|'remove'} action
 * @param {Number} index the row's or group's index
 */
export function dispatchRowsChange(target, action, index) {
  const { CustomEvent } = target.ownerDocument.defaultView
  target.dispatchEvent(new CustomEvent(ROWS_CHANGE_EVENT, { bubbles: true, detail: { action, index } }))
}

/**
 * A row or group built after render takes on the state around it: not required inside a condition-hidden container,
 * disabled on a skipped page (marked, so bringing the page back re-enables it). Call it once the node is in place.
 * @param {HTMLElement} node
 */
export function adoptInto(node) {
  if (node.closest(HIDDEN_BY_CONDITION_SELECTOR)) {
    suspendRequired(node)
  }
  if (node.closest(`[${SKIPPED_ATTR}]`)) {
    for (const control of node.querySelectorAll(SKIPPABLE_CONTROLS)) {
      if (!control.disabled) {
        control.disabled = true
        control.setAttribute(SKIP_DISABLED_ATTR, '')
      }
    }
  }
}
