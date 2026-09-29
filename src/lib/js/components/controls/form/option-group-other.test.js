import { strict as assert } from 'node:assert'
import { after, before, describe, it } from 'node:test'
import i18n from '@draggable/i18n'
import { Actions } from '../../../common/actions.js'
import { DEFAULT_OTHER_LABEL } from '../../../common/dom.js'
import { Events } from '../../../common/events.js'
import { configOptionsOf } from '../../edit-panel/config-options.mjs'
import Field from '../../fields/field.js'
import { Components } from '../../index.js'
import { Controls } from '../index.js'
import CheckboxGroupControl from './checkbox-group.js'
import RadioGroupControl from './radio-group.js'

// an editor's Components whose Controls registered the checkbox and radio group controls
const editor = () => {
  const events = new Events().init({})
  const editorComponents = new Components({ events, actions: new Actions(events).init({}) })
  const controls = new Controls(editorComponents)
  controls.add(new CheckboxGroupControl())
  controls.add(new RadioGroupControl())
  editorComponents.controls = controls
  return editorComponents
}

// a field as its control adds it: the control's data, its control id and any config overrides
const fieldFrom = (controlId, config = {}) => {
  const editorComponents = editor()
  const { meta: _meta, ...data } = editorComponents.controls.get(controlId)
  return new Field({ ...data, config: { ...data.config, controlId, ...config } }, editorComponents)
}

const panelKeys = field => field.editPanels.get('config').editPanelItems.map(({ itemKey }) => itemKey)
// jsdom only fires a checkbox's change event on click() while it is in the document, as the editor's panel is
const toggleOther = field => {
  document.body.replaceChildren(field.dom)
  field.editPanels
    .get('config')
    .editPanelItems.find(({ itemKey }) => itemKey === 'config.other')
    .dom.querySelector('input[type="checkbox"]')
    .click()
}

describe('Other choice in the editor', () => {
  it('checkbox and radio groups show the Other toggle, switched off, and can add otherLabel', () => {
    for (const controlId of ['checkbox', 'radio']) {
      const field = fieldFrom(controlId)
      assert.equal(field.get('config.other'), false, controlId)
      assert.ok(panelKeys(field).includes('config.other'), controlId)
      assert.ok(field.editPanels.get('config').addableConfigOptions().has('otherLabel'), controlId)
    }
  })

  it('a field of another control offers no Other toggle', () => {
    const field = new Field(
      { tag: 'input', attrs: { type: 'text' }, config: { label: 'Name', controlId: 'text-input' } },
      editor()
    )
    assert.equal(configOptionsOf(field.config).has('other'), false)
  })

  it('a checkbox group saved before this feature renders as before and can add Other from the dialog', () => {
    const editorComponents = editor()
    const field = new Field(
      {
        tag: 'input',
        attrs: { type: 'checkbox' },
        config: { label: 'Old group', controlId: 'checkbox' },
        options: [{ label: 'One', value: 'one' }],
      },
      editorComponents
    )
    assert.equal(field.preview.querySelector('.f-checkbox-other'), null)
    const addable = field.editPanels.get('config').addableConfigOptions()
    assert.ok(addable.has('other') && addable.has('otherLabel'))
  })

  describe('the preview Other choice', () => {
    const previewChange = input => input.dispatchEvent(new window.Event('change', { bubbles: true }))

    it('is disabled, because Other is never checked by default', () => {
      const field = fieldFrom('checkbox', { other: true })
      assert.equal(field.preview.querySelector('.f-checkbox-other input[value="other"]').disabled, true)
    })

    it('checked in the preview, it neither throws nor stops an option from being saved as checked', () => {
      // jsdom reports a listener's exception as a window error event rather than throwing from dispatchEvent
      const errors = []
      const onError = evt => errors.push(evt.error)
      window.addEventListener('error', onError)
      try {
        for (const controlId of ['checkbox', 'radio']) {
          const field = fieldFrom(controlId, { other: true })
          const optionCount = field.get('options').length
          document.body.replaceChildren(field.dom)
          const other = field.preview.querySelector('input[value="other"]')
          other.checked = true
          previewChange(other)

          const [first] = field.preview.querySelectorAll(`input[type="${controlId}"]`)
          first.checked = true
          previewChange(first)
          const checkedType = controlId === 'radio' ? 'selected' : 'checked'
          assert.equal(field.get('options')[0][checkedType], true, controlId)
          assert.equal(field.get('options').length, optionCount, `${controlId}: Other never becomes an option`)
        }
        assert.deepEqual(errors, [])
      } finally {
        window.removeEventListener('error', onError)
      }
    })
  })

  describe('switching Other on', () => {
    // i18n.get reads the locale's table; tests have no language loaded, so i18n.current isn't that table
    const lang = () => {
      i18n.langs[i18n.locale] ??= {}
      return i18n.langs[i18n.locale]
    }
    before(() => {
      lang().other = 'Autre'
    })
    after(() => {
      delete lang().other
    })

    it('fills an empty otherLabel in the editor language and shows it in the panel and the preview', () => {
      const field = fieldFrom('checkbox')
      toggleOther(field)
      assert.equal(field.get('config.other'), true)
      assert.equal(field.get('config.otherLabel'), 'Autre')
      assert.ok(panelKeys(field).includes('config.otherLabel'))
      assert.equal(field.preview.querySelector('.f-checkbox-other label')?.textContent, 'Autre')
    })

    it('falls back to "Other" when the editor language has no word for it', () => {
      const saved = lang().other
      delete lang().other
      try {
        const field = fieldFrom('radio')
        toggleOther(field)
        assert.equal(field.get('config.otherLabel'), i18n.get('other') || DEFAULT_OTHER_LABEL)
      } finally {
        lang().other = saved
      }
    })

    it('keeps a label the author already set', () => {
      const field = fieldFrom('checkbox', { otherLabel: 'Something else' })
      toggleOther(field)
      assert.equal(field.get('config.otherLabel'), 'Something else')
    })

    it('switching Other off keeps otherLabel and removes the choice from the preview', () => {
      const field = fieldFrom('checkbox', { other: true, otherLabel: 'Something else' })
      assert.ok(field.preview.querySelector('.f-checkbox-other'))
      toggleOther(field)
      assert.equal(field.get('config.other'), false)
      assert.equal(field.get('config.otherLabel'), 'Something else')
      assert.equal(field.preview.querySelector('.f-checkbox-other'), null)
    })
  })
})
