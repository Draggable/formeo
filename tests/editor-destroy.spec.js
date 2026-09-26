// @ts-check
import { expect, test } from '@playwright/test'
import { gotoEditor } from './helpers/editor.js'
import { dragControlTo, formFor } from './helpers/multi-editor.js'

/**
 * How many `resize` listeners are registered on window, read through the DevTools protocol
 * @param {import('@playwright/test').Page} page
 */
const windowResizeListeners = async page => {
  const client = await page.context().newCDPSession(page)
  try {
    const { result } = await client.send('Runtime.evaluate', { expression: 'window' })
    const { listeners } = await client.send('DOMDebugger.getEventListeners', { objectId: result.objectId })
    return listeners.filter(({ type }) => type === 'resize').length
  } finally {
    await client.detach()
  }
}

test.describe('FormeoEditor#destroy (#166)', () => {
  let errors
  test.beforeEach(async ({ page }) => {
    errors = []
    page.on('pageerror', err => errors.push(err.message))
    await gotoEditor(page)
  })
  test.afterEach(() => {
    expect(errors).toEqual([])
  })

  test('removes the editor, its controls and the tooltip from the page', async ({ page }) => {
    const state = await page.evaluate(async () => {
      const editor = window.frameworkLoader.currentDemo.editor
      editor.destroy()
      return {
        editors: document.querySelectorAll('.formeo-editor').length,
        controls: document.querySelectorAll('.formeo-controls').length,
        tooltips: document.querySelectorAll('.d-tooltip').length,
        initState: editor.initState,
        isDestroyed: editor.isDestroyed,
        whenReady: await editor.whenReady().then(
          () => 'resolved',
          error => error.message
        ),
      }
    })
    expect(state).toEqual({
      editors: 0,
      controls: 0,
      tooltips: 0,
      initState: 'destroyed',
      isDestroyed: true,
      whenReady: 'Editor was destroyed',
    })
  })

  test('is safe to call twice', async ({ page }) => {
    await page.evaluate(() => {
      const editor = window.frameworkLoader.currentDemo.editor
      editor.destroy()
      editor.destroy()
    })
  })

  test('a new editor mounts in the same container and works', async ({ page }) => {
    await page.evaluate(async () => {
      window.frameworkLoader.currentDemo.editor.destroy()
      window.__second = new window.FormeoEditor({ editorContainer: '.build-form', sessionStorage: false })
      await window.__second.whenReady()
    })
    await expect(page.locator('.build-form .formeo-editor')).toHaveCount(1)
    await page.getByRole('button', { name: 'Text Input' }).click()
    await expect(page.locator('.build-form .formeo-field')).toHaveCount(1)
    expect(await page.evaluate(() => Object.keys(window.__second.formData.fields).length)).toBe(1)
  })

  test('an editor destroyed before it is ready never renders', async ({ page }) => {
    const state = await page.evaluate(async () => {
      window.frameworkLoader.currentDemo.editor.destroy()
      const editor = new window.FormeoEditor({ editorContainer: '.build-form' })
      const pending = editor.whenReady().then(
        () => 'resolved',
        error => error.message
      )
      editor.destroy()
      await new Promise(resolve => setTimeout(resolve, 1500))
      return {
        editors: document.querySelectorAll('.build-form .formeo-editor').length,
        initState: editor.initState,
        pending: await pending,
      }
    })
    expect(state).toEqual({ editors: 0, initState: 'destroyed', pending: 'Editor was destroyed' })
  })

  test('an editor destroyed while initializing never renders, and a pending whenReady() rejects', async ({ page }) => {
    const state = await page.evaluate(async () => {
      const container = document.createElement('div')
      container.id = 'destroy-while-initializing'
      document.body.appendChild(container)
      // allowEdit: false keeps loadResources() from calling init(), so the test can call it itself
      const editor = new window.FormeoEditor({
        allowEdit: false,
        editorContainer: container,
        sessionStorage: false,
        style: null,
      })
      await editor.loadResources()

      editor.init()
      const stateWhenDestroyed = editor.initState
      const pending = editor.whenReady().then(
        () => 'resolved',
        error => error.message
      )
      editor.destroy()
      const whenReady = await pending
      await new Promise(resolve => setTimeout(resolve, 300))

      return {
        stateWhenDestroyed,
        whenReady,
        initState: editor.initState,
        controls: editor.controls ?? null,
        rendered: container.querySelectorAll('.formeo-editor, .formeo-controls').length,
      }
    })

    expect(state).toEqual({
      stateWhenDestroyed: 'initializing',
      whenReady: 'Editor was destroyed',
      initState: 'destroyed',
      controls: null,
      rendered: 0,
    })
  })

  test('ends a control drag in progress: removes its ghost and restores the page overflow', async ({ page }) => {
    const overflowBefore = await page.evaluate(() => document.documentElement.style.overflow)
    const control = page.getByRole('button', { name: 'Text Input' })
    await control.hover()
    const from = await control.boundingBox()
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2, { steps: 5 })
    await page.mouse.move(from.x + from.width / 2 + 60, from.y + from.height / 2 + 60, { steps: 10 })
    await expect(page.locator('.control-moving')).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden')

    await page.evaluate(() => window.frameworkLoader.currentDemo.editor.destroy())
    await page.mouse.up()

    await expect(page.locator('.control-moving')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe(overflowBefore)
  })

  for (const [where, hook] of [
    ['onLoad', 'onLoad'],
    ['the formeoLoaded event callback', 'formeoLoaded'],
  ]) {
    test(`an editor destroyed from ${where} stays destroyed`, async ({ page }) => {
      await page.evaluate(() => window.frameworkLoader.currentDemo.editor.destroy())
      const listenersBefore = await windowResizeListeners(page)

      const state = await page.evaluate(async hookName => {
        const container = document.createElement('div')
        container.id = 'destroy-from-callback'
        document.body.appendChild(container)
        const destroyIt = editor => editor.destroy()
        const options = { editorContainer: container, sessionStorage: false, style: null }
        if (hookName === 'onLoad') {
          options.onLoad = destroyIt
        } else {
          options.events = { formeoLoaded: destroyIt }
        }
        const editor = new window.FormeoEditor(options)
        const whenReady = await editor.whenReady().then(
          () => 'resolved',
          error => error.message
        )
        await new Promise(resolve => setTimeout(resolve, 300))
        return {
          whenReady,
          initState: editor.initState,
          isDestroyed: editor.isDestroyed,
          rendered: container.querySelectorAll('.formeo-editor, .formeo-controls').length,
          tooltips: document.querySelectorAll('.d-tooltip').length,
        }
      }, hook)

      expect(state).toEqual({
        whenReady: 'Editor was destroyed',
        initState: 'destroyed',
        isDestroyed: true,
        rendered: 0,
        tooltips: 0,
      })
      expect(await windowResizeListeners(page)).toBe(listenersBefore)
    })
  }

  test('switching demo frameworks leaves exactly one editor', async ({ page }) => {
    await page.evaluate(() => window.frameworkLoader.switchFramework('angular'))
    await page.evaluate(() => window.frameworkLoader.switchFramework('vanilla'))
    await expect(page.locator('.formeo-editor')).toHaveCount(1)
  })

  test.describe('with two editors on one page', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(
        async ([formA, formB]) => {
          window.e2eCalls = { a: 0, b: 0 }
          const make = (id, key, formData) => {
            const container = document.createElement('div')
            container.id = id
            document.body.appendChild(container)
            return new window.FormeoEditor(
              {
                editorContainer: container,
                sessionStorage: false,
                style: null,
                events: { onUpdate: () => window.e2eCalls[key]++ },
              },
              formData
            )
          }
          window.e2eEditorA = make('e2e-editor-a', 'a', formA)
          await window.e2eEditorA.whenReady()
          // ready last, so it holds the page-wide tooltip
          window.e2eEditorB = make('e2e-editor-b', 'b', formB)
          await window.e2eEditorB.whenReady()
        },
        [formFor('a', 'Field A', { tooltip: 'Tip A' }), formFor('b', 'Field B', { tooltip: 'Tip B' })]
      )
    })

    test("a destroyed editor's callbacks stop firing", async ({ page }) => {
      await page.evaluate(async () => {
        // held from before destroy(), as app code might
        const fieldA = window.e2eEditorA.Components.fields.get('field-a')
        window.e2eEditorA.destroy()
        window.e2eCalls = { a: 0, b: 0 }
        fieldA.set('config.label', 'Changed after destroy')
        await new Promise(resolve => setTimeout(resolve, 300))
        fieldA.set('config.label', 'Changed again after destroy')
      })

      await page.locator('#e2e-editor-b').getByRole('button', { name: 'Text Input' }).click()
      await page.evaluate(() => window.dispatchEvent(new Event('resize')))

      await expect.poll(() => page.evaluate(() => window.e2eCalls.b)).toBeGreaterThan(0)
      await page.waitForTimeout(500)
      expect(await page.evaluate(() => window.e2eCalls.a)).toBe(0)
    })

    test('removes its window resize listener', async ({ page }) => {
      const before = await windowResizeListeners(page)
      // not the last editor on the page, so the shared tooltip (and its resize listener) stays
      await page.evaluate(() => window.e2eEditorA.destroy())
      const after = await windowResizeListeners(page)

      expect(before - after).toBe(1)
    })

    test('a trailing onUpdate scheduled just before destroy() never fires', async ({ page }) => {
      const calls = await page.evaluate(async () => {
        const editor = window.e2eEditorA
        const field = editor.Components.fields.get('field-a')
        // let any onUpdate from loading settle first
        await new Promise(resolve => setTimeout(resolve, 500))
        field.set('config.label', 'Changed once')
        field.set('config.label', 'Changed twice')
        const beforeDestroy = window.e2eCalls.a
        editor.destroy()
        // well past the onUpdate throttle window
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { beforeDestroy, afterDestroy: window.e2eCalls.a }
      })

      expect(calls.beforeDestroy).toBeGreaterThan(0)
      expect(calls.afterDestroy).toBe(calls.beforeDestroy)
    })

    test('destroying one editor leaves the other fully working', async ({ page }) => {
      // the test editors sit below the demo; fit the whole page so the stage is under the mouse
      await page.setViewportSize({ width: 1280, height: 1800 })
      await page.evaluate(() => window.scrollTo(0, 0))

      await page.evaluate(() => {
        window.e2eEditorB.destroy()
        window.e2eCalls = { a: 0, b: 0 }
      })
      await expect(page.locator('#e2e-editor-b .formeo-editor')).toHaveCount(0)
      const editorA = page.locator('#e2e-editor-a')
      const fieldCount = () => page.evaluate(() => Object.keys(window.e2eEditorA.formData.fields).length)

      await editorA.getByRole('button', { name: 'Text Input' }).click()
      await expect.poll(fieldCount).toBe(2)

      await dragControlTo(
        page,
        editorA.getByRole('button', { name: 'Text Input' }),
        editorA.locator('.formeo-stage').first()
      )
      await expect.poll(fieldCount).toBe(3)
      await expect(editorA.locator('.formeo-field')).toHaveCount(3)

      await expect.poll(() => page.evaluate(() => window.e2eCalls.a)).toBeGreaterThan(0)
      expect(await page.evaluate(() => window.e2eCalls.b)).toBe(0)

      const formData = await page.evaluate(() => window.e2eEditorA.formData)
      expect(formData.id).toBe('form-a')
      expect(Object.keys(formData.fields)).toContain('field-a')
      expect(Object.keys(formData.fields)).toHaveLength(3)
      expect(Object.keys(formData.rows)).toContain('row-a')

      await editorA.locator('#field-a [data-tooltip]').hover()
      await expect(page.locator('.d-tooltip')).toBeVisible()
      await expect(page.locator('.d-tooltip')).toHaveText('Tip A')

      await page.setViewportSize({ width: 1000, height: 1800 })
      await page.evaluate(() => window.dispatchEvent(new Event('resize')))
      await page.waitForTimeout(300)
      await expect(editorA.locator('.formeo-controls')).toHaveCount(1)
    })
  })

  test('a new editor with a destroyed editor’s sessionStorage key does not warn', async ({ page }) => {
    const warnings = []
    page.on('console', msg => msg.type() === 'warning' && warnings.push(msg.text()))

    await page.evaluate(async () => {
      const container = document.createElement('div')
      container.id = 'destroy-key-editor'
      document.body.appendChild(container)
      const make = () =>
        new window.FormeoEditor({ editorContainer: container, sessionStorage: 'destroy-key', style: null })

      const first = make()
      await first.whenReady()
      first.destroy()

      await make().whenReady()
    })

    expect(warnings.filter(text => text.includes('sessionStorage key "destroy-key"'))).toHaveLength(0)
  })
})

