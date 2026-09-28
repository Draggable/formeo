// @ts-check
import { expect, test } from '@playwright/test'
import { gotoEditor } from './helpers/editor.js'

// Refs #217: a textarea's native resize handle could drag it wider than its
// column, since textareas had no max-width/resize rule constraining them.
test.describe('Textarea resize stays inside its column', () => {
  test.use({ viewport: { width: 2200, height: 1000 } })

  test.beforeEach(async ({ page }) => {
    await gotoEditor(page)
  })

  test('dragging the resize handle does not widen the textarea past its column', async ({ page }) => {
    await page.getByRole('button', { name: 'TextArea' }).click()
    const ta = page.locator('.formeo-stage textarea').first()
    await ta.waitFor({ state: 'visible' })
    const col = ta.locator('xpath=ancestor::*[contains(@class,"formeo-column")][1]')
    await expect(col).toHaveCount(1)

    const taBoxBefore = await ta.boundingBox()
    const colBoxBefore = await col.boundingBox()
    expect(taBoxBefore).toBeTruthy()
    expect(colBoxBefore).toBeTruthy()

    const box = /** @type {NonNullable<typeof taBoxBefore>} */ (taBoxBefore)
    // Drag from the bottom-right corner (the native resize handle) well past the
    // column's right edge.
    await page.mouse.move(box.x + box.width - 3, box.y + box.height - 3)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width - 3 + 600, box.y + box.height - 3 + 150, { steps: 10 })
    await page.mouse.up()

    const taBoxAfter = await ta.boundingBox()
    const colBoxAfter = await col.boundingBox()
    expect(taBoxAfter).toBeTruthy()
    expect(colBoxAfter).toBeTruthy()
    const after = /** @type {NonNullable<typeof taBoxAfter>} */ (taBoxAfter)
    const colAfter = /** @type {NonNullable<typeof colBoxAfter>} */ (colBoxAfter)

    // The textarea's right edge must never extend past its column's right edge.
    expect(after.x + after.width).toBeLessThanOrEqual(colAfter.x + colAfter.width + 1)
  })
})
