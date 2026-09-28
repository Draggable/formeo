import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { Components } from '../index.js'
import { componentOptions, getComponentLabel } from './helpers.mjs'

// "About you" twice, so the picker has to tell the two apart
const formData = () => ({
  id: 'form-t',
  stages: {
    's-1': { id: 's-1', config: { title: 'About you' }, children: ['r-1'] },
    's-2': { id: 's-2', config: { title: '' }, children: [] },
    's-3': { id: 's-3', config: { title: 'About you' }, children: [] },
  },
  rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'] } },
  columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: ['f-1'] } },
  fields: { 'f-1': { id: 'f-1', tag: 'input', attrs: { type: 'text' }, config: { label: 'Name' } } },
})

const editorComponents = pages => {
  const events = new Events().init({})
  const components = new Components({ events, actions: new Actions(events).init({}) })
  components.load(formData(), { pages })
  return components
}

const stageOptions = (components, key, value = '') =>
  componentOptions({ components, key, value })
    .map(item => ({
      value: item.dataset.value,
      label: item.dataset.label,
      type: item.querySelector('.component-type')?.textContent.trim(),
    }))
    .filter(option => option.value.startsWith('stages.'))

describe('condition target picker: pages (#122)', () => {
  it('with page tabs, lists each page by its title as a "Page"', () => {
    assert.deepEqual(stageOptions(editorComponents(true), 'then.condition.target'), [
      { value: 'stages.s-1', label: 'About you', type: 'Page' },
      { value: 'stages.s-2', label: 'Page 2', type: 'Page' },
      { value: 'stages.s-3', label: 'About you (2)', type: 'Page' },
    ])
  })

  it('without page tabs, leaves stages out', () => {
    assert.deepEqual(stageOptions(editorComponents(false), 'then.condition.target'), [])
  })

  it('without page tabs, still lists a stage the condition already targets', () => {
    assert.deepEqual(stageOptions(editorComponents(false), 'then.condition.target', 'stages.s-2'), [
      { value: 'stages.s-2', label: 'Stage', type: 'Stage' },
    ])
  })

  it('never lists pages as an if source or target', () => {
    const components = editorComponents(true)
    for (const key of ['if.condition.source', 'if.condition.target']) {
      assert.deepEqual(stageOptions(components, key), [], key)
    }
  })

  it('shows a chosen page by its title', () => {
    const components = editorComponents(true)
    const stage = components.getAddress('stages.s-2')
    assert.equal(getComponentLabel(stage, 'then.condition.target', components), 'Page 2')
  })
})
