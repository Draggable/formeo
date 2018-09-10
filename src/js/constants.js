export const POLYFILLS = [
  { name: 'cssPreload', src: 'https://cdnjs.cloudflare.com/ajax/libs/loadCSS/2.0.1/cssrelpreload.min.js' },
]

export const CONTROL_GROUP_CLASSNAME = 'control-group'
export const STAGE_CLASSNAME = 'stage'
export const ROW_CLASSNAME = `${STAGE_CLASSNAME}-rows`
export const COLUMN_CLASSNAME = `${STAGE_CLASSNAME}-columns`
export const FIELD_CLASSNAME = `${STAGE_CLASSNAME}-fields`

export const CHILD_MAP = new Map([
  [STAGE_CLASSNAME, ROW_CLASSNAME],
  [ROW_CLASSNAME, COLUMN_CLASSNAME],
  [COLUMN_CLASSNAME, FIELD_CLASSNAME],
])
