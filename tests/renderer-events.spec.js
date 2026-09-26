// @ts-check
import { expect, test } from '@playwright/test'

const formData = {
  id: 'e2e-events',
  stages: { 's-1': { id: 's-1', children: ['r-1'] } },
  rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
  columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['nickname'] } },
  fields: {
    nickname: {
      id: 'nickname',
      tag: 'input',
      attrs: { type: 'text', name: 'nickname' },
      config: { label: 'Nickname' },
    },
  },
}

test.describe('FormeoRenderer events (#209)', () => {
  test('onRender, onChange and onSubmit fire in a real browser', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor')).toBeVisible()
    await page.evaluate(data => {
      window.__calls = { render: 0, change: [], submit: [] }
      const container = Object.assign(document.createElement('div'), { id: 'events-container' })
      document.body.appendChild(container)
      new window.FormeoRenderer({
        renderContainer: container,
        events: {
          onRender: () => window.__calls.render++,
          onChange: ({ userData }) => window.__calls.change.push(userData.nickname),
          onSubmit: ({ event, userData }) => {
            event.preventDefault()
            window.__calls.submit.push(userData.nickname)
          },
        },
      }).render(data)
    }, formData)
    const input = page.locator('#events-container input[name="nickname"]')
    await input.fill('Ada')
    await input.press('Enter')
    const calls = await page.evaluate(() => window.__calls)
    expect(calls.render).toBe(1)
    expect(calls.change.at(-1)).toBe('Ada')
    expect(calls.submit).toEqual(['Ada'])
  })
})

test('the documented FormData upload snippet sends the File (#313)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.formeo-editor')).toBeVisible()
  await page.evaluate(() => {
    window.__upload = null
    const container = Object.assign(document.createElement('div'), { id: 'upload-container' })
    document.body.appendChild(container)
    new window.FormeoRenderer({
      renderContainer: container,
      events: {
        onSubmit: ({ event, form }) => {
          event.preventDefault()
          const body = new FormData(form)
          window.__upload = { name: body.get('resume')?.name, json: JSON.stringify({ resume: body.get('resume') }) }
        },
      },
    }).render({
      id: 'upload-form',
      stages: { 's-1': { id: 's-1', children: ['r-1'] } },
      rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
      columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['resume'] } },
      fields: {
        resume: { id: 'resume', tag: 'input', attrs: { type: 'file', name: 'resume' }, config: { label: 'Resume' } },
      },
    })
  })
  await page.locator('#upload-container input[type="file"]').setInputFiles({
    name: 'cv.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('hello'),
  })
  await page.evaluate(() => document.querySelector('#upload-container form').requestSubmit())
  const upload = await page.evaluate(() => window.__upload)
  expect(upload.name).toBe('cv.txt')
  expect(upload.json).toBe('{"resume":{}}') // why the docs say not to JSON.stringify files
})
