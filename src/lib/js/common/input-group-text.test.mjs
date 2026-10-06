import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import i18n from '@draggable/i18n'
import { INPUT_GROUP_TEXT, inputGroupText } from './input-group-text.mjs'

describe('input group strings (#349 phase 3)', () => {
  let savedLangs
  beforeEach(() => {
    savedLangs = i18n.langs
    i18n.langs = Object.create(null)
  })
  afterEach(() => {
    i18n.langs = savedLangs
  })

  it('has an English fallback for every key', () => {
    assert.deepEqual(INPUT_GROUP_TEXT, {
      'inputGroup.add': 'Add +',
      'inputGroup.added': 'Group {n} added',
      'inputGroup.remove': 'Remove group {n}',
      'inputGroup.removed': 'Group {n} removed',
    })
  })

  it('fills tokens, and uses the current locale when it has the key', () => {
    assert.equal(inputGroupText('inputGroup.remove', { n: 2 }), 'Remove group 2')
    i18n.langs[i18n.locale] = { 'inputGroup.remove': 'Gruppe {n} entfernen' }
    assert.equal(inputGroupText('inputGroup.remove', { n: 3 }), 'Gruppe 3 entfernen')
  })
})
