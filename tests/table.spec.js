// @ts-check
import { expect, test } from '@playwright/test'

const hours = () => ({
  caption: 'Opening hours',
  headerRow: true,
  rowHeaders: false,
  columns: [{ label: 'Day' }, { label: 'Hours' }],
  rows: [{ cells: ['Mon', '9–5'] }, { cells: ['Tue', '9–1'] }],
})

/** A one-column form holding the given fields */
const formWith = (fields = {}) => {
  const ids = Object.keys(fields)
  return {
    id: 'form-tbl',
    stages: { 'stage-tbl': { id: 'stage-tbl', children: ['row-tbl'] } },
    rows: { 'row-tbl': { id: 'row-tbl', config: {}, children: ['col-tbl'] } },
    columns: { 'col-tbl': { id: 'col-tbl', config: { width: '100%' }, children: ids } },
    fields,
  }
}

const tableField = (table = hours()) => ({
  'field-tbl': {
    id: 'field-tbl',
    tag: 'table',
    attrs: { className: '' },
    config: { label: 'Table', hideLabel: true, controlId: 'table' },
    table,
  },
})

/**
 * Mounts an editor in a fresh container above the demo editor. The editor is window[globalName].
 * @param {import('@playwright/test').Page} page
 * @param {Object} [formData]
 * @param {string} [id] container id
 * @param {string} [globalName]
 */
const mountEditor = async (page, formData, id = 'e2e-tbl', globalName = '__editor') => {
  if (!(await page.locator('.formeo-editor').first().isVisible())) {
    await page.goto('/')
    await expect(page.locator('.formeo-editor').first()).toBeVisible()
  }
  await page.evaluate(
    async ({ formData, id, globalName }) => {
      const container = document.createElement('div')
      container.id = id
      document.body.prepend(container)
      window[globalName] = new window.FormeoEditor(
        { editorContainer: container, sessionStorage: false, style: null },
        formData
      )
      await window[globalName].whenReady()
    },
    { formData, id, globalName }
  )
  return page.locator(`#${id}`)
}

/**
 * Renders formData (or an editor's formData) into a new container. The renderer is window.__renderer.
 * @param {import('@playwright/test').Page} page
 * @param {{ formData?: Object, from?: string, id?: string, width?: string }} opts
 */
const renderForm = (page, { formData, from = '__editor', id = 'e2e-tbl-render', width = '' }) =>
  page.evaluate(
    ({ formData, from, id, width }) => {
      const container = Object.assign(document.createElement('div'), { id })
      container.style.width = width
      document.body.appendChild(container)
      window.__renderer = new window.FormeoRenderer({ renderContainer: container })
      window.__renderer.render(formData || window[from].formData)
    },
    { formData, from, id, width }
  )

/** Opens a field's edit window and returns its Table panel */
const openTablePanel = async field => {
  await field.locator('.field-actions').hover()
  await field.locator('.field-actions .edit-toggle').click()
  const panel = field.locator('.table-panel')
  await expect(panel).toBeVisible()
  return panel
}

const tableOf = page => page.evaluate(() => Object.values(window.__editor.formData.fields)[0].table)

