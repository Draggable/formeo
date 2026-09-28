// @ts-check
import { expect, test } from '@playwright/test'

const page = (n, fields, title) => ({ n, fields, title })
const buildPages = pages => {
  const data = { id: 'pages', stages: {}, rows: {}, columns: {}, fields: {} }
  for (const { n, fields, title } of pages) {
    data.stages[`p-${n}`] = { id: `p-${n}`, config: title ? { title } : {}, children: [`r-${n}`] }
    data.rows[`r-${n}`] = { id: `r-${n}`, config: {}, children: [`c-${n}`] }
    data.columns[`c-${n}`] = { id: `c-${n}`, config: { width: '100%' }, children: fields.map(f => f.id) }
    for (const f of fields) data.fields[f.id] = f
  }
  return data
}
const input = (name, attrs = {}) => ({
  id: name,
  tag: 'input',
  attrs: { type: 'text', name, ...attrs },
  config: { label: name },
})

// the shape Formeo's button control saves; it renders <button type="submit"> without a name
const submitButton = {
  id: 'send',
  tag: 'button',
  attrs: { className: 'f-btn-group' },
  config: { label: 'Button', hideLabel: true },
  meta: { group: 'common', icon: 'button', id: 'button' },
  options: [{ label: 'Send', type: 'submit', className: '' }],
}

// a real wizard ends with a submit button, so Enter on the last page submits natively
const twoPages = buildPages([
  page(1, [input('name')], 'About you'),
  page(2, [input('email', { type: 'email', required: true }), submitButton]),
])

// no submit field anywhere, so only the renderer's own Submit button (`submit: true`) can submit it
const twoPagesNoSubmit = buildPages([
  page(1, [input('name', { required: true })], 'About you'),
  page(2, [input('email', { type: 'email' })]),
])

// "person" in the first field skips the Company page; anything else brings it back
const skipForm = buildPages([
  page(1, [input('kind')], 'About you'),
  page(2, [input('company', { required: true })], 'Company'),
  page(3, [input('email', { type: 'email' })], 'Contact'),
])
const kindClause = comparison => [{ source: 'fields.kind', sourceProperty: 'value', comparison, target: 'person' }]
skipForm.stages['p-1'].conditions = [
  { if: kindClause('=='), then: [{ target: 'stages.p-2', targetProperty: 'isNotVisible' }] },
  { if: kindClause('!='), then: [{ target: 'stages.p-2', targetProperty: 'isVisible' }] },
]

/**
 * Renders formData into a fresh container with the given pagination option; submitted userData
 * lands in window.__submitted. With `toggleSubmit`, an onChange handler disables the submit button
 * while `form.checkValidity()` fails, a common pattern.
 */
const mount = async (browserPage, data, pagination, { toggleSubmit = false } = {}) => {
  await browserPage.goto('/')
  await expect(browserPage.locator('.formeo-editor')).toBeVisible()
  await browserPage.evaluate(
    ([data, pagination, toggleSubmit]) => {
      window.__submitted = null
      window.__submitCount = 0
      const container = Object.assign(document.createElement('div'), { id: 'pages-container' })
      document.body.appendChild(container)
      const onChange = ({ form }) => {
        form.querySelector('button[type="submit"]').disabled = !form.checkValidity()
      }
      window.__pager = new window.FormeoRenderer({
        renderContainer: container,
        pagination,
        events: {
          ...(toggleSubmit && { onChange }),
          onSubmit: ({ event, userData }) => {
            event.preventDefault()
            window.__submitted = userData
            window.__submitCount += 1
          },
        },
      })
      window.__pager.render(data)
    },
    [data, pagination, toggleSubmit]
  )
  return browserPage.locator('#pages-container')
}

