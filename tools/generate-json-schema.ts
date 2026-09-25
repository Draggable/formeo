import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildFormDataJsonSchema } from './formdata-schema.mjs'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(projectRoot, 'dist', 'formData_schema.json')

writeFileSync(outFile, JSON.stringify(buildFormDataJsonSchema(), null, 2))
console.log(`formData schema: ${outFile}`)
