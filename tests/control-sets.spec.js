// @ts-check
import { expect, test } from '@playwright/test'
import { gotoEditor } from './helpers/editor.js'
import { dragControlTo } from './helpers/multi-editor.js'

let errors
test.beforeEach(({ page }) => {
  errors = []
  page.on('pageerror', err => errors.push(err.message))
})
test.afterEach(() => {
  expect(errors).toEqual([])
})

/**
 * The demo form's rows whose legend is 'Address', with their fields' names and control ids
 * @param {import('@playwright/test').Page} page
 */
const addressRows = page =>
  page.evaluate(() => {
    const { formData } = window.frameworkLoader.currentDemo.editor
    return Object.values(formData.rows)
      .filter(row => row.config?.legend === 'Address')
      .map(row => {
        const fields = row.children.flatMap(id => formData.columns[id].children).map(id => formData.fields[id])
        return {
          fieldset: row.config.fieldset,
          names: fields.map(field => field.attrs.name),
          controlIds: fields.map(field => field.config.controlId),
        }
      })
  })

const addressFields = {
  fieldset: true,
  names: ['street', 'city', 'postcode', 'country'],
  controlIds: ['text-input', 'text-input', 'text-input', 'select'],
}

test.describe('control sets (#227)', () => {
  test('clicking the Address set adds one row with its four fields', async ({ page }) => {
    await gotoEditor(page)
    const rows = page.locator('.formeo-editor .formeo-row')
    const before = await rows.count()
    await page.locator('.address-set-control button').click()
    await expect(rows).toHaveCount(before + 1)
    await expect(
      page.locator('.formeo-editor .formeo-row').filter({ hasText: 'Street' }).locator('.formeo-field')
    ).toHaveCount(4)
    expect(await addressRows(page)).toEqual([addressFields])
  })

  test('dragging the Address set onto the page adds it there', async ({ page }) => {
    await gotoEditor(page)
    const stage = page.locator('.formeo-editor .formeo-stage:not([hidden])').first()
    await dragControlTo(page, page.locator('.address-set-control'), stage)
    await expect.poll(() => addressRows(page)).toEqual([addressFields])
  })

  test('an onBeforeAdd veto from a document listener adds nothing', async ({ page }) => {
    await gotoEditor(page)
    await page.evaluate(() => {
      document.addEventListener('formeoBeforeAdd', evt => {
        if (evt.detail.componentType === 'controlSet') {
          evt.preventDefault()
        }
      })
    })
    await page.locator('.address-set-control button').click()
    await page.waitForTimeout(300)
    expect(await addressRows(page)).toEqual([])
  })
})
