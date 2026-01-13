// @ts-check
import { expect, test } from '@playwright/test'
import { conditionalFields } from './conditions.formData'

test.describe('Form Editor', () => {
  test('should load the form editor correctly', async ({ page }) => {
    await page.goto('/')

    // Check if the form editor is loaded by verifying the presence of a specific element
    await expect(page.locator('.formeo-editor')).toBeVisible()
  })

  test.skip('should load the form editor with the correct form data', async ({ page }) => {
    await page.goto('/')

    // Load the form data into the form editor
    await page.evaluate(formData => {
      window.formeoEditor.formData = formData
    }, conditionalFields)

    // Check if the form editor has the correct form data
    const formData = await page.evaluate(() => window.formeoEditor.formData)
    await expect(formData).toEqual(conditionalFields)
  })

  test('should add fields to the form editor', async ({ page }) => {
    await page.goto('/')

    // Add a field to the form editor
    const checkboxControl = page.getByRole('button', { name: 'Checkbox Group' })
    await checkboxControl.click()

    // Click on the first element matching the selector ".field-actions .edit-toggle"
    await page.locator('.field-actions').first().hover()
    await page.locator('.field-actions .edit-toggle').first().click()

    // click the options panel label
    await page.locator('.field-edit').first().getByRole('heading', { name: 'Options' }).click()

    await page.locator('.field-edit-options .label').click()
    await page.locator('.field-edit-options .label').press('ControlOrMeta+a')
    await page.locator('.field-edit-options .label').fill('Field One')
    await page.getByRole('button', { name: '+ Option' }).click()
  })
})
