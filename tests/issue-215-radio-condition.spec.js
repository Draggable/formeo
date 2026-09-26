// @ts-check
import { expect, test } from '@playwright/test'
import { gotoEditor } from './helpers/editor.js'

test('hide a field when a radio option is checked, built in the editor (#215)', async ({ page }) => {
  await gotoEditor(page)

  await page.getByRole('button', { name: 'Radio Group' }).click()
  await page.getByRole('button', { name: 'Text Input' }).click()
  await expect(page.locator('.formeo-field')).toHaveCount(2)

  // Identify fields by their control type rather than object-key order, which is not
  // guaranteed to mirror the order the fields were added in.
  const initialFormData = await page.evaluate(() => window.frameworkLoader.currentDemo.editor.formData)
  const fieldEntries = Object.entries(initialFormData.fields)
  const [radioId] = fieldEntries.find(([, field]) => field.config.controlId === 'radio')
  const [textId] = fieldEntries.find(([, field]) => field.config.controlId === 'text-input')
  const [stageId] = Object.keys(initialFormData.stages)

  // A freshly added field has no `conditions` key of its own, so its edit panel has no
  // Conditions tab. Conditions live on the stage (the whole form) instead - its edit panel
  // is seeded with one empty if/then condition that can reference any field as source/target.
  const stage = page.locator('.formeo-stage').first()
  await stage.locator('.stage-actions').first().hover()
  await stage.locator('.stage-actions .edit-toggle').first().click()
  const stageEditPanel = stage.locator('.stage-edit').first()
  await stageEditPanel.waitFor({ state: 'visible' })

  // IF source: type "Radio 2" and choose the Radio 2 option nested under the Radio Group field
  const sourceInput = stageEditPanel.locator('.condition-source .f-autocomplete-display-field').first()
  await sourceInput.click()
  await sourceInput.fill('Radio 2')
  const radioGroupItem = page.locator('.f-autocomplete-list-item-depth-0[data-label="Radio Group"]')
  await radioGroupItem.hover()
  // "Radio 2" is an option nested inside the Radio Group item's own sub-list; scope to it so a second
  // autocomplete list open elsewhere on the stage can't cause a strict-mode failure
  await radioGroupItem.locator('.f-autocomplete-list-item[data-label="Radio 2"]').click()

  // The property switches to "is checked" automatically, with no comparison/value box
  const sourceProperty = stageEditPanel.locator('.condition-sourceProperty').first()
  await expect(sourceProperty).toHaveValue('isChecked')
  await expect(sourceProperty).not.toHaveClass(/hidden-property/)
  await expect(stageEditPanel.locator('.condition-comparison').first()).toHaveClass(/hidden-property/)

  // THEN target: this Text Input, "is not visible"
  const targetInput = stageEditPanel
    .locator('.then-conditions-wrap .condition-target .f-autocomplete-display-field')
    .first()
  await targetInput.click()
  await targetInput.fill('Text Input')
  // Scope to the stage so another open autocomplete list can't cause a strict-mode failure, and take
  // the last match so the freshly opened list (not a still-closing one) is the one clicked
  await stage.locator('.f-autocomplete-list-item[data-label="Text Input"]').last().click()
  await stageEditPanel.locator('.then-conditions-wrap .condition-targetProperty').first().selectOption('isNotVisible')

  // Writes to the underlying condition data are debounced, so poll until they land
  // instead of racing a fixed timeout.
  const getCondition = () =>
    page.evaluate(stageId => window.frameworkLoader.currentDemo.editor.formData.stages[stageId].conditions[0], stageId)
  await expect.poll(getCondition).toMatchObject({
    if: [{ source: `fields.${radioId}.options[1]`, sourceProperty: 'isChecked' }],
    then: [{ target: `fields.${textId}`, targetProperty: 'isNotVisible' }],
  })

  const formData = await page.evaluate(() => window.frameworkLoader.currentDemo.editor.formData)

  await page.evaluate(data => {
    const container = Object.assign(document.createElement('div'), { id: 'c215' })
    document.body.appendChild(container)
    new window.FormeoRenderer({ renderContainer: container }).render(data)
  }, formData)
  const target = page.locator(`#c215 [id="f-${textId}"]`)
  await expect(target).toBeVisible()
  await page.locator(`#c215 [id="f-${radioId}"] input[type="radio"]`).nth(1).check()
  await expect(target).toBeHidden()
})
