import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const htmlAttributesSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.function(),
    z.record(z.string(), z.string()), // for style objects
    z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        selected: z.boolean().optional(),
      })
    ), // for configurable html elements like h1, h2 etc
  ])
)

const formDataSchema = z
  .object({
    $schema: z.string().regex(/\.json$/),
    id: z.string().uuid(),
    stages: z
      .record(
        z.string().uuid(),
        z.object({
          id: z.string().uuid(),
          children: z.array(z.string().uuid()),
        })
      )
      .describe('Droppable zones for rows, columns and fields'),
    rows: z
      .record(
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
        })
      )
      .describe('Droppable zones for columns and fields'),
    columns: z
      .record(
        z.string().uuid(),
        z.object({
          id: z.string().uuid(),
          children: z.array(z.string().uuid()),
          className: z.union([z.string(), z.array(z.string())]).optional(),
          config: z
            .object({
              width: z.string().optional(),
            })
            .optional(),
        })
      )
      .describe('Droppable zones for fields'),
    fields: z
      .record(
        z.string().uuid(),
        z.object({
          id: z.string().uuid(),
          tag: z.string(),
          attrs: htmlAttributesSchema.optional(),
          config: z
            .object({
              label: z.string().optional(),
              hideLabel: z.boolean().optional(),
              editableContent: z.boolean().optional(),
            })
            .catchall(z.any())
            .optional(),
          meta: z
            .object({
              group: z.string().optional(),
              icon: z.string().optional(),
              id: z.string().optional(),
            })
            .optional(),
          content: z.any().optional(),
          action: z.object({}).optional(),
          options: z
            .array(
              z
                .object({
                  label: z.string(),
                  value: z.string().optional(),
                  selected: z.boolean().optional(),
                  checked: z.boolean().optional(),
                  type: z
                    .array(
                      z.object({
                        type: z.string(),
                        label: z.string(),
                        // value: z.string().optional(),
                        selected: z.boolean().optional(),
                      })
                    )
                    .optional(),
                })
                .catchall(z.any())
            )
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
                    })
                  )
                  .optional(),
                // "then" is not a keyword when used as a key in
                // an object and required for the schema
                then: z
                  .array(
                    z.object({
                      target: z.string().optional(),
                      targetProperty: z.string().optional(),
                      assignment: z.string().optional(),
                      value: z.string().optional(),
                    })
                  )
                  .optional(),
              })
            )
            .optional(),
        })
      )
      .describe('Field and Element definitions'),
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
      {} as Record<string, unknown>
    ),
    ...schema,
  }
}

const jsonSchema = zodToJsonSchema(formDataSchema, { name: 'formData', nameStrategy: 'title' })
const orderedJsonSchema = reorderSchema(jsonSchema)
const distDir = join(projectRoot, 'dist')
writeFileSync(join(distDir, 'formData_schema.json'), JSON.stringify(orderedJsonSchema, null, 2))
