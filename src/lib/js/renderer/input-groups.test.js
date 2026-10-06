import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'
import { cloneNumber, groupNamesOf } from './input-groups.js'

const GLOBALS = ['document', 'window', 'Element', 'HTMLElement', 'HTMLFormElement', 'Node', 'FormData']

/** One input-group row holding the given fields */
const groupForm = (fields, rowConfig = {}) => ({
  id: 'group-form',
  stages: { 's-1': { id: 's-1', config: {}, children: ['r-1'] } },
  rows: { 'r-1': { id: 'r-1', config: { inputGroup: true, legend: 'Contacts', ...rowConfig }, children: ['c-1'] } },
  columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: Object.keys(fields) } },
  fields,
})

const options = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
]
const text = (id, attrs = {}) => ({
  [id]: { id, tag: 'input', attrs: { type: 'text', ...attrs }, config: { label: `Text ${id}` } },
})
const radios = (id, attrs = {}) => ({
  [id]: { id, tag: 'input', attrs: { type: 'radio', ...attrs }, config: { label: `Radio ${id}` }, options },
})
const checkboxes = (id, attrs = {}) => ({
  [id]: { id, tag: 'input', attrs: { type: 'checkbox', ...attrs }, config: { label: `Boxes ${id}` }, options },
})
const multiSelect = id => ({
  [id]: { id, tag: 'select', attrs: { multiple: true, name: id }, config: { label: `Select ${id}` }, options },
})
const singleSelect = id => ({
  [id]: { id, tag: 'select', attrs: { name: id }, config: { label: `Choose ${id}` }, options },
})
const textarea = id => ({ [id]: { id, tag: 'textarea', attrs: {}, config: { label: `Area ${id}` } } })

