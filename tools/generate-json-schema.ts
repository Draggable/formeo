import { join } from 'node:path'
import { writeFileSync } from 'node:fs'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const __dirname = join(new URL('.', import.meta.url).pathname)

const htmlAttributesSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.function(),
    z.record(z.string(), z.string()), // for style objects
  ]),
)

const formDataSchema = z
  .object({
    id: z.string().uuid(),
    stages: z.record(
      z.string().uuid(),
      z.object({
        id: z.string().uuid(),
        children: z.array(z.string().uuid()),
      }),
    ),
    rows: z.record(
      z.string().uuid(),
      z.object({
        id: z.string().uuid(),
        children: z.array(z.string().uuid()),
        className: z.union([z.string(), z.array(z.string())]).optional(),
        config: z
          .object({
            fieldset: z.boolean().optional(),
            legend: z.string().optional(),
            inputGroup: z.boolean().optional(),
          })
          .optional(),
      }),
    ),
    columns: z.record(
      z.string().uuid(),
      z.object({
        id: z.string().uuid(),
        children: z.array(z.string().uuid()),
        className: z.string().optional(),
        config: z
          .object({
            width: z.string().optional(),
          })
          .optional(),
      }),
    ),
    fields: z.record(
      z.string().uuid(),
      z.object({
        id: z.string().uuid(),
        tag: z.string(),
        attrs: htmlAttributesSchema.optional(),
        config: z
          .object({
            label: z.string().optional(),
          })
          .optional(),
        meta: z
          .object({
            group: z.string().optional(),
            icon: z.string().optional(),
            id: z.string().optional(),
          })
          .optional(),
        conditions: z
          .array(
            z.object({
              if: z
                .array(
                  z.object({
                    source: z.string().optional(),
                    sourceProperty: z.string().optional(),
                    comparison: z.string().optional(),
                    target: z.string().optional(),
                    targetProperty: z.string().optional(),
                  }),
                )
                .optional(),
              // "then" is not a keyword when used as a key in
              // an object and required for the schema
              // biome-ignore lint/suspicious/noThenProperty:
              then: z
                .array(
                  z.object({
                    target: z.string().optional(),
                    targetProperty: z.string().optional(),
                    assignment: z.string().optional(),
                    value: z.string().optional(),
                  }),
                )
                .optional(),
            }),
          )
          .optional(),
      }),
    ),
  })
  .describe('Schema definition for formData')

const reorderSchema = (schema: object) => {
  const topProperties = ['$schema', 'title', 'description']
  return {
    ...topProperties.reduce(
      (acc, key) => {
        if (key in schema) {
          acc[key] = schema[key as keyof typeof schema]
        }
        return acc
      },
      {} as Record<string, unknown>,
    ),
    ...schema,
  }
}
const jsonSchema = zodToJsonSchema(formDataSchema, { name: 'formData', nameStrategy: 'title' })
const orderedJsonSchema = reorderSchema(jsonSchema)
const distDir = join(__dirname, '../dist')
writeFileSync(join(distDir, 'formData.schema.json'), JSON.stringify(orderedJsonSchema, null, 2))
