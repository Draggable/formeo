import { strict as assert } from 'node:assert'
import { afterEach, describe, it, mock } from 'node:test'
import Sortable from 'sortablejs'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { Components } from '../index.js'
import { EditorPages } from './pages.js'

export const threePages = (key = 'p') => ({
  id: `form-${key}`,
  stages: {
    [`${key}-1`]: { id: `${key}-1`, config: { title: 'About you' }, children: [`${key}-r1`] },
    [`${key}-2`]: { id: `${key}-2`, config: { title: 'Account' }, children: [] },
    [`${key}-3`]: { id: `${key}-3`, children: [] },
  },
  rows: { [`${key}-r1`]: { id: `${key}-r1`, config: {}, children: [`${key}-c1`] } },
  columns: { [`${key}-c1`]: { id: `${key}-c1`, config: { width: '100%' }, children: [`${key}-f1`] } },
  fields: {
    [`${key}-f1`]: { id: `${key}-f1`, tag: 'input', attrs: { type: 'text' }, config: { label: 'Name' } },
  },
})

const mounted = []
export const setup = ({ formData = threePages(), callbacks = {}, actions = {} } = {}) => {
  const events = new Events().init(callbacks)
  const components = new Components({ events, actions: new Actions(events).init(actions) })
  components.load(formData, { pages: true })
  const pages = new EditorPages(components)
  components.pages = pages
  const editor = document.createElement('div')
  editor.className = 'formeo formeo-editor'
  editor.dir = 'ltr'
  editor.appendChild(pages.render())
  document.body.appendChild(editor)
  mounted.push({ pages, editor })
  return { components, pages, editor }
}

const key = (target, name, init = {}) =>
  target.dispatchEvent(new window.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }))
const tabs = editor => [...editor.querySelectorAll('.formeo-page-tab')]
const visibleStageIds = editor =>
  [...editor.querySelectorAll('.formeo-stage')].filter(stage => !stage.hidden).map(stage => stage.id)

afterEach(() => {
  for (const { pages, editor } of mounted.splice(0)) {
    pages.destroy()
    editor.remove()
  }
})