test.describe('Table element (#349)', () => {
  /** @type {Error[]} */
  let errors
  test.beforeEach(({ page }) => {
    errors = []
    page.on('pageerror', error => errors.push(error))
  })
  test.afterEach(() => {
    expect(errors).toEqual([])
  })

  test('builds a table from the controls panel and renders it semantically', async ({ page }) => {
    const editor = await mountEditor(page)
    const control = editor.getByRole('button', { name: 'Table', exact: true })
    // focusing a control brings its group into view (control.js focus handler)
    await control.focus()
    await control.click()
    const field = editor.locator('.formeo-field').last()
    const panel = await openTablePanel(field)
    // the edit window's panel nav lists the Table tab first (Panels builds its tab labels as h5)
    await expect(field.locator('.field-edit h5').first()).toHaveText('Table')

    await panel.getByRole('textbox', { name: 'Caption' }).fill('Opening hours')
    await panel.getByRole('textbox', { name: 'Column 1 header' }).fill('Day')
    await panel.getByRole('textbox', { name: 'Column 2 header' }).fill('Hours')
    await panel.getByRole('button', { name: 'Remove column 3' }).click()
    await panel.getByRole('textbox', { name: 'Row 1, column 1' }).fill('Mon')
    await panel.getByRole('textbox', { name: 'Row 1, column 2' }).fill('9–5')
    await panel.getByRole('checkbox', { name: 'Row headers' }).check()

    await field.locator('.field-actions').hover()
    await field.locator('.field-actions .edit-toggle').click()
    await expect(field.locator('.field-preview table.f-table')).toBeVisible()
    await expect(field.locator('.field-preview table.f-table caption')).toHaveText('Opening hours')

    await renderForm(page, {})
    const region = page.locator('#e2e-tbl-render').getByRole('region', { name: 'Opening hours' })
    await expect(region.locator('table caption')).toHaveText('Opening hours')
    await expect(region.locator('thead th[scope="col"]')).toHaveText(['Day', 'Hours'])
    await expect(region.locator('tbody tr').first().locator('th[scope="row"]')).toHaveText('Mon')
    await expect(region.locator('tbody tr').first().locator('td')).toHaveText('9–5')
    expect(await page.evaluate(() => window.__renderer.userData)).toEqual({})
  })

  test('adds and removes rows and columns from the keyboard', async ({ page }) => {
    const editor = await mountEditor(page, formWith(tableField()))
    const panel = await openTablePanel(editor.locator('.formeo-field').first())

    await panel.getByRole('button', { name: '+ Row' }).focus()
    await page.keyboard.press('Enter')
    await expect(panel.getByRole('textbox', { name: 'Row 3, column 1' })).toBeFocused()

    await panel.getByRole('button', { name: '+ Column' }).focus()
    await page.keyboard.press('Space')
    await expect(panel.getByRole('textbox', { name: 'Column 3 header' })).toBeFocused()
    await page.keyboard.type('Notes')

    await panel.getByRole('button', { name: 'Remove row 3' }).focus()
    await page.keyboard.press('Enter')
    await expect(panel.getByRole('button', { name: 'Remove row 2' })).toBeFocused()
    await page.keyboard.press('Enter')
    // one row left: its remove button is disabled and focus moves to + Row
    await expect(panel.getByRole('button', { name: 'Remove row 1' })).toBeDisabled()
    await expect(panel.getByRole('button', { name: '+ Row' })).toBeFocused()

    await panel.getByRole('button', { name: 'Remove column 1' }).focus()
    await page.keyboard.press('Enter')
    await expect(panel.getByRole('button', { name: 'Remove column 1' })).toBeFocused()

    const table = await tableOf(page)
    expect(table.columns).toEqual([{ label: 'Hours' }, { label: 'Notes' }])
    expect(table.rows).toEqual([{ cells: ['9–5', ''] }])
  })

  test('a wide table scrolls inside its focusable region instead of overflowing', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor').first()).toBeVisible()
    const columns = Array.from({ length: 6 }, (_, i) => ({ label: `Wednesday opening ${i + 1}` }))
    const rows = [{ cells: columns.map(() => 'Closed for maintenance') }]
    await renderForm(page, {
      formData: formWith(tableField({ caption: 'Week', columns, rows })),
      width: '320px',
    })
    const container = page.locator('#e2e-tbl-render')
    const region = container.getByRole('region', { name: 'Week' })
    const sizes = await region.evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }))
    expect(sizes.client).toBeGreaterThan(0)
    expect(sizes.scroll).toBeGreaterThan(sizes.client)
    const containerSizes = await container.evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }))
    expect(containerSizes.scroll).toBeLessThanOrEqual(containerSizes.client)

    await region.focus()
    await expect(region).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => region.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
  })

  test('a saved table loads into a new editor unchanged and renders the same', async ({ page }) => {
    const first = { ...hours(), rowHeaders: true }
    await mountEditor(page, formWith(tableField(first)))
    const saved = await page.evaluate(() => window.__editor.formData)
    expect(saved.fields['field-tbl'].table).toEqual(first)

    const second = await mountEditor(page, saved, 'e2e-tbl-2', '__editor2')
    const panel = await openTablePanel(second.locator('.formeo-field').first())
    await expect(panel.getByRole('textbox', { name: 'Caption' })).toHaveValue('Opening hours')
    await expect(panel.getByRole('checkbox', { name: 'Row headers' })).toBeChecked()
    expect(await page.evaluate(() => window.__editor2.formData.fields)).toEqual(saved.fields)

    await renderForm(page, { from: '__editor', id: 'render-a' })
    await renderForm(page, { from: '__editor2', id: 'render-b' })
    const htmlOf = id => page.locator(`#${id} .f-table-wrap`).evaluate(el => el.outerHTML)
    expect(await htmlOf('render-a')).toBe(await htmlOf('render-b'))
  })

  test('userData ignores the table and keeps the other answers', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor').first()).toBeVisible()
    const fields = {
      ...tableField(),
      'field-name': {
        id: 'field-name',
        tag: 'input',
        attrs: { type: 'text', name: 'name' },
        config: { label: 'Name' },
      },
    }
    await renderForm(page, { formData: formWith(fields) })
    await page.locator('#e2e-tbl-render').getByRole('textbox', { name: 'Name' }).fill('Ada')
    expect(await page.evaluate(() => window.__renderer.userData)).toEqual({ name: 'Ada' })
  })
})
