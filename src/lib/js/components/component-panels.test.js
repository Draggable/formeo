import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { Actions } from '../common/actions.js'
import { Events } from '../common/events.js'
import Field from './fields/field.js'
import { Components } from './index.js'
import Stage from './stages/stage.js'

// an editor's Components with the given `config` option, loaded with one empty stage
const editorWith = (config = {}) => {
  const events = new Events().init({})
  const editorComponents = new Components({ events, actions: new Actions(events).init({}) })
  editorComponents.config = config
  editorComponents.load({ id: 'form-cp', stages: { 's-1': { id: 's-1', config: {}, children: [] } } })
  return editorComponents
}

// a stage that declares a custom Settings panel and an empty Attributes panel, the way rows do (#112)
class PanelledStage extends Stage {
  get customPanels() {
    return {
      settings: {
        panelConfig: {
          config: { label: 'Settings' },
          attrs: { className: 'f-panel settings-panel' },
          children: 'Settings go here',
        },
      },
    }
  }

  get defaultPanelData() {
    return { attrs: {} }
  }
}

const withSettings = { stages: { all: { panels: { order: ['settings'] } } } }

describe('Component#updateEditPanels custom and default panels (#112)', () => {
  it('adds a custom panel that panels.order names, in that order', () => {
    const stage = new PanelledStage({ id: 's-p', children: [] }, editorWith(withSettings))
    assert.deepEqual([...stage.editPanels.keys()], ['attrs', 'conditions', 'settings'])
    assert.ok(stage.dom.querySelector('.settings-panel'))
  })

  it('leaves out a custom panel that panels.order does not name', () => {
    const stage = new PanelledStage({ id: 's-p', children: [] }, editorWith())
    assert.equal(stage.editPanels.has('settings'), false)
  })

  it('panels.disabled removes a custom panel', () => {
    const stage = new PanelledStage(
      { id: 's-p', children: [] },
      editorWith({ stages: { all: { panels: { order: ['settings'], disabled: ['settings'] } } } })
    )
    assert.equal(stage.editPanels.has('settings'), false)
  })

  it('defaultPanelData shows an empty panel without writing the key', () => {
    const stage = new PanelledStage({ id: 's-p', children: [] }, editorWith())
    assert.equal(stage.editPanels.get('attrs').editPanelItems.length, 0)
    assert.equal(stage.get('attrs'), undefined)
  })

  it('defaultPanelData also covers a null value', () => {
    const stage = new PanelledStage({ id: 's-p', children: [], attrs: null }, editorWith())
    assert.ok(stage.editPanels.has('attrs'))
  })

  it('without defaultPanelData a missing key still gets no panel', () => {
    assert.equal(new Stage({ id: 's-q', children: [] }, editorWith()).editPanels.has('attrs'), false)
    const rule = new Field({ id: 'f-hr', tag: 'hr', config: { label: 'Rule' } }, editorWith())
    assert.equal(rule.editPanels.has('attrs'), false)
  })

  it('className is never a panel', () => {
    const stage = new Stage({ id: 's-c', children: [], className: ['formeo-stage'] }, editorWith())
    assert.equal(stage.editPanels.has('className'), false)
  })

  it('a component with every panel disabled builds without panels', () => {
    const editorComponents = editorWith({
      stages: { all: { panels: { disabled: ['attrs', 'options', 'conditions'] } } },
    })
    const stage = editorComponents.stages.get('s-1')
    assert.equal(stage.editPanels.size, 0)
    assert.equal(stage.panels, null)
  })
})
