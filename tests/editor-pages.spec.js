// @ts-check
import { expect, test } from '@playwright/test'
import { callsOf, clearDemo, formDataOf, mountEditor, threePageForm } from './helpers/pages.js'

const visibleStages = editor => editor.locator('.formeo-stage:visible')

test.describe('Editor page tabs (#122)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 })
    await clearDemo(page)
  })

  test('without the pages option the editor is unchanged', async ({ page }) => {
    const editor = await mountEditor(page, { options: { pages: false } })
    await expect(editor.locator('.formeo-page-tabs')).toHaveCount(0)
    await expect(editor.locator('.formeo-pages-editor')).toHaveCount(0)
    await expect(visibleStages(editor)).toHaveCount(3)
    expect((await formDataOf(page)).stages['p-s3'].config).toEqual({ title: '' })
  })

  test('a single-page form shows one tab and no remove button', async ({ page }) => {
    const editor = await mountEditor(page, { formData: null })
    await expect(editor.getByRole('tab')).toHaveText(['Page 1'])
    await expect(editor.locator('.formeo-page-remove')).toHaveCount(0)
  })

  test('shows the first page and switches on click', async ({ page }) => {
    const editor = await mountEditor(page)
    await expect(editor.getByRole('tab')).toHaveText(['About you', 'Account', 'Page 3'])
    await expect(visibleStages(editor)).toHaveCount(1)
    await expect(editor.locator('[id="p-s1"]')).toBeVisible()

    await editor.getByRole('tab', { name: 'Account' }).click()
    await expect(editor.locator('[id="p-s2"]')).toBeVisible()
    await expect(editor.locator('[id="p-s1"]')).toBeHidden()
    await expect(editor.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true')
  })

  test('+ adds a page and switches to it', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('button', { name: 'Add page' }).click()
    await expect(editor.getByRole('tab')).toHaveText(['About you', 'Account', 'Page 3', 'Page 4'])
    await expect(editor.getByRole('tab', { name: 'Page 4' })).toBeFocused()
    expect(Object.keys((await formDataOf(page)).stages)).toHaveLength(4)
  })

  test('clicking a control adds it to the page on screen', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'Page 3' }).click()
    await editor.getByRole('button', { name: 'Text Input' }).click()
    expect((await formDataOf(page)).stages['p-s3'].children).toHaveLength(1)
    expect((await formDataOf(page)).stages['p-s1'].children).toEqual(['p-r1'])
  })

  test('controlOnLeft keeps the controls on the left', async ({ page }) => {
    const editor = await mountEditor(page, { options: { controlOnLeft: true } })
    const pagesBox = await editor.locator('.formeo-pages-editor').boundingBox()
    const controlsBox = await editor.locator('.formeo-controls').boundingBox()
    expect(controlsBox.x).toBeLessThan(pagesBox.x)
  })

  test('loading new formData goes back to its first page', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'Account' }).click()

    for (const [key, how] of [
      ['q', 'load'],
      ['r', 'formData'],
    ]) {
      await page.evaluate(
        ([data, how]) => {
          const e = window.e2eEditors['e2e-pages']
          if (how === 'load') {
            e.load(data)
          } else {
            e.formData = data
          }
        },
        [threePageForm(key), how]
      )
      await expect(editor.getByRole('tab')).toHaveText(['About you', 'Account', 'Page 3'])
      await expect(editor.getByRole('tab', { name: 'About you' })).toHaveAttribute('aria-selected', 'true')
      await expect(visibleStages(editor)).toHaveCount(1)
      await expect(editor.locator(`[id="${key}-s1"]`)).toBeVisible()
      // Components.load leaves stages.active on the last stage loaded; the pages render moves it to the first
      expect(await page.evaluate(() => window.e2eEditors['e2e-pages'].Components.stages.active.id)).toBe(`${key}-s1`)
    }

    await editor.getByRole('button', { name: 'Text Input' }).click()
    expect((await formDataOf(page)).stages['r-s1'].children).toHaveLength(2)
    expect((await formDataOf(page)).stages['r-s3'].children).toEqual([])
  })

  test('reloading the same form keeps the page on screen and its titles live', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'Account' }).click()
    await page.evaluate(data => {
      window.e2eEditors['e2e-pages'].formData = data
    }, threePageForm())
    await expect(editor.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true')
    await expect(editor.locator('[id="p-s2"]')).toBeVisible()

    await page.evaluate(() => {
      window.e2eEditors['e2e-pages'].Components.stages.get('p-s1').set('config.title', 'Renamed')
    })
    await expect(editor.getByRole('tab')).toHaveText(['Renamed', 'Account', 'Page 3'])
  })

  // stage.empty() slides each stage up and down again, and the slide leaves an inline display: block behind
  test('Clear All keeps the pages and still shows one at a time', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept())
    const editor = await mountEditor(page)
    await editor.locator('.clear-form').click()
    await expect.poll(async () => Object.keys((await formDataOf(page)).rows)).toEqual([])
    await expect(editor.locator('.removing-all-fields')).toHaveCount(0)
    // let the slide down finish
    await page.waitForTimeout(600)

    await expect(editor.getByRole('tab')).toHaveText(['About you', 'Account', 'Page 3'])
    expect(Object.keys((await formDataOf(page)).stages)).toEqual(['p-s1', 'p-s2', 'p-s3'])
    await expect(visibleStages(editor)).toHaveCount(1)
    await expect(editor.locator('[id="p-s1"]')).toBeVisible()

    for (const [name, id] of [
      ['Account', 'p-s2'],
      ['Page 3', 'p-s3'],
      ['About you', 'p-s1'],
    ]) {
      await editor.getByRole('tab', { name }).click()
      await expect(visibleStages(editor)).toHaveCount(1)
      await expect(editor.locator(`[id="${id}"]`)).toBeVisible()
    }
  })

  test('destroy() releases the page tabs', async ({ page }) => {
    const editor = await mountEditor(page)
    const released = await page.evaluate(() => {
      const e = window.e2eEditors['e2e-pages']
      const { pages } = e
      e.destroy()
      return { wrapper: pages.wrapper, tablist: pages.tablist, listeners: pages.stageListeners.size }
    })
    expect(released).toEqual({ wrapper: null, tablist: null, listeners: 0 })
    await expect(editor.locator('.formeo-pages-editor')).toHaveCount(0)
  })

  // Controls#destroy must run before EditorPages#destroy: destroying the tabs' Sortables first ends any
  // active drag early through SortableJS's shared drag state, orphaning its fallback ghost (#122).
  test('destroy() mid control-drag leaves no ghost or leftover Sortable, with page tabs present', async ({ page }) => {
    const editor = await mountEditor(page)
    const control = editor.getByRole('button', { name: 'Text Input' })
    await control.hover()
    const from = await control.boundingBox()
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2, { steps: 5 })
    await page.mouse.move(from.x + from.width / 2 + 60, from.y + from.height / 2 + 60, { steps: 10 })
    await expect(page.locator('.control-moving')).toHaveCount(1)

    await page.evaluate(() => window.e2eEditors['e2e-pages'].destroy())
    await page.mouse.up()

    await expect(page.locator('.control-moving')).toHaveCount(0)
    expect(
      await page.evaluate(() => document.querySelectorAll('.sortable-ghost, .sortable-chosen, .sortable-drag').length)
    ).toBe(0)
  })

  test('no page callbacks fire on the first render', async ({ page }) => {
    await mountEditor(page)
    expect(await callsOf(page)).toEqual([])
  })
})
