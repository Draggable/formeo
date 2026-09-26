// @ts-check
import { expect, test } from '@playwright/test'
import { gotoEditor } from './helpers/editor.js'
import { dragControlTo, formFor } from './helpers/multi-editor.js'

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
      await page.evaluate(() => {
        window.e2eEditorA.destroy()
        window.e2eCalls = { a: 0, b: 0 }
      })

      await page.locator('#e2e-editor-b').getByRole('button', { name: 'Text Input' }).click()
      await page.evaluate(() => window.dispatchEvent(new Event('resize')))

      await expect.poll(() => page.evaluate(() => window.e2eCalls.b)).toBeGreaterThan(0)
      await page.waitForTimeout(500)
      expect(await page.evaluate(() => window.e2eCalls.a)).toBe(0)
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
