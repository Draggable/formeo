import { suite, test } from 'node:test'
import { conditionalFields } from '../../../tests/conditions.formData.js'
import { buildFormDataJsonSchema, formDataSchema } from '../../../tools/formdata-schema.mjs'

const withSecondClause = logical => {
  const data = structuredClone(conditionalFields)
  data.stages.ff163056.conditions[0].if.push({ logical, source: 'fields.056be3d7', sourceProperty: 'value' })
  return data
}

suite('formData schema', () => {
  test('accepts formData saved by the current editor (8-char ids, stage conditions)', t => {
    const result = formDataSchema.safeParse(conditionalFields)
    t.assert.ok(result.success, JSON.stringify(result.error?.issues))
  })

  test('accepts the logical operator between if clauses and rejects unknown ones', t => {
    t.assert.ok(formDataSchema.safeParse(withSecondClause('&&')).success)
    t.assert.ok(formDataSchema.safeParse(withSecondClause('||')).success)
    t.assert.ok(formDataSchema.safeParse(withSecondClause('and')).success)
    t.assert.strictEqual(formDataSchema.safeParse(withSecondClause('AND')).success, false)
  })

  test('rejects component keys that are not formeo ids', t => {
    const data = structuredClone(conditionalFields)
    data.fields['not an id'] = data.fields['056be3d7']
    t.assert.strictEqual(formDataSchema.safeParse(data).success, false)
  })

  test('generates a populated JSON schema', t => {
    const schema = buildFormDataJsonSchema()
    t.assert.strictEqual(schema.$schema, 'http://json-schema.org/draft-07/schema#')
    t.assert.strictEqual(schema.title, 'formData')
    t.assert.deepStrictEqual(schema.required, ['id', 'stages', 'rows', 'columns', 'fields'])
    const ifItem = schema.properties.fields.additionalProperties.properties.conditions.items.properties.if.items
    t.assert.deepStrictEqual(ifItem.properties.logical.enum, ['&&', '||', 'and', 'or'])
  })

  test('the generated JSON schema never forbids additional properties', t => {
    const schema = buildFormDataJsonSchema()
    const offendingPaths = []
    const walk = (node, path) => {
      if (!node || typeof node !== 'object') {
        return
      }
      if (Array.isArray(node)) {
        node.forEach((item, i) => {
          walk(item, `${path}[${i}]`)
        })
        return
      }
      if (node.additionalProperties === false) {
        offendingPaths.push(path)
      }
      for (const [key, value] of Object.entries(node)) {
        walk(value, `${path}.${key}`)
      }
    }
    walk(schema, '$')
    t.assert.deepStrictEqual(offendingPaths, [])
  })

  test('accepts editor.json output ($schema) and uuid-keyed legacy components', t => {
    const withRef = {
      $schema: 'https://cdn.jsdelivr.net/npm/formeo@5.3.0/dist/formData_schema.json',
      ...structuredClone(conditionalFields),
    }
    t.assert.ok(formDataSchema.safeParse(withRef).success)

    const uuid = 'a33bcc32-c54c-46ed-9609-7cdb5b3dc511'
    const legacy = structuredClone(conditionalFields)
    legacy.fields[uuid] = { ...legacy.fields['056be3d7'], id: uuid }
    legacy.columns.f0002d5c.children.push(uuid)
    t.assert.ok(formDataSchema.safeParse(legacy).success)
  })
})