test.describe('moving the last field out of a column (#166)', () => {
  const twoRowForm = () => ({
    id: 'form-move',
    stages: { 'stage-move': { id: 'stage-move', children: ['row-1', 'row-2'] } },
    rows: {
      'row-1': { id: 'row-1', config: {}, children: ['col-1'] },
      'row-2': { id: 'row-2', config: {}, children: ['col-2'] },
    },
    columns: {
      'col-1': { id: 'col-1', config: { width: '100%' }, children: ['field-1'] },
      'col-2': { id: 'col-2', config: { width: '100%' }, children: ['field-2'] },
    },
    fields: {
      'field-1': { id: 'field-1', tag: 'input', attrs: { type: 'text' }, config: { label: 'First' } },
      'field-2': { id: 'field-2', tag: 'input', attrs: { type: 'text' }, config: { label: 'Second' } },
    },
  })

  test('removes the emptied column and keeps the moved field', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))
    await page.setViewportSize({ width: 1280, height: 1800 })
    await gotoEditor(page)
    await page.evaluate(async formData => {
      window.frameworkLoader.currentDemo.editor.destroy()
      window.__moveEditor = new window.FormeoEditor({ editorContainer: '.build-form', sessionStorage: false }, formData)
      await window.__moveEditor.whenReady()
    }, twoRowForm())

    const field = page.locator('.formeo-field#field-1')
    await field.locator('.field-actions').hover()
    const handle = field.locator('.field-actions .item-move')
    await handle.waitFor({ state: 'visible' })
    // the actions slide open; wait for the handle to settle before reading its position
    await page.waitForTimeout(400)
    const from = await handle.boundingBox()
    const to = await page.locator('.formeo-field#field-2').boundingBox()
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2 + 10, { steps: 5 })
    await expect(page.locator('.field-moving')).toHaveCount(1)
    await page.mouse.move(to.x + to.width / 2, to.y + to.height * 0.75, { steps: 25 })
    await page.waitForTimeout(150)
    await page.mouse.move(to.x + to.width / 2, to.y + to.height * 0.8, { steps: 3 })
    await page.waitForTimeout(150)
    await page.mouse.up()

    // depending on where the drop lands, field-1 joins col-2 or a new row the stage makes for it
    await expect.poll(() => page.evaluate(() => Boolean(window.__moveEditor.formData.columns['col-1']))).toBe(false)
    const formData = await page.evaluate(() => window.__moveEditor.formData)
    expect(Object.keys(formData.fields).sort()).toEqual(['field-1', 'field-2'])
    const holders = Object.values(formData.columns).filter(({ children }) => children.includes('field-1'))
    expect(holders).toHaveLength(1)
    await expect(page.locator('.formeo-field')).toHaveCount(2)
    // the drop finishes normally: the source's onEnd clears the hover state it set
    await expect(page.locator('[class*="hovering-"]')).toHaveCount(0)
    expect(errors).toEqual([])
  })
})
