import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import { normalizePagination } from './helpers.js'
import FormeoRenderer from './index.js'

let dom
let container
const GLOBALS = ['document', 'window', 'Element', 'HTMLElement', 'HTMLFormElement', 'Node', 'FormData']
// condition value actions dispatch `new Event(...)`, which jsdom only accepts from its own window
const nativeEvent = global.Event

beforeEach(() => {
  dom = new JSDOM('<!DOCTYPE html><body><div id="container"></div></body>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
  })
  const { window } = dom
  for (const name of GLOBALS) {
    global[name] = name === 'window' ? window : name === 'document' ? window.document : window[name]
  }
  global.Event = window.Event
  container = window.document.getElementById('container')
})

afterEach(() => {
  for (const name of GLOBALS) delete global[name]
  global.Event = nativeEvent
})

const field = (id, { tag = 'input', ...attrs } = {}, extra = {}) => ({
  id,
  tag,
  attrs: tag === 'input' ? { type: 'text', name: id, ...attrs } : { name: id, ...attrs },
  config: { label: id },
  ...extra,
})

/**
 * One stage per entry of `pageFields`; each stage holds one row and one column with those fields
 * @param {Array<Array<Object>>} pageFields
 * @param {Array<String>} titles optional config.title per page
 */
const buildPages = (pageFields, titles = []) => {
  const data = { id: 'pages', stages: {}, rows: {}, columns: {}, fields: {} }
  pageFields.forEach((fields, i) => {
    const n = i + 1
    data.stages[`p-${n}`] = { id: `p-${n}`, config: titles[i] ? { title: titles[i] } : {}, children: [`r-${n}`] }
    data.rows[`r-${n}`] = { id: `r-${n}`, config: {}, children: [`c-${n}`] }
    data.columns[`c-${n}`] = { id: `c-${n}`, config: { width: '100%' }, children: fields.map(f => f.id) }
    for (const f of fields) data.fields[f.id] = f
  })
  return data
}

const twoPages = ({ requiredFirst = false } = {}) =>
  buildPages(
    [[field('name', { required: requiredFirst })], [field('email', { type: 'email', required: true })]],
    ['About you']
  )

const render = (pagination, data = twoPages(), extra = {}) => {
  const renderer = new FormeoRenderer({ renderContainer: container, pagination, ...extra })
  renderer.render(data)
  return renderer
}

const pages = () => [...container.querySelectorAll('.formeo-stage')]
const hiddenPages = () => pages().map(p => p.hidden)
const tabs = () => [...container.querySelectorAll('[role="tab"]')]
const input = name => container.querySelector(`[name="${name}"]`)
const key = (elem, k) => {
  const event = new dom.window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
  elem.dispatchEvent(event)
  return event
}
const typeInto = (elem, value) => {
  elem.value = value
  elem.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
}

describe('normalizePagination (#122)', () => {
  test('returns null for a missing or unknown type', () => {
    assert.equal(normalizePagination(), null)
    assert.equal(normalizePagination('none'), null)
    assert.equal(normalizePagination({ type: 'accordion' }), null)
  })

  test('expands the string shorthand with default labels and progress on', () => {
    assert.deepEqual(normalizePagination('wizard'), {
      type: 'wizard',
      progress: true,
      labels: { previous: 'Previous', next: 'Next', page: 'Page {n}' },
    })
  })

  test('merges custom labels and keeps progress: false', () => {
    assert.deepEqual(normalizePagination({ type: 'wizard', progress: false, labels: { next: 'Weiter' } }), {
      type: 'wizard',
      progress: false,
      labels: { previous: 'Previous', next: 'Weiter', page: 'Page {n}' },
    })
  })

  test('ignores label values that are not strings', () => {
    assert.deepEqual(normalizePagination({ type: 'tabs', labels: { page: undefined, next: 3 } }).labels, {
      previous: 'Previous',
      next: 'Next',
      page: 'Page {n}',
    })
  })
})

