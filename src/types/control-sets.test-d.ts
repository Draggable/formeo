// Compile-only checks for control sets (#227). Run with `npm run test:types`.
import {
  type BeforeAddControlSetDetail,
  type BeforeAddDetail,
  type BeforeAddFieldDetail,
  type ControlDefinition,
  FormeoEditor,
} from 'formeo'

const addressSet: ControlDefinition = {
  id: 'address-set-control',
  meta: { group: 'common', id: 'address-set', icon: 'rows' },
  config: { label: 'Address' },
  controlSet: {
    layout: 'stacked',
    row: { config: { fieldset: true, legend: 'Address' } },
    fields: [
      { control: 'text-input', attrs: { name: 'street' }, config: { label: 'Street' } },
      {
        control: 'select',
        attrs: { name: 'country' },
        config: { label: 'Country' },
        options: [{ label: 'Canada', value: 'ca', selected: false }],
      },
      { tag: 'input', attrs: { type: 'text', name: 'zip' }, config: { label: 'Zip' }, meta: { id: 'zip' } },
    ],
  },
}

const fieldCount = (detail: BeforeAddDetail): number =>
  detail.componentType === 'controlSet' ? detail.data.fields.length : 0

const editor = new FormeoEditor({
  controls: { elements: [addressSet] },
  events: {
    onBeforeAdd: ({ detail }) => detail.componentType !== 'controlSet' || detail.data.layout === 'columns',
  },
})
editor.controls?.addElement('address-set-control')

// --- negative cases ---------------------------------------------------------------

const badLayout: ControlDefinition = {
  meta: { group: 'common', id: 'grid-set' },
  config: { label: 'Grid' },
  // @ts-expect-error a control set's layout is 'stacked' or 'columns'
  controlSet: { layout: 'grid', fields: [] },
}

// @ts-expect-error a control set has no tag of its own; its members do
const setWithTag: ControlDefinition = {
  tag: 'div',
  meta: { group: 'common', id: 'tagged-set' },
  config: { label: 'Tagged' },
  controlSet: { fields: [] },
}

const unnarrowed = (detail: BeforeAddControlSetDetail | BeforeAddFieldDetail) =>
  // @ts-expect-error only a control set's data has fields; narrow on componentType first
  detail.data.fields.length

export { badLayout, fieldCount, setWithTag, unnarrowed }
