// @ts-check
import { expect, test } from '@playwright/test'
import { addFieldAndEdit, gotoEditor } from './helpers/editor.js'

const radioValues = field =>
  field.locator('.field-preview input[type="radio"]').evaluateAll(els => els.map(el => el.value))

const optionValues = (page, field) =>
  field
    .getAttribute('id')
    .then(id =>
      page.evaluate(id => window.frameworkLoader.currentDemo.editor.formData.fields[id].options.map(o => o.value), id)
    )

/**
 * Drag an option by its '.prop-order' handle to just inside the top of another option.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} handle
 * @param {import('@playwright/test').Locator} target
 */
const dragOptionAbove = async (page, handle, target) => {
  const from = await handle.boundingBox()
  const to = await target.boundingBox()
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  // a small intermediate move is needed to cross Sortable's forceFallback drag threshold
  // before the larger move to the drop target, or no drag ever starts
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2 - 10, { steps: 5 })
  await page.waitForTimeout(100)
  await page.mouse.move(to.x + to.width / 2, to.y + 2, { steps: 20 })
  await page.waitForTimeout(100)
  await page.mouse.up()
}

/**
 * The className of the '.prop-control' that is topmost at the centre of a locator's box, or null.
 * @param {import('@playwright/test').Locator} locator
 */
const hitAtCentre = locator =>
  locator.evaluate(el => {
    const r = el.getBoundingClientRect()
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
    return hit?.closest('.prop-control')?.className ?? null
  })

test.describe('Options panel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page)
  })

  test('removing options updates the preview right away (#306)', async ({ page }) => {
    const { field, editPanel } = await addFieldAndEdit(page, 'Radio Group', 'Options')
    const items = editPanel.locator('.field-edit-options > li')
    await expect(items).toHaveCount(3)
    await items.nth(2).hover()
    await items.nth(2).locator('.prop-remove').click()
    await expect(items).toHaveCount(2)
    await items.nth(0).hover()
    await items.nth(0).locator('.prop-remove').click()
    await expect(items).toHaveCount(1)
    await expect.poll(() => radioValues(field)).toEqual(['radio-2'])
  })

  test('editing an option label in the preview updates the options panel (#306 regression)', async ({ page }) => {
    await page.getByRole('button', { name: 'Radio Group' }).click()
    const field = page.locator('.formeo-field').last()
    const secondLabel = field.locator('.field-preview .f-radio label').nth(1)
    await secondLabel.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('New radio 2')
    await field.locator('.field-actions').hover()
    await field.locator('.field-actions .edit-toggle').click()
    await field.locator('.field-edit').getByRole('heading', { name: 'Options' }).click()
    const labelInput = field.locator('.field-edit-options > li').nth(1).locator('input[name$="-label"]')
    await expect(labelInput).toHaveValue('New radio 2')
  })

  test('dragging option 3 above option 1 reorders formData options and the preview (#114)', async ({ page }) => {
    const { field, editPanel } = await addFieldAndEdit(page, 'Radio Group', 'Options')
    const items = editPanel.locator('.field-edit-options > li')
    await items.nth(2).hover()
    const handle = items.nth(2).locator('.prop-order')
    await expect(handle).toBeVisible()
    await dragOptionAbove(page, handle, items.nth(0))

    await expect.poll(() => optionValues(page, field)).toEqual(['radio-3', 'radio-1', 'radio-2'])
    await expect.poll(() => radioValues(field)).toEqual(['radio-3', 'radio-1', 'radio-2'])
  })

  test('option remove button and drag handle sit side by side and both work (#114)', async ({ page }) => {
    const { field, editPanel } = await addFieldAndEdit(page, 'Select', 'Options')
    const items = editPanel.locator('.field-edit-options > li')
    await expect(items).toHaveCount(3)
    const initial = await optionValues(page, field)

    for (const item of [items.nth(0), items.nth(2)]) {
      await item.hover()
      const remove = item.locator('.prop-remove')
      const handle = item.locator('.prop-order')
      await expect(remove).toBeVisible()
      await expect(handle).toBeVisible()
      // the arrow glyph itself must paint, not just the empty button
      await expect(handle.locator('svg path')).toBeVisible()
      await expect(handle).toHaveCSS('cursor', 'grab')

      const r = await remove.boundingBox()
      const h = await handle.boundingBox()
      const overlapX = Math.min(r.x + r.width, h.x + h.width) - Math.max(r.x, h.x)
      const overlapY = Math.min(r.y + r.height, h.y + h.height) - Math.max(r.y, h.y)
      expect(overlapX <= 0 || overlapY <= 0, 'remove button and drag handle must not overlap').toBe(true)

      // each control is the topmost element at its own centre, so each one receives the pointer
      expect(await hitAtCentre(remove)).toContain('prop-remove')
      expect(await hitAtCentre(handle)).toContain('prop-order')
    }

    await items.nth(2).hover()
    await dragOptionAbove(page, items.nth(2).locator('.prop-order'), items.nth(0))
    const reordered = [initial[2], initial[0], initial[1]]
    await expect.poll(() => optionValues(page, field)).toEqual(reordered)

    await items.nth(0).hover()
    await items.nth(0).locator('.prop-remove').click()
    await expect(items).toHaveCount(2)
    await expect.poll(() => optionValues(page, field)).toEqual(reordered.slice(1))
  })

  test('toggling "multiple" on a select logs no page error and re-keys its options', async ({ page }) => {
    const pageErrors = []
    page.on('pageerror', err => pageErrors.push(err))

    const { field, editPanel } = await addFieldAndEdit(page, 'Select', 'Attributes')
    const fieldId = await field.getAttribute('id')
    const optionsData = () =>
      page.evaluate(id => window.frameworkLoader.currentDemo.editor.formData.fields[id].options, fieldId)

    expect((await optionsData()).every(o => 'selected' in o)).toBe(true)

    await editPanel.locator('.field-attrs-multiple input[type="checkbox"]').check()

    await expect
      .poll(() =>
        page.evaluate(id => window.frameworkLoader.currentDemo.editor.formData.fields[id].attrs.multiple, fieldId)
      )
      .toBe(true)
    const updatedOptions = await optionsData()
    expect(updatedOptions.every(o => 'checked' in o && !('selected' in o))).toBe(true)
    expect(pageErrors).toEqual([])
  })
})