describe('pagination (#122)', () => {
  test('without the option every stage is visible', () => {
    const renderer = render(undefined)
    assert.deepEqual(hiddenPages(), [false, false])
    assert.equal(container.querySelector('.formeo-pages-nav'), null)
    assert.equal(renderer.pageCount, 1)
  })

  test('a single stage renders without navigation', () => {
    const data = twoPages()
    delete data.stages['p-2']
    const renderer = render('wizard', data)
    assert.equal(container.querySelector('.formeo-pages-nav'), null)
    assert.equal(container.querySelector('.formeo-pages-steps'), null)
    assert.equal(renderer.pageCount, 1)
    assert.equal(renderer.page, 0)
  })

  test('rendering again does not duplicate the navigation', () => {
    const renderer = render('tabs')
    renderer.render(twoPages())
    assert.equal(container.querySelectorAll('.formeo-pages-nav').length, 1)
  })

  describe('tabs', () => {
    test('labels tabs from config.title, falling back to labels.page', () => {
      render('tabs')
      assert.deepEqual(
        tabs().map(t => t.textContent),
        ['About you', 'Page 2']
      )
      container.replaceChildren()
      render({ type: 'tabs', labels: { page: 'Seite {n}' } })
      assert.deepEqual(
        tabs().map(t => t.textContent),
        ['About you', 'Seite 2']
      )
    })

    test('clicking a tab shows its page and wires the ARIA tabs pattern', () => {
      const renderer = render('tabs')
      assert.equal(container.querySelector('[role="tablist"]').classList.contains('formeo-pages-nav'), true)
      assert.deepEqual(hiddenPages(), [false, true])
      tabs()[1].click()
      assert.deepEqual(hiddenPages(), [true, false])
      assert.equal(renderer.page, 1)
      assert.deepEqual(
        tabs().map(t => t.getAttribute('aria-selected')),
        ['false', 'true']
      )
      assert.deepEqual(
        tabs().map(t => t.tabIndex),
        [-1, 0]
      )
      pages().forEach((page, i) => {
        assert.equal(page.getAttribute('role'), 'tabpanel')
        assert.equal(tabs()[i].getAttribute('aria-controls'), page.id)
        assert.equal(page.getAttribute('aria-labelledby'), tabs()[i].id)
      })
    })

    test('arrow keys, Home and End move between tabs and wrap around', () => {
      const renderer = render('tabs', buildPages([[field('a')], [field('b')], [field('c')]]))
      tabs()[0].focus()
      key(tabs()[0], 'ArrowRight')
      assert.equal(renderer.page, 1)
      assert.equal(dom.window.document.activeElement, tabs()[1])
      key(tabs()[1], 'End')
      assert.equal(renderer.page, 2)
      key(tabs()[2], 'ArrowRight')
      assert.equal(renderer.page, 0, 'wraps to the first tab')
      key(tabs()[0], 'ArrowLeft')
      assert.equal(renderer.page, 2, 'wraps to the last tab')
      key(tabs()[2], 'Home')
      assert.equal(renderer.page, 0)
      assert.equal(dom.window.document.activeElement, tabs()[0])
    })

    test('in a right-to-left form, ArrowLeft moves to the next tab and ArrowRight to the previous one', () => {
      container.dir = 'rtl'
      const renderer = render('tabs', buildPages([[field('a')], [field('b')], [field('c')]]))
      key(tabs()[0], 'ArrowLeft')
      assert.equal(renderer.page, 1)
      assert.equal(dom.window.document.activeElement, tabs()[1])
      key(tabs()[1], 'ArrowRight')
      assert.equal(renderer.page, 0)
      key(tabs()[0], 'ArrowRight')
      assert.equal(renderer.page, 2, 'wraps to the last tab')
    })

    test('switching tabs does not validate the page being left', () => {
      const renderer = render('tabs', twoPages({ requiredFirst: true }))
      tabs()[1].click()
      assert.equal(renderer.page, 1)
    })

    test('two forms from the same formData get unique tab ids, each controlling its own page', () => {
      // the editor gives its stage element the stage's id too
      const editorStage = document.createElement('div')
      editorStage.id = 'p-1'
      document.body.prepend(editorStage)
      const second = document.createElement('div')
      document.body.append(second)
      render('tabs')
      new FormeoRenderer({ renderContainer: second, pagination: 'tabs' }).render(twoPages())

      const allTabs = [...document.querySelectorAll('[role="tab"]')]
      assert.equal(allTabs.length, 4)
      assert.equal(new Set(allTabs.map(tab => tab.id)).size, 4, 'tab ids are unique')
      for (const tab of allTabs) {
        const panel = document.getElementById(tab.getAttribute('aria-controls'))
        assert.equal(panel.getAttribute('aria-labelledby'), tab.id)
        assert.equal(panel.closest('form'), tab.closest('form'), 'aria-controls resolves within its own form')
      }
      assert.deepEqual(
        pages().map(page => page.dataset.stageId),
        ['p-1', 'p-2'],
        'each page still names its stage'
      )
    })

    test('tab panels are focusable, as the ARIA tabs pattern expects', () => {
      render('tabs')
      assert.deepEqual(
        pages().map(p => p.getAttribute('tabindex')),
        ['0', '0']
      )
    })

    test('a label set to undefined falls back to the default', () => {
      render({ type: 'tabs', labels: { page: undefined } })
      assert.deepEqual(
        tabs().map(t => t.textContent),
        ['About you', 'Page 2']
      )
    })
  })

  describe('wizard', () => {
    const next = () => container.querySelector('.formeo-pages-next')
    const previous = () => container.querySelector('.formeo-pages-previous')
    const steps = () => [...container.querySelectorAll('.formeo-pages-step')]

    test('Next stops on an invalid page and moves on once it is valid; Previous goes back', () => {
      const renderer = render('wizard', twoPages({ requiredFirst: true }))
      assert.equal(previous().disabled, true)
      next().click()
      assert.equal(renderer.page, 0)
      input('name').value = 'Ada'
      next().click()
      assert.equal(renderer.page, 1)
      assert.deepEqual(hiddenPages(), [true, false])
      assert.equal(next().hidden, true, 'no Next on the last page')
      assert.equal(previous().disabled, false)
      previous().click()
      assert.equal(renderer.page, 0)
    })

    test('the status reads "N / M" in a live region', () => {
      render('wizard')
      const status = container.querySelector('.formeo-pages-status')
      assert.equal(status.getAttribute('aria-live'), 'polite')
      assert.equal(status.textContent, '1 / 2')
      next().click()
      assert.equal(status.textContent, '2 / 2')
    })

    test('the Previous/Next bar is a group, not a navigation landmark inside the form', () => {
      render('wizard')
      const bar = container.querySelector('.formeo-pages-nav.formeo-pages-wizard')
      assert.equal(bar.tagName, 'DIV')
      assert.equal(bar.getAttribute('role'), 'group')
      assert.equal(container.querySelector('nav'), null)
    })

    test('uses custom Previous/Next labels', () => {
      render({ type: 'wizard', labels: { previous: 'Zurück', next: 'Weiter' } })
      assert.equal(previous().textContent, 'Zurück')
      assert.equal(next().textContent, 'Weiter')
    })

    test('Next moves focus to the first control of the new page', () => {
      render('wizard')
      next().focus()
      next().click()
      assert.equal(dom.window.document.activeElement, input('email'))
    })

    test('Previous moves focus to the first control of the new page', () => {
      render('wizard')
      next().click()
      previous().focus()
      previous().click()
      assert.equal(dom.window.document.activeElement, input('name'))
    })

    test('a page with nothing focusable takes focus itself, so focus never drops to the body', () => {
      const note = { id: 'thanks', tag: 'p', attrs: {}, config: {}, content: 'Thanks!' }
      render('wizard', buildPages([[field('a')], [note]]))
      next().focus()
      next().click()
      assert.equal(next().hidden, true)
      assert.equal(dom.window.document.activeElement, pages()[1])
    })

    test('Next checks only the current page, even when an earlier page has become invalid', () => {
      const renderer = render(
        'wizard',
        buildPages([[field('a', { required: true })], [field('b', { required: true })], [field('c')]])
      )
      input('a').value = 'x'
      next().click()
      assert.equal(renderer.page, 1)
      renderer.page = 0
      input('a').value = ''
      renderer.page = 1
      next().click()
      assert.equal(renderer.page, 1, 'reports page 2 instead of jumping back to page 1')
    })

    test('Next skips a required field hidden by a condition (#495)', () => {
      const hide = (comparison, targetProperty) => ({
        if: [{ source: 'fields.toggle', sourceProperty: 'value', comparison, target: 'hide' }],
        then: [{ target: 'fields.secret', targetProperty, assignment: '', value: '' }],
      })
      const data = buildPages([
        [
          field('toggle', {}, { conditions: [hide('equals', 'isNotVisible'), hide('notEquals', 'isVisible')] }),
          field('secret', { required: true }),
        ],
        [field('email')],
      ])
      const renderer = render('wizard', data)
      next().click()
      assert.equal(renderer.page, 0, 'the visible required field blocks Next')
      typeInto(input('toggle'), 'hide')
      next().click()
      assert.equal(renderer.page, 1, 'once hidden it no longer does')
    })

    test('Enter in an input before the last page acts as Next', () => {
      const renderer = render('wizard', twoPages({ requiredFirst: true }))
      const blocked = key(input('name'), 'Enter')
      assert.equal(blocked.defaultPrevented, true, 'never submits from an earlier page')
      assert.equal(renderer.page, 0, 'the invalid page keeps Enter from moving on')
      input('name').value = 'Ada'
      key(input('name'), 'Enter')
      assert.equal(renderer.page, 1)
      assert.equal(key(input('email'), 'Enter').defaultPrevented, false, 'the last page submits natively')
    })

    test('Enter in a textarea keeps its newline', () => {
      render('wizard', buildPages([[field('notes', { tag: 'textarea' })], [field('b')]]))
      assert.equal(key(container.querySelector('textarea'), 'Enter').defaultPrevented, false)
    })

    test('Next leaves focus alone when the current page is invalid, letting the native report stand', () => {
      const data = buildPages([[field('a'), field('b', { required: true })], [field('c')]])
      render('wizard', data)
      input('a').focus()
      next().click()
      assert.equal(dom.window.document.activeElement, input('a'), 'Next must not move focus onto page 1 itself')
    })

    test('a novalidate form moves on without checking any page', () => {
      const data = buildPages(
        [[field('a', { required: true })], [field('b', { required: true })], [field('c', { required: true })]],
        ['One', 'Two', 'Three']
      )
      const renderer = render('wizard', data)
      container.querySelector('form').noValidate = true
      next().click()
      assert.equal(renderer.page, 1, 'Next')
      key(input('b'), 'Enter')
      assert.equal(renderer.page, 2, 'Enter as Next')
      renderer.page = 0
      steps()[2].querySelector('button').click()
      assert.equal(renderer.page, 2, 'a forward step jump')
    })

    describe('step list', () => {
      const threePages = () =>
        buildPages(
          [[field('a', { required: true })], [field('b', { required: true })], [field('c')]],
          ['One', 'Two', 'Three']
        )

      test('lists every page title and marks the current step', () => {
        render('wizard', threePages())
        assert.deepEqual(
          steps().map(s => s.textContent),
          ['One', 'Two', 'Three']
        )
        assert.deepEqual(
          steps().map(s => s.dataset.state),
          ['current', 'upcoming', 'upcoming']
        )
        assert.equal(steps()[0].querySelector('button').getAttribute('aria-current'), 'step')
      })

      test('forward steps validate each page in between and stop on the first invalid one', () => {
        const renderer = render('wizard', threePages())
        steps()[2].querySelector('button').click()
        assert.equal(renderer.page, 0, 'page 1 is invalid')
        input('a').value = 'x'
        steps()[2].querySelector('button').click()
        assert.equal(renderer.page, 1, 'stops on page 2, which is invalid')
        assert.deepEqual(
          steps().map(s => s.dataset.state),
          ['done', 'current', 'upcoming']
        )
        input('b').value = 'y'
        steps()[2].querySelector('button').click()
        assert.equal(renderer.page, 2)
      })

      test('going back is always allowed', () => {
        const renderer = render('wizard', threePages())
        input('a').value = 'x'
        next().click()
        input('b').value = ''
        steps()[0].querySelector('button').click()
        assert.equal(renderer.page, 0)
      })

      test('progress: false leaves the step list out', () => {
        render({ type: 'wizard', progress: false }, threePages())
        assert.equal(container.querySelector('.formeo-pages-steps'), null)
      })

      test('clicking the current step is a no-op: no focus change, no onPageChange', () => {
        const calls = []
        const renderer = render('wizard', threePages(), { events: { onPageChange: () => calls.push(1) } })
        input('a').focus()
        steps()[0].querySelector('button').click()
        assert.equal(renderer.page, 0)
        assert.equal(calls.length, 0)
        assert.equal(dom.window.document.activeElement, input('a'))
      })

      test('a forward step jump that stops on a later invalid page does not focus its first, valid control', () => {
        const data = buildPages(
          [[field('a')], [field('b'), field('c', { required: true })], [field('d')]],
          ['One', 'Two', 'Three']
        )
        const renderer = render('wizard', data)
        steps()[2].querySelector('button').click()
        assert.equal(renderer.page, 1, 'stops on page 2, which is invalid')
        assert.notEqual(
          dom.window.document.activeElement,
          input('b'),
          "must not steal focus onto page 2's first, valid control"
        )
      })
    })
  })

  describe('validation across pages', () => {
    test('reportValidity() brings an invalid control on a hidden page into view', () => {
      const renderer = render('tabs')
      container.querySelector('form').reportValidity()
      assert.equal(renderer.page, 1)
    })

    test("every invalid event of a pass shows the page of the form's first invalid control", () => {
      const renderer = render(
        'tabs',
        buildPages([[field('a')], [field('b', { required: true })], [field('c', { required: true })]])
      )
      container.querySelector('form').requestSubmit()
      assert.equal(renderer.page, 1)
    })

    test('a later validation pass in the same task switches the page again', () => {
      const renderer = render('tabs')
      const form = container.querySelector('form')
      form.requestSubmit()
      renderer.page = 0
      form.reportValidity()
      assert.equal(renderer.page, 1)
    })

    test('clicking a submit button, or something inside one, brings the invalid page into view', () => {
      const renderer = render('tabs')
      const button = document.createElement('button')
      const label = document.createElement('span')
      label.textContent = 'Send'
      button.append(label)
      container.querySelector('form').append(button)
      label.click()
      assert.equal(renderer.page, 1)
    })

    test('an external submit button associated with the form brings the invalid page into view', () => {
      const renderer = render('tabs')
      const form = container.querySelector('form')
      form.id = 'associated-form'
      const button = document.createElement('button')
      button.type = 'submit'
      button.setAttribute('form', form.id)
      container.append(button)
      button.click()
      assert.equal(renderer.page, 1)
    })

    test('Enter in an input marks the implicit submission that follows as reported', () => {
      const renderer = render('tabs')
      key(input('name'), 'Enter')
      // jsdom has no implicit submission; run the validation pass the browser would run in the same task
      container.querySelector('form').checkValidity()
      assert.equal(renderer.page, 1)
    })

    test('plain checkValidity() calls never switch pages', () => {
      const calls = []
      const renderer = render('tabs', twoPages(), { events: { onPageChange: () => calls.push(1) } })
      assert.equal(container.querySelector('form').checkValidity(), false)
      assert.equal(input('email').checkValidity(), false)
      assert.equal(renderer.page, 0)
      assert.deepEqual(calls, [])
    })

    test('checkValidity() right after reportValidity() in the same task does not switch pages', () => {
      const renderer = render('tabs')
      const form = container.querySelector('form')
      form.reportValidity()
      renderer.page = 0
      form.checkValidity()
      assert.equal(renderer.page, 0)
    })

    test('checkValidity() in a later task than a reported pass does not switch pages', async () => {
      const renderer = render('tabs')
      const form = container.querySelector('form')
      form.reportValidity()
      renderer.page = 0
      await new Promise(resolve => setTimeout(resolve, 0))
      form.checkValidity()
      assert.equal(renderer.page, 0)
    })

    test('a field a condition reveals on another page becomes required again', () => {
      const when = (comparison, targetProperty) => ({
        if: [{ source: 'fields.toggle', sourceProperty: 'value', comparison, target: 'hide' }],
        then: [{ target: 'fields.email', targetProperty, assignment: '', value: '' }],
      })
      const data = buildPages([
        [field('toggle', {}, { conditions: [when('equals', 'isNotVisible'), when('notEquals', 'isVisible')] })],
        [field('email', { type: 'email', required: true })],
      ])
      render('tabs', data)
      typeInto(input('toggle'), 'hide')
      assert.equal(input('email').required, false)
      typeInto(input('toggle'), 'show')
      assert.equal(input('email').required, true, 'page 2 is not a condition, so it must not keep required off')
    })

    describe('a required checkbox group on an inactive page stays required', () => {
      const group = () => ({
        id: 'g',
        tag: 'input',
        attrs: { type: 'checkbox', name: 'g', required: true },
        config: { label: 'g' },
        options: [
          { label: 'One', value: 'g1' },
          { label: 'Two', value: 'g2' },
        ],
      })
      const required = () => [...container.querySelectorAll('input[type="checkbox"]')].map(box => box.required)

      test('after the userData setter re-syncs it', () => {
        const renderer = render('tabs', buildPages([[field('name')], [group()]]))
        assert.deepEqual(required(), [true, true])
        renderer.userData = { g: [] }
        assert.deepEqual(required(), [true, true], 'page 2 is inactive, not hidden by a condition')
        renderer.userData = { g: ['g1'] }
        assert.deepEqual(required(), [false, false], 'one checked box satisfies the group')
      })

      test('after a form reset re-syncs it', async () => {
        render('tabs', buildPages([[field('name')], [group()]]))
        container.querySelector('form').reset()
        await new Promise(resolve => setTimeout(resolve, 0))
        assert.deepEqual(required(), [true, true])
      })

      test('after a condition hides and shows it again', () => {
        const when = (comparison, targetProperty) => ({
          if: [{ source: 'fields.toggle', sourceProperty: 'value', comparison, target: 'hide' }],
          then: [{ target: 'fields.g', targetProperty, assignment: '', value: '' }],
        })
        const toggle = field(
          'toggle',
          {},
          { conditions: [when('equals', 'isNotVisible'), when('notEquals', 'isVisible')] }
        )
        render('tabs', buildPages([[toggle], [group()]]))
        typeInto(input('toggle'), 'hide')
        assert.deepEqual(required(), [false, false], 'hidden by a condition')
        typeInto(input('toggle'), 'show')
        assert.deepEqual(required(), [true, true], 'shown again, on a page that is merely inactive')
      })
    })
  })

  describe('renderer.page and onPageChange', () => {
    test('the page setter clamps to the available pages', () => {
      const renderer = render('tabs')
      assert.equal(renderer.pageCount, 2)
      renderer.page = 0.5
      assert.equal(renderer.page, 0)
      renderer.page = 1.9
      assert.equal(renderer.page, 1)
      renderer.page = 5
      assert.equal(renderer.page, 1)
      renderer.page = -1
      assert.equal(renderer.page, 0)
    })

    test('form controls named like wrapped methods do not break reportValidity or requestSubmit', () => {
      const renderer = render(
        'tabs',
        buildPages([
          [field('requestSubmit'), field('reportValidity')],
          [field('email', { type: 'email', required: true })],
        ])
      )
      const form = container.querySelector('form')
      assert.doesNotThrow(() => form.reportValidity())
      renderer.page = 0
      assert.doesNotThrow(() => form.requestSubmit())
      assert.equal(renderer.page, 1)
    })

    test('onPageChange fires on every change but not on render or when the page stays the same', () => {
      const calls = []
      const renderer = render('tabs', twoPages(), {
        events: {
          onPageChange: ({ page, previousPage, form, renderer: r }) => calls.push({ page, previousPage, form, r }),
        },
      })
      assert.equal(calls.length, 0)
      tabs()[1].click()
      renderer.page = 1
      renderer.page = 0
      assert.deepEqual(
        calls.map(({ page, previousPage }) => [page, previousPage]),
        [
          [1, 0],
          [0, 1],
        ]
      )
      assert.equal(calls[0].form, container.querySelector('form'))
      assert.equal(calls[0].r, renderer)
    })

    test('onPageChange fires when validation jumps to another page', () => {
      const calls = []
      render('tabs', twoPages(), { events: { onPageChange: ({ page }) => calls.push(page) } })
      container.querySelector('form').reportValidity()
      assert.deepEqual(calls, [1])
    })

    test('onPageChange fires for Next, Previous and a validation jump in the wizard', () => {
      const calls = []
      render('wizard', twoPages(), {
        events: { onPageChange: ({ page, previousPage }) => calls.push([page, previousPage]) },
      })
      container.querySelector('.formeo-pages-next').click()
      container.querySelector('.formeo-pages-previous').click()
      container.querySelector('form').requestSubmit()
      assert.deepEqual(calls, [
        [1, 0],
        [0, 1],
        [1, 0],
      ])
    })
  })
})

