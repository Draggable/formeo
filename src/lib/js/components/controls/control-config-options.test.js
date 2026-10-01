import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { configOptionsOf } from '../edit-panel/config-options.mjs'
import Field from '../fields/field.js'
import { Components } from '../index.js'
import Control from './control.js'
import { Controls } from './index.js'

const ratingControl = () =>
  new Control({
    tag: 'input',
    attrs: { type: 'number' },
    config: { label: 'Rating', stars: 5 },
    meta: { group: 'common', id: 'rating', icon: 'star' },
    configOptions: { stars: { default: 5, label: 'Stars' } },
  })

// an editor's Components with the given `config` option and a Controls that registered the rating control
const editorWith = (config = {}) => {
  const events = new Events().init({})
  const editorComponents = new Components({ events, actions: new Actions(events).init({}) })
  editorComponents.config = config
  const controls = new Controls(editorComponents)
  controls.add(ratingControl())
  editorComponents.controls = controls
  return editorComponents
}

const fieldOf = (editorComponents, controlId) =>
  new Field(
    { tag: 'input', attrs: { type: 'number' }, config: { label: 'How many?', controlId, stars: 5 } },
    editorComponents
  )

const panelKeys = component => component.editPanels.get('config')?.editPanelItems.map(({ itemKey }) => itemKey) ?? []

describe('control configOptions', () => {
  it('stay out of the field data the control adds', () => {
    const { controls } = editorWith()
    assert.equal('configOptions' in controls.get('rating'), false)
    assert.deepEqual(controls.declaredConfigOptions('rating'), { stars: { default: 5, label: 'Stars' } })
  })

  it("offer the control's keys in its fields' Config panel, next to the keys every field has", () => {
    const rating = fieldOf(editorWith(), 'rating')
    assert.deepEqual(panelKeys(rating), ['config.label', 'config.stars'])
    assert.deepEqual(configOptionsOf(rating.config).get('stars'), { label: 'Stars', default: 5 })
    assert.ok(configOptionsOf(rating.config).has('tooltip'), 'fields.all keys still apply')
  })

  it('do not reach fields of other controls, which keep exactly the fields.all keys', () => {
    const other = fieldOf(editorWith(), 'text-input')
    assert.deepEqual(panelKeys(other), ['config.label'])
    assert.deepEqual(
      [...configOptionsOf(other.config).keys()],
      ['label', 'hideLabel', 'helpText', 'labelPosition', 'disableHtmlLabel', 'tooltip']
    )
  })

  it('sit beneath the editor config for that control', () => {
    const rating = fieldOf(
      editorWith({
        fields: { rating: { panels: { config: { options: { stars: { default: 3, label: 'Star count' } } } } } },
      }),
      'rating'
    )
    assert.deepEqual(configOptionsOf(rating.config).get('stars'), { label: 'Star count', default: 3 })
  })

  it('can be disabled through the editor config', () => {
    const rating = fieldOf(editorWith({ fields: { all: { panels: { config: { disabled: ['stars'] } } } } }), 'rating')
    assert.deepEqual(panelKeys(rating), ['config.label'])
  })
})
