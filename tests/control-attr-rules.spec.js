// @ts-check
import { expect, test } from '@playwright/test'
import { addFieldAndEdit, gotoEditor } from './helpers/editor.js'

// The demo registers an Email control with
//   config: { disabledAttrs: ['type'], lockedAttrs: ['required', 'className'] }
// (src/demo/js/options/controls.js). Its accessible button name is `@ Email`
// because its icon is the literal `@`.
test.describe('Control-level lockedAttrs / disabledAttrs', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page)
  })

  test('locked attrs have no remove button and disabled attrs are not shown', async ({ page }) => {
    const { field } = await addFieldAndEdit(page, '@ Email', 'Attributes')
    const attrsPanel = field.locator('.attrs-panel')
    await expect(attrsPanel).toBeVisible()

    // disabled: not rendered at all, so it cannot be edited
    await expect(attrsPanel.locator('.field-attrs-type')).toHaveCount(0)

    // locked: rendered, marked locked, but no remove control
    for (const attr of ['required', 'className']) {
      const row = attrsPanel.locator(`.field-attrs-${attr}`)
      await expect(row).toHaveCount(1)
      await expect(row.locator('.prop-remove')).toHaveCount(0)
      await expect(row.locator('.locked-prop')).toHaveCount(1)
    }
  })

  test('a disabled attr cannot be re-added with + Attribute', async ({ page }) => {
    // The demo's default add-attribute UI is an in-app dialog (see add-attribute.spec.js),
    // not window.prompt/alert: submitting a disabled name sets a custom validity message
    // and the dialog stays open instead of adding the attribute.
    const { field } = await addFieldAndEdit(page, '@ Email', 'Attributes')
    await field.locator('.attrs-panel .add-attrs').click()
    const dialog = page.locator('.formeo-dialog.add-attribute-dialog')
    await expect(dialog).toBeVisible()
    const name = dialog.locator('[name="attrName"]')
    await name.fill('type')
    await dialog.locator('button[type="submit"]').click()
    await expect(dialog).toBeVisible()
    expect(await name.evaluate(el => el.validity.valid)).toBe(false)
    await expect(field.locator('.attrs-panel .field-attrs-type')).toHaveCount(0)
  })

  test('a locked attr cannot be re-added with + Attribute', async ({ page }) => {
    const { field } = await addFieldAndEdit(page, '@ Email', 'Attributes')
    await field.locator('.attrs-panel .add-attrs').click()
    const dialog = page.locator('.formeo-dialog.add-attribute-dialog')
    await expect(dialog).toBeVisible()
    const name = dialog.locator('[name="attrName"]')
    await name.fill('required')
    await dialog.locator('button[type="submit"]').click()
    await expect(dialog).toBeVisible()
    expect(await name.evaluate(el => el.validity.valid)).toBe(false)

    const fieldId = await field.getAttribute('id')
    const required = await page.evaluate(
      id => window.frameworkLoader.currentDemo.editor.formData.fields[id].attrs.required,
      fieldId
    )
    expect(required).toBe(true)
  })

  test('the keyboard cannot toggle a locked checkbox', async ({ page }) => {
    const { field } = await addFieldAndEdit(page, '@ Email', 'Attributes')
    const checkbox = field.locator('.field-attrs-required input[type="checkbox"]')
    await expect(checkbox).toBeVisible()
    await expect(checkbox).toBeDisabled()

    await checkbox.focus()
    await page.keyboard.press('Space')

    const fieldId = await field.getAttribute('id')
    const required = await page.evaluate(
      id => window.frameworkLoader.currentDemo.editor.formData.fields[id].attrs.required,
      fieldId
    )
    expect(required).toBe(true)
  })
})
