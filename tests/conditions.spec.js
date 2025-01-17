// @ts-check
import { test, expect } from '@playwright/test'
import { conditionalFields } from './conditions.formData'

test.describe('Form Editor', () => {
  test('should load the form editor correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/absproxy/5173')

    // Check if the form editor is loaded by verifying the presence of a specific element
    await expect(page.locator('.formeo-editor')).toBeVisible()
  })

  test.skip('should load the form editor with the correct form data', async ({ page }) => {
    await page.goto('http://localhost:5173/absproxy/5173')

    // Load the form data into the form editor
    await page.evaluate(formData => {
      window.formeoEditor.formData = formData
    }, conditionalFields)

    // Check if the form editor has the correct form data
    const formData = await page.evaluate(() => window.formeoEditor.formData)
    await expect(formData).toEqual(conditionalFields)
  })

  test('should add fields to the form editor', async ({ page }) => {
    await page.goto('http://localhost:5173/absproxy/5173')

    // Add a field to the form editor
    const checkboxControl = page.getByRole('button', { name: 'Checkbox Group' })
    await checkboxControl.click()

    // Click on the first element matching the selector ".field-actions .edit-toggle"
    await page.locator('.field-actions').first().hover()
    await page.locator('.field-actions .edit-toggle').first().click()

    // click the options panel label
    await page.locator('.field-edit').first().getByRole('heading', { name: 'Options' }).click()

    await page.getByPlaceholder('Label').click();
    await page.getByPlaceholder('Label').press('ControlOrMeta+a');
    await page.getByPlaceholder('Label').fill('Field One');
    await page.getByRole('button', { name: '+ Option' }).click();
    
  })
})
