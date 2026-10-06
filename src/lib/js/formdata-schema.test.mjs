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

  test('accepts attrs on rows and columns (#112)', t => {
    const data = structuredClone(conditionalFields)
    const [rowId] = Object.keys(data.rows)
    const [columnId] = Object.keys(data.columns)
    data.rows[rowId].attrs = { 'data-section': 'contact', className: 'my-row' }
    data.columns[columnId].attrs = { 'aria-label': 'Left', style: 'padding: 4px' }
    const result = formDataSchema.safeParse(data)
    t.assert.ok(result.success, JSON.stringify(result.error?.issues))
  })

  test('accepts a field labelPosition and legacy labelAfter, and rejects other positions (#243)', t => {
    const data = structuredClone(conditionalFields)
    const [fieldId] = Object.keys(data.fields)
    const withConfig = config => {
      data.fields[fieldId].config = { label: 'Name', ...config }
      return formDataSchema.safeParse(data).success
    }
    for (const labelPosition of ['top', 'bottom', 'before', 'after']) {
      t.assert.ok(withConfig({ labelPosition }), labelPosition)
    }
    t.assert.strictEqual(withConfig({ labelPosition: 'left' }), false)
    t.assert.ok(withConfig({ labelAfter: true }))
    t.assert.strictEqual(withConfig({ labelAfter: 'yes' }), false)
  })

  test('the generated JSON schema lists the label positions (#243)', t => {
    const config = buildFormDataJsonSchema().properties.fields.additionalProperties.properties.config
    t.assert.deepStrictEqual(config.properties.labelPosition.enum, ['top', 'bottom', 'before', 'after'])
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

  test('accepts a table field and rejects malformed cells and columns (#349)', t => {
    const data = structuredClone(conditionalFields)
    const [fieldId] = Object.keys(data.fields)
    const withTable = table => {
      data.fields[fieldId] = { id: fieldId, tag: 'table', config: { label: 'Table', hideLabel: true }, table }
      return formDataSchema.safeParse(data).success
    }
    const table = {
      caption: 'Hours',
      headerRow: true,
      rowHeaders: false,
      columns: [{ label: 'Day' }, { label: 'Open' }],
      rows: [{ cells: ['Mon', '9–5'] }],
    }
    t.assert.ok(withTable(table))
    t.assert.ok(
      withTable({ columns: [{ label: 'A', value: 'a' }], rows: [{ cells: ['x'], value: 'r' }] }),
      'extra keys'
    )
    t.assert.strictEqual(withTable({ ...table, rows: [{ cells: [1, 2] }] }), false)
    t.assert.strictEqual(withTable({ ...table, columns: [{ value: 'a' }] }), false)
    t.assert.strictEqual(withTable({ ...table, headerRow: 'yes' }), false)
  })

  test('the generated JSON schema describes a field table (#349)', t => {
    const field = buildFormDataJsonSchema().properties.fields.additionalProperties
    const table = field.properties.table
    t.assert.deepStrictEqual(table.required, ['columns', 'rows'])
    t.assert.strictEqual(table.properties.rows.items.properties.cells.items.type, 'string')
  })

  test('accepts matrix columns and rows, and rejects malformed ones (#349 phase 2)', t => {
    const data = structuredClone(conditionalFields)
    const [fieldId] = Object.keys(data.fields)
    const withTable = table => {
      data.fields[fieldId] = { id: fieldId, tag: 'table', config: { label: 'Matrix', hideLabel: true }, table }
      return formDataSchema.safeParse(data).success
    }
    const matrix = {
      rowHeaders: true,
      columns: [{ label: '' }, { label: 'Good', value: 'good', input: 'radio' }, { label: 'C', input: 'text' }],
      rows: [{ value: 'speed', required: true, cells: ['Speed', '', ''] }],
    }
    t.assert.ok(withTable(matrix))
    t.assert.strictEqual(withTable({ ...matrix, columns: [{ label: 'A', input: 'select' }] }), false)
    t.assert.strictEqual(withTable({ ...matrix, columns: [{ label: 'A', value: 1 }] }), false)
    t.assert.strictEqual(withTable({ ...matrix, rows: [{ cells: [], required: 'yes' }] }), false)
    t.assert.strictEqual(withTable({ ...matrix, rows: [{ cells: [], value: 2 }] }), false)
  })

  test('the generated JSON schema describes matrix inputs (#349 phase 2)', t => {
    const field = buildFormDataJsonSchema().properties.fields.additionalProperties
    const { columns, rows } = field.properties.table.properties
    t.assert.deepStrictEqual(columns.items.properties.input.enum, ['radio', 'checkbox', 'text'])
    t.assert.strictEqual(columns.items.properties.value.type, 'string')
    t.assert.strictEqual(rows.items.properties.required.type, 'boolean')
    t.assert.strictEqual(rows.items.properties.value.type, 'string')
  })

  test('accepts a repeating table and rejects malformed limits (#349 phase 3)', t => {
    const data = structuredClone(conditionalFields)
    const [fieldId] = Object.keys(data.fields)
    const withTable = table => {
      data.fields[fieldId] = { id: fieldId, tag: 'table', config: { label: 'Order', hideLabel: true }, table }
      return formDataSchema.safeParse(data).success
    }
    const order = repeat => ({
      repeat,
      columns: [{ label: 'Qty', value: 'qty', input: 'text' }],
      rows: [{ cells: [''], required: true }],
    })
    t.assert.ok(withTable(order({ min: 1, max: 10 })))
    t.assert.ok(withTable(order({ min: 0, max: null })))
    t.assert.ok(withTable(order({})))
    t.assert.ok(withTable(order({ min: 1, later: true })), 'extra keys')
    t.assert.strictEqual(withTable(order({ min: '1' })), false)
    t.assert.strictEqual(withTable(order({ min: -1 })), false)
    t.assert.strictEqual(withTable(order({ max: 0 })), false)
    t.assert.strictEqual(withTable(order({ min: 1.5 })), false)
    t.assert.strictEqual(withTable(order(true)), false)
  })

  test('the generated JSON schema describes repeat (#349 phase 3)', t => {
    const table = buildFormDataJsonSchema().properties.fields.additionalProperties.properties.table
    t.assert.ok(table.properties.repeat)
    t.assert.strictEqual(table.properties.repeat.properties.min.type, 'integer')
  })
})
