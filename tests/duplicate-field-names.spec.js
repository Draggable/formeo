// @ts-check
import { expect, test } from '@playwright/test'
import { addFieldAndEdit, gotoEditor } from './helpers/editor.js'

/**
 * Hover a field's action bar and click one of its buttons
 * @param {import('@playwright/test').Locator} field
 * @param {'clone' | 'remove' | 'edit-toggle'} action
 */
const fieldAction = async (field, action) => {
  await field.locator('.field-actions').hover()
  await field.locator(`.field-actions .${action === 'edit-toggle' ? action : `item-${action}`}`).click()
}

/**
 * Open a field's Attributes panel unless it is already showing
 * @param {import('@playwright/test').Locator} field
 */
const openAttributes = async field => {
  const editPanel = field.locator('.field-edit')
  if (!(await editPanel.isVisible())) {
    await fieldAction(field, 'edit-toggle')
    await editPanel.waitFor({ state: 'visible' })
  }
  await editPanel.getByRole('heading', { name: 'Attributes' }).click()
  await expect(field.locator('.attrs-panel')).toBeVisible()
}

test.describe('Duplicate field name hint (#331)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page)
  })

  test('warns on both fields after a clone, and clears on rename or removal', async ({ page }) => {
    const { field, editPanel } = await addFieldAndEdit(page, 'Text Input', 'Attributes')
    const originalId = await field.getAttribute('id')
    // `field` is "the last field", which a clone changes, so pin the original by id
    const original = page.locator(`.formeo-field[id="${originalId}"]`)

    await editPanel.locator('.add-attrs').click()
    const dialog = page.locator('.formeo-dialog.add-attribute-dialog')
    await expect(dialog).toBeVisible()
    await dialog.locator('[name="attrName"]').fill('name')
    await dialog.locator('[name="attrValue"]').fill('email')
    await dialog.locator('button[type="submit"]').click()
    await expect(dialog).toHaveCount(0)
    await expect(original.locator('.field-attrs-name')).toHaveCount(1)
    // a unique name gets no warning
    await expect(original.locator('.duplicate-name-hint')).toBeHidden()

    await fieldAction(original, 'clone')
    const fields = page.locator('.formeo-field')
    await expect(fields).toHaveCount(2)
    const copy = page.locator(`.formeo-field:not([id="${originalId}"])`)

    for (const each of [original, copy]) {
      await openAttributes(each)
      const hint = each.locator('.field-attrs-name .duplicate-name-hint')
      await expect(hint).toBeVisible()
      await expect(hint).toContainText('email')
      await expect(hint).toHaveAttribute('role', 'status')
      const hintId = await hint.getAttribute('id')
      await expect(each.locator('.field-attrs-name input')).toHaveAttribute('aria-describedby', hintId ?? '')
    }

    await copy.locator('.field-attrs-name input').fill('phone')
    await expect(original.locator('.duplicate-name-hint')).toBeHidden()
    await expect(copy.locator('.duplicate-name-hint')).toBeHidden()

    // clone the original again, then remove that clone
    await fieldAction(original, 'clone')
    await expect(fields).toHaveCount(3)
    await expect(original.locator('.duplicate-name-hint')).toBeVisible()
    const secondCopy = original.locator('xpath=following-sibling::li[contains(@class, "formeo-field")][1]')
    await expect(secondCopy).not.toHaveAttribute('id', originalId ?? '')
    await fieldAction(secondCopy, 'remove')
    await expect(fields).toHaveCount(2)
    await expect(original.locator('.duplicate-name-hint')).toBeHidden()
  })
})
