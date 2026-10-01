import { strict as assert } from 'node:assert'
import { afterEach, before, describe, it } from 'node:test'
import i18n from '@draggable/i18n'
import { Actions } from '../../common/actions.js'
import { Events } from '../../common/events.js'
import { COLUMN_PRESET_CLASSNAME } from '../../constants.js'
import { Components } from '../index.js'

const formWithRow = (row = {}) => ({
  id: 'form-row',
  stages: { 's-1': { id: 's-1', children: ['r-1'] } },
  rows: { 'r-1': { id: 'r-1', config: {}, children: ['c-1'], ...row } },
  columns: { 'c-1': { id: 'c-1', config: { width: '100%' }, children: [] } },
  fields: {},
})

const mounted = []

/**
 * One editor's Components loaded with formWithRow(row), its stage mounted so update callbacks run
 * @param {Object} [opts] { config, row, callbacks, actions }
 */
const editorWith = ({ config = {}, row, callbacks = {}, actions = {} } = {}) => {
  const events = new Events().init(callbacks)
  const editorComponents = new Components({ events, actions: new Actions(events).init(actions) })
  editorComponents.config = config
  editorComponents.load(formWithRow(row))
  const stageDom = editorComponents.stages.get('s-1').dom
  document.body.appendChild(stageDom)
  mounted.push(stageDom)
  return editorComponents
}

const rowOf = editorComponents => editorComponents.rows.get('r-1')
const attrKeys = row => row.editPanels.get('attrs').editPanelItems.map(({ itemKey }) => itemKey)
const nextFrames = () => new Promise(resolve => setTimeout(resolve, 50))

describe('Row edit panels (#112)', () => {
  // addAttribute writes a label into the current language, which the editor loads before this runs
  before(() => {
    i18n.current ??= {}
  })

  afterEach(() => {
    for (const node of mounted.splice(0)) {
      node.remove()
    }
  })

  it('has a Settings panel, then an Attributes panel, in its row-edit window', () => {
    const row = rowOf(editorWith())
    assert.deepEqual([...row.editPanels.keys()], ['settings', 'attrs'])
    assert.ok(row.dom.querySelector('.row-edit .settings-panel'))
    assert.ok(row.dom.querySelector('.row-edit .attrs-panel'))
  })

  it('the Settings panel holds the input group, fieldset and column layout controls', async () => {
    const row = rowOf(editorWith())
    await nextFrames()
    const settings = row.dom.querySelector('.row-edit .settings-panel')
    assert.ok(settings.querySelector('#r-1-inputGroup'))
    assert.ok(settings.querySelector('#r-1-fieldset'))
    assert.ok(settings.querySelector(`.${COLUMN_PRESET_CLASSNAME}`))
  })

  it('panels.disabled settings leaves only Attributes, and column widths still update', () => {
    const row = rowOf(editorWith({ config: { rows: { all: { panels: { disabled: ['settings'] } } } } }))
    assert.deepEqual([...row.editPanels.keys()], ['attrs'])
    assert.doesNotThrow(() => row.autoColumnWidths())
  })

  it('with every panel disabled the row still builds and resizes', () => {
    const row = rowOf(editorWith({ config: { rows: { all: { panels: { disabled: ['settings', 'attrs'] } } } } }))
    assert.equal(row.editPanels.size, 0)
    assert.doesNotThrow(() => row.autoColumnWidths())
  })

  it('adding an attribute saves it on the row and fires onUpdateRow', () => {
    const seen = []
    const editorComponents = editorWith({ callbacks: { onUpdateRow: ({ detail }) => seen.push(detail.changePath) } })
    rowOf(editorComponents).editPanels.get('attrs').addAttribute('data-section', 'contact')
    assert.equal(editorComponents.formData.rows['r-1'].attrs['data-section'], 'contact')
    assert.ok(seen.includes('rows.r-1.attrs.data-section'), JSON.stringify(seen))
  })

  it('adding the same attribute again replaces its item', () => {
    const row = rowOf(editorWith())
    const panel = row.editPanels.get('attrs')
    panel.addAttribute('data-section', 'contact')
    panel.addAttribute('data-section', 'billing')
    assert.equal(row.get('attrs.data-section'), 'billing')
    assert.equal(panel.props.querySelectorAll('.field-attrs-data-section').length, 1)
  })

  it('id, tag and data-clone-of are reserved', () => {
    const row = rowOf(editorWith())
    const panel = row.editPanels.get('attrs')
    for (const name of ['id', 'tag', 'data-clone-of']) {
      assert.equal(row.isDisabledProp(`attrs.${name}`), true, name)
      panel.addAttribute(name, 'x')
      assert.equal(row.get(`attrs.${name}`), undefined, name)
    }
  })

  it('the add-attribute event reports reserved names as disabled, so the dialog refuses them', () => {
    let addEvt
    const editorComponents = editorWith({
      actions: {
        add: {
          attr: evt => {
            addEvt = evt
          },
        },
      },
    })
    rowOf(editorComponents).dom.querySelector('.row-edit .add-attrs').click()
    assert.equal(addEvt.isDisabled('attrs.id'), true)
    assert.equal(addEvt.isDisabled('attrs.data-section'), false)
  })

  it('an integrator can reserve more names but not free the built-in ones', () => {
    const row = rowOf(editorWith({ config: { rows: { all: { panels: { attrs: { disabled: ['onclick'] } } } } } }))
    assert.equal(row.isDisabledProp('attrs.onclick'), true)
    assert.equal(row.isDisabledProp('attrs.id'), true)
  })

  it('a loaded row keeps a reserved attribute in its data but does not show it', () => {
    const editorComponents = editorWith({ row: { attrs: { id: 'legacy', 'data-section': 'contact' } } })
    assert.deepEqual(attrKeys(rowOf(editorComponents)), ['attrs.data-section'])
    assert.equal(editorComponents.formData.rows['r-1'].attrs.id, 'legacy')
  })

  it('row attributes are not applied to the editor canvas', () => {
    const row = rowOf(editorWith({ row: { attrs: { 'data-section': 'contact', className: 'd-none' } } }))
    assert.equal(row.dom.hasAttribute('data-section'), false)
    assert.equal(row.dom.classList.contains('d-none'), false)
  })

  it('a row without attributes saves no attrs key', () => {
    const editorComponents = editorWith()
    assert.equal(Object.hasOwn(editorComponents.formData.rows['r-1'], 'attrs'), false)
  })

  it('a row loaded with attrs: null shows an empty panel and can take an attribute', () => {
    const row = rowOf(editorWith({ row: { attrs: null } }))
    assert.deepEqual(attrKeys(row), [])
    row.editPanels.get('attrs').addAttribute('data-section', 'contact')
    assert.equal(row.get('attrs.data-section'), 'contact')
  })

  it('a cloned row gets its own copy of the attributes', () => {
    const editorComponents = editorWith({ row: { attrs: { 'data-section': 'contact' } } })
    const copy = rowOf(editorComponents).clone()
    assert.equal(copy.get('attrs.data-section'), 'contact')
    copy.set('attrs.data-section', 'billing')
    assert.equal(rowOf(editorComponents).get('attrs.data-section'), 'contact')
  })

  it('rows.all attrs add: false hides "+ Attribute" on rows (#117)', () => {
    const row = rowOf(editorWith({ config: { rows: { all: { panels: { attrs: { add: false } } } } } }))
    assert.equal(row.dom.querySelector('.row-edit .add-attrs'), null)
  })

  it("a row with its edit button disabled leaves its column's edit button alone", async () => {
    const config = {
      rows: { all: { actionButtons: { disabled: ['edit'] }, panels: { disabled: ['settings', 'attrs'] } } },
    }
    const row = rowOf(editorWith({ config }))
    await nextFrames()
    assert.equal(row.dom.querySelector('.row-actions .edit-toggle'), null)
    assert.ok(row.dom.querySelector('.column-actions .edit-toggle'))
  })

  it('a row with every action button and every panel disabled renders without throwing', async () => {
    const config = {
      rows: {
        all: {
          actionButtons: { disabled: ['move', 'edit', 'clone', 'remove'] },
          panels: { disabled: ['settings', 'attrs'] },
        },
      },
    }
    const row = rowOf(editorWith({ config }))
    await nextFrames()
    assert.ok(row.dom)
  })

  it("re-running updateEditPanels leaves the row's columns' panel navs alone", async () => {
    const editorComponents = editorWith()
    const row = rowOf(editorComponents)
    const columnNav = editorComponents.columns.get('c-1').dom.querySelector('.panel-nav')
    row.updateEditPanels()
    assert.equal(editorComponents.columns.get('c-1').dom.querySelector('.panel-nav'), columnNav)
    assert.equal(row.dom.querySelectorAll(':scope > .row-edit > .panel-nav').length, 1)
  })

  it("a row without panels is not given a descendant's nav on re-run", async () => {
    const config = { rows: { all: { panels: { disabled: ['settings', 'attrs'] } } } }
    const editorComponents = editorWith({ config })
    const columnNav = editorComponents.columns.get('c-1').dom.querySelector('.panel-nav')
    rowOf(editorComponents).updateEditPanels()
    assert.equal(editorComponents.columns.get('c-1').dom.querySelector('.panel-nav'), columnNav)
  })
})

