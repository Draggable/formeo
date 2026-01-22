// @ts-check
import { expect, test } from '@playwright/test'

/**
 * Helper to get the editor instance from the demo page
 */
const getEditor = () => window.frameworkLoader?.currentDemo?.editor

test.describe('Editor Initialization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the editor to load
    await expect(page.locator('.formeo-editor')).toBeVisible()
    // Wait for full initialization using whenReady
    await page.evaluate(async () => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      await editor?.whenReady()
    })
  })

  test('should expose initState property on editor instance', async ({ page }) => {
    const initState = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return editor?.initState
    })

    expect(initState).toBe('ready')
  })

  test('should expose isReady property on editor instance', async ({ page }) => {
    const isReady = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return editor?.isReady
    })

    expect(isReady).toBe(true)
  })

  test('should have whenReady method that resolves immediately when ready', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      if (!editor) return { error: 'No editor instance' }

      const start = Date.now()
      await editor.whenReady()
      const elapsed = Date.now() - start

      return {
        resolved: true,
        elapsed,
        isReady: editor.isReady,
      }
    })

    expect(result.resolved).toBe(true)
    expect(result.elapsed).toBeLessThan(100) // Should resolve almost immediately
    expect(result.isReady).toBe(true)
  })

  test('should preserve form data after adding fields', async ({ page }) => {
    // Add some fields
    await page.getByRole('button', { name: 'Text Input' }).click()
    await page.getByRole('button', { name: 'Email' }).click()

    // Get the form data
    const formData = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return editor?.formData
    })

    expect(formData).toBeTruthy()
    expect(formData.id).toBeTruthy()
    expect(Object.keys(formData.fields).length).toBe(2)
  })

  test('should have initState as a string property', async ({ page }) => {
    const hasInitState = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return typeof editor?.initState === 'string'
    })

    expect(hasInitState).toBe(true)
  })
})

test.describe('Form Data Persistence', () => {
  test('should preserve form data structure after initialization', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()
    await page.evaluate(async () => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      await editor?.whenReady()
    })

    // Get initial form data
    const initialFormData = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return editor?.formData
    })

    expect(initialFormData).toBeTruthy()
    expect(initialFormData.id).toBeTruthy()
    expect(initialFormData.stages).toBeTruthy()
    expect(initialFormData.rows).toBeTruthy()
    expect(initialFormData.columns).toBeTruthy()
    expect(initialFormData.fields).toBeTruthy()
  })

  test('should maintain form data after clearing', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()
    await page.evaluate(async () => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      await editor?.whenReady()
    })

    // Add a field first
    await page.getByRole('button', { name: 'Text Input' }).click()

    // Get form id before clear
    const beforeClear = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return {
        id: editor?.formData?.id,
        fieldCount: Object.keys(editor?.formData?.fields || {}).length,
      }
    })

    expect(beforeClear.fieldCount).toBe(1)

    // Clear the form
    await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      editor?.clear()
    })

    // Get form data after clear
    const afterClear = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return {
        id: editor?.formData?.id,
        fieldCount: Object.keys(editor?.formData?.fields || {}).length,
        hasStages: Object.keys(editor?.formData?.stages || {}).length > 0,
      }
    })

    // ID should be different after clear
    expect(afterClear.id).not.toBe(beforeClear.id)
    // Fields should be empty
    expect(afterClear.fieldCount).toBe(0)
    // Should still have at least one stage
    expect(afterClear.hasStages).toBe(true)
  })
})

test.describe('Language Change Data Persistence', () => {
  test('should preserve form data when setLang is called', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()
    await page.evaluate(async () => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      await editor?.whenReady()
    })

    // Add some fields first
    await page.getByRole('button', { name: 'Text Input' }).click()
    await page.getByRole('button', { name: 'Select' }).click()

    // Get form data before language change
    const beforeLangChange = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return {
        id: editor?.formData?.id,
        fieldCount: Object.keys(editor?.formData?.fields || {}).length,
        fieldIds: Object.keys(editor?.formData?.fields || {}),
      }
    })

    expect(beforeLangChange.fieldCount).toBe(2)

    // Change language (this should NOT reload form data)
    await page.evaluate(async () => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      if (editor?.i18n?.setLang) {
        await editor.i18n.setLang('en-US')
      }
    })

    // Get form data after language change
    const afterLangChange = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return {
        id: editor?.formData?.id,
        fieldCount: Object.keys(editor?.formData?.fields || {}).length,
        fieldIds: Object.keys(editor?.formData?.fields || {}),
        isReady: editor?.isReady,
      }
    })

    // Form ID should be the same (data preserved)
    expect(afterLangChange.id).toBe(beforeLangChange.id)
    // Field count should be the same
    expect(afterLangChange.fieldCount).toBe(beforeLangChange.fieldCount)
    // Field IDs should be preserved
    expect(afterLangChange.fieldIds).toEqual(beforeLangChange.fieldIds)
    // Editor should still be ready
    expect(afterLangChange.isReady).toBe(true)
  })

  test('should not clear fields when changing language', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()
    await page.evaluate(async () => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      await editor?.whenReady()
    })

    // Add multiple fields
    await page.getByRole('button', { name: 'Text Input' }).click()
    await page.getByRole('button', { name: 'Email' }).click()
    await page.getByRole('button', { name: 'Number' }).click()

    // Verify fields are visible
    const fieldsBeforeCount = await page.locator('.formeo-field').count()
    expect(fieldsBeforeCount).toBe(3)

    // Change language
    await page.evaluate(async () => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      if (editor?.i18n?.setLang) {
        await editor.i18n.setLang('en-US')
      }
    })

    // Verify fields are still visible
    const fieldsAfterCount = await page.locator('.formeo-field').count()
    expect(fieldsAfterCount).toBe(3)
  })
})

test.describe('Editor State Transitions', () => {
  test('should be in ready state after initialization', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()
    await page.evaluate(async () => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      await editor?.whenReady()
    })

    // Check final state
    const finalState = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return editor?.initState
    })
    expect(finalState).toBe('ready')
  })

  test('should have isReady=true after initialization', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()
    await page.evaluate(async () => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      await editor?.whenReady()
    })

    const result = await page.evaluate(() => {
      const editor = window.frameworkLoader?.currentDemo?.editor
      return {
        hasIsReady: typeof editor?.isReady === 'boolean',
        isReady: editor?.isReady,
      }
    })

    expect(result.hasIsReady).toBe(true)
    expect(result.isReady).toBe(true)
  })
})
