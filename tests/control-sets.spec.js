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

/**
 * The Address row's position among the given stage's own rows (formData.stages[stageId].children), or -1
 * @param {import('@playwright/test').Page} page
 * @param {String} stageId
 */
const addressRowPosition = (page, stageId) =>
  page.evaluate(sid => {
    const { formData } = window.frameworkLoader.currentDemo.editor
    return formData.stages[sid].children.findIndex(id => formData.rows[id]?.config?.legend === 'Address')
  }, stageId)

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
    const stageId = await stage.getAttribute('id')
    const before = await page.evaluate(
      sid => window.frameworkLoader.currentDemo.editor.formData.stages[sid].children.length,
      stageId
    )
    // dragControlTo drops near the bottom of the stage, i.e. after every existing row
    await dragControlTo(page, page.locator('.address-set-control'), stage)
    await expect.poll(() => addressRows(page)).toEqual([addressFields])
    expect(await addressRowPosition(page, stageId)).toBe(before)
  })

  test('an onBeforeAdd veto from a document listener adds nothing', async ({ page }) => {
    await gotoEditor(page)
    await page.evaluate(() => {
      window.__vetoed = false
      document.addEventListener('formeoBeforeAdd', evt => {
        if (evt.detail.componentType === 'controlSet') {
          evt.preventDefault()
          window.__vetoed = true
        }
      })
    })
    await page.locator('.address-set-control button').click()
    await expect.poll(() => page.evaluate(() => window.__vetoed)).toBe(true)
    expect(await addressRows(page)).toEqual([])
  })
})
