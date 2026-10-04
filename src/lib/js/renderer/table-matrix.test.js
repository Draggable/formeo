import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { JSDOM } from 'jsdom'
import FormeoRenderer from './index.js'

const GLOBALS = ['document', 'window', 'Element', 'HTMLElement', 'HTMLFormElement', 'Node', 'FormData']

/** One stage per entry; each stage holds one row and one column with those fields */
const pagesOf = (...pages) => {
  const data = { id: 'matrix-form', stages: {}, rows: {}, columns: {}, fields: {} }
  pages.forEach((fields, i) => {
    const n = i + 1
    data.stages[`p-${n}`] = { id: `p-${n}`, config: {}, children: [`r-${n}`] }
    data.rows[`r-${n}`] = { id: `r-${n}`, config: {}, children: [`c-${n}`] }
    data.columns[`c-${n}`] = { id: `c-${n}`, config: { width: '100%' }, children: Object.keys(fields) }
    Object.assign(data.fields, fields)
  })
  return data
}

const mixed = () => ({
  caption: 'Visit',
  headerRow: true,
  rowHeaders: true,
  columns: [
    { label: '' },
    { label: 'Poor', value: 'poor', input: 'radio' },
    { label: 'Good', value: 'good', input: 'radio' },
    { label: 'Comment', value: 'comment', input: 'text' },
    { label: 'Wrap', value: 'wrap', input: 'checkbox' },
  ],
  rows: [
    { value: 'speed', required: true, cells: ['Speed', '', '', '', ''] },
    { value: 'price', cells: ['Price', '', '', '', ''] },
  ],
})

const matrixField = (id, table = mixed(), extra = {}) => ({
  [id]: {
    id,
    tag: 'table',
    attrs: { className: '' },
    config: { label: 'Survey', hideLabel: true, controlId: 'matrix' },
    table,
    ...extra,
  },
})

