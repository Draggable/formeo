// @ts-check
import { expect, test } from '@playwright/test'
import { conditionalFields } from './conditions.formData'

test.describe('Form Editor', () => {
  test('should load the form editor correctly', async ({ page }) => {
    await page.goto('/')

    // Check if the form editor is loaded by verifying the presence of a specific element
    await expect(page.locator('.formeo-editor')).toBeVisible()
  })

  test.skip('should load the form editor with the correct form data', async ({ page }) => {
    await page.goto('/')

    // Load the form data into the form editor
    await page.evaluate(formData => {
      window.formeoEditor.formData = formData
    }, conditionalFields)

    // Check if the form editor has the correct form data
    const formData = await page.evaluate(() => window.formeoEditor.formData)
    await expect(formData).toEqual(conditionalFields)
  })

  test('should add fields to the form editor', async ({ page }) => {
    await page.goto('/')

    // Add a field to the form editor
    const checkboxControl = page.getByRole('button', { name: 'Checkbox Group' })
    await checkboxControl.click()

    // Click on the first element matching the selector ".field-actions .edit-toggle"
    await page.locator('.field-actions').first().hover()
    await page.locator('.field-actions .edit-toggle').first().click()

    // click the options panel label
    await page.locator('.field-edit').first().getByRole('heading', { name: 'Options' }).click()

    await page.locator('.field-edit-options .label').click()
    await page.locator('.field-edit-options .label').press('ControlOrMeta+a')
    await page.locator('.field-edit-options .label').fill('Field One')
    await page.getByRole('button', { name: '+ Option' }).click()
  })
})

test.describe('Rendered conditions', () => {
  const clause = (source, value, logical) => ({
    ...(logical && { logical }),
    source: `fields.${source}`,
    sourceProperty: 'value',
    comparison: 'equals',
    target: value,
    targetProperty: '',
  })

  const renderWithCondition = async (page, ifClauses) => {
    await page.evaluate(ifClauses => {
      const text = (id, extra = {}) => ({ id, tag: 'input', attrs: { type: 'text' }, config: { label: id }, ...extra })
      const fields = {
        'cond-a': text('cond-a'),
        'cond-b': text('cond-b'),
        'cond-target': text('cond-target', {
          conditions: [
            {
              if: ifClauses,
              then: [{ target: 'fields.cond-target', targetProperty: 'isNotVisible', assignment: '', value: '' }],
            },
          ],
        }),
      }
      const ids = Object.keys(fields)
      const formData = {
        id: 'e2e-conditions',
        stages: { 'cond-stage': { id: 'cond-stage', children: ['cond-row'] } },
        rows: { 'cond-row': { id: 'cond-row', config: {}, children: ids.map(id => `col-${id}`) } },
        columns: Object.fromEntries(ids.map(id => [`col-${id}`, { id: `col-${id}`, config: {}, children: [id] }])),
        fields,
      }
      const container = document.createElement('div')
      container.id = 'e2e-conditions'
      document.body.appendChild(container)
      new window.FormeoRenderer({ renderContainer: container, formData }).render()
    }, ifClauses)
    return page.locator('#e2e-conditions form')
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()
  })

  test('AND hides the target only when both clauses match (#258)', async ({ page }) => {
    const form = await renderWithCondition(page, [clause('cond-a', 'a'), clause('cond-b', 'b', '&&')])
    const target = form.locator('#f-cond-target')

    await form.locator('#f-cond-a').fill('a')
    await expect(target).toBeVisible()

    await form.locator('#f-cond-b').fill('b')
    await expect(target).toBeHidden()
  })

  test('OR hides the target when either clause matches (#258)', async ({ page }) => {
    const form = await renderWithCondition(page, [clause('cond-a', 'a'), clause('cond-b', 'b', '||')])

    await form.locator('#f-cond-b').fill('b')
    await expect(form.locator('#f-cond-target')).toBeHidden()
  })
})
