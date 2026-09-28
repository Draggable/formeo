import { expect, test } from '@playwright/test'

test.describe('renderer.userData setter (#123, #229)', () => {
  test('skips keys the form lacks with one warning and no page error', async ({ page }) => {
    const errors = []
    const warnings = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => message.type() === 'warning' && warnings.push(message.text()))

    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()
    warnings.length = 0

    await page.evaluate(() => {
      const container = Object.assign(document.createElement('div'), { id: 'ud-container' })
      document.body.appendChild(container)
      const renderer = new window.FormeoRenderer({ renderContainer: container })
      renderer.render({
        id: 'ud-form',
        stages: { 's-1': { id: 's-1', children: ['r-1'] } },
        rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
        columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['name'] } },
        fields: {
          name: { id: 'name', tag: 'input', attrs: { type: 'text', name: 'name' }, config: { label: 'Name' } },
        },
      })
      renderer.userData = { nope: 'x', name: 'Ada' }
    })

    await expect(page.locator('#ud-container [name="name"]')).toHaveValue('Ada')
    expect(errors).toEqual([])
    expect(warnings.filter(text => text.includes('renderer.userData'))).toEqual([
      'formeo: renderer.userData has no field named: nope',
    ])
  })
})