test.describe('multi-page forms (#122)', () => {
  test('wizard: an invalid field on another page is shown and focused on submit', async ({ page: browserPage }) => {
    const root = await mount(browserPage, twoPages, 'wizard')
    await root.locator('input[name="name"]').fill('Ada')
    await browserPage.evaluate(() => {
      window.__pager.page = 0
      document.querySelector('#pages-container form').requestSubmit()
    })
    await expect(root.locator('input[name="email"]')).toBeVisible()
    expect(await browserPage.evaluate(() => document.activeElement?.getAttribute('name'))).toBe('email')

    await root.locator('input[name="email"]').fill('ada@example.com')
    await browserPage.evaluate(() => document.querySelector('#pages-container form').requestSubmit())
    expect(await browserPage.evaluate(() => window.__submitted)).toEqual({ name: 'Ada', email: 'ada@example.com' })
  })

  test('wizard: Enter moves to the next page and only submits from the last one', async ({ page: browserPage }) => {
    const root = await mount(browserPage, twoPages, 'wizard')
    await root.locator('input[name="name"]').fill('Ada')
    await root.locator('input[name="name"]').press('Enter')
    await expect(root.locator('input[name="email"]')).toBeVisible()
    await expect(root.locator('input[name="email"]')).toBeFocused()
    expect(await browserPage.evaluate(() => window.__submitted)).toBeNull()

    await root.locator('input[name="email"]').fill('ada@example.com')
    await root.locator('input[name="email"]').press('Enter')
    await expect
      .poll(() => browserPage.evaluate(() => window.__submitted))
      .toEqual({
        name: 'Ada',
        email: 'ada@example.com',
      })
  })

  test('wizard: the step list jumps back freely but not past an invalid page', async ({ page: browserPage }) => {
    const data = buildPages([
      page(1, [input('a', { required: true })], 'One'),
      page(2, [input('b')], 'Two'),
      page(3, [input('c')], 'Three'),
    ])
    const root = await mount(browserPage, data, 'wizard')
    const step = name => root.locator('.formeo-pages-step').filter({ hasText: name }).getByRole('button')
    await step('Three').click()
    await expect(root.locator('input[name="a"]')).toBeVisible()
    await root.locator('input[name="a"]').fill('x')
    await step('Three').click()
    await expect(root.locator('input[name="c"]')).toBeVisible()
    await expect(step('Three')).toHaveAttribute('aria-current', 'step')
    await step('One').click()
    await expect(root.locator('input[name="a"]')).toBeVisible()
  })

  test('wizard: step buttons are named for their title alone, not the step number or check mark', async ({
    page: browserPage,
  }) => {
    const data = buildPages([
      page(1, [input('a')], 'One'),
      page(2, [input('b')], 'Two'),
      page(3, [input('c')], 'Three'),
    ])
    const root = await mount(browserPage, data, 'wizard')
    await expect(root.getByRole('button', { name: 'Three', exact: true })).toBeVisible()
    await root.locator('.formeo-pages-next').click()
    // page 2 is now "done", so its step shows the check mark instead of its number
    await expect(
      root.locator('.formeo-pages-step').filter({ hasText: 'One' }).getByRole('button')
    ).toHaveAccessibleName('One')
  })

  test('wizard: Next stays on the invalid control when it is not the page’s first field', async ({
    page: browserPage,
  }) => {
    const data = buildPages([
      page(1, [input('a'), input('b', { required: true })], 'One'),
      page(2, [input('c')], 'Two'),
    ])
    const root = await mount(browserPage, data, 'wizard')
    await root.locator('.formeo-pages-next').click()
    await expect(root.locator('input[name="a"]')).toBeVisible()
    await expect(root.locator('input[name="b"]')).toBeFocused()
  })

  test('wizard: a forward step jump stops on the invalid control of a later page, not its first field', async ({
    page: browserPage,
  }) => {
    const data = buildPages([
      page(1, [input('x')], 'One'),
      page(2, [input('a'), input('b', { required: true })], 'Two'),
      page(3, [input('c')], 'Three'),
    ])
    const root = await mount(browserPage, data, 'wizard')
    const step = name => root.locator('.formeo-pages-step').filter({ hasText: name }).getByRole('button')
    await step('Three').click()
    await expect(root.locator('input[name="b"]')).toBeVisible()
    await expect(root.locator('input[name="b"]')).toBeFocused()
  })

  test('clicking submit shows and focuses the first invalid field, even on an earlier page', async ({
    page: browserPage,
  }) => {
    const data = buildPages([
      page(1, [input('a', { required: true })], 'One'),
      page(2, [input('b', { required: true }), submitButton], 'Two'),
    ])
    const root = await mount(browserPage, data, 'wizard')
    await browserPage.evaluate(() => {
      window.__pager.page = 1
    })
    // a trusted submit: the browser validates between microtasks, unlike requestSubmit() from a script
    await root.getByRole('button', { name: 'Send' }).click()
    await expect(root.locator('input[name="a"]')).toBeVisible()
    await expect(root.locator('input[name="a"]')).toBeFocused()
    expect(await browserPage.evaluate(() => window.__pager.page)).toBe(0)
    expect(await browserPage.evaluate(() => window.__submitted)).toBeNull()
  })

  test('a checkValidity() call from onChange never moves the user to another page', async ({ page: browserPage }) => {
    const root = await mount(browserPage, twoPages, 'wizard', { toggleSubmit: true })
    await root.locator('input[name="name"]').pressSequentially('Ada')
    await expect(root.locator('input[name="name"]')).toBeFocused()
    await expect(root.locator('input[name="email"]')).toBeHidden()
    expect(await browserPage.evaluate(() => window.__pager.page)).toBe(0)
    await expect(root.locator('button[type="submit"]')).toBeDisabled()
  })

  test('tabs: arrow keys move between tabs', async ({ page: browserPage }) => {
    const root = await mount(browserPage, twoPages, 'tabs')
    await root.getByRole('tab', { name: 'About you' }).focus()
    await browserPage.keyboard.press('ArrowRight')
    await expect(root.getByRole('tab', { name: 'Page 2' })).toBeFocused()
    await expect(root.getByRole('tab', { name: 'Page 2' })).toHaveAttribute('aria-selected', 'true')
    await expect(root.locator('input[name="email"]')).toBeVisible()
    await expect(root.locator('input[name="name"]')).toBeHidden()
  })

  test('the tablist, step list and wizard bar have accessible names, and the status names the page', async ({
    page: browserPage,
  }) => {
    let root = await mount(browserPage, twoPages, 'tabs')
    await expect(root.getByRole('tablist', { name: 'Pages' })).toBeVisible()

    root = await mount(browserPage, twoPages, 'wizard')
    await expect(root.getByRole('list', { name: 'Progress' })).toBeVisible()
    await expect(root.getByRole('group', { name: 'Page navigation' })).toBeVisible()
    await expect(root.locator('.formeo-pages-status')).toHaveText('About you (1 of 2)')
    await root.getByRole('button', { name: 'Next' }).click()
    await expect(root.locator('.formeo-pages-status')).toHaveText('Page 2 (2 of 2)')
  })

  test('wizard with submit: Enter on the last page submits a form without its own submit field', async ({
    page: browserPage,
  }) => {
    const root = await mount(browserPage, twoPagesNoSubmit, { type: 'wizard', submit: true })
    await root.locator('input[name="name"]').fill('Ada')
    await root.locator('input[name="name"]').press('Enter')
    await expect(root.locator('input[name="email"]')).toBeFocused()
    await expect(root.getByRole('button', { name: 'Submit' })).toBeVisible()
    await expect(root.getByRole('button', { name: 'Next' })).toBeHidden()

    await root.locator('input[name="email"]').fill('ada@example.com')
    await root.locator('input[name="email"]').press('Enter')
    await expect
      .poll(() => browserPage.evaluate(() => window.__submitted))
      .toEqual({ name: 'Ada', email: 'ada@example.com' })
  })

  test('wizard with submit: Submit shows an invalid earlier page first, then submits', async ({
    page: browserPage,
  }) => {
    const root = await mount(browserPage, twoPagesNoSubmit, { type: 'wizard', submit: true })
    await browserPage.evaluate(() => {
      window.__pager.page = 1
    })
    await root.getByRole('button', { name: 'Submit' }).click()
    await expect(root.locator('input[name="name"]')).toBeFocused()
    expect(await browserPage.evaluate(() => window.__submitted)).toBeNull()

    await root.locator('input[name="name"]').fill('Ada')
    await browserPage.evaluate(() => {
      window.__pager.page = 1
    })
    await root.getByRole('button', { name: 'Submit' }).click()
    await expect.poll(() => browserPage.evaluate(() => window.__submitted)).toEqual({ name: 'Ada', email: '' })
  })

  test('wizard with submit and a submit field of its own: Enter on the last page submits once', async ({
    page: browserPage,
  }) => {
    const root = await mount(browserPage, twoPages, { type: 'wizard', submit: true })
    await root.locator('input[name="name"]').press('Enter')
    await root.locator('input[name="email"]').fill('ada@example.com')
    await root.locator('input[name="email"]').press('Enter')
    await expect.poll(() => browserPage.evaluate(() => window.__submitCount)).toBe(1)
    await browserPage.waitForTimeout(200)
    expect(await browserPage.evaluate(() => window.__submitCount)).toBe(1)
  })

  test('tabs with submit: the Submit button below the pages submits from any tab', async ({ page: browserPage }) => {
    const root = await mount(browserPage, twoPagesNoSubmit, { type: 'tabs', submit: true })
    await root.locator('input[name="name"]').fill('Ada')
    await expect(root.locator('.formeo-pages-actions').getByRole('button', { name: 'Submit' })).toBeVisible()
    await root.getByRole('button', { name: 'Submit' }).click()
    await expect.poll(() => browserPage.evaluate(() => window.__submitted)).toEqual({ name: 'Ada', email: '' })
  })

  test('wizard with heading: each page shows its title and is named by it', async ({ page: browserPage }) => {
    const root = await mount(browserPage, twoPages, { type: 'wizard', heading: true })
    await expect(root.getByRole('heading', { level: 2, name: 'About you' })).toBeVisible()
    await expect(root.getByRole('group', { name: 'About you' })).toBeVisible()
    await root.getByRole('button', { name: 'Next' }).click()
    await expect(root.getByRole('heading', { level: 2, name: 'Page 2' })).toBeVisible()
    await expect(root.getByRole('heading', { name: 'About you' })).toBeHidden()
  })

  test('render() keeps the page on show', async ({ page: browserPage }) => {
    const root = await mount(browserPage, twoPages, 'tabs')
    await root.getByRole('tab', { name: 'Page 2' }).click()
    await browserPage.evaluate(data => window.__pager.render(data), twoPages)
    await expect(root.getByRole('tab', { name: 'Page 2' })).toHaveAttribute('aria-selected', 'true')
    await expect(root.locator('input[name="email"]')).toBeVisible()
  })

  test('wizard: Enter jumps over a skipped page, whose step takes no number', async ({ page: browserPage }) => {
    const root = await mount(browserPage, skipForm, { type: 'wizard', submit: true })
    await root.locator('input[name="kind"]').fill('person')
    await expect(root.getByRole('list', { name: 'Progress' }).getByRole('button')).toHaveText(['About you', 'Contact'])
    // a display: none step doesn't increment the CSS counter that numbers the steps
    expect(
      await root
        .locator('.formeo-pages-step')
        .nth(1)
        .evaluate(step => getComputedStyle(step).display)
    ).toBe('none')

    await root.locator('input[name="kind"]').press('Enter')
    await expect(root.locator('input[name="email"]')).toBeFocused()
    await expect(root.locator('.formeo-pages-status')).toHaveText('Contact (2 of 2)')
    await root.locator('input[name="email"]').fill('ada@example.com')
    await root.locator('input[name="email"]').press('Enter')
    await expect
      .poll(() => browserPage.evaluate(() => window.__submitted))
      .toEqual({ kind: 'person', email: 'ada@example.com' })
  })

  test('wizard: a skipped page comes back, required again, when the answer changes', async ({ page: browserPage }) => {
    const root = await mount(browserPage, skipForm, 'wizard')
    await root.locator('input[name="kind"]').fill('person')
    await root.locator('input[name="kind"]').fill('business')
    await expect(root.getByRole('list', { name: 'Progress' }).getByRole('button')).toHaveText([
      'About you',
      'Company',
      'Contact',
    ])
    await root.getByRole('button', { name: 'Next' }).click()
    await expect(root.locator('input[name="company"]')).toBeFocused()
    await root.getByRole('button', { name: 'Next' }).click()
    // Company is required and empty, so Next stays put
    await expect(root.locator('input[name="company"]')).toBeVisible()
  })

  test("wizard: a skipped page's answers stop showing the pages that depend on them", async ({ page: browserPage }) => {
    // "person" skips Company; the VAT page is shown only when "vat" (on Company) is "yes"
    const vatForm = buildPages([
      page(1, [input('kind')], 'About you'),
      page(2, [input('vat')], 'Company'),
      page(3, [input('vat-number')], 'VAT'),
    ])
    const vatClause = comparison => [{ source: 'fields.vat', sourceProperty: 'value', comparison, target: 'yes' }]
    vatForm.stages['p-1'].conditions = skipForm.stages['p-1'].conditions
    vatForm.stages['p-2'].conditions = [
      { if: vatClause('=='), then: [{ target: 'stages.p-3', targetProperty: 'isVisible' }] },
      { if: vatClause('!='), then: [{ target: 'stages.p-3', targetProperty: 'isNotVisible' }] },
    ]
    const root = await mount(browserPage, vatForm, 'wizard')
    const steps = root.getByRole('list', { name: 'Progress' }).getByRole('button')
    await root.getByRole('button', { name: 'Next' }).click()
    await root.locator('input[name="vat"]').fill('yes')
    await expect(steps).toHaveText(['About you', 'Company', 'VAT'])

    await root.getByRole('button', { name: 'Previous' }).click()
    await root.locator('input[name="kind"]').fill('person')
    await expect(steps).toHaveText(['About you'])
    await expect(root.locator('.formeo-pages-status')).toHaveText('About you (1 of 1)')

    await root.locator('input[name="kind"]').fill('')
    await expect(steps).toHaveText(['About you', 'Company', 'VAT'])
    await expect(root.locator('.formeo-pages-status')).toHaveText('About you (1 of 3)')
  })
})
