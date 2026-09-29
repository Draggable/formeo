import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { DEFAULT_OTHER_LABEL, dom, OTHER_GROUP_ATTR } from './dom.js'

const groupField = ({ type = 'checkbox', attrs = {}, config = {}, options = ['One', 'Two'] } = {}) => ({
  tag: 'input',
  id: 'f-hobbies',
  attrs: { type, ...attrs },
  config: { label: 'Hobbies', other: true, otherLabel: 'Something else', ...config },
  options: options.map(label => ({ label, value: label.toLowerCase() })),
})

// renders into a fresh container so queries and bubbling events work; earlier renders are removed, because they
// reuse the same ids and jsdom resolves `#id` selectors against the document's first match
const render = (field, isPreview = false) => {
  document.body.replaceChildren()
  const container = document.createElement('div')
  container.appendChild(dom.create(field, isPreview))
  document.body.appendChild(container)
  return {
    container,
    group: container.querySelector('#f-hobbies'),
    choice: container.querySelector('input[value="other"]'),
    label: container.querySelector('#f-hobbies-other-label'),
    text: container.querySelector('.f-other-value'),
  }
}

const change = elem => elem.dispatchEvent(new window.Event('change', { bubbles: true }))

describe('Other choice rendering', () => {
  test('nothing is added without config.other', () => {
    const { choice, text } = render(groupField({ config: { other: false } }))
    assert.equal(choice, null)
    assert.equal(text, null)
  })

  test('nothing is added to a group that is not a checkbox or radio group', () => {
    const { choice } = render({ ...groupField(), tag: 'select', attrs: {} })
    assert.equal(choice, null)
  })

  test('a checkbox group gets a last choice with its label and a disabled text box', () => {
    const { container, choice, label, text } = render(groupField({ attrs: { name: 'hobbies' } }))
    const wraps = Array.from(container.querySelectorAll('.f-checkbox'))
    assert.equal(wraps.length, 3)
    assert.ok(wraps[2].classList.contains('f-checkbox-other'), 'the Other choice comes last')
    assert.equal(choice.type, 'checkbox')
    assert.equal(choice.name, 'hobbies[]')
    assert.equal(choice.id, 'f-hobbies-other')
    assert.equal(label.getAttribute('for'), 'f-hobbies-other')
    assert.equal(label.textContent, 'Something else')
    assert.equal(text.type, 'text')
    assert.equal(text.name, 'hobbies-other')
    assert.equal(text.id, 'f-hobbies-other-value')
    assert.equal(text.getAttribute('aria-labelledby'), 'f-hobbies-other-label')
    assert.equal(text.disabled, true)
    assert.equal(text.required, false)
  })

  test('an empty otherLabel falls back to "Other"', () => {
    const { label } = render(groupField({ config: { otherLabel: '' } }))
    assert.equal(label.textContent, DEFAULT_OTHER_LABEL)
  })

  test('the Other choice counts toward the [] suffix of a one-option checkbox group (#128)', () => {
    const { container, text } = render(groupField({ options: ['One'] }))
    const names = Array.from(container.querySelectorAll('input[type="checkbox"]'), input => input.name)
    assert.deepEqual(names, ['f-hobbies[]', 'f-hobbies[]'])
    assert.equal(text.name, 'f-hobbies-other', 'an unnamed group falls back to its id')
  })

  test('a radio group shares its name with the Other choice, without []', () => {
    const { choice, text } = render(groupField({ type: 'radio', attrs: { name: 'color' } }))
    assert.equal(choice.type, 'radio')
    assert.equal(choice.name, 'color')
    assert.equal(text.name, 'color-other')
  })

  test('a required group makes the text box required', () => {
    const { choice, text } = render(groupField({ type: 'radio', attrs: { name: 'color', required: true } }))
    assert.equal(choice.required, true, 'the choice is required like every radio')
    assert.equal(text.required, true)
    assert.equal(text.disabled, true, 'disabled, so it does not validate until Other is chosen')
  })

  test('an inline group shows the Other choice inline too', () => {
    const { choice } = render(groupField({ config: { inline: true } }))
    assert.ok(choice.parentElement.classList.contains('f-checkbox-inline'))
  })

  test('the text box is enabled only while Other is checked', () => {
    const { group, choice, text } = render(groupField({ attrs: { name: 'hobbies' } }))
    assert.equal(group.getAttribute(`data-${OTHER_GROUP_ATTR}`), 'true')
    choice.checked = true
    change(choice)
    assert.equal(text.disabled, false)
    choice.checked = false
    change(choice)
    assert.equal(text.disabled, true)
  })

  test('picking another radio disables the text box', () => {
    const { container, choice, text } = render(groupField({ type: 'radio', attrs: { name: 'color' } }))
    choice.checked = true
    change(choice)
    const [one] = container.querySelectorAll('input[type="radio"]')
    one.checked = true
    change(one)
    assert.equal(text.disabled, true)
  })

  test('the text box stays disabled while the choice itself is disabled', () => {
    const { group, choice, text } = render(groupField({ attrs: { name: 'hobbies', disabled: true } }))
    choice.checked = true
    dom.syncOtherInput(group)
    assert.equal(text.disabled, true)
  })

  test('the editor preview shows the choice with a label that is not contenteditable, and no listeners', () => {
    const { container, choice, label, text } = render(groupField(), true)
    const optionLabels = Array.from(container.querySelectorAll('label[for^="f-hobbies-"]')).filter(
      optionLabel => optionLabel !== label
    )
    assert.ok(optionLabels.length > 0 && optionLabels.every(optionLabel => optionLabel.hasAttribute('contenteditable')))
    assert.equal(label.hasAttribute('contenteditable'), false)
    assert.equal(text.name, 'f-hobbies-other', 'the preview keeps id-based names')
    assert.equal(container.querySelector(`[data-${OTHER_GROUP_ATTR}]`), null)
    choice.checked = true
    change(choice)
    assert.equal(text.disabled, true, 'the preview text box never enables')
  })
})
