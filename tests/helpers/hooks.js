// @ts-check
import { expect } from '@playwright/test'
import { formFor } from './multi-editor.js'

/**
 * Mounts an editor in #e2e-hooks (above the demo editor) with the one-field form formFor('h', 'Name'), so the field
 * is `field-h` in `stage-h`. Its before-hooks, remove action, onSave and edit-panel events record into
 * window.__hooks.calls. Steer them from the test:
 * - window.__hooks.mode[name] = 'cancel' | 'defer' (default: allow), for name in beforeAdd, beforeRemove,
 *   beforeClone, beforeSave; resolve a deferred one with window.__hooks.resolve[name](value)
 * - window.__hooks.mode.removeAction = 'defer' keeps actions.remove.component events in window.__hooks.removeRequests
 * The editor is window.__editor.
 * @param {import('@playwright/test').Page} page
 * @param {{ pages?: boolean }} [options]
 * @return {Promise<import('@playwright/test').Locator>} the editor's container
 */
export const mountHookedEditor = async (page, { pages = false } = {}) => {
  await page.goto('/')
  await expect(page.locator('.formeo-editor').first()).toBeVisible()
  await page.evaluate(
    async ({ formData, pages }) => {
      const hooks = { calls: [], mode: {}, resolve: {}, removeRequests: [] }
      window.__hooks = hooks
      const entry = (name, props = {}) => ({
        name,
        ...Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)),
      })
      const before =
        name =>
        ({ detail }) => {
          const { componentType, componentId, addedVia } = detail
          hooks.calls.push(entry(name, { componentType, componentId, addedVia }))
          const mode = hooks.mode[name]
          if (mode === 'cancel') {
            return false
          }
          if (mode === 'defer') {
            return new Promise(resolve => {
              hooks.resolve[name] = resolve
            })
          }
        }
      const record =
        name =>
        ({ detail }) =>
          hooks.calls.push(entry(name, { componentType: detail.componentType, componentId: detail.componentId }))
      const container = document.createElement('div')
      container.id = 'e2e-hooks'
      document.body.prepend(container)
      window.__editor = new window.FormeoEditor(
        {
          editorContainer: container,
          sessionStorage: false,
          style: null,
          pages,
          events: {
            onBeforeAdd: before('beforeAdd'),
            onBeforeRemove: before('beforeRemove'),
            onBeforeClone: before('beforeClone'),
            onBeforeSave: before('beforeSave'),
            onSave: () => hooks.calls.push(entry('save')),
            onEditOpen: record('editOpen'),
            onEditClose: record('editClose'),
          },
          actions: {
            remove: {
              component: evt => {
                hooks.calls.push(
                  entry('removeAction', { componentType: evt.componentType, componentId: evt.componentId })
                )
                if (hooks.mode.removeAction === 'defer') {
                  hooks.removeRequests.push(evt)
                  return
                }
                evt.removeAction()
              },
            },
          },
        },
        formData
      )
      await window.__editor.whenReady()
    },
    { formData: formFor('h', 'Name'), pages }
  )
  return page.locator('#e2e-hooks')
}

/**
 * Hovers a field's action bar, then clicks one of its buttons
 * @param {import('@playwright/test').Locator} field a .formeo-field
 * @param {string} className e.g. 'item-remove'
 */
export const clickFieldAction = async (field, className) => {
  await field.locator('.field-actions').hover()
  await field.locator(`.field-actions .${className}`).click()
}

/**
 * What the hooks recorded, optionally only the calls named `name`
 * @param {import('@playwright/test').Page} page
 * @param {string} [name]
 */
export const hookCalls = (page, name) =>
  page.evaluate(n => window.__hooks.calls.filter(call => !n || call.name === n), name)