describe('EditorPages tab bar (#122)', () => {
  it('renders one tab per page, in order, titled or numbered', () => {
    const { editor, pages } = setup()
    const tablist = editor.querySelector('[role="tablist"]')
    assert.equal(tablist.getAttribute('aria-label'), 'Pages')
    assert.deepEqual(
      tabs(editor).map(tab => tab.textContent),
      ['About you', 'Account', 'Page 3']
    )
    assert.equal(pages.count, 3)
    assert.equal(editor.querySelector('.formeo-page-add').getAttribute('aria-label'), 'Add page')
    assert.equal(editor.querySelector('.formeo-pages-editor').dataset.pageCount, '3')
  })

  it('links each tab to its page', () => {
    const { editor, components } = setup()
    const [first] = tabs(editor)
    const stage = components.stages.get('p-1')
    assert.equal(first.getAttribute('role'), 'tab')
    assert.equal(first.getAttribute('aria-controls'), 'p-1')
    assert.equal(stage.dom.getAttribute('role'), 'tabpanel')
    assert.equal(stage.dom.getAttribute('aria-labelledby'), first.id)
  })

  it('gives tabs ids unique to the editor', () => {
    const a = setup()
    const b = setup()
    assert.notEqual(tabs(a.editor)[0].id, tabs(b.editor)[0].id)
  })

  it('shows a title as text, never as markup', () => {
    const formData = threePages()
    formData.stages['p-2'].config.title = '<img src=x onerror=alert(1)>'
    const { editor } = setup({ formData })
    assert.equal(editor.querySelector('.formeo-page-tabs img'), null)
    assert.equal(tabs(editor)[1].textContent, '<img src=x onerror=alert(1)>')
  })

  it('starts on the first page, whichever stage loaded last', () => {
    const { editor, pages, components } = setup()
    assert.deepEqual(visibleStageIds(editor), ['p-1'])
    assert.equal(components.stages.active.id, 'p-1')
    assert.equal(pages.index, 0)
    assert.deepEqual(
      tabs(editor).map(tab => [tab.getAttribute('aria-selected'), tab.tabIndex]),
      [
        ['true', 0],
        ['false', -1],
        ['false', -1],
      ]
    )
  })

  it('switches pages and fires onPageChange once per real change', () => {
    const onPageChange = mock.fn()
    const { editor, pages, components } = setup({ callbacks: { onPageChange } })

    pages.activate(2)
    pages.activate('p-3')

    assert.deepEqual(visibleStageIds(editor), ['p-3'])
    assert.equal(components.stages.active.id, 'p-3')
    assert.equal(onPageChange.mock.callCount(), 1)
    assert.deepEqual(onPageChange.mock.calls[0].arguments[0].detail, {
      page: 2,
      previousPage: 0,
      stageId: 'p-3',
      previousStageId: 'p-1',
    })
  })

  it('does not fire onPageChange on render', () => {
    const onPageChange = mock.fn()
    const { pages } = setup({ callbacks: { onPageChange } })
    pages.render()
    assert.equal(onPageChange.mock.callCount(), 0)
  })

  it('switches on tab click', () => {
    const { editor } = setup()
    tabs(editor)[1].click()
    assert.deepEqual(visibleStageIds(editor), ['p-2'])
  })

  it('keeps the active page across render()', () => {
    const { editor, pages } = setup()
    pages.activate(1)
    editor.replaceChildren(pages.render())
    assert.deepEqual(visibleStageIds(editor), ['p-2'])
  })

  it('goes back to the first page when the active page is gone after a load', () => {
    const { editor, pages, components } = setup()
    pages.activate(1)
    components.load(threePages('q'), { pages: true })
    editor.replaceChildren(pages.render())
    assert.deepEqual(visibleStageIds(editor), ['q-1'])
  })
})

describe('EditorPages keyboard (#122)', () => {
  it('moves with ArrowRight/ArrowLeft, wrapping, and Home/End', () => {
    const { editor } = setup()
    const [first] = tabs(editor)
    first.focus()
    key(first, 'ArrowLeft')
    assert.equal(document.activeElement, tabs(editor)[2])
    assert.deepEqual(visibleStageIds(editor), ['p-3'])
    key(document.activeElement, 'ArrowRight')
    assert.equal(document.activeElement, tabs(editor)[0])
    key(document.activeElement, 'End')
    assert.equal(document.activeElement, tabs(editor)[2])
    key(document.activeElement, 'Home')
    assert.equal(document.activeElement, tabs(editor)[0])
  })

  it('swaps the arrow keys in a right-to-left editor', () => {
    const { editor } = setup()
    editor.dir = 'rtl'
    const [first] = tabs(editor)
    first.focus()
    key(first, 'ArrowLeft')
    assert.equal(document.activeElement, tabs(editor)[1])
  })
})

