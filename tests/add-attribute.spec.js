// @ts-check
import { expect, test } from '@playwright/test'
import { addFieldAndEdit, gotoEditor } from './helpers/editor.js'

test.describe('Add attribute dialog (#233)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page)
  })

  test('adds an attribute through the in-app dialog, not window.prompt', async ({ page }) => {
    let nativeDialogs = 0
    page.on('dialog', d => {
      nativeDialogs++
      d.dismiss()
    })
    const { field, editPanel } = await addFieldAndEdit(page, 'Text Input', 'Attributes')
    await editPanel.getByRole('button', { name: '+ Attribute' }).click()
    const dialog = page.locator('.formeo-dialog.add-attribute-dialog')
    await expect(dialog).toBeVisible()
    await dialog.locator('[name="attrName"]').fill('data-limit')
    await dialog.locator('[name="attrValue"]').fill('10')
    await dialog.locator('button[type="submit"]').click()
    await expect(dialog).toHaveCount(0)
    const fieldId = await field.getAttribute('id')
    await expect
      .poll(() =>
        page.evaluate(id => window.frameworkLoader.currentDemo.editor.formData.fields[id].attrs['data-limit'], fieldId)
      )
      .toBe('10')
    await expect(editPanel.locator('.field-attrs-data-limit')).toHaveCount(1)
    expect(nativeDialogs).toBe(0)
  })

  test('refuses the disabled "type" attribute and stays open', async ({ page }) => {
    // Text Input's demo config gives it a type picklist that overrides the default
    // attrs.type disablement (see Component#isDisabledProp's "developer is explicitly
    // setting a value" early return), so use Radio Group, whose control config disables
    // attrs.type outright (src/lib/js/components/controls/form/radio-group.js).
    const { editPanel } = await addFieldAndEdit(page, 'Radio Group', 'Attributes')
    await editPanel.getByRole('button', { name: '+ Attribute' }).click()
    const dialog = page.locator('.formeo-dialog.add-attribute-dialog')
    const name = dialog.locator('[name="attrName"]')
    await name.fill('type')
    await dialog.locator('button[type="submit"]').click()
    await expect(dialog).toBeVisible()
    expect(await name.evaluate(el => el.validity.valid)).toBe(false)
  })

  test('Escape closes the dialog without adding anything', async ({ page }) => {
    const { editPanel } = await addFieldAndEdit(page, 'Text Input', 'Attributes')
    const before = await editPanel.locator('.attrs-panel li').count()
    await editPanel.getByRole('button', { name: '+ Attribute' }).click()
    await page.locator('.add-attribute-dialog [name="attrName"]').fill('data-x')
    await page.keyboard.press('Escape')
    await expect(page.locator('.add-attribute-dialog')).toHaveCount(0)
    await expect(editPanel.locator('.attrs-panel li')).toHaveCount(before)
  })
})
