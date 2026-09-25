// @ts-check
import { expect, test } from '@playwright/test'

/**
 * Renders formData with the library's FormeoRenderer (exposed on window by src/lib/js/index.js)
 * into a fresh container appended to the demo page.
 */
const renderForm = async (page, fields) => {
  await page.evaluate(fields => {
    const fieldIds = Object.keys(fields)
    const formData = {
      id: 'e2e-option-groups',
      stages: { 'e2e-stage': { id: 'e2e-stage', children: ['e2e-row'] } },
      rows: { 'e2e-row': { id: 'e2e-row', config: {}, children: fieldIds.map(id => `col-${id}`) } },
      columns: Object.fromEntries(
        fieldIds.map(id => [`col-${id}`, { id: `col-${id}`, config: { width: '100%' }, children: [id] }])
      ),
      fields,
    }
    const container = document.createElement('div')
    container.id = 'e2e-render'
    document.body.appendChild(container)
    new window.FormeoRenderer({ renderContainer: container, formData }).render()
  }, fields)
  return page.locator('#e2e-render form')
}

const group = (type, attrs, options = ['One', 'Two']) => ({
  tag: 'input',
  attrs: { type, ...attrs },
  config: { label: `${type} group` },
  options: options.map(label => ({ label, value: label.toLowerCase() })),
})

const isValid = form => form.evaluate(el => /** @type {HTMLFormElement} */ (el).checkValidity())

test.describe('Rendered checkbox and radio groups', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()
  })

  test('a required radio group blocks submit until an option is picked (#270)', async ({ page }) => {
    const form = await renderForm(page, { 'e2e-radio': { id: 'e2e-radio', ...group('radio', { required: true }) } })

    expect(await isValid(form)).toBe(false)
    await form.getByLabel('Two').check()
    expect(await isValid(form)).toBe(true)
  })

  test('a required checkbox group needs exactly one checked box (#270)', async ({ page }) => {
    const form = await renderForm(page, {
      'e2e-checkbox': { id: 'e2e-checkbox', ...group('checkbox', { required: true }) },
    })

    expect(await isValid(form)).toBe(false)
    await form.getByLabel('One').check()
    expect(await isValid(form)).toBe(true)
    await form.getByLabel('One').uncheck()
    expect(await isValid(form)).toBe(false)
  })

  test('the configured name is submitted (#220, #331)', async ({ page }) => {
    const form = await renderForm(page, { 'e2e-radio': { id: 'e2e-radio', ...group('radio', { name: 'favcolor' }) } })

    await form.getByLabel('Two').check()
    const submitted = await form.evaluate(el => Object.fromEntries(new FormData(/** @type {HTMLFormElement} */ (el))))
    expect(submitted).toEqual({ favcolor: 'two' })
  })

  test('custom attributes reach the rendered group (#256)', async ({ page }) => {
    const form = await renderForm(page, {
      'e2e-checkbox': { id: 'e2e-checkbox', ...group('checkbox', { 'data-layout': 'inline' }) },
    })

    await expect(form.locator('#f-e2e-checkbox')).toHaveAttribute('data-layout', 'inline')
  })
})
