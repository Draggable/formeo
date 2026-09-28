// Compile-only usage checks for src/types/formeo.d.ts. Run with `npm run test:types`.
// Every `@ts-expect-error` below must stay an error; if one stops erroring, tsc fails with TS2578.
import {
  type BeforeAddDetail,
  type ComponentEventData,
  type ComponentEvents,
  type ControlDefinition,
  type FormData,
  type FormeoComponent,
  FormeoEditor,
  type FormeoEditorOptions,
  type FormeoFormData,
  type FormeoOptions,
  FormeoRenderer,
  type FormeoRendererOptions,
  type LogicalOperator,
  type RemoveItemsActionEvent,
  type UserData,
} from 'formeo'

const formData: FormeoFormData = {
  id: 'a95d0c69',
  stages: {
    ff163056: {
      id: 'ff163056',
      children: ['c5060f33'],
      config: { title: 'Contact' },
      conditions: [
        {
          if: [
            {
              source: 'fields.056be3d7',
              sourceProperty: 'value',
              comparison: '==',
              target: 'yes',
              targetProperty: 'value',
            },
            { logical: '&&', source: 'fields.6c67ea4a.options[0]', sourceProperty: 'isChecked' },
          ],
          then: [{ target: 'fields.7e3298ba', targetProperty: 'isNotVisible', assignment: '', value: '' }],
        },
      ],
    },
  },
  rows: { c5060f33: { id: 'c5060f33', children: ['2474fbd2'], config: { fieldset: false } } },
  columns: { '2474fbd2': { id: '2474fbd2', children: ['056be3d7'], config: { width: '100%' } } },
  fields: {
    '056be3d7': {
      id: '056be3d7',
      tag: 'input',
      attrs: { type: 'text', required: false, className: '' },
      config: { label: 'Input One', controlId: 'text-input' },
    },
  },
}

const emailControl: ControlDefinition = {
  id: 'email-control',
  tag: 'input',
  attrs: { type: 'email', required: true, className: 'custom-email' },
  config: { label: 'Email', disabledAttrs: ['type'], lockedAttrs: ['required', 'className'] },
  meta: { group: 'common', id: 'email', icon: '@' },
  dependencies: { js: ['https://cdn.example.com/a.js'], css: 'https://cdn.example.com/a.css' },
  action: { onRender: (elem: HTMLElement) => elem.id },
}

// onRender and onAddChild are also called the legacy way; narrow before reading `component`/`parent`/`child`.
const componentEvents: ComponentEvents = {
  onRender: evt => {
    if (evt instanceof HTMLElement) {
      evt.classList.add('rendered')
    } else {
      evt.component.id
    }
  },
  onAddChild: evt => {
    if ('component' in evt) {
      evt.component.id
    } else {
      evt.parent.id
      evt.child.id
    }
  },
}

const describeAdd = (detail: BeforeAddDetail): string => {
  switch (detail.componentType) {
    case 'field':
      return detail.data.tag ?? detail.controlId
    case 'row':
    case 'column':
      return `${detail.addedVia} ${detail.parent.id} ${detail.index}`
    case 'stage':
      return `page ${detail.index}`
  }
}

const options: FormeoEditorOptions = {
  editorContainer: '#formeo-editor',
  sessionStorage: 'orders-form',
  pages: true,
  svgSprite: null,
  controls: {
    container: document.querySelector<HTMLElement>('.controls'),
    elements: [emailControl],
    disable: { formActions: ['clearBtn'] },
    panels: { displayType: 'tabbed' },
  },
  config: {
    fields: {
      all: { panels: { attrs: { locked: ['required'] } } },
      'text-input': { attrs: { type: [{ label: 'text', value: 'text' }] } },
    },
    rows: { all: { actionButtons: { disabled: ['page'] } } },
  },
  events: {
    onSave: ({ formData }) => formData.fields,
    onChange: evt => evt.detail.stages,
    onUpdateField: ({ detail }) => detail.changePath,
    formeoLoaded: editor => editor.formData,
    onPageChange: ({ detail }) => detail.page - detail.previousPage,
    onAddStage: ({ detail }) => detail.componentId,
    onBeforeAdd: ({ detail }) => describeAdd(detail) !== '',
    onBeforeRemove: async ({ detail }) => {
      if (detail.componentType === 'stage') {
        return detail.isEmpty || window.confirm(`Remove ${detail.title}?`)
      }
      const response = await fetch(`/api/fields/${detail.componentId}/usage`)
      return !(await response.json()).inUse
    },
    onBeforeClone: evt => {
      if (evt.detail.componentType === 'row') {
        evt.preventDefault()
      }
    },
    onBeforeSave: ({ detail }) => Object.keys(detail.formData.fields).length > 0,
    onEditOpen: ({ detail }) => detail.component.dom.focus(),
    onEditClose: ({ detail }) => detail.componentType,
    confirmClearAll: evt => evt.clearAllAction(),
  },
  actions: {
    add: {
      attr: evt => (evt.isDisabled('attrs.data-x') ? undefined : evt.addAction('data-x', '1')),
      condition: evt => evt.addAction(evt),
    },
    remove: {
      component: evt => window.confirm(`Delete this ${evt.componentType}?`) && evt.removeAction(),
      conditions: evt => (evt.isClearAll ? evt.removeAction() : console.log(evt.itemKey, evt.component.id)),
      page: evt => (evt.isEmpty || window.confirm(evt.title)) && evt.removeAction(),
    },
    click: { btn: evt => evt.action() },
    save: { form: data => data.id },
  },
  i18n: { locale: 'de-DE', location: 'https://example.com/lang/' },
  onLoad: editor => editor.isReady,
}

