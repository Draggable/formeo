export const POLYFILLS = [
  { name: 'cssPreload', src: 'https://cdnjs.cloudflare.com/ajax/libs/loadCSS/2.0.1/cssrelpreload.min.js' },
]

export const CONTROL_GROUP_CLASSNAME = 'control-group'
export const STAGE_CLASSNAME = 'stage'
export const ROW_CLASSNAME = `${STAGE_CLASSNAME}-rows`
export const COLUMN_CLASSNAME = `${STAGE_CLASSNAME}-columns`
export const FIELD_CLASSNAME = `${STAGE_CLASSNAME}-fields`

export const CHILD_CLASSNAME_MAP = new Map([
  [STAGE_CLASSNAME, ROW_CLASSNAME],
  [ROW_CLASSNAME, COLUMN_CLASSNAME],
  [COLUMN_CLASSNAME, FIELD_CLASSNAME],
])

export const COMPONENT_TYPES = [
  { name: 'controls', className: CONTROL_GROUP_CLASSNAME },
  { name: 'stage', className: STAGE_CLASSNAME },
  { name: 'row', className: ROW_CLASSNAME },
  { name: 'column', className: COLUMN_CLASSNAME },
  { name: 'field', className: FIELD_CLASSNAME },
]

const childTypeMap = COMPONENT_TYPES.map(({ name }, index, arr) => {
  const { name: childName } = arr[index + 1] || {}
  return childName && [name, childName]
}).filter(Boolean)

const parentTypeMap = childTypeMap
  .slice()
  .map(typeMap => typeMap.slice().reverse())
  .reverse()

export const CHILD_TYPE_MAP = new Map(childTypeMap.map(typeMap => typeMap.map(type => `${type}s`)))

export const PARENT_TYPE_MAP = new Map(parentTypeMap.slice())

export const TYPE_CHILD_CLASSNAME_MAP = new Map([
  ['stage', ROW_CLASSNAME],
  ['row', COLUMN_CLASSNAME],
  ['column', FIELD_CLASSNAME],
])

const columnTemplates = [
  [{ value: '100.0', label: '100%' }],
  [
    { value: '50.0,50.0', label: '50 | 50' },
    { value: '33.3,66.6', label: '33 | 66' },
    { value: '66.6,33.3', label: '66 | 33' },
  ],
  [
    { value: '33.3,33.3,33.3', label: '33 | 33 | 33' },
    { value: '25.0,25.0,50.0', label: '25 | 25 | 50' },
    { value: '50.0,25.0,25.0', label: '50 | 25 | 25' },
    { value: '25.0,50.0,25.0', label: '25 | 50 | 25' },
  ],
  [{ value: '25.0,25.0,25.0,25.0', label: '25 | 25 | 25 | 25' }],
]

export const COLUMN_TEMPLATES = new Map(
  columnTemplates.reduce(
    (acc, cur, idx) => {
      acc.push([idx, cur])
      return acc
    },
    [
      [
        'custom',
        {
          value: 'custom',
          label: 'Custom',
        },
      ],
    ]
  )
)

export const CHANGE_TYPES = [{ type: 'added', condition: (o, n) => Boolean(o === undefined && n) }]
