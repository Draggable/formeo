// @ts-check
import { expect } from '@playwright/test'

/**
 * Open the demo and wait until its editor is ready.
 * The live editor is window.frameworkLoader.currentDemo.editor.
 * @param {import('@playwright/test').Page} page
 */
export const gotoEditor = async page => {
  await page.goto('/')
  await expect(page.locator('.formeo-editor')).toBeVisible()
  await page.evaluate(() => window.frameworkLoader?.currentDemo?.editor?.whenReady())
}

/**
 * Collect the payloads the demo's `onChange: console.log` callback receives.
 * Call before gotoEditor so no payload is missed.
 * @param {import('@playwright/test').Page} page
 * @return {Array<{type: string, detail: Object}>} live array
 */
export const collectOnChange = page => {
  const payloads = []
  page.on('console', async msg => {
    const [first] = msg.args()
    const value = await first?.jsonValue().catch(() => null)
    if (value?.type === 'formeoUpdated') {
      payloads.push(value)
    }
  })
  return payloads
}

/**
 * Click a control, then open the new field's edit panel, optionally on a named panel tab.
 * @param {import('@playwright/test').Page} page
 * @param {string} controlName accessible name of the control button, e.g. 'Radio Group'
 * @param {string} [panelHeading] e.g. 'Options', 'Attributes'
 */
export const addFieldAndEdit = async (page, controlName, panelHeading) => {
  await page.getByRole('button', { name: controlName }).click()
  const field = page.locator('.formeo-field').last()
  await field.waitFor({ state: 'visible' })
  await field.locator('.field-actions').hover()
  await field.locator('.field-actions .edit-toggle').click()
  const editPanel = field.locator('.field-edit')
  await editPanel.waitFor({ state: 'visible' })
  if (panelHeading) {
    await editPanel.getByRole('heading', { name: panelHeading }).click()
  }
  return { field, editPanel }
}
