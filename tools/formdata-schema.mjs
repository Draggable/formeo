import { z } from 'zod'

// Formeo ids are 8-hex short ids (common/utils shortId) or full v4 uuids (older data)
export const componentId = z
  .string()
  .regex(/^[0-9a-f]{8}(-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/)
  .describe('Formeo component id: 8-character hex short id or full uuid')

const htmlAttributesSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.function(),
    z.record(z.string(), z.string()), // for style objects
    z.array(z.looseObject({ label: z.string(), value: z.string(), selected: z.boolean().optional() })),
  ])
)

const conditionIfSchema = z.looseObject({
  logical: z
    .enum(['&&', '||', 'and', 'or'])
    .optional()
    .describe('Joins this clause to the previous one. The editor stores && or ||'),
  source: z.string().optional(),
  sourceProperty: z.string().optional(),
  comparison: z.string().optional(),
  target: z.string().optional(),
  targetProperty: z.string().optional(),
})

const conditionThenSchema = z.looseObject({
  target: z.string().optional(),
  targetProperty: z.string().optional(),
  assignment: z.string().optional(),
  value: z.string().optional(),
})

export const conditionsSchema = z.array(
  z.looseObject({ if: z.array(conditionIfSchema).optional(), then: z.array(conditionThenSchema).optional() })
)

// a table field's structure. Loose objects, so keys added later (and unknown keys) still validate
const tableSchema = z
  .looseObject({
    caption: z.string().optional(),
    headerRow: z.boolean().optional().describe('columns[].label render as <thead> th scope="col"'),
    rowHeaders: z.boolean().optional().describe('each row\'s first cell renders as th scope="row"'),
    repeat: z
      .looseObject({
        min: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe('rows the form starts with, and the fewest it keeps; default 1'),
        max: z
          .number()
          .int()
          .min(1)
          .nullable()
          .optional()
          .describe('the most rows the person filling in the form can add; null or absent for no limit'),
      })
      .optional()
      .describe('the person filling in the form adds and removes rows copied from rows[0]; needs an input column'),
    columns: z.array(
      z.looseObject({
        label: z.string(),
        value: z.string().optional().describe('the name key of an input column'),
        input: z
          .enum(['radio', 'checkbox', 'text'])
          .optional()
          .describe('the input each cell of this column renders; absent for a static column'),
      })
    ),
    rows: z.array(
      z.looseObject({
        cells: z.array(z.string()),
        value: z.string().optional().describe('the name key of the row'),
        required: z.boolean().optional().describe("the row's inputs must be answered"),
      })
    ),
  })
  .describe(
    'Table element data: a caption, header options, columns and rows of plain-text cells; columns with an input make a matrix, and repeat lets the person filling in the form add rows'
  )

const className = z.union([z.string(), z.array(z.string())]).optional()

export const formDataSchema = z
  .looseObject({
    $schema: z
      .string()
      .regex(/\.json$/)
      .optional(),
    id: componentId,
    stages: z
      .record(
        componentId,
        z
          .object({
            id: componentId,
            children: z.array(componentId),
            attrs: htmlAttributesSchema.optional(),
            conditions: conditionsSchema.optional(),
          })
          .catchall(z.any())
      )
      .describe('Droppable zones for rows, columns and fields'),
    rows: z
      .record(
        componentId,
        z
          .object({
            id: componentId,
            children: z.array(componentId),
            className,
            attrs: htmlAttributesSchema.optional(),
            config: z
              .object({
                fieldset: z.boolean().optional(),
                legend: z.string().optional(),
                inputGroup: z.boolean().optional(),
              })
              .catchall(z.any())
              .optional(),
            conditions: conditionsSchema.optional(),
          })
          .catchall(z.any())
      )
      .describe('Droppable zones for columns and fields'),
    columns: z
      .record(
        componentId,
        z
          .object({
            id: componentId,
            children: z.array(componentId),
            className,
            attrs: htmlAttributesSchema.optional(),
            config: z.object({ width: z.string().optional() }).catchall(z.any()).optional(),
            conditions: conditionsSchema.optional(),
          })
          .catchall(z.any())
      )
      .describe('Droppable zones for fields'),
    fields: z
      .record(
        componentId,
        z
          .object({
            id: componentId,
            tag: z.string(),
            attrs: htmlAttributesSchema.optional(),
            config: z
              .object({
                label: z.string().optional(),
                hideLabel: z.boolean().optional(),
                labelPosition: z
                  .enum(['top', 'bottom', 'before', 'after'])
                  .optional()
                  .describe('Where the label sits: top/bottom stack, before/after sit beside the control'),
                labelAfter: z
                  .boolean()
                  .optional()
                  .describe('Legacy: replaced by labelPosition, which wins when both are set'),
                editableContent: z.boolean().optional(),
                controlId: z.string().optional(),
                disabledAttrs: z.array(z.string()).optional(),
                lockedAttrs: z.array(z.string()).optional(),
                other: z.boolean().optional(),
                otherLabel: z.string().optional(),
              })
              .catchall(z.any())
              .optional(),
            meta: z
              .looseObject({ group: z.string().optional(), icon: z.string().optional(), id: z.string().optional() })
              .optional(),
            content: z.any().optional(),
            action: z.object({}).catchall(z.any()).optional(),
            options: z
              .array(
                z
                  .object({
                    label: z.string(),
                    value: z.string().optional(),
                    selected: z.boolean().optional(),
                    checked: z.boolean().optional(),
                  })
                  .catchall(z.any())
              )
              .optional(),
            conditions: conditionsSchema.optional(),
            table: tableSchema.optional(),
          })
          .catchall(z.any())
      )
      .describe('Field and Element definitions'),
  })
  .describe('Schema definition for formData')

export function buildFormDataJsonSchema() {
  const { $schema, ...rest } = z.toJSONSchema(formDataSchema, { target: 'draft-7', unrepresentable: 'any' })
  return { $schema, title: 'formData', ...rest }
}
