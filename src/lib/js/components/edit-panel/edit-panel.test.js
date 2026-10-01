import { strict as assert } from 'node:assert'
import { before, describe, it, mock } from 'node:test'
import i18n from '@draggable/i18n'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import Field from '../fields/field.js'
import components, { Components } from '../index.js'
import { configOptionsOf } from './config-options.mjs'
import EditPanel from './edit-panel.js'
import { toggleOptionMultiSelect } from './edit-panel-item.mjs'
import { labelHelper } from './helpers.mjs'

const selectField = () =>
  new Field(
    {
      tag: 'select',
      attrs: { type: 'select' },
      config: { label: 'Choices', controlId: 'select' },
      options: [
        { label: 'One', value: 'one', selected: true },
        { label: 'Two', value: 'two', selected: false },
      ],
    },
    components
  )

const radioField = () =>
  new Field(
    {
      tag: 'input',
      attrs: { type: 'radio' },
      config: { label: 'Colour', controlId: 'radio' },
      options: [
        { label: 'Red', value: 'red', selected: false },
        { label: 'Green', value: 'green', selected: true },
        { label: 'Blue', value: 'blue', selected: false },
      ],
    },
    components
  )

const optionItems = panel => panel.props.querySelectorAll(':scope > li')

describe('EditPanel option ordering (#114)', () => {
  it('renders a .prop-order drag handle on every option', () => {
    const panel = radioField().editPanels.get('options')
    assert.equal(optionItems(panel).length, 3)
    for (const li of optionItems(panel)) {
      assert.ok(li.querySelector('.prop-order'), 'each option has a handle')
    }
  })

  it('makes the options list sortable by that handle', () => {
    const panel = radioField().editPanels.get('options')
    assert.equal(panel.sortable.el, panel.props)
    assert.equal(panel.sortable.options.handle, '.prop-order')
  })

  it('moving option 3 above option 1 reorders the field options and keeps selection with it', () => {
    const field = radioField()
    mock.method(field, 'debouncedUpdatePreview', () => {})
    field.editPanels.get('options').moveOption(2, 0)
    assert.deepEqual(
      field.get('options').map(o => o.value),
      ['blue', 'red', 'green']
    )
    assert.equal(field.get('options')[2].selected, true)
    assert.equal(field.debouncedUpdatePreview.mock.callCount(), 1)
  })

  it('re-keys option items so an edit after a move lands on the moved option', () => {
    const field = radioField()
    const panel = field.editPanels.get('options')
    panel.moveOption(2, 0)
    const firstLabel = optionItems(panel)[0].querySelector('input[name$="-label"]')
    assert.equal(firstLabel.value, 'Blue')
    firstLabel.value = 'Navy'
    firstLabel.dispatchEvent(new window.Event('input', { bubbles: true }))
    assert.equal(field.get('options[0].label'), 'Navy')
    assert.equal(field.get('options[1].label'), 'Red')
  })

  it('keeps the rebuilt list sortable and destroys the old instance', () => {
    const panel = radioField().editPanels.get('options')
    const previous = panel.sortable
    const destroy = mock.method(previous, 'destroy')
    panel.moveOption(0, 1)
    assert.equal(destroy.mock.callCount(), 1)
    assert.notEqual(panel.sortable, previous)
    assert.equal(panel.sortable.el, panel.props)
  })

  it('ignores a drop in place', () => {
    const field = radioField()
    const before = field.get('options')
    field.editPanels.get('options').moveOption(1, 1)
    assert.equal(field.get('options'), before)
  })
})

describe('EditPanel#setData via toggleOptionMultiSelect (select switched to multiple)', () => {
  it('does not throw and switches options to the multi-select "checked" key, re-rendering the panel', () => {
    const field = selectField()
    const panel = field.editPanels.get('options')
    const previousProps = panel.props

    assert.doesNotThrow(() => toggleOptionMultiSelect(true, field))

    const options = field.get('options')
    assert.deepEqual(
      options.map(o => ({ value: o.value, checked: o.checked })),
      [
        { value: 'one', checked: true },
        { value: 'two', checked: false },
      ]
    )
    assert.equal(
      options.some(o => 'selected' in o),
      false,
      'options no longer carry the single-select "selected" key'
    )
    assert.notEqual(panel.props, previousProps, 'panel re-rendered its props list')
  })
})

