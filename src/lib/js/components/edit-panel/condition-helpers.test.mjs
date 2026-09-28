import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { adoptStageTargetProperty, toggleFieldVisibility } from './condition-helpers.mjs'

/**
 * The inputs of one then-row, as Condition#fields holds them
 * @param {String} target
 * @param {String} targetProperty
 * @return {Map<String, HTMLElement>}
 */
const thenFields = (target, targetProperty) => {
  const select = document.createElement('select')
  for (const value of ['value', 'isChecked', 'isNotChecked', 'isVisible', 'isNotVisible']) {
    const option = document.createElement('option')
    option.value = value
    option.textContent = value
    select.append(option)
  }
  select.value = targetProperty
  const text = value => Object.assign(document.createElement('input'), { value })
  return new Map([
    ['target', text(target)],
    ['targetProperty', select],
    ['assignment', text('')],
    ['value', text('')],
  ])
}
const offered = fields =>
  [...fields.get('targetProperty').options]
    .filter(option => !option.classList.contains('hidden-option'))
    .map(option => option.value)

describe('condition fields for a page target (#122)', () => {
  it('a page target offers only isVisible and isNotVisible', () => {
    const fields = thenFields('stages.s-2', 'isNotVisible')
    toggleFieldVisibility(fields)
    assert.deepEqual(offered(fields), ['isVisible', 'isNotVisible'])
    assert.equal(fields.get('targetProperty').value, 'isNotVisible')
  })

  it('a stored property a page cannot take is shown as-is, not rewritten', () => {
    const fields = thenFields('stages.s-2', 'value')
    toggleFieldVisibility(fields)
    assert.equal(fields.get('targetProperty').value, 'value')
  })

  it('switching back to a field target offers its properties again', () => {
    const fields = thenFields('stages.s-2', 'isVisible')
    toggleFieldVisibility(fields)
    fields.get('target').value = 'fields.f-1'
    toggleFieldVisibility(fields)
    assert.deepEqual(offered(fields), ['value', 'isVisible', 'isNotVisible'])
  })

  it('picking a page as the target turns a property it cannot take into isNotVisible', () => {
    const picked = thenFields('stages.s-2', 'value')
    adoptStageTargetProperty(picked)
    assert.equal(picked.get('targetProperty').value, 'isNotVisible')

    const kept = thenFields('stages.s-2', 'isVisible')
    adoptStageTargetProperty(kept)
    assert.equal(kept.get('targetProperty').value, 'isVisible')

    const field = thenFields('fields.f-1', 'value')
    adoptStageTargetProperty(field)
    assert.equal(field.get('targetProperty').value, 'value')
  })
})
