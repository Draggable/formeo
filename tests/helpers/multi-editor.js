// @ts-check

/**
 * Builds a one-field form whose ids are unique to `key`, so two editors never share ids.
 * @param {string} key
 * @param {string} label
 * @param {Object} [fieldConfig] extra field config, e.g. { tooltip: 'Help' }
 */
export const formFor = (key, label, fieldConfig = {}) => ({
  id: `form-${key}`,
  stages: { [`stage-${key}`]: { id: `stage-${key}`, children: [`row-${key}`] } },
  rows: { [`row-${key}`]: { id: `row-${key}`, config: {}, children: [`col-${key}`] } },
  columns: { [`col-${key}`]: { id: `col-${key}`, config: { width: '100%' }, children: [`field-${key}`] } },
  fields: {
    [`field-${key}`]: {
      id: `field-${key}`,
      tag: 'input',
      attrs: { type: 'text' },
      config: { label, controlId: 'text-input', ...fieldConfig },
    },
  },
})

/**
 * Drags a control button onto the bottom of a stage the way a user does with Sortable's fallback drag.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} control
 * @param {import('@playwright/test').Locator} stage
 */
export const dragControlTo = async (page, control, stage) => {
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