describe('pagination teardown (#166)', () => {
  /**
   * Tracks the listeners paginate() leaves on the document, keyed by type
   * @return {Map<String, Set<Function>>}
   */
  const trackDocumentListeners = () => {
    const live = new Map()
    const { addEventListener, removeEventListener } = document
    document.addEventListener = function (type, listener, options) {
      if (!live.has(type)) live.set(type, new Set())
      live.get(type).add(listener)
      return addEventListener.call(this, type, listener, options)
    }
    document.removeEventListener = function (type, listener, options) {
      live.get(type)?.delete(listener)
      return removeEventListener.call(this, type, listener, options)
    }
    return live
  }
  const count = live => [...live.values()].reduce((total, listeners) => total + listeners.size, 0)

  for (const type of ['tabs', 'wizard']) {
    test(`renderer.destroy() removes the ${type} pager's document listeners`, () => {
      const live = trackDocumentListeners()
      const renderer = render(type)
      assert.ok(count(live) > 0, 'paginate() listens on the document')
      renderer.destroy()
      assert.equal(count(live), 0)
      assert.equal(renderer.pager, null)
      assert.equal(renderer.page, 0)
      assert.equal(renderer.pageCount, 1)
    })
  }

  test('renderer.destroy() is safe twice with a pager, and render() paginates again afterwards', () => {
    const renderer = render('wizard')
    assert.doesNotThrow(() => {
      renderer.destroy()
      renderer.destroy()
    })
    renderer.render(twoPages())
    assert.equal(renderer.pageCount, 2)
    assert.deepEqual(hiddenPages(), [false, true])
  })
})
