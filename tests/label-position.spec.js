// @ts-check
import { expect, test } from '@playwright/test'

const POSITIONS = ['top', 'bottom', 'before', 'after']

/** One text field `field-lp` (and optionally more fields) in a single-column form */
const formWith = (fields = {}) => {
  const ids = Object.keys(fields)
  return {
    id: 'form-lp',
    stages: { 'stage-lp': { id: 'stage-lp', children: ['row-lp'] } },
    rows: { 'row-lp': { id: 'row-lp', config: {}, children: ['col-lp'] } },
    columns: { 'col-lp': { id: 'col-lp', config: { width: '100%' }, children: ids } },
    fields,
  }
}

const textField = (config = {}) => ({
  'field-lp': {
    id: 'field-lp',
    tag: 'input',
    attrs: { type: 'text' },
    config: { label: 'Name', controlId: 'text-input', ...config },
  },
})

/**
 * Mounts an editor in #e2e-lp (above the demo editor). The editor is window.__editor.
 * @param {import('@playwright/test').Page} page
 * @param {Object} formData
 */
const mountEditor = async (page, formData) => {
  await page.goto('/')
  await expect(page.locator('.formeo-editor').first()).toBeVisible()
  await page.evaluate(async formData => {
    const container = document.createElement('div')
    container.id = 'e2e-lp'
    document.body.prepend(container)
    window.__editor = new window.FormeoEditor(
      { editorContainer: container, sessionStorage: false, style: null },
      formData
    )
    await window.__editor.whenReady()
  }, formData)
  return page.locator('#e2e-lp')
}

/**
 * Renders the editor's formData into #e2e-lp-render
 * @param {import('@playwright/test').Page} page
 * @param {{ width?: string, dir?: string }} [opts]
 */
const renderEditorForm = (page, { width = '', dir = '' } = {}) =>
  page.evaluate(
    ({ width, dir }) => {
      const container = Object.assign(document.createElement('div'), { id: 'e2e-lp-render' })
      container.style.width = width
      if (dir) {
        container.dir = dir
      }
      document.body.appendChild(container)
      new window.FormeoRenderer({ renderContainer: container }).render(window.__editor.formData)
    },
    { width, dir }
  )

const formDataOf = page => page.evaluate(() => window.__editor.formData)

/** Bounding boxes of a label and its control */
const boxesOf = async (label, control) => {
  const [l, c] = [await label.boundingBox(), await control.boundingBox()]
  if (!l || !c) throw new Error('label or control is not visible')
  return { l, c }
}

const overlapsVertically = ({ l, c }) => l.y < c.y + c.height && c.y < l.y + l.height

/** Asserts the label sits where `position` puts it, for left-to-right text */
const expectPlaced = (position, boxes) => {
  const { l, c } = boxes
  if (position === 'top') expect(l.y + l.height).toBeLessThanOrEqual(c.y + 1)
  if (position === 'bottom') expect(c.y + c.height).toBeLessThanOrEqual(l.y + 1)
  if (position === 'before') {
    expect(overlapsVertically(boxes)).toBe(true)
    expect(l.x + l.width).toBeLessThanOrEqual(c.x + 1)
  }
  if (position === 'after') {
    expect(overlapsVertically(boxes)).toBe(true)
    expect(c.x + c.width).toBeLessThanOrEqual(l.x + 1)
  }
}