// README-advertised aliases still work
const legacyOptions: FormeoOptions = options
const legacyData: FormData = formData

const editor = new FormeoEditor(legacyOptions, legacyData)
const current: FormeoFormData = editor.formData
editor.formData = JSON.stringify(current)
const json: string = editor.json
editor.clear()
void editor.whenReady().then(ready => ready.i18n?.setLang('en-US'))
editor.pages?.activate(1, { focus: true })
const newPage = editor.pages?.add({ title: 'Payment' })
editor.controls?.addElement('email-control')
if (editor.initState === 'destroyed' || editor.isDestroyed) {
  editor.destroy()
}
const bare = new FormeoEditor()
const jquery = new FormeoEditor({ editorContainer: { jquery: '3.7.1', 0: document.body } })

document.addEventListener('formeoBeforeRemove', evt => {
  if (evt.detail.componentType === 'row') {
    evt.preventDefault()
  }
})
document.addEventListener('formeoEditOpened', evt => evt.detail.componentId)

const rendererOptions: FormeoRendererOptions = {
  renderContainer: '#formeo-renderer',
  formData,
  pagination: { type: 'wizard', heading: 3, submit: true, labels: { next: 'Weiter', status: '{title} ({n}/{count})' } },
  elements: { email: { action: { onRender: elem => elem.focus() } } },
  config: { attrs: { novalidate: true } },
  events: {
    onRender: ({ form }) => form.id,
    onChange: ({ userData }) => userData.email,
    onSubmit: ({ event, userData }) => {
      event.preventDefault()
      return userData
    },
    onPageChange: ({ page, stageId }) => `${page}:${stageId ?? ''}`,
  },
}
const renderer = new FormeoRenderer(rendererOptions)
renderer.render()
renderer.userData = { name: 'Ada', hobbies: ['a', 'b'] }
const values: UserData = renderer.userData
const html: string = renderer.html
renderer.page = renderer.pageCount - 1
renderer.destroy()
const headless = new FormeoRenderer().getRenderedForm(formData)

const fromGlobal = new window.FormeoEditor({ editorContainer: document.body })

const and: LogicalOperator = '&&'

// --- negative cases: these must stay type errors ---------------------------------

// @ts-expect-error `logical` is case-sensitive
const badLogical: LogicalOperator = 'AND'

// @ts-expect-error formData ids map to objects with children
const badStage: FormeoFormData = { id: 'x', stages: { a: { id: 'a' } }, rows: {}, columns: {}, fields: {} }

// @ts-expect-error unknown editor option names are rejected (catches typos such as `container`)
const typo: FormeoEditorOptions = { container: '#x' }

// @ts-expect-error the renderer paginates as tabs or a wizard only
const badPagination: FormeoRendererOptions = { pagination: 'accordion' }

// @ts-expect-error initState is read-only
editor.initState = 'ready'

// @ts-expect-error `formActions: false` throws at runtime (controls/index.js calls .includes on it); leave it out
const badFormActions: FormeoEditorOptions = { controls: { disable: { formActions: false } } }

const badHook: FormeoEditorOptions = {
  events: {
    // @ts-expect-error a before hook returns a boolean, nothing, or a Promise of one; a string is a mistake
    onBeforeSave: () => 'no',
  },
}

const unnarrowed = (detail: BeforeAddDetail) =>
  // @ts-expect-error only a control's detail has a controlId; a page's (componentType 'stage') does not
  detail.controlId

const clearAll = (evt: RemoveItemsActionEvent<'conditions'>) =>
  // @ts-expect-error "Clear All" has no itemKey, so check isClearAll first
  evt.itemKey

const unnarrowedRender = (evt: ComponentEventData | HTMLElement) =>
  // @ts-expect-error `evt` may be the bare element from the legacy onRender call; narrow with `instanceof HTMLElement` first
  evt.component

const unnarrowedAddChild = (evt: ComponentEventData | { parent: FormeoComponent; child: FormeoComponent }) =>
  // @ts-expect-error `evt` may be the legacy `{ parent, child }` payload; narrow with `'component' in evt` first
  evt.component

export {
  and,
  badFormActions,
  badHook,
  badLogical,
  badPagination,
  badStage,
  bare,
  clearAll,
  componentEvents,
  fromGlobal,
  headless,
  html,
  jquery,
  json,
  newPage,
  typo,
  unnarrowed,
  unnarrowedAddChild,
  unnarrowedRender,
  values,
}
