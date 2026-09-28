// @ts-check
import { expect, test } from '@playwright/test'
import { clickFieldAction, hookCalls, mountHookedEditor } from './helpers/hooks.js'
import { dragControlTo } from './helpers/multi-editor.js'

let errors
test.beforeEach(({ page }) => {
  errors = []
  page.on('pageerror', err => errors.push(err.message))
})
test.afterEach(() => {
  expect(errors).toEqual([])
})

test.describe('actions.remove.component (#281)', () => {
  test('a remove action that calls removeAction removes the field at once', async ({ page }) => {
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

test.describe('onBeforeAdd (#281)', () => {
  test('a click held by a Promise adds the field once it resolves', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await page.evaluate(() => {
      window.__hooks.mode.beforeAdd = 'defer'
    })
    await editor.getByRole('button', { name: 'Text Input' }).click()
    await page.waitForTimeout(300)
    await expect(editor.locator('.formeo-field')).toHaveCount(1)
    expect(await hookCalls(page, 'beforeAdd')).toEqual([
      { name: 'beforeAdd', componentType: 'field', addedVia: 'click' },
    ])
    await page.evaluate(() => window.__hooks.resolve.beforeAdd(true))
    await expect(editor.locator('.formeo-field')).toHaveCount(2)
  })

  test('a cancelled drop leaves no field and no empty row', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await page.evaluate(() => {
      window.__hooks.mode.beforeAdd = 'cancel'
    })
    await dragControlTo(page, editor.locator('.text-input-control'), editor.locator('.formeo-stage'))
    await page.waitForTimeout(300)
    await expect(editor.locator('.formeo-field')).toHaveCount(1)
    await expect(editor.locator('.formeo-row')).toHaveCount(1)
    const [call] = await hookCalls(page, 'beforeAdd')
    expect(call).toEqual({ name: 'beforeAdd', componentType: 'field', addedVia: 'dragDrop' })
  })

  test('an allowed drop still adds the field', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await dragControlTo(page, editor.locator('.text-input-control'), editor.locator('.formeo-stage'))
    await expect(editor.locator('.formeo-field')).toHaveCount(2)
  })

  test('with pages, it can veto the + tab', async ({ page }) => {
    const editor = await mountHookedEditor(page, { pages: true })
    await page.evaluate(() => {
      window.__hooks.mode.beforeAdd = 'cancel'
    })
    await editor.locator('.formeo-page-add').click()
    await page.waitForTimeout(300)
    await expect(editor.locator('.formeo-page-tab-wrap')).toHaveCount(1)
    expect(await hookCalls(page, 'beforeAdd')).toEqual([{ name: 'beforeAdd', componentType: 'stage' }])
  })

  test('destroying the editor while a hook waits adds nothing and throws nothing', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await page.evaluate(() => {
      window.__hooks.mode.beforeAdd = 'defer'
    })
    await editor.getByRole('button', { name: 'Text Input' }).click()
    // destroy() empties the Components store (FormeoEditor#destroy calls Components.empty()), so formData's
    // baseline field count is 0 once destroyed. If the held add still went through after that, it would create
    // a field entry and bring the count back to 1 - that's the real regression check. The pageerror check in
    // afterEach covers "throws nothing".
    const result = await page.evaluate(async () => {
      let addedAfterDestroy = false
      document.addEventListener('formeoAddedField', () => {
        addedAfterDestroy = true
      })
      window.__editor.destroy()
      window.__hooks.resolve.beforeAdd(true)
      await new Promise(resolve => setTimeout(resolve, 300))
      return { fields: Object.keys(window.__editor.formData.fields).length, addedAfterDestroy }
    })
    expect(result.fields).toBe(0)
    expect(result.addedAfterDestroy).toBe(false)
  })
})

test.describe('onBeforeClone and onBeforeSave (#281)', () => {
  test('onBeforeClone can cancel cloning a field', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await page.evaluate(() => {
      window.__hooks.mode.beforeClone = 'cancel'
    })
    await clickFieldAction(editor.locator('.formeo-field'), 'item-clone')
    await page.waitForTimeout(300)
    await expect(editor.locator('.formeo-field')).toHaveCount(1)
    await page.evaluate(() => {
      window.__hooks.mode.beforeClone = 'allow'
    })
    await clickFieldAction(editor.locator('.formeo-field').first(), 'item-clone')
    await expect(editor.locator('.formeo-field')).toHaveCount(2)
  })

  test('onBeforeSave can cancel the save, and onSave only fires once allowed', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await page.evaluate(() => {
      window.__hooks.mode.beforeSave = 'cancel'
    })
    await editor.locator('.save-form').click()
    expect(await hookCalls(page, 'save')).toEqual([])
    await page.evaluate(() => {
      window.__hooks.mode.beforeSave = 'allow'
    })
    await editor.locator('.save-form').click()
    expect(await hookCalls(page, 'save')).toEqual([{ name: 'save' }])
    expect(await hookCalls(page, 'beforeSave')).toHaveLength(2)
  })
})
