// @ts-check
import { expect, test } from '@playwright/test'

/**
 * Builds a one-field form whose ids are unique to `key`, so the two editors never share ids.
 */
const formFor = (key, label) => ({
  id: `form-${key}`,
  stages: { [`stage-${key}`]: { id: `stage-${key}`, children: [`row-${key}`] } },
  rows: { [`row-${key}`]: { id: `row-${key}`, config: {}, children: [`col-${key}`] } },
  columns: { [`col-${key}`]: { id: `col-${key}`, config: { width: '100%' }, children: [`field-${key}`] } },
  fields: {
    [`field-${key}`]: {
      id: `field-${key}`,
      tag: 'input',
      attrs: { type: 'text' },
      config: { label, controlId: 'text-input' },
    },
  },
})

test.describe('Multiple editors on one page (#152)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor').first()).toBeVisible()

    await page.evaluate(
      async ([formA, formB]) => {
        const make = (id, formData) => {
          const container = document.createElement('div')
          container.id = id
          document.body.appendChild(container)
          return new window.FormeoEditor({ editorContainer: container, sessionStorage: false, style: null }, formData)
        }
        window.e2eEditorA = make('e2e-editor-a', formA)
        window.e2eEditorB = make('e2e-editor-b', formB)
        await Promise.all([window.e2eEditorA.whenReady(), window.e2eEditorB.whenReady()])
      },
      [formFor('a', 'Field A'), formFor('b', 'Field B')]
    )
  })

  test('each editor keeps its own formData', async ({ page }) => {
    const [a, b] = await page.evaluate(() => [window.e2eEditorA.formData, window.e2eEditorB.formData])

    expect(a.id).toBe('form-a')
    expect(Object.keys(a.fields)).toEqual(['field-a'])
    expect(b.id).toBe('form-b')
    expect(Object.keys(b.fields)).toEqual(['field-b'])
  })

  test('each editor renders its own fields and controls', async ({ page }) => {
    await expect(page.locator('#e2e-editor-a')).toContainText('Field A')
    await expect(page.locator('#e2e-editor-a')).not.toContainText('Field B')
    await expect(page.locator('#e2e-editor-b')).toContainText('Field B')
    await expect(page.locator('#e2e-editor-a .formeo-controls')).toHaveCount(1)
    await expect(page.locator('#e2e-editor-b .formeo-controls')).toHaveCount(1)
  })

  test('adding a field in one editor leaves the other untouched', async ({ page }) => {
    await page.locator('#e2e-editor-a').getByRole('button', { name: 'Checkbox Group' }).click()

    const [a, b] = await page.evaluate(() => [
      Object.keys(window.e2eEditorA.formData.fields).length,
      Object.keys(window.e2eEditorB.formData.fields).length,
    ])
    expect(a).toBe(2)
    expect(b).toBe(1)
  })

  test('condition pickers list the fields of their own editor', async ({ page }) => {
    // Conditions live on the stage's edit panel, not on a field's edit panel (there is no field
    // "Conditions" tab - verified against the running demo). The stage edit panel opens directly
    // to its (only) panel, which is seeded with one empty if/then condition.
    const editorA = page.locator('#e2e-editor-a')
    const stageA = editorA.locator('.formeo-stage').first()
    await stageA.locator('.stage-actions').first().hover()
    await stageA.locator('.stage-actions .edit-toggle').first().click()

    const stageEditA = editorA.locator('.stage-edit').first()
    await stageEditA.locator('.condition-source .f-autocomplete-display-field').first().click()

    await expect(editorA.locator('.f-autocomplete-list')).toContainText('Field A')
    await expect(editorA.locator('.f-autocomplete-list')).not.toContainText('Field B')
  })

  test('onUpdate fires only for the editor that changed', async ({ page }) => {
    await page.evaluate(async () => {
      window.e2eCalls = { c: 0, d: 0 }
      const make = (id, key) => {
        const container = document.createElement('div')
        container.id = id
        document.body.appendChild(container)
        return new window.FormeoEditor({
          editorContainer: container,
          sessionStorage: false,
          style: null,
          events: { onUpdate: () => window.e2eCalls[key]++ },
        })
      }
      const editors = [make('e2e-editor-c', 'c'), make('e2e-editor-d', 'd')]
      await Promise.all(editors.map(editor => editor.whenReady()))
    })
    await page.evaluate(() => {
      window.e2eCalls = { c: 0, d: 0 }
    })

    await page.locator('#e2e-editor-c').getByRole('button', { name: 'Checkbox Group' }).click()

    await expect.poll(() => page.evaluate(() => window.e2eCalls.c)).toBeGreaterThan(0)
    expect(await page.evaluate(() => window.e2eCalls.d)).toBe(0)
  })
})