describe('EditorPages add, labels and destroy (#122)', () => {
  it('adds an untitled page at the end, switches to it and fires onAddStage', () => {
    const onAddStage = mock.fn()
    const { editor, pages } = setup({ callbacks: { onAddStage } })
    editor.querySelector('.formeo-page-add').click()

    assert.equal(pages.count, 4)
    assert.equal(tabs(editor)[3].textContent, 'Page 4')
    assert.equal(document.activeElement, tabs(editor)[3])
    assert.equal(pages.index, 3)
    assert.equal(onAddStage.mock.callCount(), 1)
    assert.equal(editor.querySelector('.formeo-pages-editor').dataset.pageCount, '4')
  })

  it('add({ title }) returns the stage with that title', () => {
    const { pages } = setup()
    const stage = pages.add({ title: 'Review' })
    assert.equal(stage.get('config.title'), 'Review')
    assert.equal(pages.titleOf(stage.id), 'Review')
  })

  it('relabels a tab when its config.title changes', () => {
    const { editor, components } = setup()
    components.stages.get('p-3').set('config.title', 'Review')
    assert.equal(tabs(editor)[2].textContent, 'Review')
    components.stages.get('p-3').set(['config', 'title'], '')
    assert.equal(tabs(editor)[2].textContent, 'Page 3')
  })

  it('keeps relabeling after a reload of the same stage ids', () => {
    const { editor, components, pages } = setup()
    const before = components.stages.get('p-1')
    components.load(threePages(), { pages: true })
    editor.replaceChildren(pages.render())
    assert.notEqual(components.stages.get('p-1'), before)
    components.stages.get('p-1').set('config.title', 'Renamed')
    assert.equal(tabs(editor)[0].textContent, 'Renamed')
    before.set('config.title', 'Stale')
    assert.equal(tabs(editor)[0].textContent, 'Renamed')
  })

  it('destroy() releases its Sortables and stage listeners', () => {
    const { editor, pages, components } = setup()
    const tablist = editor.querySelector('.formeo-page-tabs')
    const stage = components.stages.get('p-3')
    pages.destroy()
    assert.equal(Sortable.get(tablist), undefined)
    stage.set('config.title', 'After')
    assert.equal(tabs(editor)[2].textContent, 'Page 3')
  })

  it('destroy() removes the role, aria-labelledby and hidden it set on each stage', () => {
    const { pages, components } = setup()
    const stageDoms = pages.ids.map(id => components.stages.get(id).dom)
    assert.ok(
      stageDoms.some(stageDom => stageDom.hidden),
      'some pages are hidden before destroy()'
    )
    pages.destroy()
    for (const stageDom of stageDoms) {
      assert.equal(stageDom.hidden, false)
      assert.equal(stageDom.hasAttribute('hidden'), false)
      assert.equal(stageDom.hasAttribute('role'), false)
      assert.equal(stageDom.hasAttribute('aria-labelledby'), false)
    }
  })
})

describe('EditorPages rename (#122)', () => {
  const input = editor => editor.querySelector('.formeo-page-title-input')

  it('F2 opens an input with the current title; Enter saves it', () => {
    const { editor, components } = setup()
    const [first] = tabs(editor)
    first.focus()
    key(first, 'F2')
    assert.equal(input(editor).value, 'About you')
    assert.equal(document.activeElement, input(editor))
    assert.equal(first.hidden, true)

    input(editor).value = '  Your details  '
    key(input(editor), 'Enter')
    assert.equal(input(editor), null)
    assert.equal(components.stages.get('p-1').get('config.title'), 'Your details')
    assert.equal(tabs(editor)[0].textContent, 'Your details')
    assert.equal(document.activeElement, tabs(editor)[0])
  })

  it('Escape cancels', () => {
    const { editor, components } = setup()
    tabs(editor)[0].dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true }))
    input(editor).value = 'Nope'
    key(input(editor), 'Escape')
    assert.equal(components.stages.get('p-1').get('config.title'), 'About you')
    assert.equal(tabs(editor)[0].hidden, false)
  })

  it('an empty title falls back to "Page {n}"', () => {
    const { editor, pages } = setup()
    pages.startRename('p-2')
    input(editor).value = '   '
    key(input(editor), 'Enter')
    assert.equal(tabs(editor)[1].textContent, 'Page 2')
  })

  it('keys typed in the input edit text, not pages', () => {
    const { editor, pages } = setup()
    pages.startRename('p-2')
    const before = input(editor)
    for (const name of ['Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'F2']) {
      key(before, name)
    }
    // Delete in particular must not have reached requestRemove(): the page count is unchanged and this is
    // still the very same input element (a real removal would rebuildTabs() and destroy it)
    assert.equal(pages.count, 3)
    assert.equal(pages.index, 0)
    assert.equal(input(editor), before)
  })

  it('switching pages commits the rename first', () => {
    const { editor, pages, components } = setup()
    pages.startRename('p-3')
    input(editor).value = 'Review'
    pages.activate(1)
    assert.equal(input(editor), null)
    assert.equal(components.stages.get('p-3').get('config.title'), 'Review')
  })

  it('blur saves', () => {
    const { editor, pages, components } = setup()
    pages.startRename('p-3')
    input(editor).value = 'Review'
    input(editor).dispatchEvent(new window.FocusEvent('blur'))
    assert.equal(components.stages.get('p-3').get('config.title'), 'Review')
  })

  it('destroying the editor mid-rename discards the unsaved title and does not throw', () => {
    const { editor, pages, components } = setup()
    pages.startRename('p-3')
    input(editor).value = 'Review'
    assert.doesNotThrow(() => pages.destroy())
    assert.equal(input(editor), null)
    assert.equal(components.stages.get('p-3').get('config.title'), '')
    assert.equal(components.formData.stages['p-3'].config.title, '')
  })
})

