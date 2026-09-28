// Shaped like formBuilder2Formeo's convertData() output (Draggable/formBuilder2Formeo src/convert-data.js):
// columns have no `config`, the stage has `settings` rather than `config`, and fields carry no attrs.type.
const field = (id, data) => ({ id, ...data })
const fields = {
  'fb-text': field('fb-text', {
    tag: 'input',
    config: { label: 'First Name' },
    attrs: { name: 'text-1532560573320', className: 'red form-control' },
    meta: { id: 'text', icon: 'text', group: 'form' },
  }),
  'fb-hidden': field('fb-hidden', {
    tag: 'input',
    attrs: { name: 'hidden-1532560563828' },
    meta: { id: 'hidden', icon: 'hidden', group: 'form' },
  }),
  'fb-select': field('fb-select', {
    tag: 'select',
    config: { label: 'Profession' },
    attrs: { name: 'select-1532560573336', className: 'form-control' },
    options: [
      { label: 'Street Sweeper', value: 'option-2' },
      { label: 'Brain Surgeon', value: 'option-3' },
    ],
    meta: { id: 'select', icon: 'select', group: 'form' },
  }),
}
const ids = Object.keys(fields)

export const convertedForm = () => ({
  id: 'fb-form',
  fields: structuredClone(fields),
  columns: Object.fromEntries(ids.map(id => [`col-${id}`, { id: `col-${id}`, children: [id] }])),
  rows: Object.fromEntries(
    ids.map(id => [
      `row-${id}`,
      {
        id: `row-${id}`,
        config: { fieldset: false, legend: '', inputGroup: false },
        attrs: { className: 'f-row' },
        children: [`col-${id}`],
      },
    ])
  ),
  stages: { 'fb-stage': { id: 'fb-stage', settings: {}, children: ids.map(id => `row-${id}`) } },
})
