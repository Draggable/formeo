// @ts-check
import { expect, test } from '@playwright/test'
import { clickFieldAction, hookCalls, mountHookedEditor } from './helpers/hooks.js'

let errors
test.beforeEach(({ page }) => {
  errors = []
  page.on('pageerror', err => errors.push(err.message))
})
test.afterEach(() => {
  expect(errors).toEqual([])
})

test.describe('actions.remove.component (#281)', () => {
  test('the default removes a field at once', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await clickFieldAction(editor.locator('.formeo-field'), 'item-remove')
    await expect(editor.locator('.formeo-field')).toHaveCount(0)
    expect(await hookCalls(page, 'removeAction')).toEqual([
      { name: 'removeAction', componentType: 'field', componentId: 'field-h' },
    ])
  })

  test('a custom handler can hold the removal and finish it later', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await page.evaluate(() => {
      window.__hooks.mode.removeAction = 'defer'
    })
    await clickFieldAction(editor.locator('.formeo-field'), 'item-remove')
    await page.waitForTimeout(500)
    await expect(editor.locator('.formeo-field')).toHaveCount(1)
    await page.evaluate(() => window.__hooks.removeRequests[0].removeAction())
    await expect(editor.locator('.formeo-field')).toHaveCount(0)
    expect(await page.evaluate(() => Object.keys(window.__editor.formData.fields))).toEqual([])
  })
})
