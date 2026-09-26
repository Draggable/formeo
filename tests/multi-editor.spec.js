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

/**
 * Drags a control button onto the bottom of a stage the way a user does with Sortable's fallback drag.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} control
 * @param {import('@playwright/test').Locator} stage
 */
const dragControlTo = async (page, control, stage) => {
  await control.hover()
  const from = await control.boundingBox()
  const to = await stage.boundingBox()
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  // cross Sortable's fallbackTolerance before the long move, or no drag starts
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2, { steps: 5 })
  await page.waitForTimeout(100)
  await page.mouse.move(to.x + to.width / 2, to.y + to.height - 10, { steps: 25 })
  await page.waitForTimeout(150)
  await page.mouse.up()
}

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

  test('a control dragged onto its editor’s stage adds the field to that editor only', async ({ page }) => {
    // the test editors sit below the demo; fit the whole page so the stage is under the mouse
    await page.setViewportSize({ width: 1280, height: 1800 })
    await page.evaluate(() => window.scrollTo(0, 0))
    const fieldCount = editor => page.evaluate(name => Object.keys(window[name].formData.fields).length, editor)

    await dragControlTo(
      page,
      page.locator('#e2e-editor-a').getByRole('button', { name: 'Text Input' }),
      page.locator('#e2e-editor-a .formeo-stage').first()
    )

    await expect.poll(() => fieldCount('e2eEditorA')).toBe(2)
    expect(await fieldCount('e2eEditorB')).toBe(1)
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

test.describe('Shared sessionStorage key warning (#152)', () => {
  const warningsFor = (warnings, key) => warnings.filter(text => text.includes(`sessionStorage key "${key}"`))

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor').first()).toBeVisible()
    await page.evaluate(() => {
      window.makeEditor = (id, sessionStorage) => {
        const container = document.createElement('div')
        container.id = id
        document.body.appendChild(container)
        return new window.FormeoEditor({ editorContainer: container, sessionStorage, style: null })
      }
    })
  })

  test('warns once when two live editors share a key', async ({ page }) => {
    const warnings = []
    page.on('console', msg => msg.type() === 'warning' && warnings.push(msg.text()))

    await page.evaluate(async () => {
      const editors = [window.makeEditor('key-a', 'shared-form'), window.makeEditor('key-b', 'shared-form')]
      await Promise.all(editors.map(editor => editor.whenReady()))
    })

    expect(warningsFor(warnings, 'shared-form')).toHaveLength(1)
  })

  test('does not warn when an editor is re-created after the first one left the page', async ({ page }) => {
    const warnings = []
    page.on('console', msg => msg.type() === 'warning' && warnings.push(msg.text()))

    await page.evaluate(async () => {
      const removed = window.makeEditor('remount-a', 'remount-form')
      await removed.whenReady()
      document.getElementById('remount-a').remove()

      const replaced = window.makeEditor('remount-b', 'remount-form')
      await replaced.whenReady()
      document.getElementById('remount-b').replaceChildren()

      await window.makeEditor('remount-c', 'remount-form').whenReady()
    })

    expect(warningsFor(warnings, 'remount-form')).toHaveLength(0)
  })

  test('does not warn for distinct keys', async ({ page }) => {
    const warnings = []
    page.on('console', msg => msg.type() === 'warning' && warnings.push(msg.text()))

    await page.evaluate(async () => {
      const editors = [window.makeEditor('distinct-a', 'orders-form'), window.makeEditor('distinct-b', 'returns-form')]
      await Promise.all(editors.map(editor => editor.whenReady()))
    })

    expect(warnings.filter(text => text.includes('sessionStorage key'))).toHaveLength(0)
  })
})

test.describe('Per-editor save, restore and clear (#152)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor').first()).toBeVisible()

    await page.evaluate(
      async ([formA, formB]) => {
        // the demo editor uses the default key; start every test from an empty store
        window.sessionStorage.clear()
        window.makeKeyedEditor = (id, sessionStorage, formData) => {
          const container = document.createElement('div')
          container.id = id
          document.body.appendChild(container)
          return new window.FormeoEditor({ editorContainer: container, sessionStorage, style: null }, formData)
        }
        window.e2eEditorA = window.makeKeyedEditor('save-editor-a', 'a-form', formA)
        window.e2eEditorB = window.makeKeyedEditor('save-editor-b', 'b-form', formB)
        await Promise.all([window.e2eEditorA.whenReady(), window.e2eEditorB.whenReady()])
      },
      [formFor('a', 'Field A'), formFor('b', 'Field B')]
    )
  })

  const stored = (page, key) => page.evaluate(storageKey => window.sessionStorage.getItem(storageKey), key)

  test('saving one editor writes only its own key', async ({ page }) => {
    await page.locator('#save-editor-a .save-form').click()

    await expect.poll(() => stored(page, 'a-form')).not.toBeNull()
    expect(Object.keys(JSON.parse(await stored(page, 'a-form')).fields)).toEqual(['field-a'])
    expect(await stored(page, 'b-form')).toBeNull()
    expect(await stored(page, 'formeo-formData')).toBeNull()
  })

  test('a new editor with the same key and no formData restores the saved form', async ({ page }) => {
    await page.locator('#save-editor-a .save-form').click()
    await expect.poll(() => stored(page, 'a-form')).not.toBeNull()

    const restored = await page.evaluate(async () => {
      const editor = window.makeKeyedEditor('save-editor-c', 'a-form')
      await editor.whenReady()
      return editor.formData
    })

    expect(restored.id).toBe('form-a')
    expect(Object.keys(restored.fields)).toEqual(['field-a'])
    await expect(page.locator('#save-editor-c')).toContainText('Field A')
  })

  test('clearing one editor leaves the other untouched', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept())

    await page.locator('#save-editor-a .clear-form').click()

    await expect.poll(() => page.evaluate(() => Object.keys(window.e2eEditorA.formData.rows).length)).toBe(0)
    const b = await page.evaluate(() => window.e2eEditorB.formData)
    expect(Object.keys(b.rows)).toEqual(['row-b'])
    expect(Object.keys(b.fields)).toEqual(['field-b'])
    await expect(page.locator('#save-editor-b')).toContainText('Field B')
  })
})