describe('EditPanel#addAttribute', () => {
  // addAttribute writes a label into the current language, which the editor loads before this runs
  before(() => {
    i18n.current ??= {}
  })

  const attrRows = (panel, name) => panel.props.querySelectorAll(`[class~="field-attrs-${name}"]`)

  it('adds a namespaced attribute, whose ":" would break a class selector', () => {
    const field = selectField()
    const panel = field.editPanels.get('attrs')
    assert.doesNotThrow(() => panel.addAttribute('xlink:href', '#a'))
    assert.equal(field.get('attrs.xlink:href'), '#a')
    assert.equal(attrRows(panel, 'xlink:href').length, 1)
  })

  it('replaces the row when the same namespaced attribute is added again', () => {
    const field = selectField()
    const panel = field.editPanels.get('attrs')
    panel.addAttribute('xlink:href', '#a')
    panel.addAttribute('xlink:href', '#b')
    assert.equal(field.get('attrs.xlink:href'), '#b')
    assert.equal(attrRows(panel, 'xlink:href').length, 1)
  })
})

describe('EditPanel config.title (#122)', () => {
  const titledForm = () => ({
    id: 'form-title',
    stages: { 's-1': { id: 's-1', config: { title: 'About you' }, children: [] } },
  })
  const load = pages => {
    const events = new Events().init({})
    const editorComponents = new Components({ events, actions: new Actions(events).init({}) })
    editorComponents.load(titledForm(), { pages })
    return editorComponents
  }
  const configKeys = component =>
    new EditPanel(component.get('config'), 'config', component).editPanelItems.map(({ itemKey }) => itemKey)

  it('pages off: a stage with config.title shows no Title item', () => {
    const stage = load(false).stages.get('s-1')
    assert.equal(stage.get('config.title'), 'About you')
    assert.ok(!configKeys(stage).includes('config.title'))
  })

  it('pages off: a field with config.title shows no Title item', () => {
    const editorComponents = load(false)
    const field = new Field(
      { tag: 'input', attrs: { type: 'text' }, config: { label: 'Name', title: 'T' } },
      editorComponents
    )
    assert.ok(configKeys(field).includes('config.label'))
    assert.ok(!configKeys(field).includes('config.title'))
  })

  it('pages on: a stage shows its Title item, a field still does not', () => {
    const editorComponents = load(true)
    assert.ok(configKeys(editorComponents.stages.get('s-1')).includes('config.title'))
    const field = new Field(
      { tag: 'input', attrs: { type: 'text' }, config: { label: 'Name', title: 'T' } },
      editorComponents
    )
    assert.ok(!configKeys(field).includes('config.title'))
  })
})

describe('EditPanel#clearAllItems (#281)', () => {
  it('tells actions.remove.* that it is a Clear All', () => {
    const events = new Events().init({})
    const seen = []
    const editorComponents = new Components({
      events,
      actions: new Actions(events).init({ remove: { options: evt => seen.push(evt) } }),
    })
    const field = new Field(
      {
        tag: 'input',
        attrs: { type: 'radio' },
        config: { label: 'Colour', controlId: 'radio' },
        options: [{ label: 'Red', value: 'red', selected: false }],
      },
      editorComponents
    )
    field.editPanels.get('options').clearAllItems()
    assert.equal(seen.length, 1)
    assert.equal(seen[0].type, 'options')
    assert.equal(seen[0].isClearAll, true)
    assert.equal(field.get('options').length, 1, 'held: nothing cleared yet')
  })
})

// an editor's Components with the given `config` option, loaded with one empty stage `s-1`
const editorWith = (config = {}, opts = {}) => {
  const events = new Events().init({})
  const editorComponents = new Components({ events, actions: new Actions(events).init({}) })
  editorComponents.config = config
  editorComponents.load({ id: 'form-decl', stages: { 's-1': { id: 's-1', config: {}, children: [] } } }, opts)
  return editorComponents
}

const textField = (editorComponents, config = {}) =>
  new Field(
    {
      id: 'f-decl',
      tag: 'input',
      attrs: { type: 'text' },
      config: { label: 'Name', controlId: 'text-input', ...config },
    },
    editorComponents
  )

const panelKeys = component => component.editPanels.get('config')?.editPanelItems.map(({ itemKey }) => itemKey) ?? []

