// @ts-check
import { expect, test } from '@playwright/test'
import { addFieldAndEdit, gotoEditor } from './helpers/editor.js'

/**
 * Renders formData with the library's FormeoRenderer into a fresh container on the demo page.
 * The renderer is kept on window.e2eRenderer so tests can read its userData.
 */
const renderForm = async (page, fields) => {
  await page.evaluate(fields => {
    const fieldIds = Object.keys(fields)
    const formData = {
      id: 'e2e-other',
      stages: { 'e2e-stage': { id: 'e2e-stage', children: ['e2e-row'] } },
      rows: { 'e2e-row': { id: 'e2e-row', config: {}, children: fieldIds.map(id => `col-${id}`) } },
      columns: Object.fromEntries(
        fieldIds.map(id => [`col-${id}`, { id: `col-${id}`, config: { width: '100%' }, children: [id] }])
      ),
      fields,
    }
    const container = document.createElement('div')
    container.id = 'e2e-other-render'
    document.body.appendChild(container)
    window.e2eRenderer = new window.FormeoRenderer({ renderContainer: container, formData })
    window.e2eRenderer.render()
  }, fields)
  return page.locator('#e2e-other-render form')
}

const otherGroup = (id, type, attrs = {}) => ({
  id,
  tag: 'input',
  attrs: { type, name: id, ...attrs },
  config: { label: `${type} group`, other: true, otherLabel: 'Something else' },
  options: [
    { label: 'One', value: 'one' },
    { label: 'Two', value: 'two' },
  ],
})

const isValid = form => form.evaluate(el => /** @type {HTMLFormElement} */ (el).checkValidity())

test.describe('Other choice', () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page)
  })

  test('switching on Other option in the Configuration panel adds the choice to the preview', async ({ page }) => {
    const { field, editPanel } = await addFieldAndEdit(page, 'Checkbox Group', 'Configuration')
    await expect(field.locator('.f-checkbox-other')).toHaveCount(0)

    await editPanel.locator('.field-config-other input[type="checkbox"]').check()
    await expect(editPanel.locator('.field-config-otherLabel input')).toHaveValue('Other')

    // the preview is hidden while the edit panel is open
    await field.locator('.field-actions').hover()
    await field.locator('.field-actions .edit-toggle').click()
    await expect(field).not.toHaveClass(/editing/)
    await expect(field.locator('.f-checkbox-other')).toBeVisible()
    await expect(field.locator('.f-checkbox-other label')).toHaveText('Other')
  })

  test('choosing Other and typing reports the text under {name}-other', async ({ page }) => {
    const form = await renderForm(page, { hobbies: otherGroup('hobbies', 'checkbox') })
    const choice = form.getByRole('checkbox', { name: 'Something else' })
    const text = form.getByRole('textbox', { name: 'Something else' })

    await expect(text).toBeDisabled()
    await form.getByRole('checkbox', { name: 'One' }).check()
    await choice.check()
    await text.fill('Knitting')

    const userData = await page.evaluate(() => window.e2eRenderer.userData)
    expect(userData).toEqual({ hobbies: ['one', 'other'], 'hobbies-other': 'Knitting' })
    const posted = await form.evaluate(el => Array.from(new FormData(/** @type {HTMLFormElement} */ (el))))
    expect(posted).toEqual([
      ['hobbies[]', 'one'],
      ['hobbies[]', 'other'],
      ['hobbies-other', 'Knitting'],
    ])

    await choice.uncheck()
    await expect(text).toBeDisabled()
    expect(await page.evaluate(() => window.e2eRenderer.userData)).toEqual({ hobbies: 'one' })
  })

  test('a required radio group blocks submission while Other is chosen and empty', async ({ page }) => {
    const form = await renderForm(page, { color: otherGroup('color', 'radio', { required: true }) })

    expect(await isValid(form)).toBe(false)
    await form.getByRole('radio', { name: 'One' }).check()
    expect(await isValid(form)).toBe(true)
    await form.getByRole('radio', { name: 'Something else' }).check()
    expect(await isValid(form)).toBe(false)
    await form.getByRole('textbox', { name: 'Something else' }).fill('Teal')
    expect(await isValid(form)).toBe(true)
  })
})
