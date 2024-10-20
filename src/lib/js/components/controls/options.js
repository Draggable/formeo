const defaultOptions = Object.freeze({
  sortable: true,
  elementOrder: {},
  groupOrder: [],
  groups: [
    {
      id: 'layout',
      label: 'controls.groups.layout',
      elementOrder: ['row', 'column'],
    },
    {
      id: 'common',
      label: 'controls.groups.form',
      elementOrder: ['button', 'checkbox'],
    },
    {
      id: 'html',
      label: 'controls.groups.html',
      elementOrder: ['header', 'block-text'],
    },
  ],
  disable: {
    groups: [],
    elements: [],
    formActions: [],
  },
  elements: [],
  container: null,
  panels: { displayType: 'slider' },
})

export default defaultOptions