describe('Row Settings checkboxes (#521)', () => {
  afterEach(() => {
    for (const node of mounted.splice(0)) {
      node.remove()
    }
  })

  // the Settings panel renders on the next frame
  const checkboxes = async row => {
    await nextFrames()
    return {
      fieldset: row.dom.querySelector('#r-1-fieldset'),
      inputGroup: row.dom.querySelector('#r-1-inputGroup'),
    }
  }

  it('an unset fieldset or input group shows unchecked', async () => {
    const { fieldset, inputGroup } = await checkboxes(rowOf(editorWith({ row: { config: {} } })))
    assert.equal(fieldset.checked, false)
    assert.equal(inputGroup.checked, false)
  })

  it('a config with only fieldset leaves Input group unchecked', async () => {
    const { fieldset, inputGroup } = await checkboxes(rowOf(editorWith({ row: { config: { fieldset: true } } })))
    assert.equal(fieldset.checked, true)
    assert.equal(inputGroup.checked, false)
  })

  it('a config with only inputGroup leaves Fieldset unchecked', async () => {
    const { fieldset, inputGroup } = await checkboxes(rowOf(editorWith({ row: { config: { inputGroup: true } } })))
    assert.equal(fieldset.checked, false)
    assert.equal(inputGroup.checked, true)
  })

  it('the first click on an unset checkbox turns the setting on', async () => {
    const editorComponents = editorWith({ row: { config: {} } })
    const row = rowOf(editorComponents)
    const { fieldset, inputGroup } = await checkboxes(row)
    fieldset.click()
    inputGroup.click()
    assert.equal(row.get('config.fieldset'), true)
    assert.equal(row.get('config.inputGroup'), true)
  })

  it('loading an unset config saves it unchanged', () => {
    const editorComponents = editorWith({ row: { config: {} } })
    assert.deepEqual(editorComponents.formData.rows['r-1'].config, {})
  })
})
