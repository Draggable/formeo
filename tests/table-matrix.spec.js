// @ts-check
import { expect, test } from '@playwright/test'

const visit = () => ({
  caption: 'Visit',
  headerRow: true,
  rowHeaders: true,
  columns: [
    { label: '' },
    { label: 'Poor', value: 'poor', input: 'radio' },
    { label: 'Good', value: 'good', input: 'radio' },
    { label: 'Comment', value: 'comment', input: 'text' },
  ],
  rows: [
    { value: 'speed', required: true, cells: ['Speed', '', '', ''] },
    { value: 'price', cells: ['Price', '', '', ''] },
  ],
})

/** A one-column form holding the given fields */
const formWith = (fields = {}, stageConditions) => {
  const ids = Object.keys(fields)
  const stage = { id: 'stage-mx', children: ['row-mx'] }
  if (stageConditions) {
    stage.conditions = stageConditions
  }
  return {
    id: 'form-mx',
    stages: { 'stage-mx': stage },
    rows: { 'row-mx': { id: 'row-mx', config: {}, children: ['col-mx'] } },
    columns: { 'col-mx': { id: 'col-mx', config: { width: '100%' }, children: ids } },
    fields,
  }
}

const matrixField = (table = visit(), id = 'mx1') => ({
  [id]: {
    id,
    tag: 'table',
    attrs: { className: '', name: '' },
    config: { label: 'Matrix', hideLabel: true, controlId: 'matrix' },
    table,
  },
})

const textField = id => ({ [id]: { id, tag: 'input', attrs: { type: 'text', name: id }, config: { label: id } } })

