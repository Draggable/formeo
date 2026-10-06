// @ts-check
import { expect } from '@playwright/test'

/**
 * Helpers shared by the table e2e specs. Ids are derived from a short prefix so specs can't collide:
 * form-{p}, stage-{p}, row-{p}, col-{p}, and containers e2e-{p} and e2e-{p}-render.
 * @param {string} p short id prefix, such as 'mx'
 */
export const tableHelpers = p => {
  /** A one-column form holding the given fields */
  const formWith = (fields = {}, stageConditions = undefined) => {
    const ids = Object.keys(fields)
    /** @type {Record<string, any>} */
    const stage = { id: `stage-${p}`, children: [`row-${p}`] }
    if (stageConditions) {
      stage.conditions = stageConditions
    }
    return {
      id: `form-${p}`,
      stages: { [`stage-${p}`]: stage },
      rows: { [`row-${p}`]: { id: `row-${p}`, config: {}, children: [`col-${p}`] } },
      columns: { [`col-${p}`]: { id: `col-${p}`, config: { width: '100%' }, children: ids } },
      fields,
    }
  }

  /**
   * Mounts an editor in a fresh container above the demo editor. The editor is window[globalName].
   * @param {import('@playwright/test').Page} page
   * @param {Object} [formData]
   * @param {string} [id] container id
   * @param {string} [globalName]
   */
  const mountEditor = async (page, formData, id = `e2e-${p}`, globalName = '__editor') => {
    if (!(await page.locator('.formeo-editor').first().isVisible())) {
      await page.goto('/')
      await expect(page.locator('.formeo-editor').first()).toBeVisible()
    }
    await page.evaluate(
      async ({ formData, id, globalName }) => {
        const container = document.createElement('div')
        container.id = id
        document.body.prepend(container)
        window[globalName] = new window.FormeoEditor(
          { editorContainer: container, sessionStorage: false, style: null },
          formData
        )
        await window[globalName].whenReady()
      },
      { formData, id, globalName }
    )
    return page.locator(`#${id}`)
  }

  /**
   * Renders formData (or an editor's formData) into a new container. The renderer is window.__renderer.
   * @param {import('@playwright/test').Page} page
   * @param {{ formData?: Object, from?: string, id?: string, width?: string }} opts
   */
  const renderForm = (page, { formData, from = '__editor', id = `e2e-${p}-render`, width = '' }) =>
    page.evaluate(
      ({ formData, from, id, width }) => {
        const container = Object.assign(document.createElement('div'), { id })
        container.style.width = width
        document.body.appendChild(container)
        window.__renderer = new window.FormeoRenderer({ renderContainer: container })
        window.__renderer.render(formData || window[from].formData)
      },
      { formData, from, id, width }
    )

  return { formWith, mountEditor, renderForm }
}

/** Opens a field's edit window and returns its Table panel */
export const openTablePanel = async field => {
  await field.locator('.field-actions').hover()
  await field.locator('.field-actions .edit-toggle').click()
  const panel = field.locator('.table-panel')
  await expect(panel).toBeVisible()
  return panel
}
