import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, mock, test } from 'node:test'
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

  const DEFAULT_LABELS = {
    previous: 'Previous',
    next: 'Next',
    page: 'Page {n}',
    submit: 'Submit',
    tablist: 'Pages',
    steps: 'Progress',
    navigation: 'Page navigation',
    status: '{title} ({n} of {count})',
  }

  test('expands the string shorthand with the defaults', () => {
    assert.deepEqual(normalizePagination('wizard'), {
      type: 'wizard',
      progress: true,
      submit: false,
      heading: 0,
      labels: DEFAULT_LABELS,
    })
  })

  test('merges custom labels and keeps progress: false', () => {
    assert.deepEqual(normalizePagination({ type: 'wizard', progress: false, labels: { next: 'Weiter' } }), {
      type: 'wizard',
      progress: false,
      submit: false,
      heading: 0,
      labels: { ...DEFAULT_LABELS, next: 'Weiter' },
    })
  })

  test('ignores label values that are not strings', () => {
    assert.deepEqual(
      normalizePagination({ type: 'tabs', labels: { page: undefined, next: 3, status: null } }).labels,
      DEFAULT_LABELS
    )
  })

  test('accepts every navigation label', () => {
    const labels = {
      submit: 'Senden',
      tablist: 'Seiten',
      steps: 'Fortschritt',
      navigation: 'Seitennavigation',
      status: '{n}/{count}',
    }
    assert.deepEqual(normalizePagination({ type: 'wizard', labels }).labels, { ...DEFAULT_LABELS, ...labels })
  })

  test('submit is a boolean, off by default', () => {
    assert.equal(normalizePagination({ type: 'tabs' }).submit, false)
    assert.equal(normalizePagination({ type: 'wizard', submit: true }).submit, true)
    assert.equal(normalizePagination({ type: 'wizard', submit: 1 }).submit, true)
    assert.equal(normalizePagination({ type: 'wizard', submit: 0 }).submit, false)
  })

  test('heading is a level from 2 to 6, true meaning 2, anything else off', () => {
    const level = heading => normalizePagination({ type: 'wizard', heading }).heading
    assert.equal(level(true), 2)
    for (const n of [2, 3, 4, 5, 6]) {
      assert.equal(level(n), n)
    }
    for (const off of [false, undefined, null, 0, 1, 7, '2', 2.5, 'h2']) {
      assert.equal(level(off), 0, String(off))
    }
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

    test('the tablist is named by labels.tablist', () => {
      render('tabs')
      assert.equal(container.querySelector('[role="tablist"]').getAttribute('aria-label'), 'Pages')
      render({ type: 'tabs', labels: { tablist: 'Seiten' } })
      assert.equal(container.querySelector('[role="tablist"]').getAttribute('aria-label'), 'Seiten')
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

    test('the status names the page and its place, in a live region', () => {
      render('wizard')
      const status = container.querySelector('.formeo-pages-status')
      assert.equal(status.getAttribute('aria-live'), 'polite')
      assert.equal(status.textContent, 'About you (1 of 2)')
      next().click()
      assert.equal(status.textContent, 'Page 2 (2 of 2)')
    })

    test('a custom status fills every placeholder each time, keeps $ patterns literal and unknown ones as typed', () => {
      render(
        { type: 'wizard', labels: { status: '{n}/{count}: {title} – {title} {unknown}' } },
        buildPages([[field('a')], [field('b')]], ['Pay $& now $$', 'Two'])
      )
      assert.equal(
        container.querySelector('.formeo-pages-status').textContent,
        '1/2: Pay $& now $$ – Pay $& now $$ {unknown}'
      )
    })

    test('the step list and the Previous/Next bar are named by labels.steps and labels.navigation', () => {
      render('wizard')
      assert.equal(container.querySelector('.formeo-pages-steps').getAttribute('aria-label'), 'Progress')
      assert.equal(container.querySelector('.formeo-pages-wizard').getAttribute('aria-label'), 'Page navigation')
      render({ type: 'wizard', labels: { steps: 'Fortschritt', navigation: 'Seitennavigation' } })
      assert.equal(container.querySelector('.formeo-pages-steps').getAttribute('aria-label'), 'Fortschritt')
      assert.equal(container.querySelector('.formeo-pages-wizard').getAttribute('aria-label'), 'Seitennavigation')
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

    test('Enter as Next does not leave the reporting flag set for an onPageChange checkValidity() call (#122)', () => {
      // page 2 is valid; page 3 has an empty required field. A silent checkValidity() from onPageChange
      // must never be mistaken for a reported pass, or Enter on page 1 jumps straight to page 3.
      const data = buildPages([[field('a')], [field('b')], [field('c', { required: true })]], ['One', 'Two', 'Three'])
      const renderer = render('wizard', data, { events: { onPageChange: ({ form }) => form.checkValidity() } })
      key(input('a'), 'Enter')
      assert.equal(renderer.page, 1, 'Enter must land on page 2, not skip it for the invalid page 3')
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

  describe('submit button', () => {
    const submitButton = () => container.querySelector('.formeo-pages-submit')
    const next = () => container.querySelector('.formeo-pages-next')
    const threePages = () => buildPages([[field('a')], [field('b')], [field('c')]], ['One', 'Two', 'Three'])

    test('is left out by default', () => {
      render('wizard')
      assert.equal(submitButton(), null)
      render('tabs')
      assert.equal(submitButton(), null)
    })

    test('in a wizard, replaces Next on the last page only', () => {
      const renderer = render({ type: 'wizard', submit: true }, threePages())
      const submit = submitButton()
      assert.equal(submit.type, 'submit')
      assert.equal(submit.textContent, 'Submit')
      assert.equal(submit.parentElement, container.querySelector('.formeo-pages-wizard'))
      assert.equal(submit.parentElement.lastElementChild, submit)
      const shown = () => [submit.hidden, next().hidden]
      assert.deepEqual(shown(), [true, false])
      renderer.page = 1
      assert.deepEqual(shown(), [true, false])
      renderer.page = 2
      assert.deepEqual(shown(), [false, true])
      renderer.page = 0
      assert.deepEqual(shown(), [true, false])
    })

    test('uses labels.submit', () => {
      render({ type: 'wizard', submit: true, labels: { submit: 'Senden' } })
      assert.equal(submitButton().textContent, 'Senden')
    })

    test('in tabs, sits after the last page and is always shown', () => {
      const renderer = render({ type: 'tabs', submit: true })
      const form = container.querySelector('form')
      const actions = form.querySelector('.formeo-pages-actions')
      assert.equal(actions.parentElement, form)
      assert.equal(actions.previousElementSibling, pages().at(-1))
      assert.equal(submitButton().parentElement, actions)
      assert.equal(submitButton().hidden, false)
      renderer.page = 1
      assert.equal(submitButton().hidden, false)
    })

    test('Enter on the last page is left to the browser', () => {
      const renderer = render({ type: 'wizard', submit: true })
      assert.equal(key(input('name'), 'Enter').defaultPrevented, true)
      renderer.page = 1
      assert.equal(key(input('email'), 'Enter').defaultPrevented, false)
    })

    test('clicking it with an invalid control on an earlier page shows that page', () => {
      const renderer = render({ type: 'wizard', submit: true }, twoPages({ requiredFirst: true }))
      renderer.page = 1
      submitButton().click()
      assert.equal(renderer.page, 0)
    })

    describe('on a one-page form', () => {
      const onePage = () => {
        const data = twoPages()
        delete data.stages['p-2']
        return data
      }

      for (const type of ['wizard', 'tabs']) {
        test(`with submit: true, ${type} still gets the Submit button below the page, and no navigation`, () => {
          const renderer = render({ type, submit: true }, onePage())
          const actions = container.querySelector('.formeo-pages-actions')
          assert.notEqual(actions, null)
          assert.equal(actions.parentElement, container.querySelector('form'))
          assert.equal(actions.previousElementSibling, pages().at(-1))
          const submit = submitButton()
          assert.equal(submit.parentElement, actions)
          assert.equal(submit.hidden, false)
          assert.equal(submit.type, 'submit')
          assert.equal(submit.textContent, 'Submit')
          assert.equal(container.querySelectorAll('.formeo-pages-submit').length, 1)
          assert.equal(container.querySelector('.formeo-pages-nav'), null)
          assert.equal(container.querySelector('.formeo-pages-steps'), null)
          assert.equal(renderer.pageCount, 1)
          assert.equal(renderer.page, 0)
        })
      }

      test('with submit: true and heading: true, no heading is added: headings need 2+ pages', () => {
        render({ type: 'wizard', submit: true, heading: true }, onePage())
        assert.equal(container.querySelector('.formeo-pages-heading'), null)
      })

      test('without submit, a one-page form gets no actions bar either', () => {
        render({ type: 'wizard' }, onePage())
        assert.equal(container.querySelector('.formeo-pages-actions'), null)
        assert.equal(submitButton(), null)
      })

      test('re-rendering does not duplicate the Submit button', () => {
        const renderer = render({ type: 'wizard', submit: true }, onePage())
        renderer.render(onePage())
        assert.equal(container.querySelectorAll('.formeo-pages-submit').length, 1)
      })
    })
  })

  describe('page headings', () => {
    const headings = () => [...container.querySelectorAll('.formeo-pages-heading')]

    test('are left out by default', () => {
      render('wizard')
      assert.equal(headings().length, 0)
    })

    test('heading: true puts an <h2> with the page title first in each page', () => {
      render({ type: 'wizard', heading: true })
      assert.deepEqual(
        headings().map(h => [h.tagName, h.textContent]),
        [
          ['H2', 'About you'],
          ['H2', 'Page 2'],
        ]
      )
      pages().forEach((page, i) => {
        assert.equal(page.firstElementChild, headings()[i])
      })
    })

    test('a number from 2 to 6 picks the level, and labels.page names untitled pages', () => {
      render({ type: 'tabs', heading: 4, labels: { page: 'Seite {n}' } })
      assert.deepEqual(
        headings().map(h => [h.tagName, h.textContent]),
        [
          ['H4', 'About you'],
          ['H4', 'Seite 2'],
        ]
      )
    })

    test('titles are text, never markup', () => {
      const title = '<img src=x onerror="window.pwned = 1">'
      render({ type: 'wizard', heading: true }, buildPages([[field('a')], [field('b')]], [title]))
      assert.equal(headings()[0].textContent, title)
      assert.equal(container.querySelector('.formeo-pages-heading img'), null)
    })

    test('in a wizard, each page is a group labelled by its heading', () => {
      render({ type: 'wizard', heading: true })
      pages().forEach((page, i) => {
        assert.equal(page.getAttribute('role'), 'group')
        assert.equal(page.getAttribute('aria-labelledby'), headings()[i].id)
        assert.match(headings()[i].id, new RegExp(`^formeo-pages-\\d+-heading-${i + 1}$`))
      })
    })

    test('in tabs, pages stay labelled by their tab', () => {
      render({ type: 'tabs', heading: true })
      pages().forEach((page, i) => {
        assert.equal(page.getAttribute('role'), 'tabpanel')
        assert.equal(page.getAttribute('aria-labelledby'), tabs()[i].id)
      })
    })

    test('two forms on one page get their own heading ids', () => {
      const second = document.createElement('div')
      document.body.append(second)
      render({ type: 'wizard', heading: true })
      new FormeoRenderer({ renderContainer: second, pagination: { type: 'wizard', heading: true } }).render(twoPages())
      const ids = [...document.querySelectorAll('.formeo-pages-heading')].map(h => h.id)
      assert.equal(ids.length, 4)
      assert.equal(new Set(ids).size, 4)
    })
  })

  describe('keeping the page across render()', () => {
    const threePages = () => buildPages([[field('a')], [field('b')], [field('c')]], ['One', 'Two', 'Three'])

    test('render() keeps the page on show, without onPageChange or moving focus', () => {
      const calls = []
      const renderer = render('tabs', threePages(), { events: { onPageChange: ({ page }) => calls.push(page) } })
      renderer.page = 2
      calls.length = 0
      const focused = dom.window.document.activeElement
      renderer.render(threePages())
      assert.equal(renderer.page, 2)
      assert.deepEqual(hiddenPages(), [true, true, false])
      assert.equal(tabs()[2].getAttribute('aria-selected'), 'true')
      assert.deepEqual(calls, [])
      assert.equal(dom.window.document.activeElement, focused)
    })

    test('the kept page follows its stage when the stages are reordered', () => {
      const renderer = render('wizard', threePages())
      renderer.page = 1
      const data = threePages()
      const { 'p-2': second, ...rest } = data.stages
      data.stages = { ...rest, 'p-2': second }
      renderer.render(data)
      assert.equal(renderer.page, 2)
      assert.equal(container.querySelector('.formeo-pages-status').textContent, 'Two (3 of 3)')
    })

    test('starts on the first page when the kept stage is gone', () => {
      const renderer = render('wizard', threePages())
      renderer.page = 1
      const data = threePages()
      delete data.stages['p-2']
      renderer.render(data)
      assert.equal(renderer.page, 0)
    })

    test('starts on the first page for a different form', () => {
      const renderer = render('tabs', threePages())
      renderer.page = 1
      const other = threePages()
      other.stages = Object.fromEntries(
        Object.values(other.stages).map(stage => [`q${stage.id}`, { ...stage, id: `q${stage.id}` }])
      )
      renderer.render(other)
      assert.equal(renderer.page, 0)
    })

    test('getRenderedForm() keeps the page too', () => {
      const renderer = render('tabs', threePages())
      renderer.page = 1
      renderer.getRenderedForm(threePages())
      assert.equal(renderer.page, 1)
    })

    test('destroy() forgets the page', () => {
      const renderer = render('wizard', threePages())
      renderer.page = 2
      renderer.destroy()
      renderer.render(threePages())
      assert.equal(renderer.page, 0)
    })

    test('two renderers keep their own page', () => {
      const second = document.createElement('div')
      document.body.append(second)
      const a = render('tabs', threePages())
      const b = new FormeoRenderer({ renderContainer: second, pagination: 'tabs' })
      b.render(threePages())
      a.page = 2
      a.render(threePages())
      b.render(threePages())
      assert.equal(a.page, 2)
      assert.equal(b.page, 0)
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

    // a browser runs microtasks after each listener of a trusted click or keydown, before the validation
    // pass it triggers; jsdom has no such pass, so checkValidity() stands in for it after a microtask
    const reportedTriggers = {
      'a submit click': form => {
        const button = document.createElement('button')
        form.append(button)
        // stop jsdom's own synchronous submission
        form.addEventListener('click', event => event.preventDefault())
        button.click()
      },
      'Enter in an input': () => key(input('name'), 'Enter'),
    }
    for (const [trigger, run] of Object.entries(reportedTriggers)) {
      test(`${trigger} still counts as reported after a microtask, but not in a later task`, async () => {
        const renderer = render('tabs')
        const form = container.querySelector('form')
        run(form)
        await Promise.resolve()
        form.checkValidity()
        assert.equal(renderer.page, 1)
        renderer.page = 0
        await new Promise(resolve => setTimeout(resolve, 0))
        form.checkValidity()
        assert.equal(renderer.page, 0)
      })
    }

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

    test('onPageChange names the stages it moves between', () => {
      const calls = []
      const renderer = render('tabs', twoPages(), {
        events: { onPageChange: ({ stageId, previousStageId }) => calls.push([stageId, previousStageId]) },
      })
      tabs()[1].click()
      renderer.page = 0
      assert.deepEqual(calls, [
        ['p-2', 'p-1'],
        ['p-1', 'p-2'],
      ])
    })

    describe('page conditions (#122)', () => {
      /**
       * Adds a pair of conditions to stage `on`: `source` holding `value` skips `stageId`, anything else brings it back
       * @param {Object} data formData
       * @param {String} value
       * @param {String} stageId
       * @param {{on?: String, source?: String}} [where]
       * @return {Object} data
       */
      const skipWhen = (data, value, stageId, { on = 'p-1', source = 'a' } = {}) => {
        const clause = comparison => [
          { source: `fields.${source}`, sourceProperty: 'value', comparison, target: value },
        ]
        data.stages[on].conditions = [
          ...(data.stages[on].conditions ?? []),
          { if: clause('=='), then: [{ target: `stages.${stageId}`, targetProperty: 'isNotVisible' }] },
          { if: clause('!='), then: [{ target: `stages.${stageId}`, targetProperty: 'isVisible' }] },
        ]
        return data
      }
      // page 2 has a required field and one the author disabled
      const threePages = () =>
        buildPages(
          [[field('a')], [field('b', { required: true }), field('b2', { disabled: true })], [field('c')]],
          ['One', 'Two', 'Three']
        )
      const stage = id => [...container.querySelectorAll('.formeo-stage')].find(elem => elem.dataset.stageId === id)
      const skipped = () => pages().map(page => page.hasAttribute('data-skipped'))

      test('every stage names its stage id, in every mode', () => {
        for (const pagination of [undefined, 'tabs', 'wizard']) {
          render(pagination, threePages())
          assert.deepEqual(
            pages().map(page => page.dataset.stageId),
            ['p-1', 'p-2', 'p-3'],
            String(pagination)
          )
        }
      })

      test('without pagination, a skipped page disappears and its answers leave the submission', () => {
        const renderer = render(undefined, skipWhen(threePages(), 'skip', 'p-2'))
        input('b').value = 'kept'
        typeInto(input('a'), 'skip')

        assert.equal(stage('p-2').hidden, true)
        assert.deepEqual(skipped(), [false, true, false])
        assert.equal(input('b').disabled, true)
        assert.equal(input('b').hasAttribute('data-formeo-skip-disabled'), true)
        assert.equal(input('b').value, 'kept')
        assert.deepEqual(Object.keys(renderer.userData), ['a', 'c'])
        // empty the required field while it is skipped: it must not block
        input('b').value = ''
        assert.equal(container.querySelector('form').checkValidity(), true, 'a skipped required field never blocks')

        typeInto(input('a'), 'go')
        assert.equal(stage('p-2').hidden, false)
        assert.deepEqual(skipped(), [false, false, false])
        assert.equal(input('b').disabled, false)
        assert.equal(input('b').hasAttribute('data-formeo-skip-disabled'), false)
        assert.deepEqual(Object.keys(renderer.userData), ['a', 'b', 'c'])
        assert.equal(container.querySelector('form').checkValidity(), false, 'the required field blocks again')

        // a value typed before the skip is still there when the page comes back
        input('b').value = 'kept'
        typeInto(input('a'), 'skip')
        typeInto(input('a'), 'go')
        assert.equal(input('b').value, 'kept')
      })

      test('controls the author disabled stay disabled after the page comes back', () => {
        render(undefined, skipWhen(threePages(), 'skip', 'p-2'))
        typeInto(input('a'), 'skip')
        assert.equal(input('b2').hasAttribute('data-formeo-skip-disabled'), false)
        typeInto(input('a'), 'go')
        assert.equal(input('b2').disabled, true)
      })

      test('skipping or bringing back a page twice changes nothing more', () => {
        const renderer = render(undefined, threePages())
        renderer.setStageSkipped(stage('p-2'), true)
        renderer.setStageSkipped(stage('p-2'), true)
        assert.equal(stage('p-2').querySelectorAll('[data-formeo-skip-disabled]').length, 1)
        renderer.setStageSkipped(stage('p-2'), false)
        renderer.setStageSkipped(stage('p-2'), false)
        assert.equal(input('b').disabled, false)
        assert.equal(input('b2').disabled, true)
      })

      test('a condition can never skip the last page left in play', () => {
        const warn = mock.method(console, 'warn', () => {})
        try {
          for (const pagination of [undefined, 'wizard']) {
            warn.mock.resetCalls()
            // b on p-2 skips p-1, then p-2 itself: a skipped page's answers no longer drive other pages, so the
            // source must stay in play for the second skip to reach the guard
            const data = buildPages([[field('a')], [field('b')]])
            skipWhen(data, 'skip', 'p-1', { source: 'b' })
            skipWhen(data, 'skip', 'p-2', { on: 'p-2', source: 'b' })
            render(pagination, data)
            typeInto(input('b'), 'skip')
            assert.deepEqual(skipped(), [true, false], String(pagination))
            assert.equal(warn.mock.callCount(), 1, String(pagination))
          }
        } finally {
          warn.mock.restore()
        }
      })

      test('a stage target only takes isVisible or isNotVisible, and never hides the form', () => {
        const data = threePages()
        data.stages['p-1'].conditions = [
          {
            if: [{ source: 'fields.a', sourceProperty: 'value', comparison: '==', target: 'x' }],
            then: [
              { target: 'stages.p-2', targetProperty: 'value', assignment: '=', value: 'y' },
              { target: 'stages.p-2', targetProperty: 'isChecked' },
            ],
          },
        ]
        render(undefined, data)
        typeInto(input('a'), 'x')
        assert.equal(container.querySelector('form').hidden, false)
        assert.equal(stage('p-2').hidden, false)
        assert.deepEqual(skipped(), [false, false, false])
      })

      test('a stage id that is not a valid selector still resolves', () => {
        const data = threePages()
        data.stages = {
          'p-1': data.stages['p-1'],
          'p:2': { ...data.stages['p-2'], id: 'p:2' },
          'p-3': data.stages['p-3'],
        }
        render(undefined, skipWhen(data, 'skip', 'p:2'))
        typeInto(input('a'), 'skip')
        assert.deepEqual(skipped(), [false, true, false])
      })

      test('two forms from the same formData skip their own pages', () => {
        const second = document.createElement('div')
        document.body.append(second)
        render('wizard', skipWhen(threePages(), 'skip', 'p-2'))
        new FormeoRenderer({ renderContainer: second, pagination: 'wizard' }).render(
          skipWhen(threePages(), 'skip', 'p-2')
        )
        typeInto(input('a'), 'skip')
        assert.deepEqual(skipped(), [false, true, false])
        const otherStage = [...second.querySelectorAll('.formeo-stage')][1]
        assert.equal(otherStage.hasAttribute('data-skipped'), false)
      })

      // p-1: a skips p-2 when 'skip'; p-2: b == 'yes' shows p-3, anything else skips it
      const vatPages = () => {
        const data = buildPages([[field('a')], [field('b')], [field('c')]], ['One', 'Company', 'VAT'])
        skipWhen(data, 'skip', 'p-2')
        const clause = comparison => [{ source: 'fields.b', sourceProperty: 'value', comparison, target: 'yes' }]
        data.stages['p-2'].conditions = [
          { if: clause('=='), then: [{ target: 'stages.p-3', targetProperty: 'isVisible' }] },
          { if: clause('!='), then: [{ target: 'stages.p-3', targetProperty: 'isNotVisible' }] },
        ]
        return data
      }

      test("a skipped page's answers read as unanswered (#122)", () => {
        const renderer = render('wizard', vatPages())
        typeInto(input('b'), 'yes')
        assert.deepEqual(skipped(), [false, false, false])
        typeInto(input('a'), 'skip')
        assert.deepEqual(skipped(), [false, true, true])
        assert.equal(
          renderer.evaluateCondition({ source: 'fields.b', sourceProperty: 'value', comparison: '==', target: 'yes' }),
          false
        )
        assert.equal(renderer.getComponentProperty('fields.b', 'isVisible'), false)
      })

      test('its answers count again when the page comes back', () => {
        render('wizard', vatPages())
        typeInto(input('b'), 'yes')
        typeInto(input('a'), 'skip')
        typeInto(input('a'), '')
        assert.deepEqual(skipped(), [false, false, false])
      })

      test('skipping a page re-runs only the conditions that read it', () => {
        const data = buildPages([[field('a'), field('d')], [field('b')], [field('c')]])
        skipWhen(data, 'skip', 'p-2')
        // an unrelated value action on p-1: d == 'x' fills c with 'auto'; it still matches when p-2 comes back
        data.stages['p-1'].conditions.push({
          if: [{ source: 'fields.d', sourceProperty: 'value', comparison: '==', target: 'x' }],
          then: [{ target: 'fields.c', targetProperty: 'value', assignment: '=', value: 'auto' }],
        })
        render('wizard', data)
        typeInto(input('d'), 'x')
        typeInto(input('c'), 'mine')
        typeInto(input('a'), 'skip')
        typeInto(input('a'), '') // p-2 comes back: re-running d's condition would overwrite the user's 'mine'
        assert.equal(input('c').value, 'mine')
      })

      test('a condition showing a page and the next one neither undoes its skip nor keeps the next page in play', () => {
        // p-1: a skips p-2; p-2: b == 'yes' shows p-2 and p-3 in one condition, b != 'yes' skips p-3
        const data = skipWhen(buildPages([[field('a')], [field('b')], [field('c')]]), 'skip', 'p-2')
        const clause = comparison => [{ source: 'fields.b', sourceProperty: 'value', comparison, target: 'yes' }]
        data.stages['p-2'].conditions = [
          {
            if: clause('=='),
            then: [
              { target: 'stages.p-2', targetProperty: 'isVisible' },
              { target: 'stages.p-3', targetProperty: 'isVisible' },
            ],
          },
          { if: clause('!='), then: [{ target: 'stages.p-3', targetProperty: 'isNotVisible' }] },
        ]
        render('wizard', data)
        typeInto(input('b'), 'yes')
        assert.deepEqual(skipped(), [false, false, false])
        typeInto(input('a'), 'skip')
        assert.deepEqual(skipped(), [false, true, true])
      })

      test("an action on another page reads a skipped page as unanswered, even beside that page's own action", () => {
        // p-1: a skips p-2, d is just another answer; p-2: b == 'yes' and d == 'go' skips p-2 and shows p-3 in ONE
        // condition, b != 'yes' skips p-3
        const data = skipWhen(buildPages([[field('a'), field('d')], [field('b')], [field('c')]]), 'skip', 'p-2')
        const b = comparison => ({ source: 'fields.b', sourceProperty: 'value', comparison, target: 'yes' })
        data.stages['p-2'].conditions = [
          {
            if: [
              b('=='),
              { source: 'fields.d', sourceProperty: 'value', comparison: '==', target: 'go', logical: '&&' },
            ],
            then: [
              { target: 'stages.p-2', targetProperty: 'isNotVisible' },
              { target: 'stages.p-3', targetProperty: 'isVisible' },
            ],
          },
          { if: [b('!=')], then: [{ target: 'stages.p-3', targetProperty: 'isNotVisible' }] },
        ]
        render('wizard', data)
        typeInto(input('b'), 'yes')
        typeInto(input('a'), 'skip')
        assert.deepEqual(skipped(), [false, true, true])
        // d re-runs the condition while p-2 is skipped: skipping p-2 again reads b as it is, showing p-3 must not
        typeInto(input('d'), 'go')
        assert.deepEqual(skipped(), [false, true, true])
      })

      test('a condition that also acts on its own page still re-runs for its other pages when that page is skipped', () => {
        // p-1: a skips p-2; p-2: b == 'yes' shows p-3, b != 'yes' skips p-3 and keeps p-2 in ONE condition
        const data = skipWhen(buildPages([[field('a')], [field('b')], [field('c')]]), 'skip', 'p-2')
        const clause = comparison => [{ source: 'fields.b', sourceProperty: 'value', comparison, target: 'yes' }]
        data.stages['p-2'].conditions = [
          { if: clause('=='), then: [{ target: 'stages.p-3', targetProperty: 'isVisible' }] },
          {
            if: clause('!='),
            then: [
              { target: 'stages.p-3', targetProperty: 'isNotVisible' },
              { target: 'stages.p-2', targetProperty: 'isVisible' },
            ],
          },
        ]
        render('wizard', data)
        typeInto(input('b'), 'yes')
        typeInto(input('a'), 'skip')
        // re-run for p-3 only: its p-2 action is left alone, so it doesn't undo the skip
        assert.deepEqual(skipped(), [false, true, true])
        typeInto(input('a'), '')
        assert.deepEqual(skipped(), [false, false, false])
      })

      test('a page skipped by its own answer stays skipped, while other pages read that answer as unanswered', () => {
        // p-2 skips itself when b says so; p-1 shows p-3 only when b == 'skip'
        const data = skipWhen(buildPages([[field('a')], [field('b')], [field('c')]]), 'skip', 'p-2', {
          on: 'p-2',
          source: 'b',
        })
        const clause = comparison => [{ source: 'fields.b', sourceProperty: 'value', comparison, target: 'skip' }]
        data.stages['p-1'].conditions = [
          { if: clause('=='), then: [{ target: 'stages.p-3', targetProperty: 'isVisible' }] },
          { if: clause('!='), then: [{ target: 'stages.p-3', targetProperty: 'isNotVisible' }] },
        ]
        const renderer = render('wizard', data)
        assert.deepEqual(skipped(), [false, false, true])
        typeInto(input('b'), 'skip')
        // p-2's own conditions read b as it is, so its "bring back" condition doesn't bounce it straight back
        assert.deepEqual(skipped(), [false, true, true])
        assert.equal(renderer.getComponentProperty('fields.b', 'value'), '')
        assert.equal(renderer.getComponentProperty('fields.b', 'value', [stage('p-2')]), 'skip')
      })

      describe('navigation', () => {
        const next = () => container.querySelector('.formeo-pages-next')
        const previous = () => container.querySelector('.formeo-pages-previous')
        const steps = () => [...container.querySelectorAll('.formeo-pages-step')]
        const status = () => container.querySelector('.formeo-pages-status').textContent

        test('Next, Previous and Enter jump over a skipped page; its step and the status count leave it out', () => {
          const renderer = render('wizard', skipWhen(threePages(), 'skip', 'p-2'))
          typeInto(input('a'), 'skip')
          assert.deepEqual(
            steps().map(step => step.hidden),
            [false, true, false]
          )
          assert.equal(status(), 'One (1 of 2)')

          next().click()
          assert.equal(renderer.page, 2)
          assert.equal(status(), 'Three (2 of 2)')
          assert.equal(next().hidden, true)

          previous().click()
          assert.equal(renderer.page, 0)
          assert.equal(previous().disabled, true)

          key(input('a'), 'Enter')
          assert.equal(renderer.page, 2)
        })

        test('with submit, Submit shows on the last page in play', () => {
          const renderer = render({ type: 'wizard', submit: true }, skipWhen(threePages(), 'skip', 'p-3'))
          typeInto(input('a'), 'skip')
          input('b').value = 'filled'
          next().click()
          assert.equal(renderer.page, 1)
          assert.equal(next().hidden, true)
          assert.equal(container.querySelector('.formeo-pages-submit').hidden, false)
        })

        test('a forward step jump validates only the pages in play', () => {
          const renderer = render('wizard', skipWhen(threePages(), 'skip', 'p-2'))
          typeInto(input('a'), 'skip')
          // page 2's required field is empty, but the page is skipped
          steps()[2].querySelector('button').click()
          assert.equal(renderer.page, 2)
        })

        test('a skipped tab is hidden, and arrow keys, Home and End pass over it', () => {
          const renderer = render('tabs', skipWhen(threePages(), 'skip', 'p-2'))
          typeInto(input('a'), 'skip')
          assert.deepEqual(
            tabs().map(tab => tab.hidden),
            [false, true, false]
          )
          key(tabs()[0], 'ArrowRight')
          assert.equal(renderer.page, 2)
          assert.equal(dom.window.document.activeElement, tabs()[2])
          key(tabs()[2], 'ArrowRight')
          assert.equal(renderer.page, 0, 'wraps past the skipped tab')
          key(tabs()[0], 'ArrowLeft')
          assert.equal(renderer.page, 2)
          key(tabs()[2], 'Home')
          assert.equal(renderer.page, 0)
          key(tabs()[0], 'End')
          assert.equal(renderer.page, 2)
        })

        test('in a right-to-left form the swapped arrows pass over a skipped tab too', () => {
          container.dir = 'rtl'
          const renderer = render('tabs', skipWhen(threePages(), 'skip', 'p-2'))
          typeInto(input('a'), 'skip')
          key(tabs()[0], 'ArrowLeft')
          assert.equal(renderer.page, 2)
          key(tabs()[2], 'ArrowRight')
          assert.equal(renderer.page, 0)
        })

        test('a programmatic click on the hidden Next/Previous is a no-op at the ends', () => {
          const renderer = render('wizard', skipWhen(threePages(), 'skip', 'p-2'))
          typeInto(input('a'), 'skip')
          assert.equal(renderer.page, 0, 'first page in play')
          // Previous is disabled here, but nothing stops a programmatic click on it
          previous().click()
          assert.equal(renderer.page, 0)

          renderer.page = 2
          assert.equal(renderer.page, 2, 'last page in play')
          // Next is hidden here; clicking it must not fall through to goTo(undefined) and jump to page 0
          next().click()
          assert.equal(renderer.page, 2)
        })
      })

      describe('the page on show', () => {
        const events = calls => ({
          events: {
            onPageChange: ({ page, previousPage, stageId, previousStageId }) =>
              calls.push({ page, previousPage, stageId, previousStageId }),
          },
        })

        test('when it is skipped, the next page in play takes its place, with onPageChange and focus', () => {
          const calls = []
          // page 2 skips itself when its own field says so
          const data = skipWhen(threePages(), 'skip', 'p-2', { on: 'p-2', source: 'b' })
          const renderer = render('wizard', data, events(calls))
          renderer.page = 1
          calls.length = 0
          input('b').focus()
          typeInto(input('b'), 'skip')
          assert.equal(renderer.page, 2)
          assert.deepEqual(calls, [{ page: 2, previousPage: 1, stageId: 'p-3', previousStageId: 'p-2' }])
          assert.equal(dom.window.document.activeElement, input('c'))
        })

        test('at the end, the previous page takes its place, and focus from elsewhere stays put', () => {
          const data = skipWhen(threePages(), 'skip', 'p-3', { on: 'p-3', source: 'c' })
          const renderer = render('tabs', data)
          renderer.page = 2
          const outside = document.createElement('button')
          document.body.append(outside)
          outside.focus()
          typeInto(input('c'), 'skip')
          assert.equal(renderer.page, 1)
          assert.equal(dom.window.document.activeElement, outside)
        })

        test('a skipped first page starts the form on the next page in play, without onPageChange', () => {
          const calls = []
          // c is empty on render, so page 1 is skipped from the start
          const renderer = render('wizard', skipWhen(threePages(), '', 'p-1', { source: 'c' }), events(calls))
          assert.equal(renderer.page, 1)
          assert.deepEqual(hiddenPages(), [true, false, true])
          assert.deepEqual(calls, [])
        })

        test('a kept page that the new data skips gives way to the next page in play, without onPageChange', () => {
          const calls = []
          const renderer = render('tabs', threePages(), events(calls))
          renderer.page = 1
          calls.length = 0
          renderer.render(skipWhen(threePages(), '', 'p-2', { source: 'c' }))
          assert.equal(renderer.page, 2)
          assert.deepEqual(calls, [])
        })

        test('renderer.page on a skipped page shows the next page in play, or the previous one at the end', () => {
          let renderer = render('tabs', skipWhen(threePages(), 'skip', 'p-2'))
          typeInto(input('a'), 'skip')
          renderer.page = 1
          assert.equal(renderer.page, 2)

          renderer = render('tabs', skipWhen(threePages(), 'skip', 'p-3'))
          typeInto(input('a'), 'skip')
          renderer.page = 2
          assert.equal(renderer.page, 1)
        })
      })

      describe('without pagination, a self-skip keeps focus', () => {
        test('focus on the skipped page moves to the next page in play', () => {
          // page 2 skips itself when its own field says so, same as the paginated case above
          const data = skipWhen(threePages(), 'skip', 'p-2', { on: 'p-2', source: 'b' })
          render(undefined, data)
          input('b').focus()
          typeInto(input('b'), 'skip')
          assert.equal(dom.window.document.activeElement, input('c'))
        })

        test('focus elsewhere is left alone', () => {
          const data = skipWhen(threePages(), 'skip', 'p-2', { on: 'p-2', source: 'b' })
          render(undefined, data)
          const outside = document.createElement('button')
          document.body.append(outside)
          outside.focus()
          typeInto(input('b'), 'skip')
          assert.equal(dom.window.document.activeElement, outside)
        })
      })
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

  test('renderer.render() destroys the previous pager before replacing the form', () => {
    const live = trackDocumentListeners()
    const renderer = render('wizard')
    const initialListeners = count(live)
    assert.ok(initialListeners > 0, 'paginate() listens on the document')
    renderer.render(twoPages())
    assert.equal(count(live), initialListeners)
    renderer.destroy()
    assert.equal(count(live), 0)
  })

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
