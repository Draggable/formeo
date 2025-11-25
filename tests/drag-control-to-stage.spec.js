// @ts-check
import { expect, test } from '@playwright/test'

test.describe('Drag Control to Stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the editor to load
    await expect(page.locator('.formeo-editor')).toBeVisible()
    // Wait for controls to be fully initialized
    await page.waitForTimeout(500)
  })

  test('should add a control to stage via click', async ({ page }) => {
    // Get the control button
    const textInputControl = page.getByRole('button', { name: 'Text Input' })

    await expect(textInputControl).toBeVisible()

    // Count fields before click
    const fieldsBefore = await page.locator('.formeo-field').count()

    // Click to add (alternative to drag)
    await textInputControl.click()

    // Wait for the field to be added
    await page.waitForTimeout(300)

    // Verify a field was added to the stage
    const fieldsAfter = await page.locator('.formeo-field').count()
    expect(fieldsAfter).toBeGreaterThan(fieldsBefore)
  })

  test('should keep control in sidebar after adding to stage', async ({ page }) => {
    // Get the control button
    const textInputControl = page.getByRole('button', { name: 'Text Input' })

    await expect(textInputControl).toBeVisible()

    // Add control to stage
    await textInputControl.click()

    // Wait for animation to complete
    await page.waitForTimeout(300)

    // Verify the control is still in the sidebar
    await expect(textInputControl).toBeVisible()
    await expect(textInputControl).toBeEnabled()
  })

  test('should not cause layout shift when dragging control', async ({ page }) => {
    // Get the control groups container
    const controlGroups = page.locator('.control-groups')
    const textInputControl = page.getByRole('button', { name: 'Text Input' })
    const stage = page.locator('.formeo-stage')

    await expect(controlGroups).toBeVisible()
    await expect(stage).toBeVisible()

    // Get initial bounding box of control groups
    const initialBounds = await controlGroups.boundingBox()

    // Start dragging
    await textInputControl.hover()
    await page.mouse.down()

    // Move towards stage
    const stageBounds = await stage.boundingBox()
    if (stageBounds && initialBounds) {
      await page.mouse.move(stageBounds.x + stageBounds.width / 2, stageBounds.y + stageBounds.height / 2)

      // Check that control groups didn't shift significantly during drag
      const duringDragBounds = await controlGroups.boundingBox()
      if (duringDragBounds) {
        // Allow small tolerance for any animation
        expect(Math.abs(duringDragBounds.width - initialBounds.width)).toBeLessThan(5)
        expect(Math.abs(duringDragBounds.height - initialBounds.height)).toBeLessThan(50)
      }
    }

    // Complete the drop
    await page.mouse.up()

    // Wait for animation to complete
    await page.waitForTimeout(300)

    // Verify final bounds are similar to initial
    const finalBounds = await controlGroups.boundingBox()
    if (finalBounds && initialBounds) {
      expect(Math.abs(finalBounds.width - initialBounds.width)).toBeLessThan(5)
    }
  })

  test('should be able to add multiple controls to stage', async ({ page }) => {
    // Add multiple different controls via click
    const controls = ['Text Input', 'Email', 'Number']

    for (const controlName of controls) {
      const control = page.getByRole('button', { name: controlName })
      await expect(control).toBeVisible()
      await control.click()
      await page.waitForTimeout(200)
    }

    // Verify all fields were added
    const fields = await page.locator('.formeo-field').count()
    expect(fields).toBeGreaterThanOrEqual(controls.length)
  })

  test('should maintain control functionality after multiple uses', async ({ page }) => {
    const textInputControl = page.getByRole('button', { name: 'Text Input' })

    // Add first time
    await textInputControl.click()
    await page.waitForTimeout(300)

    const fieldsAfterFirst = await page.locator('.formeo-field').count()

    // Add second time - control should still work
    await textInputControl.click()
    await page.waitForTimeout(300)

    const fieldsAfterSecond = await page.locator('.formeo-field').count()

    // Should have added another field
    expect(fieldsAfterSecond).toBeGreaterThan(fieldsAfterFirst)
  })

  test('should set overflow hidden during drag to prevent scrollbar flash', async ({ page }) => {
    // This test verifies the fix for scrollbar flashing
    const textInputControl = page.getByRole('button', { name: 'Text Input' })
    const stage = page.locator('.formeo-stage')

    await expect(textInputControl).toBeVisible()
    await expect(stage).toBeVisible()

    // Get stage bounds for drag target
    const stageBounds = await stage.boundingBox()

    // Start dragging with manual mouse actions
    const controlBounds = await textInputControl.boundingBox()
    if (controlBounds && stageBounds) {
      // Move to control center and start drag
      await page.mouse.move(controlBounds.x + controlBounds.width / 2, controlBounds.y + controlBounds.height / 2)
      await page.mouse.down()

      // Move slightly to trigger the drag
      await page.mouse.move(
        controlBounds.x + controlBounds.width / 2 + 10,
        controlBounds.y + controlBounds.height / 2 + 10
      )

      // Wait a moment for onStart to fire
      await page.waitForTimeout(100)

      // Check that overflow is set to hidden during drag
      const overflowDuringDrag = await page.evaluate(() => document.documentElement.style.overflow)
      expect(overflowDuringDrag).toBe('hidden')

      // Complete the drag to stage
      await page.mouse.move(stageBounds.x + stageBounds.width / 2, stageBounds.y + stageBounds.height / 2)
      await page.mouse.up()

      // Wait for drag to complete
      await page.waitForTimeout(300)

      // Overflow should be restored after drag
      const overflowAfterDrag = await page.evaluate(() => document.documentElement.style.overflow)
      expect(overflowAfterDrag).not.toBe('hidden')
    }
  })
})