describe('input groups (#349 phase 3)', () => {
  let window
  let container
  const nativeEvent = global.Event

  beforeEach(() => {
    const jsdom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    })
    window = jsdom.window
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

  const render = (data, opts = {}) => {
    const renderer = new FormeoRenderer({ renderContainer: container, ...opts })
    renderer.render(data)
    return renderer
  }
  const $ = selector => container.querySelector(selector)
  const $$ = selector => [...container.querySelectorAll(selector)]
  const add = () => $('.add-input-group').click()
  const clones = () => $$('[data-clone-of]').filter(elem => elem.parentElement.classList.contains('f-input-group-wrap'))
  const removeOf = clone => clone.querySelector(':scope > .remove-input-group')
  const namesOf = root => [...root.querySelectorAll('input[name], select[name], textarea[name]')].map(elem => elem.name)
  const nextFrames = () => new Promise(resolve => setTimeout(resolve, 50))

  test('the Add button is translated text; each remove button has an accessible name', () => {
    render(groupForm(text('t1', { name: 'email' })))
    assert.equal($('.add-input-group').textContent, 'Add +')
    add()
    add()
    assert.deepEqual(
      clones().map(clone => removeOf(clone).getAttribute('aria-label')),
      ['Remove group 2', 'Remove group 3']
    )
  })

  test('a click on the remove icon removes the whole group', () => {
    render(groupForm(text('t1', { name: 'email' })))
    add()
    const button = removeOf(clones()[0])
    const icon = button.querySelector('svg') ?? button.firstChild
    icon.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    assert.equal(clones().length, 0)
  })

  test('clones are named per control kind', () => {
    render(
      groupForm({
        ...text('t1', { name: 'email' }),
        ...text('t2'),
        ...textarea('a1'),
        ...radios('r1', { name: 'pick' }),
        ...checkboxes('k1'),
        ...multiSelect('m1'),
      })
    )
    add()
    const clone = clones()[0]
    const names = namesOf(clone)
    const original = namesOf($('#f-r-1'))
    assert.ok(names.includes('email'), 'a named text input keeps its name')
    assert.ok(names.includes(original.find(name => name.startsWith('f-t2'))), 'an unnamed text input keeps its name')
    assert.ok(names.includes(original.find(name => name.startsWith('f-a1'))), 'an unnamed textarea keeps its name')
    assert.equal(names.filter(name => name === 'pick-1').length, 2, 'a radio group gets <name>-1')
    assert.equal(names.filter(name => name === 'f-k1-1[]').length, 2, 'a checkbox group gets <id>-1[]')
    assert.ok(names.includes('m1-1'), 'a multiple select gets <name>-1')
  })

  test('a matrix in a clone gets base <name>-<n>', () => {
    const table = {
      rowHeaders: true,
      columns: [{ label: '' }, { label: 'Good', value: 'good', input: 'radio' }],
      rows: [{ value: 'speed', cells: ['Speed', ''] }],
    }
    render(
      groupForm({
        m1: { id: 'm1', tag: 'table', attrs: { className: '', name: 'visit' }, config: { label: 'Visit' }, table },
      })
    )
    add()
    assert.deepEqual(namesOf(clones()[0]), ['visit-1[speed]'])
  })

  test('removing a middle clone renumbers the later ones and their remove buttons', () => {
    render(groupForm(radios('r1', { name: 'pick' })))
    add()
    add()
    add()
    clones()[2].querySelector('input[value="two"]').checked = true
    removeOf(clones()[0]).click()
    assert.deepEqual(
      clones().map(clone => [...new Set(namesOf(clone))]),
      [['pick-1'], ['pick-2']]
    )
    assert.equal(clones()[1].querySelector('input[value="two"]').checked, true)
    assert.deepEqual(
      clones().map(clone => removeOf(clone).getAttribute('aria-label')),
      ['Remove group 2', 'Remove group 3']
    )
  })

  test('focus and announcements after add and remove', async () => {
    render(groupForm(text('t1', { name: 'email' })))
    add()
    assert.equal(window.document.activeElement, clones()[0].querySelector('input'))
    await nextFrames()
    assert.equal($('.f-input-group-status').textContent, 'Group 2 added')
    add()
    removeOf(clones()[0]).click()
    assert.equal(window.document.activeElement, removeOf(clones()[0]), 'the button now at that index')
    removeOf(clones()[0]).click()
    assert.equal(window.document.activeElement, $('.add-input-group'), 'no clone left')
    await nextFrames()
    assert.equal($('.f-input-group-status').textContent, 'Group 2 removed')
  })

  test('add and remove fire formeo:rowschange to onChange', () => {
    const events = []
    render(groupForm(text('t1', { name: 'email' })), { events: { onChange: ({ event }) => events.push(event) } })
    add()
    removeOf(clones()[0]).click()
    assert.deepEqual(
      events.filter(event => event.type === 'formeo:rowschange').map(event => event.detail),
      [
        { action: 'add', index: 1 },
        { action: 'remove', index: 1 },
      ]
    )
  })

  test('a field whose children are plain DOM configs clones without throwing', () => {
    const fields = {
      h1: {
        id: 'h1',
        tag: 'div',
        config: { label: 'Note' },
        children: [{ tag: 'span', textContent: 'note' }, 'plain text'],
      },
      ...text('t1', { name: 'email' }),
    }
    render(groupForm(fields))
    assert.doesNotThrow(add)
    assert.ok([...clones()[0].querySelectorAll('span')].some(span => span.textContent === 'note'))
  })

  test('userFormData labels clone answers with the original labels', () => {
    const renderer = render(
      groupForm({ ...text('t1', { name: 'email' }), ...radios('r1', { name: 'pick' }), ...checkboxes('k1') })
    )
    add()
    const clone = clones()[0]
    clone.querySelector('input[name="pick-1"][value="one"]').checked = true
    clone.querySelector('input[name="f-k1-1[]"][value="two"]').checked = true
    const labels = Object.fromEntries(renderer.userFormData.map(({ key, label }) => [key, label]))
    assert.equal(labels.email, 'Text t1')
    assert.equal(labels['pick-1'], 'Radio r1')
    assert.equal(labels['f-k1-1'], 'Boxes k1')
  })

  test('userFormData labels a clone matrix answer', () => {
    const table = {
      caption: 'Visit',
      rowHeaders: true,
      columns: [{ label: '' }, { label: 'Good', value: 'good', input: 'radio' }],
      rows: [{ value: 'speed', cells: ['Speed', ''] }],
    }
    const renderer = render(
      groupForm({
        m1: { id: 'm1', tag: 'table', attrs: { className: '', name: 'visit' }, config: { label: 'Visit' }, table },
      })
    )
    add()
    clones()[0].querySelector('input').checked = true
    const entry = renderer.userFormData.find(({ key }) => key === 'visit-1[speed]')
    assert.equal(entry.label, 'Visit: Speed')
  })

  test('labels follow renumbering', () => {
    const renderer = render(groupForm(radios('r1', { name: 'pick' })))
    add()
    add()
    removeOf(clones()[0]).click()
    clones()[0].querySelector('input').checked = true
    const entry = renderer.userFormData.find(({ key }) => key === 'pick-1')
    assert.equal(entry.label, 'Radio r1')
  })

  test('groupNamesOf separates single-value names from grouped bases; cloneNumber reads -n keys', () => {
    const renderer = render(
      groupForm({
        ...text('t1', { name: 'email' }),
        ...radios('r1', { name: 'pick' }),
        ...checkboxes('k1', { name: 'likes[]' }),
        ...multiSelect('m1'),
        ...textarea('a1'),
      })
    )
    const { singles, bases } = groupNamesOf(renderer, 'f-r-1')
    assert.ok(singles.has('email'))
    assert.equal(singles.size, 2, 'the text input and the textarea')
    assert.deepEqual([...bases].sort(), ['likes', 'm1', 'pick'])
    assert.equal(cloneNumber('pick-3', 'pick'), 3)
    assert.equal(cloneNumber('likes-12[]', 'likes'), 12)
    assert.equal(cloneNumber('visit-2[speed][good]', 'visit'), 2)
    assert.equal(cloneNumber('pick-2-other', 'pick'), 2)
    assert.equal(cloneNumber('pick', 'pick'), 0)
    assert.equal(cloneNumber('pick-0', 'pick'), 0)
    assert.equal(cloneNumber('pick-2x', 'pick'), 0)
    assert.equal(cloneNumber('pickle-2', 'pick'), 0)
  })

  test('the setter fills same-named text inputs in order and leaves the rest', () => {
    const renderer = render(groupForm(text('t1', { name: 'email' })))
    add()
    add()
    renderer.userData = { email: ['a@x', 'b@x'] }
    assert.deepEqual(
      $$('input[name="email"]').map(input => input.value),
      ['a@x', 'b@x', '']
    )
    renderer.userData = { email: 'only@x' }
    assert.equal($$('input[name="email"]')[0].value, 'only@x')
    assert.equal($$('input[name="email"]')[1].value, 'b@x')
  })

  test('the setter creates copies for array answers and for -n names, quietly', async () => {
    const events = []
    const changes = []
    const renderer = render(groupForm({ ...text('t1', { name: 'email' }), ...radios('r1', { name: 'pick' }) }), {
      events: { onChange: ({ event }) => changes.push(event.type) },
    })
    $('form').addEventListener('formeo:rowschange', event => events.push(event))
    const before = window.document.activeElement
    renderer.userData = { email: ['a', 'b'], 'pick-3': 'two' }
    await nextFrames()
    assert.equal(clones().length, 3)
    assert.equal(clones()[2].querySelector('input[name="pick-3"][value="two"]').checked, true)
    assert.deepEqual(
      $$('input[name="email"]').map(input => input.value),
      ['a', 'b', '', '']
    )
    assert.deepEqual(events, [], 'no formeo:rowschange')
    assert.equal(changes.includes('formeo:rowschange'), false, 'no onChange for rowschange')
    assert.equal(changes.length, 0, 'no onChange at all')
    assert.equal(window.document.activeElement, before, 'focus unchanged')
    assert.equal(
      clones().some(c => c.contains(window.document.activeElement)),
      false
    )
    assert.equal($('.f-input-group-status').textContent, '', 'no announcement')
  })

  const kitchenSink = () => ({
    ...text('t1', { name: 'email' }),
    ...text('t2'),
    ...textarea('a1'),
    ...radios('r1', { name: 'pick' }),
    ...checkboxes('k1'),
    ...multiSelect('m1'),
    ...checkboxes('k2', { name: 'likes[]' }),
    ...singleSelect('s1'),
    m2: {
      id: 'm2',
      tag: 'table',
      attrs: { className: '', name: 'visit' },
      config: { label: 'Visit' },
      table: {
        rowHeaders: true,
        columns: [{ label: '' }, { label: 'Good', value: 'good', input: 'radio' }],
        rows: [{ value: 'speed', cells: ['Speed', ''] }],
      },
    },
  })

  // answers every control of every group, differently per group, so a swapped number shows up
  const answerAll = () => {
    const groups = [window.document.getElementById('f-r-1'), ...clones()]
    groups.forEach((group, g) => {
      for (const input of group.querySelectorAll('input[type="text"], textarea')) {
        input.value = `${g}-${input.name.slice(-6)}`
      }
      for (const sel of group.querySelectorAll('select:not([multiple])')) {
        sel.selectedIndex = g % 2
      }
      for (const sel of group.querySelectorAll('select[multiple]')) {
        sel.options[g % 2].selected = true
      }
      for (const radio of group.querySelectorAll('input[type="radio"]')) {
        radio.checked = radio.value === 'good' ? g !== 1 : radio.value === (g % 2 ? 'one' : 'two')
      }
      for (const box of group.querySelectorAll('input[type="checkbox"]')) {
        box.checked = box.value === (g % 2 ? 'two' : 'one')
      }
    })
  }

  test('every control kind round-trips through a fresh render', () => {
    const first = render(groupForm(kitchenSink()))
    add()
    add()
    answerAll()
    const saved = first.userData
    assert.ok(Object.keys(saved).some(key => key.startsWith('likes-2')))
    assert.ok(Object.keys(saved).some(key => key.includes('visit-2[speed]')))

    const fresh = render(groupForm(kitchenSink()))
    fresh.userData = saved
    assert.equal(clones().length, 2)
    assert.deepEqual(fresh.userData, saved)
  })

  test('a round trip after removing a middle clone keeps the renumbered names', () => {
    const first = render(groupForm(kitchenSink()))
    add()
    add()
    add()
    removeOf(clones()[0]).click()
    assert.equal(clones().length, 2)
    answerAll()
    const saved = first.userData
    const keys = Object.keys(saved)
    assert.ok(
      keys.some(key => key.startsWith('likes-2')),
      'checkbox group renumbered'
    )
    assert.ok(
      keys.some(key => key.includes('visit-2[speed]')),
      'matrix renumbered'
    )
    assert.equal(
      keys.some(key => key.includes('-3')),
      false,
      'no stale number'
    )

    const fresh = render(groupForm(kitchenSink()))
    fresh.userData = saved
    assert.equal(clones().length, 2)
    assert.deepEqual(fresh.userData, saved)
  })

  test('a huge -n stops at the setter limit, warns, and stays linear', t => {
    const warn = t.mock.method(console, 'warn', () => {})
    const renderer = render(groupForm(radios('r1', { name: 'pick' })))
    const start = Date.now()
    renderer.userData = { 'pick-99999': 'one' }
    const ms = Date.now() - start
    assert.equal(clones().length, 500)
    assert.ok(warn.mock.calls.some(({ arguments: [message] }) => message.includes('pick-99999')))
    assert.ok(ms < 2000, `took ${ms}ms`)
  })

  describe('a repeating table inside a clone renders but does not repeat (spec: not supported)', () => {
    const repeating = () => ({
      o1: {
        id: 'o1',
        tag: 'table',
        attrs: { className: '', name: 'order' },
        config: { label: 'Order' },
        table: {
          headerRow: true,
          repeat: { min: 1, max: 3 },
          columns: [
            { label: 'Item', value: 'item' },
            { label: 'Qty', value: 'qty', input: 'text' },
          ],
          rows: [{ cells: ['Item', ''] }],
        },
      },
    })
    const bodyRows = root => root.querySelectorAll('.f-table-repeat tbody tr').length

    test('its Add and remove buttons do nothing, while the original still repeats', () => {
      const events = []
      render(groupForm(repeating()), { events: { onChange: ({ event }) => events.push(event.type) } })
      add()
      events.length = 0
      const clone = clones()[0]
      assert.deepEqual(namesOf(clone), ['order-1[0][qty]'])
      clone.querySelector('.f-table-add-row').click()
      assert.equal(bodyRows(clone), 1, 'Add does nothing')
      clone.querySelector('.f-table-remove-row').disabled = false
      clone.querySelector('.f-table-remove-row').click()
      assert.equal(bodyRows(clone), 1, 'remove does nothing')
      assert.deepEqual(events, [], 'no formeo:rowschange')
      $('#f-r-1 .f-table-add-row').click()
      assert.equal(bodyRows($('#f-r-1')), 2, 'the original table still adds rows')
    })

    test('the userData setter does not grow it', t => {
      const warn = t.mock.method(console, 'warn', () => {})
      const renderer = render(groupForm(repeating()))
      add()
      renderer.userData = { 'order-1[2][qty]': '3' }
      assert.equal(bodyRows(clones()[0]), 1)
      assert.ok(warn.mock.calls.some(({ arguments: [message] }) => message.includes('order-1[2][qty]')))
    })
  })
})