describe('Config panel declarations', () => {
  it('a field shows only declared config keys', () => {
    const field = textField(editorWith(), { hideLabel: false, disabledAttrs: ['type'], custom: 'x' })
    assert.deepEqual(panelKeys(field), ['config.label', 'config.hideLabel'])
  })

  it('resolves all, then control id, then component id, and a disabled key stays hidden', () => {
    const field = textField(
      editorWith({
        fields: {
          all: { panels: { config: { options: { hint: { default: '', label: 'Hint' } } } } },
          'text-input': { panels: { config: { options: { hint: { default: 'x', label: 'Text hint' } } } } },
          'f-decl': { panels: { config: { disabled: ['helpText'] } } },
        },
      }),
      { hint: '', helpText: 'Help' }
    )
    const options = configOptionsOf(field.config)
    assert.deepEqual(options.get('hint'), { label: 'Text hint', default: 'x' })
    assert.equal(options.has('helpText'), false)
    assert.deepEqual(panelKeys(field), ['config.label', 'config.hint'])
  })

  it('a stage has no Config panel without pages', () => {
    const stage = editorWith().stages.get('s-1')
    assert.equal(stage.editPanels.has('config'), false)
  })

  it('with pages a stage Config panel offers only its title', () => {
    const stage = editorWith({}, { pages: true }).stages.get('s-1')
    assert.deepEqual([...configOptionsOf(stage.config).keys()], ['title'])
    assert.deepEqual(panelKeys(stage), ['config.title'])
  })

  it('with pages a page added after load offers its title too', () => {
    const stage = editorWith({}, { pages: true }).stages.add()
    assert.deepEqual(panelKeys(stage), ['config.title'])
  })

  it('the editor config option can relabel the page title and change its default', () => {
    const stage = editorWith(
      { stages: { all: { panels: { config: { options: { title: { default: 'Untitled', label: 'Page name' } } } } } } },
      { pages: true }
    ).stages.get('s-1')
    assert.deepEqual(configOptionsOf(stage.config).get('title'), { label: 'Page name', default: 'Untitled' })
  })
})

describe('Config panel "Add config"', () => {
  it('offers the declared keys not set yet, with their labels', () => {
    const panel = textField(editorWith()).editPanels.get('config')
    const addable = panel.addableConfigOptions()
    assert.deepEqual([...addable.keys()], ['hideLabel', 'helpText', 'labelAfter', 'disableHtmlLabel', 'tooltip'])
    assert.equal(addable.get('tooltip').label, labelHelper('config.tooltip'))
  })

  it('leaves out a key disabled by full path', () => {
    const panel = textField(editorWith({ fields: { all: { disabled: ['config.tooltip'] } } })).editPanels.get('config')
    assert.equal(panel.addableConfigOptions().has('tooltip'), false)
  })

  it('adds a key with its declared default, once', () => {
    const field = textField(editorWith())
    const panel = field.editPanels.get('config')
    panel.addConfigItem('labelAfter')
    panel.addConfigItem('labelAfter')
    assert.equal(field.get('config.labelAfter'), false)
    const items = panel.editPanelItems.filter(({ itemKey }) => itemKey === 'config.labelAfter')
    assert.equal(items.length, 1)
    assert.ok(panel.props.contains(items[0].dom))
  })

  it('ignores a key that is not declared', () => {
    const field = textField(editorWith())
    field.editPanels.get('config').addConfigItem('bogus')
    assert.equal(field.get('config.bogus'), undefined)
  })

  it('adds a declared key to a stage, which has no preview, without throwing', () => {
    const stage = editorWith({
      stages: { all: { panels: { config: { options: { note: { default: '' } } } } } },
    }).stages.get('s-1')
    assert.doesNotThrow(() => stage.editPanels.get('config').addConfigItem('note'))
    assert.equal(stage.get('config.note'), '')
    assert.deepEqual(panelKeys(stage), ['config.note'])
  })

  it('hides the Add button while nothing is left to add, and shows it again after a remove', () => {
    const field = textField(editorWith(), {
      hideLabel: false,
      helpText: '',
      labelAfter: false,
      disableHtmlLabel: false,
      tooltip: '',
    })
    const panel = field.editPanels.get('config')
    assert.equal(panel.addConfigButton.hidden, true)
    panel.editPanelItems.find(({ itemKey }) => itemKey === 'config.tooltip').removeItem()
    assert.equal(panel.addConfigButton.hidden, false)
    assert.ok(panel.addableConfigOptions().has('tooltip'))
  })

  it('with pages a stage has nothing to add', () => {
    const panel = editorWith({}, { pages: true }).stages.get('s-1').editPanels.get('config')
    assert.equal(panel.addConfigButton.hidden, true)
  })
})

