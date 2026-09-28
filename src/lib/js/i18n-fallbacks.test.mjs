import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { enUS } from '@draggable/formeo-languages'

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