test.describe('label position (#243)', () => {
  for (const position of POSITIONS) {
    test(`${position}: the editor preview and the rendered form agree`, async ({ page }) => {
      const editor = await mountEditor(page, formWith(textField({ labelPosition: position })))
      const field = editor.locator('.formeo-field').first()
      await expect(field.locator(':scope > .f-field')).toHaveClass(`f-field f-label-${position}`)
      expectPlaced(position, await boxesOf(field.locator('.prev-label'), field.locator('.field-preview input')))

      await renderEditorForm(page)
      const wrapper = page.locator('#e2e-lp-render .f-field')
      await expect(wrapper).toHaveClass(`f-field f-label-${position}`)
      expectPlaced(position, await boxesOf(wrapper.locator('label'), wrapper.locator('input')))
    })
  }

  test('the Configuration panel sets labelPosition from a dropdown', async ({ page }) => {
    const editor = await mountEditor(page, formWith(textField()))
    const field = editor.locator('.formeo-field').first()
    await field.hover()
    await field.locator('.field-actions').hover()
    await field.locator('.field-actions .edit-toggle').click()
    const editWindow = field.locator('.field-edit')
    await expect(editWindow).toBeVisible()
    await editWindow.getByRole('heading', { name: 'Configuration' }).click()
    await editWindow.locator('.add-config').click()
    const dialog = page.locator('.formeo-dialog.config-item-dialog')
    await dialog.locator('select.config-key-select').selectOption('labelPosition')
    await dialog.locator('button[type="submit"]').click()

    await editWindow.locator('select.config-labelPosition').selectOption('before')
    await expect.poll(async () => (await formDataOf(page)).fields['field-lp'].config.labelPosition).toBe('before')

    await field.locator('.field-actions .edit-toggle').click()
    await expect(field.locator(':scope > .f-field')).toHaveClass('f-field f-label-before')
  })

  test('a form saved with labelAfter loads as bottom and keeps its look', async ({ page }) => {
    const editor = await mountEditor(page, formWith(textField({ labelAfter: true })))
    const { config } = (await formDataOf(page)).fields['field-lp']
    expect(config.labelPosition).toBe('bottom')
    expect('labelAfter' in config).toBe(false)
    const field = editor.locator('.formeo-field').first()
    expectPlaced('bottom', await boxesOf(field.locator('.prev-label'), field.locator('.field-preview input')))
  })

  test('before stacks in a narrow container, with the input at full width', async ({ page }) => {
    await mountEditor(page, formWith(textField({ labelPosition: 'before' })))
    await renderEditorForm(page, { width: '240px' })
    const wrapper = page.locator('#e2e-lp-render .f-field')
    const { l, c } = await boxesOf(wrapper.locator('label'), wrapper.locator('input'))
    const w = await wrapper.boundingBox()
    expect(l.y + l.height).toBeLessThanOrEqual(c.y + 1)
    expect(Math.abs(c.width - (w?.width ?? 0))).toBeLessThanOrEqual(1)
  })

  test('before is on the right in a right-to-left form', async ({ page }) => {
    await mountEditor(page, formWith(textField({ labelPosition: 'before' })))
    await renderEditorForm(page, { dir: 'rtl' })
    const wrapper = page.locator('#e2e-lp-render .f-field')
    const boxes = await boxesOf(wrapper.locator('label'), wrapper.locator('input'))
    expect(overlapsVertically(boxes)).toBe(true)
    expect(boxes.l.x).toBeGreaterThanOrEqual(boxes.c.x + boxes.c.width - 1)
  })

  test('a long before label wraps beside the input instead of pushing it down', async ({ page }) => {
    const label = 'A label much longer than the default label width, so its text has to wrap'
    await mountEditor(page, formWith(textField({ label, labelPosition: 'before' })))
    await renderEditorForm(page, { width: '900px' })
    const wrapper = page.locator('#e2e-lp-render .f-field')
    expectPlaced('before', await boxesOf(wrapper.locator('label'), wrapper.locator('input')))
  })

  test('clicking a label focuses its input in every position', async ({ page }) => {
    const fields = Object.fromEntries(
      POSITIONS.map(position => [
        `field-${position}`,
        {
          id: `field-${position}`,
          tag: 'input',
          attrs: { type: 'text' },
          config: { label: `Label ${position}`, controlId: 'text-input', labelPosition: position },
        },
      ])
    )
    await mountEditor(page, formWith(fields))
    await renderEditorForm(page)
    for (const position of POSITIONS) {
      await page.locator(`#e2e-lp-render label[for="f-field-${position}"]`).click()
      await expect(page.locator(`#e2e-lp-render #f-field-${position}`)).toBeFocused()
    }
  })

  test('a condition hides a before field and a lone checkbox', async ({ page }) => {
    const hide = target => ({
      if: [
        { source: 'fields.trigger', sourceProperty: 'value', comparison: 'equals', target: 'hide', targetProperty: '' },
      ],
      then: [{ target: `fields.${target}`, targetProperty: 'isNotVisible', assignment: '', value: '' }],
    })
    const formData = formWith({
      trigger: { id: 'trigger', tag: 'input', attrs: { type: 'text' }, config: { label: 'Trigger' } },
      ...textField({ labelPosition: 'before' }),
      agree: { id: 'agree', tag: 'input', attrs: { type: 'checkbox' }, config: { label: 'I agree' } },
    })
    formData.stages['stage-lp'].conditions = [hide('field-lp'), hide('agree')]
    await page.goto('/')
    await page.evaluate(formData => {
      const container = Object.assign(document.createElement('div'), { id: 'e2e-lp-render' })
      document.body.appendChild(container)
      new window.FormeoRenderer({ renderContainer: container }).render(formData)
    }, formData)
    const form = page.locator('#e2e-lp-render')
    const before = form.locator('.f-field:has(> #f-field-lp)')
    const checkbox = form.locator('.f-field:has(> #f-agree)')
    await expect(before).toHaveClass('f-field f-label-before')
    await expect(checkbox).toHaveClass('f-field f-label-after')
    await expect(before).toBeVisible()
    await expect(checkbox).toBeVisible()

    await form.locator('#f-trigger').fill('hide')
    await expect(before).toBeHidden()
    await expect(checkbox).toBeHidden()
  })

  test('checkbox and radio groups are named by their label', async ({ page }) => {
    const group = (id, type, label) => ({
      id,
      tag: 'input',
      attrs: { type },
      config: { label, controlId: type, labelPosition: 'before' },
      options: [
        { label: 'One', value: 'one' },
        { label: 'Two', value: 'two' },
      ],
    })
    await mountEditor(
      page,
      formWith({ colours: group('colours', 'checkbox', 'Colours'), size: group('size', 'radio', 'Size') })
    )
    await renderEditorForm(page)
    const form = page.locator('#e2e-lp-render')
    await expect(form.getByRole('group', { name: 'Colours' })).toBeVisible()
    await expect(form.getByRole('group', { name: 'Size' })).toBeVisible()
    await form.getByRole('group', { name: 'Size' }).getByLabel('Two').check()
    await expect(form.locator('#f-size-1')).toBeChecked()
  })
})
