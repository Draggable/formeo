import { name } from '../../package.json'

export const PACKAGE_NAME = name

export const POLYFILLS = [
  { name: 'cssPreload', src: '//cdnjs.cloudflare.com/ajax/libs/loadCSS/2.0.1/cssrelpreload.min.js' },
  { name: 'mutationObserver', src: '//cdn.jsdelivr.net/npm/mutationobserver-shim/dist/mutationobserver.min.js' },
  { name: 'fetch', src: 'https://unpkg.com/unfetch/polyfill' },
]

export const FALLBACK_SVG_SPRITE = 'https://draggable.github.io/formeo/assets/img/formeo-sprite.svg'

export const CONTROL_GROUP_CLASSNAME = 'control-group'
export const STAGE_CLASSNAME = `${PACKAGE_NAME}-stage`
export const ROW_CLASSNAME = `${PACKAGE_NAME}-row`
export const COLUMN_CLASSNAME = `${PACKAGE_NAME}-column`
export const FIELD_CLASSNAME = `${PACKAGE_NAME}-field`

export const CHILD_CLASSNAME_MAP = new Map([
  [STAGE_CLASSNAME, ROW_CLASSNAME],
  [ROW_CLASSNAME, COLUMN_CLASSNAME],
  [COLUMN_CLASSNAME, FIELD_CLASSNAME],
])

export const COMPONENT_INDEX_TYPES = ['external', 'stages', 'rows', 'columns', 'fields']

export const COMPONENT_TYPES = [
  { name: 'controls', className: CONTROL_GROUP_CLASSNAME },
  { name: 'stage', className: STAGE_CLASSNAME },
  { name: 'row', className: ROW_CLASSNAME },
  { name: 'column', className: COLUMN_CLASSNAME },
  { name: 'field', className: FIELD_CLASSNAME },
]

export const COMPONENT_TYPE_CLASSNAMES = {
  controls: CONTROL_GROUP_CLASSNAME,
  stage: STAGE_CLASSNAME,
  row: ROW_CLASSNAME,
  column: COLUMN_CLASSNAME,
  field: FIELD_CLASSNAME,
}

export const COMPONENT_TYPE_CLASSNAMES_LOOKUP = Object.entries(COMPONENT_TYPE_CLASSNAMES).reduce(
  (acc, [type, className]) => ({
    ...acc,
    [className]: type,
  }),
  {}
)

export const COMPONENT_TYPE_CLASSNAMES_ARRAY = Object.values(COMPONENT_TYPE_CLASSNAMES)
export const COMPONENT_TYPE_CLASSNAMES_REGEXP = new RegExp(`${COMPONENT_TYPE_CLASSNAMES_ARRAY.join('|')}`, 'g')

const childTypeMap = COMPONENT_TYPES.map(({ name }, index, arr) => {
  const { name: childName } = arr[index + 1] || {}
  return childName && [name, childName]
}).filter(Boolean)

const parentTypeMap = childTypeMap
  .slice()
  .map(typeMap => typeMap.slice().reverse())
  .reverse()

export const CHILD_TYPE_MAP = new Map(childTypeMap)

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
  [{ value: '20.0,20.0,20.0,20.0,20.0', label: '20 | 20 | 20 | 20 | 20' }],
  [{ value: '16.66,16.66,16.66,16.66,16.66,16.66', label: '16.66 | 16.66 | 16.66 | 16.66 | 16.66 | 16.66' }],
]

export const COLUMN_TEMPLATES = new Map(
  columnTemplates.reduce((acc, cur, idx) => {
    acc.push([idx, cur])
    return acc
  })
)

export const CHANGE_TYPES = [{ type: 'added', condition: (o, n) => Boolean(o === undefined && n) }]

export const SESSION_FORMDATA_KEY = `${name}-formData`
export const SESSION_LOCALE_KEY = `${name}-locale`

export const ANIMATION_SPEED_BASE = 333
export const ANIMATION_SPEED_FAST = Math.round(ANIMATION_SPEED_BASE / 2)
export const ANIMATION_SPEED_SLOW = Math.round(ANIMATION_SPEED_BASE * 2)

//  Event constants
export const EVENT_FORMEO_SAVED = 'formeoSaved'
export const EVENT_FORMEO_UPDATED = 'formeoUpdated'
export const EVENT_FORMEO_UPDATED_STAGE = 'formeoUpdatedStage'
export const EVENT_FORMEO_UPDATED_ROW = 'formeoUpdatedRow'
export const EVENT_FORMEO_UPDATED_COLUMN = 'formeoUpdatedColumn'
export const EVENT_FORMEO_UPDATED_FIELD = 'formeoUpdatedField'
export const EVENT_FORMEO_CLEARED = 'formeoCleared'
export const EVENT_FORMEO_ON_RENDER = 'formeoOnRender'
export const EVENT_FORMEO_CONDITION_UPDATED = 'formeoConditionUpdated'
export const COMPARISON_OPERATORS = {
  equals: '==',
  notEquals: '!=',
  contains: '⊃',
  notContains: '!⊃',
}
export const LOGICAL_OPERATORS = {
  and: '&&',
  or: '||',
}

const visiblityConfigs = {
  isVisible: 'config.isVisible',
  isNotVisible: 'config.isNotVisible',
}

export const ASSIGNMENT_OPERATORS = {
  equals: '=',
}

export const CONDITION_INPUT_ORDER = [
  'label',
  'logical',
  'source',
  'thenTarget',
  'sourceProperty',
  'comparison',
  'target',
  'targetProperty',
  'assignment',
  'value',
]

export const FIELD_PROPERTY_MAP = {
  value: 'attrs.value',
  ...visiblityConfigs,
}

export const OPERATORS = {
  comparison: COMPARISON_OPERATORS,
  assignment: ASSIGNMENT_OPERATORS,
  logical: LOGICAL_OPERATORS,
  property: FIELD_PROPERTY_MAP,
}

export const CONDITION_TEMPLATE = () => ({
  if: [
    {
      source: '',
      sourceProperty: '',
      comparison: '',
      target: '',
      targetProperty: '',
    },
  ],
  then: [
    {
      target: '',
      targetProperty: '',
      assignment: '',
      value: '',
    },
  ],
})

export const UUID_REGEXP = /(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b)/gi

export const bsColRegExp = /\bcol-\w+-\d+/g