describe('matrix answers (#349 phase 2)', () => {
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
  const check = selector => {
    const input = $(selector)
    input.checked = true
    input.dispatchEvent(new window.Event('change', { bubbles: true }))
  }
  const type = (selector, value) => {
    const input = $(selector)
    input.value = value
    input.dispatchEvent(new window.Event('input', { bubbles: true }))
  }
  const firstInvalid = () => [...$('form').elements].find(el => el.willValidate && !el.validity.valid)
  const nextFrames = () => new Promise(resolve => setTimeout(resolve, 50))

  test('userData has a key per radio row and per checkbox or text cell', () => {
    const renderer = render(pagesOf(matrixField('m1')))
    assert.deepEqual(renderer.userData, { 'f-m1[speed][comment]': '', 'f-m1[price][comment]': '' })
    check('#f-m1-0-2')
    type('#f-m1-0-3', 'fast')
    check('#f-m1-1-4')
    assert.deepEqual(renderer.userData, {
      'f-m1[speed]': 'good',
      'f-m1[speed][comment]': 'fast',
      'f-m1[price][comment]': '',
      'f-m1[price][wrap]': 'wrap',
    })
  })

  test('a named matrix keys its answers by attrs.name', () => {
    const renderer = render(pagesOf(matrixField('m1', mixed(), { attrs: { className: '', name: 'visit' } })))
    check('#f-m1-0-1')
    assert.equal(renderer.userData['visit[speed]'], 'poor')
  })

  test('the userData setter fills radios, checkboxes and text cells, and reads back the same', () => {
    const table = mixed()
    table.rows[0].value = 'Größe 1'
    table.rows[1].value = 'a]b'
    const renderer = render(pagesOf(matrixField('m1', table)))
    const answers = {
      'f-m1[Größe 1]': 'good',
      'f-m1[Größe 1][comment]': 'schnell',
      'f-m1[a-b][comment]': '',
      'f-m1[a-b][wrap]': 'wrap',
    }
    renderer.userData = answers
    assert.equal($('#f-m1-0-2').checked, true)
    assert.equal($('#f-m1-1-4').checked, true)
    assert.equal($('#f-m1-0-3').value, 'schnell')
    assert.deepEqual(renderer.userData, answers)
  })

  test('userFormData labels a row by the caption and row, and a cell by the column too', () => {
    const renderer = render(pagesOf(matrixField('1a2b3c4d')))
    check('#f-1a2b3c4d-0-2')
    assert.deepEqual(
      renderer.userFormData.filter(({ key }) => key.includes('[speed]')),
      [
        { key: 'f-1a2b3c4d[speed]', value: 'good', label: 'Visit: Speed' },
        { key: 'f-1a2b3c4d[speed][comment]', value: '', label: 'Visit: Speed, Comment' },
      ]
    )
  })

  test('userFormData falls back to the field label and to Row n without a caption or row headers', () => {
    const table = { ...mixed(), caption: '', rowHeaders: false }
    const renderer = render(pagesOf(matrixField('m1', table)))
    const labels = renderer.userFormData.map(({ label }) => label)
    assert.deepEqual(labels, ['Survey: Row 1, Comment', 'Survey: Row 2, Comment'])
  })

  test('a required row blocks submit until its radio group, text cell and checkbox cells are answered', () => {
    render(pagesOf(matrixField('m1')))
    const form = $('form')
    assert.equal(form.checkValidity(), false)
    assert.equal(firstInvalid().id, 'f-m1-0-1')
    check('#f-m1-0-1')
    assert.equal(firstInvalid().id, 'f-m1-0-3')
    type('#f-m1-0-3', 'ok')
    // the row's only checkbox column makes "at least one box" mean this box
    assert.equal(firstInvalid().id, 'f-m1-0-4')
    check('#f-m1-0-4')
    assert.equal(form.checkValidity(), true)
  })

  test('a required checkbox row needs one box, and is required again after a reset', async () => {
    const table = {
      caption: '',
      rowHeaders: true,
      columns: [
        { label: '' },
        { label: 'Mon', value: 'mon', input: 'checkbox' },
        { label: 'Tue', value: 'tue', input: 'checkbox' },
      ],
      rows: [{ value: 'kev', required: true, cells: ['Kev', '', ''] }],
    }
    render(pagesOf(matrixField('m1', table)))
    const boxes = () => [$('#f-m1-0-1'), $('#f-m1-0-2')].map(box => box.required)
    assert.deepEqual(boxes(), [true, true])
    check('#f-m1-0-1')
    assert.deepEqual(boxes(), [false, false])
    $('form').reset()
    await nextFrames()
    assert.deepEqual(boxes(), [true, true])
  })

  test('Next stops on a page with an unanswered required row', () => {
    const renderer = render(
      pagesOf(matrixField('m1'), {
        n1: { id: 'n1', tag: 'input', attrs: { type: 'text', name: 'n1' }, config: { label: 'N' } },
      }),
      {
        pagination: 'wizard',
      }
    )
    const next = () => $('.formeo-pages-next')
    next().click()
    assert.equal(renderer.page, 0)
    check('#f-m1-0-1')
    type('#f-m1-0-3', 'ok')
    check('#f-m1-0-4')
    next().click()
    assert.equal(renderer.page, 1)
  })

  test('renderer.html holds the inputs, names and required attributes', () => {
    const renderer = render(pagesOf(matrixField('m1')))
    const { html } = renderer
    assert.match(html, /<input id="f-m1-0-1" type="radio" name="f-m1\[speed\]" value="poor"/)
    assert.match(html, /role="group" aria-labelledby="f-m1-caption"/)
    assert.match(html, /required=""/)
  })

  test('a matrix in an input group row clones without throwing, under its own names', () => {
    const data = pagesOf(matrixField('m1'))
    data.rows['r-1'].config = { inputGroup: true }
    render(data)
    $('.add-input-group').click()
    const radios = [...container.querySelectorAll('input[type="radio"]')].map(radio => radio.name)
    const clones = radios.filter(name => !name.startsWith('f-m1['))
    assert.equal(clones.length, 4)
    assert.ok(clones.every(name => /^f-[^[]+\[speed\]$|^f-[^[]+\[price\]$/.test(name)))
  })
})
