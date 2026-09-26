// @ts-check
import { expect, test } from '@playwright/test'

test('a checkbox group posts every checked value in a real browser (#128)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.formeo-editor')).toBeVisible()
  await page.evaluate(() => {
    const container = Object.assign(document.createElement('div'), { id: 'cb-container' })
    document.body.appendChild(container)
    window.__renderer = new window.FormeoRenderer({ renderContainer: container })
    window.__renderer.render({
      id: 'cb-form',
      stages: { 's-1': { id: 's-1', children: ['r-1'] } },
      rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
      columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['hobbies-1'] } },
      fields: {
        'hobbies-1': {
          id: 'hobbies-1',
          tag: 'input',
          attrs: { type: 'checkbox', name: 'hobbies' },
          config: { label: 'Hobbies' },
          options: [
            { label: 'Reading', value: 'reading' },
            { label: 'Gaming', value: 'gaming' },
            { label: 'Coding', value: 'coding' },
          ],
        },
      },
    })
  })
  await page.locator('#cb-container').getByLabel('Reading').check()
  await page.locator('#cb-container').getByLabel('Coding').check()
  const result = await page.evaluate(() => ({
    posted: new FormData(document.querySelector('#cb-container form')).getAll('hobbies[]'),
    userData: window.__renderer.userData,
  }))
  expect(result.posted).toEqual(['reading', 'coding'])
  expect(result.userData).toEqual({ hobbies: ['reading', 'coding'] })
})
