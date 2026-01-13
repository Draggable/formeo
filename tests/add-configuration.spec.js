// @ts-check
import { expect, test } from '@playwright/test'

test.describe('Add Configuration to Field', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the editor to load
    await expect(page.locator('.formeo-editor')).toBeVisible()
    // Wait for controls to be fully initialized
    await page.waitForTimeout(500)
  })

  test('should open config dialog when clicking add config button', async ({ page }) => {
    // Add a text input field
    await page.getByRole('button', { name: 'Text Input' }).click()
    await page.waitForTimeout(300)

    // Open the edit panel
    await page.locator('.field-actions').first().hover()
    await page.locator('.field-actions .edit-toggle').first().click()

    // Wait for edit panel to be visible
    const editPanel = page.locator('.field-edit').first()
    await editPanel.waitFor({ state: 'visible', timeout: 5000 })

    // Click on the Configuration panel header to expand it
    await editPanel.getByRole('heading', { name: 'Configuration' }).click()

    // Click the add config button
    await page.getByRole('button', { name: '+ Add Config' }).click()

    // Verify the dialog appears
    const dialog = page.locator('.formeo-dialog.config-item-dialog')
    await expect(dialog).toBeVisible()

    // Verify the select element is present
    const select = dialog.locator('select.config-key-select')
    await expect(select).toBeVisible()
  })

  test('should add tooltip configuration to field', async ({ page }) => {
    // Add a text input field
    await page.getByRole('button', { name: 'Text Input' }).click()
    await page.waitForTimeout(300)

    // Open the edit panel
    await page.locator('.field-actions').first().hover()
    await page.locator('.field-actions .edit-toggle').first().click()

    // Wait for edit panel to be visible
    const editPanel = page.locator('.field-edit').first()
    await editPanel.waitFor({ state: 'visible', timeout: 5000 })

    // Click on the Configuration panel header to expand it
    await editPanel.getByRole('heading', { name: 'Configuration' }).click()

    // Count config items before adding
    const configPanel = page.locator('.config-panel .edit-group')
    const configItemsBefore = await configPanel.locator('li').count()

    // Click the add config button
    await page.getByRole('button', { name: '+ Add Config' }).click()

    // Wait for dialog
    const dialog = page.locator('.formeo-dialog.config-item-dialog')
    await expect(dialog).toBeVisible()

    // Select tooltip option (not already present in default config)
    const select = dialog.locator('select.config-key-select')
    await select.selectOption('tooltip')

    // Click the submit/save button
    await dialog.locator('button[type="submit"]').click()

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible()

    // Verify the config item was added
    await page.waitForTimeout(200)
    const configItemsAfter = await configPanel.locator('li').count()
    expect(configItemsAfter).toBeGreaterThan(configItemsBefore)
  })

  test('should add labelAfter configuration to field', async ({ page }) => {
    // Add an email field (different field type to verify it works across controls)
    await page.getByRole('button', { name: 'Email' }).click()
    await page.waitForTimeout(300)

    // Open the edit panel
    await page.locator('.field-actions').first().hover()
    await page.locator('.field-actions .edit-toggle').first().click()

    // Wait for edit panel to be visible
    const editPanel = page.locator('.field-edit').first()
    await editPanel.waitFor({ state: 'visible', timeout: 5000 })

    // Click on the Configuration panel header
    await editPanel.getByRole('heading', { name: 'Configuration' }).click()

    // Click the add config button
    await page.getByRole('button', { name: '+ Add Config' }).click()

    // Wait for dialog
    const dialog = page.locator('.formeo-dialog.config-item-dialog')
    await expect(dialog).toBeVisible()

    // Select labelAfter option
    await dialog.locator('select.config-key-select').selectOption('labelAfter')

    // Click submit
    await dialog.locator('button[type="submit"]').click()

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible()

    // Verify labelAfter config item exists in the panel
    await page.waitForTimeout(200)
    const labelAfterItem = page.locator('.config-panel').getByText('Label After')
    await expect(labelAfterItem).toBeVisible()
  })

  test('should filter out already existing config options', async ({ page }) => {
    // Add a text input field
    await page.getByRole('button', { name: 'Text Input' }).click()
    await page.waitForTimeout(300)

    // Open the edit panel
    await page.locator('.field-actions').first().hover()
    await page.locator('.field-actions .edit-toggle').first().click()

    // Wait for edit panel to be visible
    const editPanel = page.locator('.field-edit').first()
    await editPanel.waitFor({ state: 'visible', timeout: 5000 })

    // Click on the Configuration panel header
    await editPanel.getByRole('heading', { name: 'Configuration' }).click()

    // Click the add config button
    await page.getByRole('button', { name: '+ Add Config' }).click()

    // Wait for dialog
    const dialog = page.locator('.formeo-dialog.config-item-dialog')
    await expect(dialog).toBeVisible()

    // Get all option values in the select
    const optionValues = await dialog
      .locator('select.config-key-select option')
      .evaluateAll(options => options.map(opt => opt.value))

    // 'label' and 'hideLabel' should NOT be in the options since they're already in the default config
    // The select should have filtered out existing config keys
    expect(optionValues).not.toContain('label')
    expect(optionValues).not.toContain('hideLabel')

    // But labelAfter, tooltip, disableHtmlLabel should still be available
    expect(optionValues).toContain('labelAfter')
    expect(optionValues).toContain('tooltip')
    expect(optionValues).toContain('disableHtmlLabel')

    // Close dialog
    await dialog.locator('button[type="button"]').click()
    await expect(dialog).not.toBeVisible()
  })

  test('should cancel dialog without adding configuration', async ({ page }) => {
    // Add a text input field
    await page.getByRole('button', { name: 'Text Input' }).click()
    await page.waitForTimeout(300)

    // Open the edit panel
    await page.locator('.field-actions').first().hover()
    await page.locator('.field-actions .edit-toggle').first().click()

    // Wait for edit panel to be visible
    const editPanel = page.locator('.field-edit').first()
    await editPanel.waitFor({ state: 'visible', timeout: 5000 })

    // Click on the Configuration panel header
    await editPanel.getByRole('heading', { name: 'Configuration' }).click()

    // Count config items before
    const configPanel = page.locator('.config-panel .edit-group')
    const configItemsBefore = await configPanel.locator('li').count()

    // Click the add config button
    await page.getByRole('button', { name: '+ Add Config' }).click()

    // Wait for dialog
    const dialog = page.locator('.formeo-dialog.config-item-dialog')
    await expect(dialog).toBeVisible()

    // Select an option
    await dialog.locator('select.config-key-select').selectOption('tooltip')

    // Click cancel button instead of submit
    await dialog.locator('button[type="button"]').click()

    // Verify dialog is closed
    await expect(dialog).not.toBeVisible()

    // Verify no config item was added
    await page.waitForTimeout(200)
    const configItemsAfter = await configPanel.locator('li').count()
    expect(configItemsAfter).toBe(configItemsBefore)
  })

  test('should add multiple config items sequentially', async ({ page }) => {
    // Add a number field
    await page.getByRole('button', { name: 'Number' }).click()
    await page.waitForTimeout(300)

    // Open the edit panel
    await page.locator('.field-actions').first().hover()
    await page.locator('.field-actions .edit-toggle').first().click()

    // Wait for edit panel to be visible
    const editPanel = page.locator('.field-edit').first()
    await editPanel.waitFor({ state: 'visible', timeout: 5000 })

    // Click on the Configuration panel header
    await editPanel.getByRole('heading', { name: 'Configuration' }).click()

    const configPanel = page.locator('.config-panel .edit-group')
    const configItemsBefore = await configPanel.locator('li').count()

    // Add first config item (tooltip)
    await page.getByRole('button', { name: '+ Add Config' }).click()
    let dialog = page.locator('.formeo-dialog.config-item-dialog')
    await expect(dialog).toBeVisible()
    await dialog.locator('select.config-key-select').selectOption('tooltip')
    await dialog.locator('button[type="submit"]').click()
    await expect(dialog).not.toBeVisible()
    await page.waitForTimeout(200)

    // Add second config item (labelAfter)
    await page.getByRole('button', { name: '+ Add Config' }).click()
    dialog = page.locator('.formeo-dialog.config-item-dialog')
    await expect(dialog).toBeVisible()
    await dialog.locator('select.config-key-select').selectOption('labelAfter')
    await dialog.locator('button[type="submit"]').click()
    await expect(dialog).not.toBeVisible()
    await page.waitForTimeout(200)

    // Verify both config items were added
    const configItemsAfter = await configPanel.locator('li').count()
    expect(configItemsAfter).toBe(configItemsBefore + 2)
  })

  test('should update field preview after adding configuration', async ({ page }) => {
    // Set up listener for formeoUpdated event
    await page.evaluate(() => {
      globalThis.updateEvents = []
      document.addEventListener('formeoUpdated', () => {
        globalThis.updateEvents.push({ timestamp: Date.now() })
      })
    })

    // Add a text input field
    await page.getByRole('button', { name: 'Text Input' }).click()
    await page.waitForTimeout(300)

    // Clear events from adding field
    await page.evaluate(() => {
      globalThis.updateEvents = []
    })

    // Open the edit panel
    await page.locator('.field-actions').first().hover()
    await page.locator('.field-actions .edit-toggle').first().click()

    // Wait for edit panel to be visible
    const editPanel = page.locator('.field-edit').first()
    await editPanel.waitFor({ state: 'visible', timeout: 5000 })

    // Click on the Configuration panel header
    await editPanel.getByRole('heading', { name: 'Configuration' }).click()

    // Click the add config button
    await page.getByRole('button', { name: '+ Add Config' }).click()

    // Wait for dialog
    const dialog = page.locator('.formeo-dialog.config-item-dialog')
    await expect(dialog).toBeVisible()

    // Select tooltip option
    await dialog.locator('select.config-key-select').selectOption('tooltip')

    // Click submit
    await dialog.locator('button[type="submit"]').click()
    await expect(dialog).not.toBeVisible()

    // Wait for debounced update
    await page.waitForTimeout(500)

    // Verify update event was fired
    const updateEvents = await page.evaluate(() => globalThis.updateEvents)
    expect(updateEvents.length).toBeGreaterThan(0)
  })
})
