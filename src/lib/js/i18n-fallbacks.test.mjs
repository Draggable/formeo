import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { enUS } from '@draggable/formeo-languages'
import { INPUT_GROUP_TEXT } from './common/input-group-text.mjs'
import { TABLE_TEXT } from './common/table-text.mjs'

/**
 * Keys used as `i18n.get(key, vars) || '<English fallback>'` across the editor, until
 * @draggable/formeo-languages ships them. Each ships from 3.8.0 (Draggable/formeo-languages#87, refs #331).
 * `duplicateFieldName`'s fallback is a template literal in code (duplicate-name-hint.js); the `{name}` form
 * below is the token the shipped translation carries and `i18n.get` fills at call time.
 */
const FALLBACKS = {
  reorderOption: 'Drag to reorder', // edit-panel-item.mjs
  attributeNameRequired: 'Enter an attribute name', // common/actions.js
  selectConfigKey: 'Select Configuration Key', // edit-panel/edit-panel.js
  duplicateFieldName: 'Another field is also named "{name}", so their answers will share one key.', // edit-panel/duplicate-name-hint.js
}

describe('i18n fallbacks (#331)', () => {
  it('@draggable/formeo-languages ships reorderOption, attributeNameRequired, selectConfigKey and duplicateFieldName, matching the English fallback', () => {
    for (const [key, text] of Object.entries(FALLBACKS)) {
      assert.equal(enUS[key], text, key)
    }
  })
})

/**
 * Keys formeo uses before @draggable/formeo-languages ships them (#349 phase 3, Draggable/formeo-languages
 * feat/table-repeat-keys). The bump that ships them must empty this set: the second test below fails until it does.
 */
const PENDING = new Set([
  'table.repeat',
  'table.repeatLocked',
  'table.repeatMax',
  'table.repeatMin',
  'table.repeatNoMax',
  'table.repeatRequired',
  'table.repeatRow',
  'table.rowAdded',
  'table.rowRemoved',
  'inputGroup.add',
  'inputGroup.added',
  'inputGroup.remove',
  'inputGroup.removed',
])

describe('i18n fallbacks (#349)', () => {
  it('@draggable/formeo-languages ships every TABLE_TEXT and INPUT_GROUP_TEXT key that is not pending, matching the English fallback', () => {
    for (const [key, text] of Object.entries({ ...TABLE_TEXT, ...INPUT_GROUP_TEXT })) {
      if (!PENDING.has(key)) {
        assert.equal(enUS[key], text, key)
      }
    }
  })

  it('no pending key has shipped yet; remove a key from PENDING when a bump ships it', () => {
    for (const key of PENDING) {
      assert.equal(enUS[key], undefined, key)
    }
  })
})
