// @ts-check

/**
 * Three pages: "About you" (a Name field), "Account" (an Email field) and an untitled, empty third page.
 * Ids start with `key`, so two editors can each load their own copy.
 * @param {string} [key]
 */
export const threePageForm = (key = 'p') => {
  const id = suffix => `${key}-${suffix}`
  const field = (n, label, type) => ({
    id: id(`f${n}`),
    tag: 'input',
    attrs: { type, name: label.toLowerCase() },
    config: { label, controlId: 'text-input' },
  })
  const row = n => ({ id: id(`r${n}`), config: {}, children: [id(`c${n}`)] })
  const column = n => ({ id: id(`c${n}`), config: { width: '100%' }, children: [id(`f${n}`)] })
  return {
    id: `form-${key}`,
    stages: {
      [id('s1')]: { id: id('s1'), config: { title: 'About you' }, children: [id('r1')] },
      [id('s2')]: { id: id('s2'), config: { title: 'Account' }, children: [id('r2')] },
      [id('s3')]: { id: id('s3'), config: { title: '' }, children: [] },
    },
    rows: { [id('r1')]: row(1), [id('r2')]: row(2) },
    columns: { [id('c1')]: column(1), [id('c2')]: column(2) },
    fields: { [id('f1')]: field(1, 'Name', 'text'), [id('f2')]: field(2, 'Email', 'email') },
  }
}

/**
 * Opens the demo, then replaces it with a blank page so each test starts from its own editors.
 * @param {import('@playwright/test').Page} page
 */
export const clearDemo = async page => {
  await page.goto('/')
  await page.locator('.formeo-editor').first().waitFor()
  await page.evaluate(() => {
    window.frameworkLoader?.currentDemo?.editor?.destroy?.()
    document.body.replaceChildren()
  })
}

/**
 * Mounts an editor in a new container. Its page callbacks record into window.e2eCalls[id].
 * @param {import('@playwright/test').Page} page
 * @param {{ id?: string, formData?: Object, options?: Object, vetoRemove?: boolean }} [setup]
 *   options: plain (serialisable) editor options, merged over { pages: true };
 *   vetoRemove: install an actions.remove.page that records the request and never removes
 * @return {Promise<import('@playwright/test').Locator>} the editor's container
 */
export const mountEditor = async (
  page,
  { id = 'e2e-pages', formData = threePageForm(), options = {}, vetoRemove = false } = {}
) => {
  await page.evaluate(
    async ([id, formData, options, vetoRemove]) => {
      const container = document.createElement('div')
      container.id = id
      document.body.appendChild(container)
      window.e2eCalls = { ...window.e2eCalls, [id]: [] }
      window.e2eVetoed = { ...window.e2eVetoed, [id]: [] }
      const record = name => evt => {
        const d = evt.detail || {}
        window.e2eCalls[id].push({
          name,
          page: d.page,
          previousPage: d.previousPage,
          stageId: d.stageId,
          previousStageId: d.previousStageId,
          componentId: d.componentId,
          componentType: d.componentType,
          changePath: d.changePath,
          value: d.value,
        })
      }
      const editor = new window.FormeoEditor(
        {
          editorContainer: container,
          sessionStorage: false,
          style: null,
          pages: true,
          events: {
            onAddStage: record('onAddStage'),
            onRemoveStage: record('onRemoveStage'),
            onPageChange: record('onPageChange'),
            onUpdateStage: record('onUpdateStage'),
          },
          actions: vetoRemove ? { remove: { page: evt => window.e2eVetoed[id].push(evt.stageId) } } : {},
          ...options,
        },
        formData
      )
      window.e2eEditors = { ...window.e2eEditors, [id]: editor }
      await editor.whenReady()
    },
    [id, formData, options, vetoRemove]
  )
  return page.locator(`[id="${id}"]`)
}

/** @param {import('@playwright/test').Page} page */
export const formDataOf = (page, id = 'e2e-pages') => page.evaluate(id => window.e2eEditors[id].formData, id)

/** @param {import('@playwright/test').Page} page */
export const callsOf = (page, id = 'e2e-pages') => page.evaluate(id => window.e2eCalls[id], id)

/**
 * Drags `source` onto the middle of `target` with real mouse events, as a user does (works for both
 * Sortable's fallback drag and native drag and drop in Chromium).
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} source
 * @param {import('@playwright/test').Locator} target
 */
// Drag method confirmed by the #122 phase 2 spike (a throwaway spec, since deleted): this real
// mouse-event `dragTo` drove all three cases — row move handle, field move handle, and control button
// — onto the tab, including the row's native HTML5 drag and drop (stage sortable has no forceFallback).
// `source.dragTo(target)` was not needed as a fallback; once `moveHandle` hovered the right element
// (see below) the row drag worked the same way as the field/control fallback drags.
export const dragTo = async (page, source, target) => {
  await source.scrollIntoViewIfNeeded()
  const from = await source.boundingBox()
  const to = await target.boundingBox()
  if (!from || !to) {
    throw new Error('drag source or target is not visible')
  }
  const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 }
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  // cross Sortable's fallbackTolerance before the long move, or no drag starts
  await page.mouse.move(start.x + 10, start.y, { steps: 5 })
  await page.waitForTimeout(100)
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 25 })
  await page.waitForTimeout(150)
  await page.mouse.up()
}

/**
 * The move handle of a row or field. The action buttons only appear once `.{type}-actions` itself
 * receives `mouseenter` (that's what toggles the `hovering-{type}` class), so hover that element
 * directly rather than the much larger component box, or `.item-move` never becomes visible.
 * @param {import('@playwright/test').Locator} editor
 * @param {'row'|'field'} type
 * @param {string} id
 */
export const moveHandle = async (editor, type, id) => {
  const component = editor.locator(`[id="${id}"]`)
  const actions = component.locator(`> .${type}-actions`)
  await actions.hover()
  const handle = actions.locator('.item-move')
  await handle.hover()
  return handle
}
