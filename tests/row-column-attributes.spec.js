// @ts-check
import { expect, test } from '@playwright/test'
import { formFor } from './helpers/multi-editor.js'

/**
 * Mounts an editor in #e2e-rc (above the demo editor), with formFor('rc', 'Name') unless formData is given:
 * row `row-rc`, column `col-rc`, field `field-rc`. The editor is window.__editor.
 * @param {import('@playwright/test').Page} page
 * @param {{ config?: Object, formData?: Object }} [options]
 */
const mountEditor = async (page, { config = {}, formData = formFor('rc', 'Name') } = {}) => {
  await page.goto('/')
  await expect(page.locator('.formeo-editor').first()).toBeVisible()
  await page.evaluate(
    async ({ formData, config }) => {
      const container = document.createElement('div')
      container.id = 'e2e-rc'
      document.body.prepend(container)
      window.__editor = new window.FormeoEditor(
        { editorContainer: container, sessionStorage: false, style: null, config },
        formData
      )
      await window.__editor.whenReady()
    },
    { formData, config }
  )
  return page.locator('#e2e-rc')
}

/**
 * Opens a row's, column's or field's edit window with its edit button
 * @param {import('@playwright/test').Locator} component
 * @param {'row' | 'column' | 'field'} type
 */
const openEdit = async (component, type) => {
  await component.hover()
  await component.locator(`.${type}-actions`).first().hover()
  await component.locator(`.${type}-actions .edit-toggle`).first().click()
  const editWindow = component.locator(`.${type}-edit`).first()
  await expect(editWindow).toBeVisible()
  return editWindow
}

/**
 * Fills and submits the add-attribute dialog from an edit window's "+ Attribute" button
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} editWindow
 */
const addAttribute = async (page, editWindow, name, value) => {
  await editWindow.locator('.add-attrs').click()
  const dialog = page.locator('.formeo-dialog.add-attribute-dialog')
  await expect(dialog).toBeVisible()
  await dialog.locator('[name="attrName"]').fill(name)
  await dialog.locator('[name="attrValue"]').fill(value)
  await dialog.locator('button[type="submit"]').click()
  return dialog
}

const formDataOf = page => page.evaluate(() => window.__editor.formData)

const renderEditorForm = page =>
  page.evaluate(() => {
    const container = Object.assign(document.createElement('div'), { id: 'e2e-rc-render' })
    document.body.appendChild(container)
    new window.FormeoRenderer({ renderContainer: container }).render(window.__editor.formData)
  })

test.describe('row and column attributes (#112)', () => {
  test('a row attribute added in the editor renders on the row', async ({ page }) => {
    const editor = await mountEditor(page)
    const editWindow = await openEdit(editor.locator('.formeo-row').first(), 'row')
    await editWindow.getByRole('heading', { name: 'Attributes' }).click()
    const dialog = await addAttribute(page, editWindow, 'data-section', 'contact')
    await expect(dialog).toHaveCount(0)
    await expect.poll(async () => (await formDataOf(page)).rows['row-rc'].attrs?.['data-section']).toBe('contact')
    await renderEditorForm(page)
    await expect(page.locator('#e2e-rc-render #f-row-rc')).toHaveAttribute('data-section', 'contact')
  })

  test('a column attribute added from its new edit button renders on the column', async ({ page }) => {
    const editor = await mountEditor(page)
    const editWindow = await openEdit(editor.locator('.formeo-column').first(), 'column')
    await addAttribute(page, editWindow, 'aria-label', 'Left')
    await expect.poll(async () => (await formDataOf(page)).columns['col-rc'].attrs?.['aria-label']).toBe('Left')
    await renderEditorForm(page)
    await expect(page.locator('#e2e-rc-render #f-col-rc')).toHaveAttribute('aria-label', 'Left')
  })

  test('a reserved name is refused and the dialog stays open', async ({ page }) => {
    const editor = await mountEditor(page)
    const editWindow = await openEdit(editor.locator('.formeo-row').first(), 'row')
    await editWindow.getByRole('heading', { name: 'Attributes' }).click()
    const dialog = await addAttribute(page, editWindow, 'id', 'mine')
    await expect(dialog).toBeVisible()
    expect(await dialog.locator('[name="attrName"]').evaluate(el => el.validity.valid)).toBe(false)
  })

  test('the row Settings tab still toggles the fieldset and shows the column layout', async ({ page }) => {
    const formData = formFor('rc', 'Name')
    formData.rows['row-rc'].config = { fieldset: false }
    const editor = await mountEditor(page, { formData })
    const editWindow = await openEdit(editor.locator('.formeo-row').first(), 'row')
    await editWindow.getByRole('heading', { name: 'Settings' }).click()
    await editWindow.locator('#row-rc-fieldset').check()
    await expect.poll(async () => (await formDataOf(page)).rows['row-rc'].config.fieldset).toBe(true)
    await expect(editWindow.locator('.column-preset')).toBeVisible()
  })
})

test.describe('hiding the add button (#117)', () => {
  test('fields.all attrs add: false hides + Attribute; existing attributes stay editable', async ({ page }) => {
    const formData = formFor('rc', 'Name')
    formData.fields['field-rc'].attrs.placeholder = 'Your name'
    const editor = await mountEditor(page, {
      formData,
      config: { fields: { all: { panels: { attrs: { add: false } } } } },
    })
    const editWindow = await openEdit(editor.locator('.formeo-field').first(), 'field')
    await editWindow.getByRole('heading', { name: 'Attributes' }).click()
    await expect(editWindow.locator('.add-attrs')).toHaveCount(0)
    await editWindow.locator('.field-attrs-placeholder input').fill('Full name')
    await expect.poll(async () => (await formDataOf(page)).fields['field-rc'].attrs.placeholder).toBe('Full name')
  })

  test('rows.all attrs add: false hides + Attribute on rows', async ({ page }) => {
    const editor = await mountEditor(page, { config: { rows: { all: { panels: { attrs: { add: false } } } } } })
    const editWindow = await openEdit(editor.locator('.formeo-row').first(), 'row')
    await editWindow.getByRole('heading', { name: 'Attributes' }).click()
    await expect(editWindow.locator('.add-attrs')).toHaveCount(0)
  })

  test('a field id can bring the button back', async ({ page }) => {
    const editor = await mountEditor(page, {
      config: {
        fields: { all: { panels: { attrs: { add: false } } }, 'field-rc': { panels: { attrs: { add: true } } } },
      },
    })
    const editWindow = await openEdit(editor.locator('.formeo-field').first(), 'field')
    await editWindow.getByRole('heading', { name: 'Attributes' }).click()
    await expect(editWindow.locator('.add-attrs')).toBeVisible()
  })
})