describe('Config panel review fixes', () => {
  const itemLabel = (component, itemKey) =>
    component.editPanels
      .get('config')
      .editPanelItems.find(item => item.itemKey === itemKey)
      .dom.querySelector('label')
      ?.textContent.trim()

  it('a panel item shows its declared label', () => {
    const field = textField(
      editorWith({
        fields: { all: { panels: { config: { options: { tooltip: { default: '', label: 'Hover text' } } } } } },
      }),
      { tooltip: 'x' }
    )
    assert.equal(itemLabel(field, 'config.tooltip'), 'Hover text')
  })

  it('with pages a relabelled page title shows its label', () => {
    const stage = editorWith(
      { stages: { all: { panels: { config: { options: { title: { default: '', label: 'Page name' } } } } } } },
      { pages: true }
    ).stages.get('s-1')
    assert.equal(itemLabel(stage, 'config.title'), 'Page name')
  })

  it('a declared stage key can be added to a stage that has no config yet', () => {
    const events = new Events().init({})
    const editorComponents = new Components({ events, actions: new Actions(events).init({}) })
    editorComponents.config = { stages: { all: { panels: { config: { options: { note: { default: '' } } } } } } }
    editorComponents.load({ id: 'form-bare', stages: { 's-bare': { id: 's-bare', children: [] } } }, {})
    for (const stage of [editorComponents.stages.get('s-bare'), editorComponents.stages.add()]) {
      const panel = stage.editPanels.get('config')
      assert.ok(panel, 'the stage has a Config panel')
      assert.equal(panel.addConfigButton.hidden, false)
      panel.addConfigItem('note')
      assert.equal(stage.get('config.note'), '')
      assert.deepEqual(panelKeys(stage), ['config.note'])
    }
  })
})

describe('panels.<panel>.add hides the add button (#117)', () => {
  before(() => {
    i18n.current ??= {}
  })

  const addButton = (component, panel) => component.dom.querySelector(`.${panel}-panel .add-${panel}`)
  const selectFor = editorComponents =>
    new Field(
      {
        id: 'f-sel',
        tag: 'select',
        attrs: { type: 'select' },
        config: { label: 'Choices', controlId: 'select' },
        options: [{ label: 'One', value: 'one', selected: false }],
      },
      editorComponents
    )

  it('shows the button by default', () => {
    assert.ok(addButton(textField(editorWith()), 'attrs'))
  })

  it('fields.all attrs add: false hides "+ Attribute"', () => {
    const field = textField(editorWith({ fields: { all: { panels: { attrs: { add: false } } } } }))
    assert.equal(addButton(field, 'attrs'), null)
  })

  it('a control id scope hides it for that control only', () => {
    const editorComponents = editorWith({ fields: { 'text-input': { panels: { attrs: { add: false } } } } })
    assert.equal(addButton(textField(editorComponents), 'attrs'), null)
    assert.ok(addButton(selectFor(editorComponents), 'attrs'))
  })

  it('a component id scope can bring it back', () => {
    const field = textField(
      editorWith({
        fields: { all: { panels: { attrs: { add: false } } }, 'f-decl': { panels: { attrs: { add: true } } } },
      })
    )
    assert.ok(addButton(field, 'attrs'))
  })

  it('options add: false hides "+ Option"', () => {
    const field = selectFor(editorWith({ fields: { all: { panels: { options: { add: false } } } } }))
    assert.equal(addButton(field, 'options'), null)
    assert.ok(addButton(field, 'attrs'))
  })

  it('stage conditions add: false hides "+ Condition" and keeps Clear All', () => {
    const stage = editorWith({ stages: { all: { panels: { conditions: { add: false } } } } }).stages.get('s-1')
    assert.equal(addButton(stage, 'conditions'), null)
    assert.ok(stage.dom.querySelector('.conditions-panel .clear-all-conditions'))
  })

  it('config add: false keeps the Add config button hidden while keys are left to add', () => {
    const field = textField(editorWith({ fields: { all: { panels: { config: { add: false } } } } }))
    const panel = field.editPanels.get('config')
    assert.ok(panel.addableConfigOptions().size > 0)
    assert.equal(panel.addConfigButton.hidden, true)
  })

  it('existing attributes stay editable and removable', () => {
    const field = new Field(
      {
        id: 'f-x',
        tag: 'input',
        attrs: { type: 'text', 'data-x': '1' },
        config: { label: 'Name', controlId: 'text-input' },
      },
      editorWith({ fields: { all: { panels: { attrs: { add: false } } } } })
    )
    const item = field.editPanels.get('attrs').editPanelItems.find(({ itemKey }) => itemKey === 'attrs.data-x')
    assert.ok(item.dom.querySelector('.prop-remove'))
    item.removeItem()
    assert.equal(field.get('attrs.data-x'), undefined)
  })
})