const mountEditor = async (page, formData, id = 'e2e-mx', globalName = '__editor') => {
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

const renderForm = (page, { formData, from = '__editor', id = 'e2e-mx-render', width = '' }) =>
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

const openTablePanel = async field => {
  await field.locator('.field-actions').hover()
  await field.locator('.field-actions .edit-toggle').click()
  const panel = field.locator('.table-panel')
  await expect(panel).toBeVisible()
  return panel
}

const matrixOf = (page, id = 'mx1') => page.evaluate(id => window.__editor.formData.fields[id].table, id)

test.describe('Matrix (#349 phase 2)', () => {
  /** @type {Error[]} */
  let errors
  test.beforeEach(({ page }) => {
    errors = []
    page.on('pageerror', error => errors.push(error))
  })
  test.afterEach(() => {
    expect(errors).toEqual([])
  })

  // The field's edit toggle only shows on hover, so opening the panel is the one pointer step
  test('builds a matrix from the controls panel; panel edits work from the keyboard', async ({ page }) => {
    const editor = await mountEditor(page)
    const control = editor.getByRole('button', { name: 'Matrix', exact: true })
    await control.focus()
    await page.keyboard.press('Enter')
    const field = editor.locator('.formeo-field').last()
    const panel = await openTablePanel(field)

    // a closed select picks an option by its first letter, as a keyboard user would
    const fourth = panel.getByRole('combobox', { name: 'Column 4 input' })
    await fourth.focus()
    await page.keyboard.press('c')
    await expect(fourth).toHaveValue('checkbox')
    await expect(panel.getByRole('combobox', { name: 'Column 4 input' })).toBeFocused()

    await panel.getByRole('button', { name: '+ Column' }).focus()
    await page.keyboard.press('Enter')
    await expect(panel.getByRole('textbox', { name: 'Column 5 header' })).toBeFocused()
    await page.keyboard.type('Comment')
    await panel.getByRole('combobox', { name: 'Column 5 input' }).focus()
    await page.keyboard.press('t')
    await expect(panel.getByRole('combobox', { name: 'Column 5 input' })).toHaveValue('text')

    await panel.getByRole('button', { name: '+ Row' }).focus()
    await page.keyboard.press('Enter')
    await expect(panel.getByRole('textbox', { name: 'Row 3, column 1' })).toBeFocused()
    await page.keyboard.type('Price')

    await panel.getByRole('textbox', { name: 'Row 3 value' }).focus()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('price')
    await page.keyboard.press('Tab')
    await panel.getByRole('checkbox', { name: 'Row 1 required' }).focus()
    await page.keyboard.press('Space')

    const fieldId = await page.evaluate(() => Object.keys(window.__editor.formData.fields).at(-1))
    const table = await matrixOf(page, fieldId)
    expect(table.columns.map(({ input }) => input ?? null)).toEqual([null, 'radio', 'radio', 'checkbox', 'text'])
    expect(table.columns[4]).toMatchObject({ label: 'Comment', value: 'column-5' })
    expect(table.rows.map(({ value }) => value)).toEqual(['row-1', 'row-2', 'price'])
    expect(table.rows[0].required).toBe(true)
    await expect(panel.getByRole('checkbox', { name: 'Header row' })).toBeDisabled()
  })

  test('renders, fills in, reads back and refills a matrix', async ({ page }) => {
    await mountEditor(page, formWith(matrixField()))
    await renderForm(page, {})
    const group = page.locator('#e2e-mx-render').getByRole('group', { name: 'Visit' })
    await expect(group.getByRole('table', { name: 'Visit' })).toBeVisible()
    await group.getByRole('radio', { name: 'Speed Good' }).check()
    await group.getByRole('textbox', { name: 'Speed Comment' }).fill('Quick')
    expect(await page.evaluate(() => window.__renderer.userData)).toEqual({
      'f-mx1[speed]': 'good',
      'f-mx1[speed][comment]': 'Quick',
      'f-mx1[price][comment]': '',
    })

    await renderForm(page, { id: 'e2e-mx-render-2' })
    await page.evaluate(() => {
      window.__renderer.userData = { 'f-mx1[price]': 'poor', 'f-mx1[price][comment]': 'Fine' }
    })
    const second = page.locator('#e2e-mx-render-2')
    await expect(second.getByRole('radio', { name: 'Price Poor' })).toBeChecked()
    await expect(second.getByRole('textbox', { name: 'Price Comment' })).toHaveValue('Fine')
  })

  test('submitting with an unanswered required row reports it', async ({ page }) => {
    await mountEditor(page, formWith(matrixField()))
    await renderForm(page, {})
    const form = page.locator('#e2e-mx-render form')
    expect(await form.evaluate(el => el.checkValidity())).toBe(false)
    const invalid = await form.evaluate(el => [...el.elements].find(c => c.willValidate && !c.validity.valid)?.id)
    expect(invalid).toBe('f-mx1-0-1')
  })

  test('builds row and cell conditions in the picker and the rendered form follows them', async ({ page }) => {
    const editor = await mountEditor(page, formWith({ ...matrixField(), ...textField('tx1') }))
    const stage = editor.locator('.formeo-stage').first()
    await stage.locator('.stage-actions').first().hover()
    await stage.locator('.stage-actions .edit-toggle').first().click()
    const stagePanel = stage.locator('.stage-edit').first()
    await stagePanel.waitFor({ state: 'visible' })

    const source = stagePanel.locator('.condition-source .f-autocomplete-display-field').first()
    await source.click()
    await source.fill('Speed')
    const matrixItem = page.locator('.f-autocomplete-list-item-depth-0[data-label="Matrix"]')
    await matrixItem.hover()
    const speedRow = matrixItem.locator('.component-type-table-row[data-label="Speed"]').first()
    await speedRow.hover()
    await speedRow.click()
    // a row offers value, isChecked and isNotChecked; "any input in the row checked" needs no comparison
    const sourceProperty = stagePanel.locator('.condition-sourceProperty').first()
    await expect(sourceProperty).toHaveValue('value')
    await sourceProperty.selectOption('isChecked')

    const target = stagePanel.locator('.then-conditions-wrap .condition-target .f-autocomplete-display-field').first()
    await target.click()
    await target.fill('Comment')
    const targetMatrix = stage.locator('.f-autocomplete-list-item-depth-0[data-label="Matrix"]').last()
    await targetMatrix.hover()
    const priceRow = targetMatrix.locator('.component-type-table-row[data-label="Price"]')
    await priceRow.hover()
    await priceRow.locator('.component-type-table-cell[data-label="Price › Comment"]').click()
    await stagePanel.locator('.then-conditions-wrap .condition-targetProperty').first().selectOption('isNotVisible')

    await expect
      .poll(() => page.evaluate(() => window.__editor.formData.stages['stage-mx'].conditions[0]))
      .toMatchObject({
        if: [{ source: 'fields.mx1.table.rows[0]', sourceProperty: 'isChecked' }],
        then: [{ target: 'fields.mx1.table.rows[1].cells[3]', targetProperty: 'isNotVisible' }],
      })

    await renderForm(page, {})
    const rendered = page.locator('#e2e-mx-render')
    const comment = rendered.getByRole('textbox', { name: 'Price Comment' })
    await expect(comment).toBeVisible()
    await rendered.getByRole('radio', { name: 'Speed Poor' }).check()
    await expect(comment).toBeHidden()
  })

  test('a narrow matrix stacks, keeps its roles and names, and still hides condition targets', async ({ page }) => {
    const hideRow = [
      {
        if: [{ source: 'fields.tx1', sourceProperty: 'value', comparison: '==', target: 'hide', targetProperty: '' }],
        then: [
          { target: 'fields.mx1.table.rows[1]', targetProperty: 'isNotVisible', assignment: '', value: '' },
          { target: 'fields.mx1.table.rows[0].cells[3]', targetProperty: 'isNotVisible', assignment: '', value: '' },
        ],
      },
    ]
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/')
    await expect(page.locator('.formeo-editor').first()).toBeVisible()
    await renderForm(page, { formData: formWith({ ...matrixField(), ...textField('tx1') }, hideRow), width: '320px' })
    const container = page.locator('#e2e-mx-render')
    const table = container.getByRole('table', { name: 'Visit' })
    await expect(table.locator('tbody tr').first()).toHaveCSS('display', 'block')
    await expect(table.locator('.f-table-cell-label').first()).toBeVisible()
    await expect(table.getByRole('row')).toHaveCount(3)
    await expect(table.getByRole('cell').first()).toBeVisible()
    await expect(table.getByRole('radio', { name: 'Speed Poor' })).toBeVisible()
    const sizes = await container.evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }))
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client)

    await container.getByRole('textbox', { name: 'tx1' }).fill('hide')
    await expect(table.locator('tbody tr').nth(1)).toBeHidden()
    await expect(table.getByRole('radio', { name: 'Price Poor' })).toBeHidden()
    await expect(table.getByRole('textbox', { name: 'Speed Comment' })).toBeHidden()
    await expect(table.getByRole('radio', { name: 'Speed Poor' })).toBeVisible()
  })

  test('a display table still scrolls at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/')
    await expect(page.locator('.formeo-editor').first()).toBeVisible()
    const columns = Array.from({ length: 6 }, (_, i) => ({ label: `Wednesday opening ${i + 1}` }))
    const rows = [{ cells: columns.map(() => 'Closed for maintenance') }]
    await renderForm(page, {
      formData: formWith({
        t1: { id: 't1', tag: 'table', config: { label: 'T' }, table: { caption: 'Week', columns, rows } },
      }),
      width: '320px',
    })
    const region = page.locator('#e2e-mx-render').getByRole('region', { name: 'Week' })
    const sizes = await region.evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }))
    expect(sizes.scroll).toBeGreaterThan(sizes.client)
    await expect(region.locator('tbody tr').first()).toHaveCSS('display', 'table-row')
  })

  test('the stage preview is inert', async ({ page }) => {
    const editor = await mountEditor(page, formWith(matrixField()))
    const preview = editor.locator('.formeo-field .field-preview table')
    await expect(preview).toHaveAttribute('inert', '')
    await preview.locator('input[type="radio"]').first().click({ force: true })
    expect(await preview.locator('input[type="radio"]:checked').count()).toBe(0)
    const field = await page.evaluate(() => window.__editor.formData.fields.mx1)
    expect(field.options).toBeUndefined()
    expect(field.attrs.value).toBeUndefined()
  })

  test('a saved matrix loads into a new editor unchanged and renders the same', async ({ page }) => {
    await mountEditor(page, formWith(matrixField()))
    const saved = await page.evaluate(() => window.__editor.formData)
    expect(saved.fields.mx1.table).toEqual(visit())

    const second = await mountEditor(page, saved, 'e2e-mx-2', '__editor2')
    const panel = await openTablePanel(second.locator('.formeo-field').first())
    await expect(panel.getByRole('textbox', { name: 'Row 1 value' })).toHaveValue('speed')
    await expect(panel.getByRole('checkbox', { name: 'Row 1 required' })).toBeChecked()
    expect(await page.evaluate(() => window.__editor2.formData.fields)).toEqual(saved.fields)

    await renderForm(page, { from: '__editor', id: 'render-a' })
    await renderForm(page, { from: '__editor2', id: 'render-b' })
    const htmlOf = id => page.locator(`#${id} .f-table-wrap`).evaluate(el => el.outerHTML)
    expect(await htmlOf('render-a')).toBe(await htmlOf('render-b'))
  })
})
