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

test.describe('onBeforeRemove (#281)', () => {
  test('returning false keeps the field and skips the remove action', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await page.evaluate(() => {
      window.__hooks.mode.beforeRemove = 'cancel'
    })
    await clickFieldAction(editor.locator('.formeo-field'), 'item-remove')
    await page.waitForTimeout(500)
    await expect(editor.locator('.formeo-field')).toHaveCount(1)
    expect(await hookCalls(page)).toEqual([{ name: 'beforeRemove', componentType: 'field', componentId: 'field-h' }])
  })

  test('a document listener can veto with preventDefault', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await page.evaluate(() => {
      document.addEventListener('formeoBeforeRemove', evt => evt.preventDefault(), { once: true })
    })
    await clickFieldAction(editor.locator('.formeo-field'), 'item-remove')
    await page.waitForTimeout(500)
    await expect(editor.locator('.formeo-field')).toHaveCount(1)
    expect(await hookCalls(page)).toEqual([])
  })

  test('an async hook removes once it resolves, and a double click asks only once', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await page.evaluate(() => {
      window.__hooks.mode.beforeRemove = 'defer'
    })
    const field = editor.locator('.formeo-field')
    await clickFieldAction(field, 'item-remove')
    await field.locator('.field-actions .item-remove').click()
    await page.waitForTimeout(300)
    await expect(field).toHaveCount(1)
    expect(await hookCalls(page, 'beforeRemove')).toHaveLength(1)
    await page.evaluate(() => window.__hooks.resolve.beforeRemove(true))
    await expect(field).toHaveCount(0)
    expect(await hookCalls(page, 'removeAction')).toHaveLength(1)
  })

  test('with pages, it can veto removing a page', async ({ page }) => {
    const editor = await mountHookedEditor(page, { pages: true })
    await editor.locator('.formeo-page-add').click()
    await expect(editor.locator('.formeo-page-tab-wrap')).toHaveCount(2)
    await page.evaluate(() => {
      window.__hooks.mode.beforeRemove = 'cancel'
    })
    await editor.locator('.formeo-page-tab-wrap').nth(1).locator('.formeo-page-remove').click()
    await page.waitForTimeout(300)
    await expect(editor.locator('.formeo-page-tab-wrap')).toHaveCount(2)
    const [call] = await hookCalls(page, 'beforeRemove')
    expect(call.componentType).toBe('stage')
  })
})
