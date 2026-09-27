// @ts-check
import { expect, test } from '@playwright/test'
import { callsOf, clearDemo, dragTo, formDataOf, mountEditor, moveHandle, threePageForm } from './helpers/pages.js'

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

  test('destroy() mid-rename discards the typed title and fires no callbacks', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'Page 3' }).dblclick()
    await editor.getByRole('textbox', { name: 'Rename page' }).fill('Review')
    const updated = await page.evaluate(async () => {
      const e = window.e2eEditors['e2e-pages']
      const stage = e.Components.stages.get('p-s3')
      window.e2eCalls['e2e-pages'].length = 0
      e.destroy()
      await new Promise(resolve => setTimeout(resolve, 300))
      return stage.data.config.title
    })
    expect(updated).toBe('')
    expect(await callsOf(page)).toEqual([])
  })

  test('double-click renames a page', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'Page 3' }).dblclick()
    const input = editor.getByRole('textbox', { name: 'Rename page' })
    await input.fill('Review')
    await input.press('Enter')
    await expect(editor.getByRole('tab', { name: 'Review' })).toBeFocused()
    expect((await formDataOf(page)).stages['p-s3'].config.title).toBe('Review')
  })

  test('F2 renames and Escape cancels', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'About you' }).focus()
    await page.keyboard.press('F2')
    await page.keyboard.type('Nope')
    await page.keyboard.press('Escape')
    await expect(editor.getByRole('tab', { name: 'About you' })).toBeVisible()
  })

  test('the stage edit panel renames the tab', async ({ page }) => {
    const editor = await mountEditor(page)
    const stage = editor.locator('[id="p-s1"]')
    await stage.locator('> .stage-actions').hover()
    await stage.locator('> .stage-actions .edit-toggle').click()
    // the edit panel opens on its Conditions panel; switch to Configuration first
    await stage.getByRole('heading', { name: 'Configuration', level: 5 }).click()
    const titleInput = stage.locator('.stage-edit .field-config-title input')
    await titleInput.fill('Your details')
    await expect(editor.getByRole('tab', { name: 'Your details' })).toBeVisible()
  })

  test('an empty page is removed at once', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'Page 3' }).click()
    await editor.getByRole('button', { name: 'Remove page "Page 3"' }).click()
    await expect(editor.getByRole('tab')).toHaveText(['About you', 'Account'])
    await expect(editor.getByRole('tab', { name: 'Account' })).toBeFocused()
  })

  test('a page with content asks first', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('button', { name: 'Remove page "About you"' }).click()
    const dialog = page.locator('dialog.remove-page-dialog')
    await expect(dialog).toContainText('Remove "About you" and everything on it?')
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(editor.getByRole('tab')).toHaveCount(3)

    await editor.getByRole('button', { name: 'Remove page "About you"' }).click()
    await dialog.getByRole('button', { name: 'Remove' }).click()
    await expect(editor.getByRole('tab')).toHaveText(['Account', 'Page 2'])
    const data = await formDataOf(page)
    expect(Object.keys(data.stages)).toEqual(['p-s2', 'p-s3'])
    expect(data.fields['p-f1']).toBeUndefined()
  })

  test('a custom actions.remove.page can veto', async ({ page }) => {
    const editor = await mountEditor(page, { vetoRemove: true })
    await editor.getByRole('tab', { name: 'Page 3' }).click()
    await editor.getByRole('button', { name: 'Remove page "Page 3"' }).click()
    await expect(editor.getByRole('tab')).toHaveCount(3)
    expect(await page.evaluate(() => window.e2eVetoed['e2e-pages'])).toEqual(['p-s3'])
  })

  test('dragging a tab reorders the pages', async ({ page }) => {
    const editor = await mountEditor(page)
    await dragTo(page, editor.getByRole('tab', { name: 'Page 3' }), editor.getByRole('tab', { name: 'About you' }))
    await expect.poll(async () => Object.keys((await formDataOf(page)).stages)).toEqual(['p-s3', 'p-s1', 'p-s2'])
    await expect(editor.getByRole('tab')).toHaveText(['Page 1', 'About you', 'Account'])
  })

  test('Alt+ArrowRight moves the focused page', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'About you' }).focus()
    await page.keyboard.press('Alt+ArrowRight')
    expect(Object.keys((await formDataOf(page)).stages)).toEqual(['p-s2', 'p-s1', 'p-s3'])
    await expect(editor.getByRole('tab', { name: 'About you' })).toBeFocused()
  })

  test('a row dropped on a tab moves to that page', async ({ page }) => {
    const editor = await mountEditor(page)
    await dragTo(page, await moveHandle(editor, 'row', 'p-r1'), editor.getByRole('tab', { name: 'Page 3' }))
    await expect.poll(async () => (await formDataOf(page)).stages['p-s3'].children).toEqual(['p-r1'])
    await expect(editor.locator('.formeo-pages-status')).toHaveText('Moved to Page 3')
    await expect(editor.locator('[id="p-s1"]')).toBeVisible()
  })

  test('a field dropped on a tab lands on that page in a new row', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'Account' }).click()
    await dragTo(page, await moveHandle(editor, 'field', 'p-f2'), editor.getByRole('tab', { name: 'About you' }))
    await expect.poll(async () => (await formDataOf(page)).stages['p-s1'].children.length).toBe(2)
    const data = await formDataOf(page)
    const newRow = data.stages['p-s1'].children[1]
    expect(data.columns[data.rows[newRow].children[0]].children).toEqual(['p-f2'])
  })

  test('a control dropped on a tab creates its field on that page', async ({ page }) => {
    const editor = await mountEditor(page)
    await dragTo(page, editor.getByRole('button', { name: 'Text Input' }), editor.getByRole('tab', { name: 'Page 3' }))
    await expect.poll(async () => (await formDataOf(page)).stages['p-s3'].children.length).toBe(1)
  })

  test('another editor’s tab refuses a row or a control', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 2000 })
    const editor = await mountEditor(page)
    const other = await mountEditor(page, { id: 'e2e-other', formData: threePageForm('q') })
    const theirs = await formDataOf(page, 'e2e-other')
    const target = other.getByRole('tab', { name: 'Page 3' })

    await dragTo(page, await moveHandle(editor, 'row', 'p-r1'), target)
    // a refused control may stay where Sortable last placed it on its way out of this editor, so only the other
    // editor is checked for it
    await dragTo(page, editor.getByRole('button', { name: 'Text Input' }), target)

    await expect(other.locator('.formeo-page-tab-wrap > :not(button, input)')).toHaveCount(0)
    expect(await formDataOf(page, 'e2e-other')).toEqual(theirs)
    await expect(other.locator('.formeo-pages-status')).toHaveText('')
    expect((await formDataOf(page)).stages['p-s1'].children).toContain('p-r1')
  })

  test('Move to page moves a row through a dialog', async ({ page }) => {
    const editor = await mountEditor(page)
    await page.evaluate(() => {
      window.e2eFormeoUpdated = 0
      document.addEventListener('formeoUpdated', () => {
        window.e2eFormeoUpdated += 1
      })
    })
    const row = editor.locator('[id="p-r1"]')
    await row.locator('> .row-actions').hover()
    await row.locator('> .row-actions .item-page').click()
    const dialog = page.locator('dialog.move-to-page-dialog')
    await expect(dialog.getByRole('combobox')).toHaveText(/Account\s*Page 3/)
    await dialog.getByRole('combobox').selectOption({ label: 'Page 3' })
    await dialog.getByRole('button', { name: 'Move' }).click()
    await expect.poll(async () => (await formDataOf(page)).stages['p-s3'].children).toEqual(['p-r1'])
    expect(await page.evaluate(() => window.e2eFormeoUpdated)).toBeGreaterThan(0)
  })

  test('Move to page lists titles as text', async ({ page }) => {
    const formData = threePageForm()
    formData.stages['p-s2'].config.title = '<b>Bold</b>'
    const editor = await mountEditor(page, { formData })
    const row = editor.locator('[id="p-r1"]')
    await row.locator('> .row-actions').hover()
    await row.locator('> .row-actions .item-page').click()
    await expect(page.locator('dialog.move-to-page-dialog option').first()).toHaveText('<b>Bold</b>')
  })

  test('the Move to page button hides on a single page and can be disabled', async ({ page }) => {
    const single = await mountEditor(page, { id: 'e2e-single', formData: null })
    await single.getByRole('button', { name: 'Text Input' }).click()
    await expect(single.locator('.item-page')).toBeHidden()
    const disabled = await mountEditor(page, {
      id: 'e2e-disabled',
      options: { config: { rows: { all: { actionButtons: { disabled: ['page'] } } } } },
    })
    await expect(disabled.locator('.item-page')).toHaveCount(0)
  })
})

