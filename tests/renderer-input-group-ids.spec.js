import { expect, test } from '@playwright/test'

test.describe('renderer input group with readable ids (#520)', () => {
  test('"Add +" copies the row when ids are not hex', async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))

    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()

    await page.evaluate(() => {
      const container = Object.assign(document.createElement('div'), { id: 'ig-container' })
      document.body.prepend(container)
      new window.FormeoRenderer({ renderContainer: '#ig-container' }).render({
        id: 'form-1',
        stages: { s1: { id: 's1', children: ['row-1'] } },
        rows: { 'row-1': { id: 'row-1', config: { inputGroup: true }, children: ['col-1'] } },
        columns: { 'col-1': { id: 'col-1', config: { width: '100%' }, children: ['field-1'] } },
        fields: {
          'field-1': {
            id: 'field-1',
            tag: 'input',
            attrs: { type: 'text', name: 'n' },
            config: { label: 'Name' },
          },
        },
      })
    })

    const container = page.locator('#ig-container')
    await container.getByRole('button', { name: 'Add +' }).click()

    await expect(container.locator('[data-clone-of="f-row-1"]')).toHaveCount(1)
    await expect(container.locator('input[name="n"]')).toHaveCount(2)
    expect(errors).toEqual([])
  })
})