describe('EditorPages remove (#122)', () => {
  it('removes an empty page at once and shows the previous page', () => {
    const onRemoveStage = mock.fn()
    const onPageChange = mock.fn()
    const { editor, pages } = setup({ callbacks: { onRemoveStage, onPageChange } })
    pages.activate(2)
    editor.querySelectorAll('.formeo-page-remove')[2].click()

    assert.equal(pages.count, 2)
    assert.deepEqual(
      tabs(editor).map(tab => tab.textContent),
      ['About you', 'Account']
    )
    assert.deepEqual(visibleStageIds(editor), ['p-2'])
    assert.equal(document.activeElement, tabs(editor)[1])
    assert.equal(onRemoveStage.mock.callCount(), 1)
    assert.deepEqual(onPageChange.mock.calls.at(-1).arguments[0].detail, {
      page: 1,
      previousPage: 2,
      stageId: 'p-2',
      previousStageId: 'p-3',
    })
  })

  it('shows the next page when the first page goes', () => {
    const { editor, pages } = setup({ actions: { remove: { page: evt => evt.removeAction() } } })
    pages.requestRemove('p-1')
    assert.deepEqual(visibleStageIds(editor), ['p-2'])
  })

  it('passes the page to actions.remove.page, which can veto', () => {
    const page = mock.fn()
    const { pages } = setup({ actions: { remove: { page } } })
    pages.requestRemove('p-1')
    const [evt] = page.mock.calls[0].arguments
    assert.equal(evt.stageId, 'p-1')
    assert.equal(evt.index, 0)
    assert.equal(evt.title, 'About you')
    assert.equal(evt.isEmpty, false)
    assert.equal(typeof evt.removeAction, 'function')
    assert.equal(pages.count, 3)
  })

  it('commits an open rename first, so the removal sees the new title', () => {
    const page = mock.fn()
    const { editor, pages, components } = setup({ actions: { remove: { page } } })
    pages.startRename('p-2')
    editor.querySelector('.formeo-page-title-input').value = 'New name'
    pages.requestRemove('p-2')
    const [evt] = page.mock.calls[0].arguments
    assert.equal(evt.title, 'New name')
    assert.equal(components.stages.get('p-2').get('config.title'), 'New name')
  })

  it('Delete on a tab asks to remove its page', () => {
    const page = mock.fn()
    const { editor } = setup({ actions: { remove: { page } } })
    const [, second] = tabs(editor)
    second.focus()
    key(second, 'Delete')
    assert.equal(page.mock.calls[0].arguments[0].stageId, 'p-2')
  })

  it('keeps the last page', () => {
    const page = mock.fn(evt => evt.removeAction())
    const { editor, pages } = setup({ actions: { remove: { page } } })
    pages.requestRemove('p-3')
    pages.requestRemove('p-2')
    assert.equal(editor.querySelectorAll('.formeo-page-remove').length, 0)
    pages.requestRemove('p-1')
    assert.equal(page.mock.callCount(), 2)
    assert.equal(pages.count, 1)
  })
})