test.describe('Editor page tabs: events and several editors (#122)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1800 })
    await clearDemo(page)
  })

  test('page changes fire their callbacks', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'Account' }).click()
    await editor.getByRole('button', { name: 'Add page' }).click()
    await editor.getByRole('tab', { name: 'Page 4' }).dblclick()
    await editor.getByRole('textbox', { name: 'Rename page' }).fill('Review')
    await page.keyboard.press('Enter')
    await editor.getByRole('button', { name: 'Remove page "Review"' }).click()

    const calls = await callsOf(page)
    const newId = calls.find(call => call.name === 'onAddStage').componentId
    expect(
      calls.filter(call => call.name === 'onPageChange').map(({ page, previousPage }) => [page, previousPage])
    ).toEqual([
      [1, 0],
      [3, 1],
      [2, 3],
    ])
    expect(calls.find(call => call.name === 'onUpdateStage' && call.changePath.endsWith('config.title'))).toMatchObject(
      {
        changePath: `stages.${newId}.config.title`,
        value: 'Review',
      }
    )
    expect(calls.find(call => call.name === 'onRemoveStage')).toMatchObject({
      componentId: newId,
      componentType: 'stage',
    })
  })

  test('formeoPageChanged reaches the page, from the tablist', async ({ page }) => {
    const editor = await mountEditor(page)
    await page.evaluate(() => {
      window.e2eDom = []
      document.addEventListener('formeoPageChanged', evt =>
        window.e2eDom.push({ stageId: evt.detail.stageId, fromTablist: evt.target.matches('.formeo-page-tabs') })
      )
    })
    await editor.getByRole('tab', { name: 'Account' }).click()
    expect(await page.evaluate(() => window.e2eDom)).toEqual([{ stageId: 'p-s2', fromTablist: true }])
  })

  test('setLang keeps the page on screen', async ({ page }) => {
    const editor = await mountEditor(page)
    await editor.getByRole('tab', { name: 'Account' }).click()
    await page.evaluate(() => window.e2eEditors['e2e-pages'].i18n.setLang('en-US'))
    await expect(editor.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true')
    await expect(editor.locator('[id="p-s2"]')).toBeVisible()
  })

  test('two editors keep separate tabs, pages and events', async ({ page }) => {
    const a = await mountEditor(page, { id: 'e2e-a', formData: threePageForm('p') })
    const b = await mountEditor(page, { id: 'e2e-b', formData: threePageForm('p') })

    const tabIds = await page.locator('.formeo-page-tab').evaluateAll(tabs => tabs.map(tab => tab.id))
    expect(new Set(tabIds).size).toBe(6)

    await a.getByRole('tab', { name: 'Account' }).click()
    await expect(a.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true')
    await expect(b.getByRole('tab', { name: 'About you' })).toHaveAttribute('aria-selected', 'true')
    expect(await callsOf(page, 'e2e-b')).toEqual([])
    expect((await callsOf(page, 'e2e-a')).filter(call => call.name === 'onPageChange')).toHaveLength(1)
  })

  test('content cannot be dropped on another editor’s tab', async ({ page }) => {
    const a = await mountEditor(page, { id: 'e2e-a', formData: threePageForm('a') })
    const b = await mountEditor(page, { id: 'e2e-b', formData: threePageForm('b') })
    await dragTo(page, await moveHandle(a, 'row', 'a-r1'), b.getByRole('tab', { name: 'Page 3' }))
    await page.waitForTimeout(300)
    expect((await formDataOf(page, 'e2e-b')).stages['b-s3'].children).toEqual([])
    expect((await formDataOf(page, 'e2e-a')).stages['a-s1'].children).toEqual(['a-r1'])
  })
})
