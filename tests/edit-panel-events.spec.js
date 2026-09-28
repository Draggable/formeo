// @ts-check
import { expect, test } from '@playwright/test'
import { clickFieldAction, hookCalls, mountHookedEditor } from './helpers/hooks.js'

test.describe('edit panel events (#316)', () => {
  test('opening and closing a field panel calls onEditOpen and onEditClose', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    const field = editor.locator('.formeo-field')
    await clickFieldAction(field, 'edit-toggle')
    await expect(field.locator('.field-edit')).toBeVisible()
    await clickFieldAction(field, 'edit-toggle')
    await expect(field).not.toHaveClass(/editing/)
    expect((await hookCalls(page)).filter(call => call.name.startsWith('edit'))).toEqual([
      { name: 'editOpen', componentType: 'field', componentId: 'field-h' },
      { name: 'editClose', componentType: 'field', componentId: 'field-h' },
    ])
  })

  test('document listeners get formeoEditOpened with the component id', async ({ page }) => {
    const editor = await mountHookedEditor(page)
    await page.evaluate(() => {
      window.__opened = []
      document.addEventListener('formeoEditOpened', evt => window.__opened.push(evt.detail.componentId))
    })
    const row = editor.locator('.formeo-row')
    await row.locator('.row-actions').first().hover()
    await row.locator('.row-actions .edit-toggle').first().click()
    await expect.poll(() => page.evaluate(() => window.__opened)).toEqual(['row-h'])
  })
})
