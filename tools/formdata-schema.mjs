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
    z.array(z.object({ label: z.string(), value: z.string(), selected: z.boolean().optional() })),
  ])
)

const conditionIfSchema = z.object({
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

const conditionThenSchema = z.object({
  target: z.string().optional(),
  targetProperty: z.string().optional(),
  assignment: z.string().optional(),
  value: z.string().optional(),
})

export const conditionsSchema = z.array(
  z.object({ if: z.array(conditionIfSchema).optional(), then: z.array(conditionThenSchema).optional() })
)

const className = z.union([z.string(), z.array(z.string())]).optional()

export const formDataSchema = z
  .object({
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
                editableContent: z.boolean().optional(),
                controlId: z.string().optional(),
                disabledAttrs: z.array(z.string()).optional(),
                lockedAttrs: z.array(z.string()).optional(),
              })
              .catchall(z.any())
              .optional(),
            meta: z
              .object({ group: z.string().optional(), icon: z.string().optional(), id: z.string().optional() })
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
