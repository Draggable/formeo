// @ts-check
import { expect, test } from '@playwright/test'

import { openTablePanel, tableHelpers } from './helpers/table.js'

const { formWith, mountEditor, renderForm } = tableHelpers('rp')

const orderTable = () => ({
  caption: 'Order',
  headerRow: true,
  rowHeaders: true,
  repeat: { min: 1, max: 3 },
  columns: [
    { label: 'Item' },
    { label: 'Qty', value: 'qty', input: 'text' },
    { label: 'Wrap', value: 'wrap', input: 'checkbox' },
  ],
  rows: [{ cells: ['Item', '', ''] }],
})

const orderField = (table = orderTable(), id = 'rp1') => ({
  [id]: {
    id,
    tag: 'table',
    attrs: { className: '', name: 'order' },
    config: { label: 'Order', hideLabel: true, controlId: 'table' },
    table,
  },
})

test.describe('Repeating rows (#349 phase 3)', () => {
  /** @type {Error[]} */
  let errors
  test.beforeEach(({ page }) => {
    errors = []
    page.on('pageerror', error => errors.push(error))
  })
  test.afterEach(() => {
    expect(errors).toEqual([])
  })

  test('turns repeating on and sets limits from the keyboard', async ({ page }) => {
    const bare = {
      caption: 'Order',
      headerRow: true,
      rowHeaders: false,
      columns: [{ label: 'Item' }, { label: 'Qty' }, { label: 'Wrap' }],
      rows: [{ cells: ['', '', ''] }],
    }
    const editor = await mountEditor(page, formWith(orderField(bare)))
    const panel = await openTablePanel(editor.locator('.formeo-field').first())
    const storedTable = () => page.evaluate(() => window.__editor.formData.fields.rp1.table)

    // a closed select picks an option by its first letter, as a keyboard user would
    for (const [column, letter, value] of [
      [1, 't', 'text'],
      [2, 't', 'text'],
      [3, 'c', 'checkbox'],
    ]) {
      const input = panel.getByRole('combobox', { name: `Column ${column} input` })
      await input.focus()
      await page.keyboard.press(letter)
      await expect(input).toHaveValue(value)
      await expect(panel.getByRole('combobox', { name: `Column ${column} input` })).toBeFocused()
    }

    const toggle = panel.getByRole('checkbox', { name: 'Repeating rows' })
    await toggle.focus()
    await page.keyboard.press('Space')
    await expect(toggle).toBeChecked()
    await expect(toggle).toBeFocused()

    const min = panel.getByRole('spinbutton', { name: 'Minimum rows' })
    await min.focus()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('1')
    await page.keyboard.press('Tab')
    const max = panel.getByRole('spinbutton', { name: 'Maximum rows' })
    await expect(max).toBeFocused()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('3')
    await page.keyboard.press('Tab')
    // the commit didn't rebuild the panel and drop focus to the body
    await expect(panel.locator(':focus')).toHaveCount(1)

    const required = panel.getByRole('checkbox', { name: 'Every row required' })
    await required.focus()
    await page.keyboard.press('Space')
    await expect(required).toBeChecked()
    await expect(required).toBeFocused()

    const table = await storedTable()
    expect(table.repeat).toEqual({ min: 1, max: 3 })
    expect(table.rows[0].required).toBe(true)
    expect(table.columns.map(column => column.input)).toEqual(['text', 'text', 'checkbox'])
    await expect(panel.getByRole('button', { name: '+ Row' })).toHaveCount(0)
  })

  test('adds and removes rows with the keyboard, with focus and announcements', async ({ page }) => {
    await mountEditor(page, formWith(orderField()))
    await renderForm(page, {})
    const form = page.locator('#e2e-rp-render')
    const add = form.getByRole('button', { name: '+ Row' })
    await add.focus()
    await page.keyboard.press('Enter')
    await expect(form.getByRole('textbox', { name: 'Item 2 Qty' })).toBeFocused()
    await expect(form.getByRole('status')).toHaveText('Item 2 added')
    await page.keyboard.type('two')
    await add.focus()
    await page.keyboard.press('Enter')
    await expect(form.getByRole('textbox', { name: 'Item 3 Qty' })).toBeFocused()
    await page.keyboard.type('three')
    await expect(add).toBeDisabled()

    // remove row 1: row 2 becomes index 0 and focus lands on the remove button at index 0
    await form.getByRole('button', { name: 'Remove row 1' }).focus()
    await page.keyboard.press('Enter')
    await expect(form.getByRole('status')).toHaveText('Item 1 removed')
    await expect(form.locator('tbody tr')).toHaveCount(2)
    await expect(form.getByRole('textbox', { name: 'Item 1 Qty' })).toHaveValue('two')
    await expect(form.getByRole('textbox', { name: 'Item 1 Qty' })).toHaveAttribute('name', 'order[0][qty]')
    await expect(form.getByRole('button', { name: 'Remove row 1' })).toBeFocused()
    await expect(form.getByRole('textbox', { name: 'Item 2 Qty' })).toHaveValue('three')
    await expect(form.getByRole('textbox', { name: 'Item 2 Qty' })).toHaveAttribute('name', 'order[1][qty]')

    // add up to Max again
    await expect(add).toBeEnabled()
    await add.focus()
    await page.keyboard.press('Enter')
    await expect(form.locator('tbody tr')).toHaveCount(3)
    await expect(add).toBeDisabled()
  })

  test('userData round-trips into a fresh render, creating rows', async ({ page }) => {
    await mountEditor(page, formWith(orderField()))
    await renderForm(page, {})
    const form = page.locator('#e2e-rp-render')
    await form.getByRole('button', { name: '+ Row' }).click()
    await form.getByRole('textbox', { name: 'Item 1 Qty' }).fill('1')
    await form.getByRole('textbox', { name: 'Item 2 Qty' }).fill('2')
    await form.getByRole('checkbox', { name: 'Item 2 Wrap' }).check()
    const saved = await page.evaluate(() => window.__renderer.userData)
    expect(saved).toEqual({ 'order[0][qty]': '1', 'order[1][qty]': '2', 'order[1][wrap]': 'wrap' })

    await page.evaluate(() => document.getElementById('e2e-rp-render').remove())
    await renderForm(page, {})
    await page.evaluate(data => {
      window.__renderer.userData = data
    }, saved)
    await expect(form.locator('tbody tr')).toHaveCount(2)
    expect(await page.evaluate(() => window.__renderer.userData)).toEqual(saved)
  })

  test('an empty required row blocks submit', async ({ page }) => {
    const table = { ...orderTable(), rows: [{ cells: ['Item', '', ''], required: true }] }
    await mountEditor(page, formWith(orderField(table)))
    await renderForm(page, {})
    const form = page.locator('#e2e-rp-render form')
    const valid = await form.evaluate(elem => elem.reportValidity())
    expect(valid).toBe(false)
    await expect(page.locator('#e2e-rp-render').getByRole('textbox', { name: 'Item 1 Qty' })).toBeFocused()
  })

  test('stacks at 360px with each card ending in its remove button', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await mountEditor(page, formWith(orderField()))
    await renderForm(page, { width: '340px' })
    const form = page.locator('#e2e-rp-render')
    await form.getByRole('button', { name: '+ Row' }).click()
    const card = form.locator('tbody tr').first()
    await expect(card).toHaveCSS('display', 'block')
    await expect(card.getByRole('button', { name: 'Remove row 1' })).toBeVisible()
    // each card ends with its remove button: nothing sits below it, and it stays inside the container
    const boxes = await form.locator('tbody tr').evaluateAll(rows =>
      rows.map(row => {
        const remove = row.querySelector('.f-table-remove-row')?.getBoundingClientRect()
        const others = [...row.querySelectorAll('td, th')]
          .filter(cell => !cell.contains(row.querySelector('.f-table-remove-row')))
          .map(cell => cell.getBoundingClientRect().bottom)
        return { top: remove?.top, right: remove?.right, othersBottom: Math.max(...others) }
      })
    )
    const container = await form.evaluate(el => el.getBoundingClientRect().right)
    expect(boxes).toHaveLength(2)
    for (const box of boxes) {
      expect(box.top).toBeGreaterThanOrEqual(box.othersBottom - 1)
      expect(box.right).toBeLessThanOrEqual(container + 1)
    }
    // the rendered container, not the document: the demo editor mounted above the form is wider than 360px
    const sizes = await form.evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }))
    expect(sizes.client).toBeGreaterThan(0)
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client)
  })

  test('input groups: named buttons, -n names and restore', async ({ page }) => {
    const data = formWith({
      email: { id: 'email', tag: 'input', attrs: { type: 'text', name: 'email' }, config: { label: 'Email' } },
      pick: {
        id: 'pick',
        tag: 'input',
        attrs: { type: 'radio', name: 'pick' },
        config: { label: 'Pick' },
        options: [
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
        ],
      },
    })
    data.rows['row-rp'].config = { inputGroup: true, legend: 'Contacts' }
    await mountEditor(page, data)
    await renderForm(page, { formData: data })
    const form = page.locator('#e2e-rp-render')
    await form.getByRole('button', { name: 'Add +' }).click()
    await expect(form.getByRole('button', { name: 'Remove group 2' })).toBeVisible()
    await expect(form.locator('input[name="pick-1"]')).toHaveCount(2)
    await form.locator('input[name="email"]').nth(1).fill('b@x')
    await form.locator('input[name="pick-1"][value="two"]').check()
    const saved = await page.evaluate(() => window.__renderer.userData)
    expect(saved.email).toEqual(['', 'b@x'])
    expect(saved['pick-1']).toBe('two')

    await page.evaluate(() => document.getElementById('e2e-rp-render').remove())
    await renderForm(page, { formData: data })
    await expect(form.getByRole('button', { name: 'Remove group 2' })).toHaveCount(0)
    await page.evaluate(answers => {
      window.__renderer.userData = answers
    }, saved)
    await expect(form.getByRole('button', { name: 'Remove group 2' })).toBeVisible()
    await expect(form.locator('input[name="email"]')).toHaveCount(2)
    await expect(form.locator('input[name="email"]').nth(1)).toHaveValue('b@x')
    expect(await page.evaluate(() => window.__renderer.userData)).toEqual(saved)
  })

  test('the picker reaches matrix cells from the keyboard and keeps them while filtering', async ({ page }) => {
    const { repeat: _repeat, ...matrix } = orderTable()
    const editor = await mountEditor(
      page,
      formWith(orderField({ ...matrix, rows: [{ value: 'a', cells: ['Apple', '', ''] }] }))
    )
    const stage = editor.locator('.formeo-stage').first()
    await stage.locator('.stage-actions').first().hover()
    await stage.locator('.stage-actions .edit-toggle').first().click()
    const stagePanel = stage.locator('.stage-edit').first()
    const source = stagePanel.locator('.condition-source .f-autocomplete-display-field').first()
    await source.focus()
    await source.fill('Apple')
    // only the active item's lists open: hover the row, and check the filter didn't hide its cell
    const row = page.locator('.component-type-table-row[data-label="Apple"]')
    await expect(row).toBeVisible()
    await row.hover()
    const cell = page.locator('.component-type-table-cell[data-label="Apple › Qty"]')
    expect(await cell.evaluate(elem => elem.style.display)).not.toBe('none')
    await expect(cell).toBeVisible()
    await source.fill('')
    await source.press('ArrowDown')
    const field = page.locator('.f-autocomplete-list-item-depth-0[data-label="Order"]')
    const isActive = () => field.evaluate(elem => elem.classList.contains('active-option'))
    for (let presses = 0; presses < 20 && !(await isActive()); presses++) {
      await source.press('ArrowDown')
    }
    expect(await isActive()).toBe(true)
    await source.press('ArrowRight')
    await source.press('ArrowRight')
    await expect(page.locator('.active-option')).toHaveAttribute('data-label', 'Apple › Qty')
    await expect(page.locator('.active-option')).toBeVisible()
    await source.press('Enter')
    await expect
      .poll(() => page.evaluate(() => window.__editor.formData.stages['stage-rp'].conditions?.[0]?.if?.[0]?.source))
      .toBe('fields.rp1.table.rows[0].cells[1]')
  })
})
