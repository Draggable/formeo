// @ts-check
import { expect, test } from '@playwright/test'

/**
 * The issue's form: row `r1` with the given config, one empty column
 * @param {Object} config
 */
const formWithRowConfig = config => ({
  id: 'form-1',
  stages: { s1: { id: 's1', children: ['r1'] } },
  rows: { r1: { id: 'r1', config, children: ['c1'] } },
  columns: { c1: { id: 'c1', config: { width: '100%' }, children: [] } },
  fields: {},
})

/**
 * Mounts an editor in #e2e-rs (above the demo editor) and opens row r1's edit window. The editor is window.__editor.
 * @param {import('@playwright/test').Page} page
 * @param {Object} config row r1's config
 */
const openRowSettings = async (page, config) => {
  await page.goto('/')
  await expect(page.locator('.formeo-editor').first()).toBeVisible()
  await page.evaluate(async formData => {
    const container = Object.assign(document.createElement('div'), { id: 'e2e-rs' })
    document.body.prepend(container)
    window.__editor = new window.FormeoEditor(
      { editorContainer: container, sessionStorage: false, style: null },
      formData
    )
    await window.__editor.whenReady()
  }, formWithRowConfig(config))

  const row = page.locator('#e2e-rs .formeo-row').first()
  // the empty column fills the row, so hover the row's own edge
  await row.hover({ position: { x: 2, y: 2 } })
  await row.locator('.row-actions').first().hover()
  await row.locator('.row-actions .edit-toggle').first().click()
  const editWindow = row.locator('.row-edit').first()
  await expect(editWindow).toBeVisible()
  return { fieldset: editWindow.locator('#r1-fieldset'), inputGroup: editWindow.locator('#r1-inputGroup') }
}

const rowConfigOf = page => page.evaluate(() => window.__editor.formData.rows.r1.config)

test.describe('row Settings checkboxes with an unset config (#521)', () => {
  test('config: {} shows Fieldset and Input group unchecked', async ({ page }) => {
    const { fieldset, inputGroup } = await openRowSettings(page, {})
    await expect(fieldset).not.toBeChecked()
    await expect(inputGroup).not.toBeChecked()
    expect(await rowConfigOf(page)).toEqual({})
  })

  test('the first click turns an unset setting on', async ({ page }) => {
    const { fieldset, inputGroup } = await openRowSettings(page, {})
    await fieldset.click()
    await inputGroup.click()
    await expect(fieldset).toBeChecked()
    await expect(inputGroup).toBeChecked()
    await expect.poll(() => rowConfigOf(page)).toEqual({ fieldset: true, inputGroup: true })
  })

  test('a partial config checks only the setting it holds', async ({ page }) => {
    const { fieldset, inputGroup } = await openRowSettings(page, { fieldset: true })
    await expect(fieldset).toBeChecked()
    await expect(inputGroup).not.toBeChecked()
  })
})
