/**
 * Type definitions for formeo.
 *
 * Hand-written. The runtime source of truth is src/lib/js/**; `npm run test:types` compiles
 * src/types/formeo.test-d.ts against this file so the public API cannot drift silently.
 * docs/typescript.md says what is typed and what is left out on purpose.
 */

// ---------------------------------------------------------------------------
// formData (matches tools/formdata-schema.mjs)
// ---------------------------------------------------------------------------

/** 8-character hex short id (current editor output) or a full uuid (older saved forms). */
export type ComponentId = string

/**
 * Dot address of a component or one of its properties, e.g. `fields.1c48584a`, `fields.1c48584a.options[0]`, or a
 * matrix row or cell: `fields.1c48584a.table.rows[0]`, `fields.1c48584a.table.rows[0].cells[1]`.
 */
export type ComponentAddress = string

export type ComponentType = 'stage' | 'row' | 'column' | 'field'

/**
 * Joins an `if` clause to the previous one (the first clause has none). The editor stores
 * the symbols; the renderer also accepts the words. `&&` binds tighter than `||`.
 */
export type LogicalOperator = '&&' | '||' | 'and' | 'or'
/** Symbols are what the editor stores; the renderer also accepts the names. */
export type ComparisonOperator = '==' | '!=' | '⊃' | '!⊃' | 'equals' | 'notEquals' | 'contains' | 'notContains'
export type AssignmentOperator = '=' | 'equals'
/** `checked` is what pre-v5 editors saved; the renderer reads it like `value`. */
export type ConditionSourceProperty = 'value' | 'isChecked' | 'isNotChecked' | 'isVisible' | 'isNotVisible' | 'checked'
export type ConditionTargetProperty = 'value' | 'isChecked' | 'isNotChecked' | 'isVisible' | 'isNotVisible'

/** Where a field's label sits: `top`/`bottom` stack, `before`/`after` sit beside the control (mirrored in RTL). */
export type LabelPosition = 'top' | 'bottom' | 'before' | 'after'

/** Empty strings are what an unfinished condition row in the editor saves. */
type Blank = ''

// biome-ignore lint/suspicious/noExplicitAny: user callbacks declare their own parameter types
type AnyFunction = (...args: any[]) => unknown

export interface ConditionIf {
  logical?: LogicalOperator
  source?: ComponentAddress
  sourceProperty?: ConditionSourceProperty | Blank
  comparison?: ComparisonOperator | Blank
  /** A literal value, or the address of another component when `targetProperty` is set. */
  target?: string
  targetProperty?: 'value' | Blank
}

export interface ConditionThen {
  target?: ComponentAddress
  targetProperty?: ConditionTargetProperty | Blank
  assignment?: AssignmentOperator | Blank
  value?: string
}

export interface Condition {
  if?: ConditionIf[]
  then?: ConditionThen[]
}

export interface AttrOption {
  label: string
  value: string
  selected?: boolean
}

export type AttrValue = string | number | boolean | Record<string, string> | AttrOption[] | AnyFunction
export type HTMLAttributes = Record<string, AttrValue | undefined>

export interface FieldOption {
  label: string
  value?: string
  selected?: boolean
  checked?: boolean
  [key: string]: unknown
}

/** Keys every component's data can have besides its id. (Interfaces, not `Omit`, which drops them with an index signature.) */
export interface ComponentProps {
  attrs?: HTMLAttributes
  conditions?: Condition[]
  [key: string]: unknown
}

export interface ComponentDataBase extends ComponentProps {
  id: ComponentId
}

export interface StageData extends ComponentDataBase {
  children: ComponentId[]
  /** `title` names the page (editor `pages` option, renderer `pagination`). */
  config?: { title?: string; [key: string]: unknown }
}

/** A row's data without its id and children, e.g. a control set's `row`. */
export interface RowProps extends ComponentProps {
  /**
   * Formeo's own class list (`formeo-row`). Put your classes in `attrs.className` (or `attrs.class`); the renderer
   * merges them. `attrs.id` and `attrs.tag` are reserved and ignored by the renderer.
   */
  className?: string | string[]
  config?: { fieldset?: boolean; legend?: string; inputGroup?: boolean; [key: string]: unknown }
}

export interface RowData extends RowProps {
  id: ComponentId
  children: ComponentId[]
}

export interface ColumnData extends ComponentDataBase {
  children: ComponentId[]
  /**
   * Formeo's own class list (`formeo-column`). Put your classes in `attrs.className` (or `attrs.class`). A column's
   * `attrs.style` is kept minus any `width`, which always comes from `config.width`. `attrs.id` and `attrs.tag` are
   * reserved.
   */
  className?: string | string[]
  config?: { width?: string; [key: string]: unknown }
}

export interface FieldConfigData {
  label?: string
  editorLabel?: string
  hideLabel?: boolean
  /** Where the label sits relative to the control. Defaults to `after` for a lone checkbox or radio, `top` otherwise. */
  labelPosition?: LabelPosition
  /**
   * @deprecated Use `labelPosition`. Still read by the renderer (`true` is `bottom`, or `after` for a lone checkbox or
   * radio); the editor converts it to `labelPosition` on load.
   */
  labelAfter?: boolean
  disableHtmlLabel?: boolean
  editableContent?: boolean
  helpText?: string
  tooltip?: string
  /** Adds an Other choice with a text box to a checkbox or radio group; its text posts as `{name}-other`. */
  other?: boolean
  /** The Other choice's label; `Other` when empty. */
  otherLabel?: string
  /** Id of the control this field was created from (`meta.id` of the control definition). */
  controlId?: string
  /** Attributes hidden from, and not addable in, the edit panel. Copied from the control definition. */
  disabledAttrs?: string[]
  /** Attributes that can't be removed, re-added or changed in the edit panel. Copied from the control definition. */
  lockedAttrs?: string[]
  [key: string]: unknown
}

/** The input a matrix column renders in each row. */
export type TableCellInput = 'radio' | 'checkbox' | 'text'

/** A table field's column (#349). */
export interface TableColumn {
  label: string
  /** The column's name key in a matrix; `column-<n>` when blank. */
  value?: string
  /** Makes the column an input column; the table is then a matrix. Absent for a static column. */
  input?: TableCellInput
  [key: string]: unknown
}

/** A table field's row: one plain-text cell per column. */
export interface TableRow {
  cells: string[]
  /** The row's name key in a matrix; `row-<n>` when blank. */
  value?: string
  /** In a matrix, the row's inputs must be answered. */
  required?: boolean
  [key: string]: unknown
}

/** A repeating table's limits (#349). Both default: `min` 1, `max` no limit. */
export interface TableRepeat {
  /** Rows the form starts with, and the fewest it keeps. A non-negative integer, at most 500. */
  min?: number
  /** The most rows the person filling in the form can add; `null` for no limit. */
  max?: number | null
  [key: string]: unknown
}

/** A table field's data (`field.table`, #349). Cells render as text, never HTML. */
export interface TableData {
  caption?: string
  /** `columns[].label` render as `<thead>` header cells. Default `true`. */
  headerRow?: boolean
  /** Each row's first cell renders as a row header. Default `false`. */
  rowHeaders?: boolean
  /** Lets the person filling in the form add and remove rows copied from `rows[0]`; needs an input column. */
  repeat?: TableRepeat
  columns: TableColumn[]
  rows: TableRow[]
  [key: string]: unknown
}

/** A field's data without its id. */
export interface FieldProps extends ComponentProps {
  tag?: string
  config?: FieldConfigData
  meta?: { group?: string; icon?: string; id?: string; [key: string]: unknown }
  content?: unknown
  action?: Record<string, unknown>
  options?: FieldOption[]
  /** Table element data (#349); present only on table fields. */
  table?: TableData
}

export interface FieldData extends FieldProps {
  id: ComponentId
  tag: string
}

/** The canonical, flat form definition. Matches dist/formData_schema.json. */
export interface FormeoFormData {
  $schema?: string
  id: ComponentId
  stages: Record<ComponentId, StageData>
  rows: Record<ComponentId, RowData>
  columns: Record<ComponentId, ColumnData>
  fields: Record<ComponentId, FieldData>
}

/** @deprecated Use `FormeoFormData`. Kept because the README advertised it; it hides the DOM `FormData` where imported. */
export type FormData = FormeoFormData

/** What a new field starts from, before it gets an id: what a control adds, or an expanded control set member. */
export interface NewFieldData extends FieldProps {
  id?: ComponentId
}

// ---------------------------------------------------------------------------
// Live components (what events and actions hand you)
// ---------------------------------------------------------------------------

export type ComponentEventHandler = (event: ComponentEventData) => void

/**
 * The public part of a stage, row, column or field in the editor. Everything else on the
 * runtime object is internal and may change.
 */
export interface FormeoComponent {
  readonly id: ComponentId
  readonly name: ComponentType
  readonly data: ComponentDataBase
  readonly dom: HTMLElement
  readonly parent: FormeoComponent | null
  readonly children: FormeoComponent[]
  /** `false` once the component has been removed. */
  readonly isRegistered: boolean
  get(path: string): unknown
  set(path: string, value: unknown): unknown
  /** Removes the property at `path`, or the component itself when called without one. */
  remove(path?: string): unknown
  /** `null` when this component's type can't have children (e.g. a field). */
  addChild(childData?: Record<string, unknown> | ComponentId, index?: number): FormeoComponent | null
  addEventListener(eventName: string, handler: ComponentEventHandler): void
  removeEventListener(eventName: string, handler: ComponentEventHandler): void
}

export interface Coords {
  pageX: number
  pageY: number
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

export interface ControlDependencies {
  js?: string | string[]
  css?: string | string[]
}

export interface ControlMeta {
  /** Control group id, e.g. `common`, `html`, `layout` or one of `controls.groups`. */
  group: string
  /** Referenced by `config.controlId`, `elementOrder`, `disable.elements` and the renderer's `elements`. */
  id: string
  icon?: string
}

interface ControlDefinitionBase {
  /** The control button's element id, used by `editor.controls.addElement(id)`. A uuid when left out. */
  id?: string
  config: FieldConfigData & { label: string }
  meta: ControlMeta
  dependencies?: ControlDependencies
  /** DOM listeners for the control's button in the controls panel. */
  controlAction?: Record<string, AnyFunction>
  events?: Record<string, AnyFunction>
}

export interface FieldControlDefinition extends ControlDefinitionBase {
  tag: string
  attrs?: HTMLAttributes
  options?: FieldOption[]
  content?: unknown
  children?: unknown
  /** Starting data for a table control (#349). Any field with an object `table` renders and edits as a table. */
  table?: TableData
  /** e.g. `onRender`, run on the field's preview; functions are not saved in formData. */
  action?: Record<string, AnyFunction>
  /** `config` keys this control's fields offer in their Configuration panel, on top of every field's. Not saved in formData. */
  configOptions?: Record<string, ConfigOptionDeclaration>
  controlSet?: never
  [key: string]: unknown
}

/** One field of a control set (#227). */
export interface ControlSetMember extends FieldProps {
  /** `meta.id` of a field control to start from; the member's other keys are merged over it (arrays replace). */
  control?: string
}

export type ControlSetLayout = 'stacked' | 'columns'

export interface ControlSet {
  /** `stacked` (default): one column; `columns`: one column per field. */
  layout?: ControlSetLayout
  /** Data for the new row, e.g. `{ config: { fieldset: true, legend: 'Address' } }`. */
  row?: RowProps
  fields: ControlSetMember[]
}

/** A control that adds one new row holding several fields (#227). */
export interface ControlSetDefinition extends ControlDefinitionBase {
  controlSet: ControlSet
  tag?: never
}

export type ControlDefinition = FieldControlDefinition | ControlSetDefinition

/**
 * A subclass of formeo's internal `Control` class. `Control` is not exported by the package,
 * so this only applies to controls built from a source checkout.
 */
export interface ControlClass {
  new (): {
    id: string
    controlData: Record<string, unknown> & { meta: ControlMeta }
    readonly dom: HTMLElement
    promise(): Promise<unknown>
  }
}

export interface ControlGroup {
  id: string
  label: string
  elementOrder?: string[]
}

export interface ControlsOptions {
  /** Element, selector or jQuery object the controls panel is rendered into. Defaults to inside the editor. */
  container?: ContainerOption
  /** @default true */
  sortable?: boolean
  disable?: {
    groups?: string[]
    elements?: string[]
    /** `true` hides both form action buttons; an array hides some, e.g. `['clearBtn']`. (`false` throws.) */
    formActions?: true | Array<'clearBtn' | 'saveBtn'>
  }
  elements?: Array<ControlDefinition | ControlClass>
  elementOrder?: Record<string, string[]>
  groups?: ControlGroup[]
  groupOrder?: string[]
  ghostPreview?: boolean
  panels?: { displayType?: 'slider' | 'tabbed' | 'auto' }
}

/** `editor.controls`, available once the editor is ready. */
export interface FormeoControls {
  /**
   * Adds what a control creates to a stage (the active one by default), without the onBeforeAdd hook.
   * `id` is the control's element id (`ControlDefinition.id`), not its `meta.id`.
   */
  addElement(id: string, stage?: FormeoComponent): FormeoComponent | undefined
}

// ---------------------------------------------------------------------------
// config (per component type)
// ---------------------------------------------------------------------------

export type PanelName = 'attrs' | 'options' | 'conditions' | 'config' | (string & {})
/** `page` is the row's "Move to page" button, added with the `pages` option. */
export type ActionButtonName = 'move' | 'edit' | 'clone' | 'remove' | 'page' | (string & {})

export interface ComponentEventData {
  component: FormeoComponent
  target: FormeoComponent
  type: string
  timestamp: number
  [key: string]: unknown
}

export interface ComponentEvents {
  onAdd?: ComponentEventHandler
  /** Also called the legacy way, with `{ parent, child }` and no `component`/`target` — narrow first. */
  onAddChild?: (event: ComponentEventData | { parent: FormeoComponent; child: FormeoComponent }) => void
  onRemove?: ComponentEventHandler
  /** Also called the legacy way, with the rendered element itself once it is in the page — narrow first. */
  onRender?: (event: ComponentEventData | HTMLElement) => void
  onClone?: ComponentEventHandler
  onUpdate?: ComponentEventHandler
}

/** A `config` key a Configuration panel offers: in `panels.config.options`, or a control's `configOptions`. */
export interface ConfigOptionDeclaration {
  /** Shown in the panel and its "Add config" dialog. Defaults to the `config.<key>` translation, then the key in title case. */
  label?: string
  /**
   * The value a key added from the dialog starts with (`labelPosition` starts at the field's current position instead).
   * Its type picks the input: a checkbox for boolean, text otherwise. With `options`, the input is a dropdown.
   */
  default: boolean | string | number
  /**
   * Makes the item a dropdown of these choices. Each `value` is a string, and `default` must be one of them. A missing
   * `label` is the `<key>.<value>` translation, then the value in title case.
   */
  options?: Array<{ value: string; label?: string }>
}

export interface ComponentConfig {
  actionButtons?: { buttons?: Array<ActionButtonName | Record<string, unknown>>; disabled?: ActionButtonName[] }
  panels?: {
    disabled?: PanelName[]
    order?: PanelName[]
    attrs?: {
      /** Attribute names hidden from the attrs panel. Combined with control `disabledAttrs`. */
      disabled?: string[]
      /** Attribute names that can't be removed or changed. Combined with control `lockedAttrs`. */
      locked?: string[]
      hideDisabled?: boolean
      /** `false` hides the "+ Attribute" button. Attributes already set stay editable unless locked. */
      add?: boolean
    }
    options?: {
      /** `false` hides the "+ Option" button. */
      add?: boolean
    }
    conditions?: {
      /** `false` hides the "+ Condition" button. "Clear All" stays. */
      add?: boolean
    }
    config?: {
      /** `config` keys the Configuration panel and its "Add config" dialog offer, merged per `all`, control id, then id. */
      options?: Record<string, ConfigOptionDeclaration>
      /** `config` keys hidden from the panel and the dialog, at whichever level they were declared. */
      disabled?: string[]
      /** `false` hides the "+ Configuration" button. */
      add?: boolean
    }
    [panel: string]: unknown
  }
  /** Full property paths, e.g. `['attrs.type']`. */
  disabled?: string[]
  /** Full property paths, e.g. `['attrs.required']`. */
  locked?: string[]
  events?: ComponentEvents
  [key: string]: unknown
}

export interface FieldComponentConfig extends ComponentConfig {
  label?: { disableHTML?: boolean }
  /** Offer a dropdown for an attribute instead of a free text input. */
  attrs?: Record<string, AttrOption[]>
  config?: Partial<FieldConfigData>
}

/** `all` applies to every component of the type; any other key is a control id (fields) or a component id. */
export type ScopedConfig<T> = { all?: T } & { [controlOrComponentId: string]: T | undefined }

export interface EditorConfig {
  stages?: ScopedConfig<ComponentConfig>
  rows?: ScopedConfig<ComponentConfig>
  columns?: ScopedConfig<ComponentConfig>
  fields?: ScopedConfig<FieldComponentConfig>
}

// ---------------------------------------------------------------------------
// Editor events
// ---------------------------------------------------------------------------

export interface FormeoEvent<TDetail = unknown> {
  timeStamp: number
  type: string
  detail: TDetail
}

/**
 * A component-type data store (`stages`, `rows`, `columns` or `fields`), as opposed to a single component. A
 * page reorder's `formeoUpdated`/`onUpdate` detail sets `entity` to this (the stages store itself), not a
 * {@link FormeoComponent}.
 */
export interface ComponentStore {
  readonly name: 'stages' | 'rows' | 'columns' | 'fields'
  readonly data: Record<ComponentId, FormeoComponent>
  readonly size: number
}

/** `detail` of the added, removed and updated events; which keys are set depends on the event. */
export interface FormeoChangeDetail {
  entity?: FormeoComponent | ComponentStore
  componentId?: ComponentId
  componentType?: ComponentType
  parent?: FormeoComponent
  dataPath?: string
  changePath?: string
  value?: unknown
  previousValue?: unknown
  /** `'reordered'` is a page (stage) reorder; `value`/`previousValue` are the new/old stage id order. */
  changeType?: 'added' | 'removed' | 'changed' | 'unchanged' | 'reordered'
  data?: unknown
  [key: string]: unknown
}

export interface FormeoSaveEvent {
  timeStamp: number
  type: string
  formData: FormeoFormData
}

export interface ConfirmClearAllDetail {
  confirmationMessage: string
  /** Call it to clear the form. */
  clearAllAction: (event?: unknown) => void
  btnCoords: Coords
}

export interface ConfirmClearAllEvent extends ConfirmClearAllDetail {
  timeStamp: number
  type: string
}

export interface EditorPageChangeDetail {
  page: number
  previousPage: number
  stageId: ComponentId
  previousStageId: ComponentId
}

export interface EditToggleDetail {
  component: FormeoComponent
  componentType: ComponentType
  componentId: ComponentId
}

interface BeforeAddPlacement {
  /** The control's `meta.id`, e.g. `text-input`. */
  controlId: string
  /** The page (stage), row or column it goes into. */
  parent: FormeoComponent
  index: number
  addedVia: 'click' | 'dragDrop'
}

export interface BeforeAddFieldDetail extends BeforeAddPlacement {
  componentType: 'field'
  /** What the new field starts from. Treat it as read-only. */
  data: NewFieldData
}

export interface BeforeAddLayoutDetail extends BeforeAddPlacement {
  componentType: 'row' | 'column'
  data: Record<string, never>
}

export interface ControlSetData {
  layout: ControlSetLayout
  row: Record<string, unknown>
  fields: NewFieldData[]
}

export interface BeforeAddControlSetDetail extends BeforeAddPlacement {
  componentType: 'controlSet'
  /** The expanded set. Treat it as read-only. */
  data: ControlSetData
}

/** The + page tab (editor `pages` option). */
export interface BeforeAddPageDetail {
  componentType: 'stage'
  index: number
}

export type BeforeAddDetail =
  | BeforeAddFieldDetail
  | BeforeAddLayoutDetail
  | BeforeAddControlSetDetail
  | BeforeAddPageDetail

export interface BeforeRemoveComponentDetail {
  component: FormeoComponent
  componentType: 'row' | 'column' | 'field'
  componentId: ComponentId
}

export interface BeforeRemovePageDetail {
  component: FormeoComponent
  componentType: 'stage'
  componentId: ComponentId
  index: number
  title: string
  isEmpty: boolean
}

export type BeforeRemoveDetail = BeforeRemoveComponentDetail | BeforeRemovePageDetail

export interface BeforeCloneDetail {
  component: FormeoComponent
  componentType: 'row' | 'column' | 'field'
  componentId: ComponentId
  parent: FormeoComponent
}

export interface BeforeSaveDetail {
  /** The formData an allowed save saves. */
  formData: FormeoFormData
}

/** What an `onBefore*` callback receives. */
export interface BeforeHookEvent<TDetail> extends FormeoEvent<TDetail> {
  preventDefault(): void
  readonly defaultPrevented: boolean
}

/**
 * `false` (or a Promise resolving to `false`) cancels. A Promise holds the change until it settles;
 * a rejection cancels. Anything else lets the change happen.
 */
// biome-ignore lint/suspicious/noConfusingVoidType: a callback without a return statement returns void
export type BeforeHookResult = boolean | undefined | void | Promise<boolean | undefined | void>

export type BeforeHook<TDetail> = (event: BeforeHookEvent<TDetail>) => BeforeHookResult

export interface FormeoEvents {
  /** Log every event to the console. */
  debug?: boolean
  /** Whether formeo's DOM events bubble. @default true */
  bubbles?: boolean
  /** Called with the editor instance each time it renders. */
  formeoLoaded?: (editor: FormeoEditor) => void
  onAdd?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onAddStage?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onAddRow?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onAddColumn?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onAddField?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onRemove?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onRemoveStage?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onRemoveRow?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onRemoveColumn?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onRemoveField?: (event: FormeoEvent<FormeoChangeDetail>) => void
  /** Throttled; `detail` is the whole formData. */
  onChange?: (event: FormeoEvent<FormeoFormData>) => void
  /** Throttled with the whole formData as `detail`, and once per component update with that change. */
  onUpdate?: (event: FormeoEvent<FormeoFormData | FormeoChangeDetail>) => void
  onUpdateStage?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onUpdateRow?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onUpdateColumn?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onUpdateField?: (event: FormeoEvent<FormeoChangeDetail>) => void
  onSave?: (event: FormeoSaveEvent) => void
  /** The active page tab changed (editor `pages` option). */
  onPageChange?: (event: FormeoEvent<EditorPageChangeDetail>) => void
  onBeforeAdd?: BeforeHook<BeforeAddDetail>
  onBeforeRemove?: BeforeHook<BeforeRemoveDetail>
  onBeforeClone?: BeforeHook<BeforeCloneDetail>
  onBeforeSave?: BeforeHook<BeforeSaveDetail>
  onEditOpen?: (event: FormeoEvent<EditToggleDetail>) => void
  onEditClose?: (event: FormeoEvent<EditToggleDetail>) => void
  confirmClearAll?: (event: ConfirmClearAllEvent) => void
}

/**
 * Custom DOM events formeo dispatches; they bubble to `document` unless `events.bubbles` is `false`.
 * `formeoOnRender` and `formeoConditionUpdated` (and the editor's `events.onRender`) are documented but never
 * dispatched, so they are left out until they are.
 */
export interface FormeoDomEventMap {
  formeoLoaded: CustomEvent<{ formeo: FormeoEditor }>
  formeoSaved: CustomEvent<{ formData: FormeoFormData }>
  formeoUpdated: CustomEvent<FormeoChangeDetail>
  formeoChanged: CustomEvent<FormeoChangeDetail>
  formeoUpdatedStage: CustomEvent<FormeoChangeDetail>
  formeoUpdatedRow: CustomEvent<FormeoChangeDetail>
  formeoUpdatedColumn: CustomEvent<FormeoChangeDetail>
  formeoUpdatedField: CustomEvent<FormeoChangeDetail>
  formeoAddedStage: CustomEvent<FormeoChangeDetail>
  formeoAddedRow: CustomEvent<FormeoChangeDetail>
  formeoAddedColumn: CustomEvent<FormeoChangeDetail>
  formeoAddedField: CustomEvent<FormeoChangeDetail>
  formeoRemovedStage: CustomEvent<FormeoChangeDetail>
  formeoRemovedRow: CustomEvent<FormeoChangeDetail>
  formeoRemovedColumn: CustomEvent<FormeoChangeDetail>
  formeoRemovedField: CustomEvent<FormeoChangeDetail>
  formeoCleared: CustomEvent<FormeoChangeDetail>
  formeoPageChanged: CustomEvent<EditorPageChangeDetail>
  /** Cancelable: `preventDefault()` in a listener cancels, synchronously only. */
  formeoBeforeAdd: CustomEvent<BeforeAddDetail>
  formeoBeforeRemove: CustomEvent<BeforeRemoveDetail>
  formeoBeforeClone: CustomEvent<BeforeCloneDetail>
  formeoBeforeSave: CustomEvent<BeforeSaveDetail>
  formeoEditOpened: CustomEvent<EditToggleDetail>
  formeoEditClosed: CustomEvent<EditToggleDetail>
  confirmClearAll: CustomEvent<ConfirmClearAllDetail>
}

export type FormeoDomEventName = keyof FormeoDomEventMap

// ---------------------------------------------------------------------------
// Editor actions
// ---------------------------------------------------------------------------

export interface AddAttrActionEvent {
  btnCoords: Coords
  /** Adds the attribute. Pass strings (`'true'`/`'false'` become booleans). */
  addAction: (attr: string, value?: AttrValue) => void
  /** Takes a full path, e.g. `attrs.type`. */
  isDisabled: (propName: string) => boolean
  isLocked: (propName: string) => boolean
  message: { attr: string; value: string }
}

export interface AddOptionActionEvent {
  btnCoords: Coords
  addAction: () => void
}

export interface AddConditionActionEvent {
  btnCoords: Coords
  /** The empty condition that `addAction(event)` adds. */
  template: Condition
  addAction: (event: { template: Condition }) => void
}

export interface AddConfigActionEvent {
  btnCoords: Coords
  /** Opens the dialog that picks a configuration key. */
  addAction: (event?: unknown) => void
}

export type RemovableItemType = 'attrs' | 'options' | 'conditions'

/** One attribute, option or condition removed with its × button. */
export interface RemoveItemActionEvent<T extends RemovableItemType = RemovableItemType> {
  type: T
  /** The item's path, e.g. `attrs.required` or `options[1]`. */
  itemKey: string
  component: FormeoComponent
  isClearAll: false
  /** Removes it. Only the first call does anything. */
  removeAction: () => void
}

/** "Clear All" in the conditions panel. */
export interface ClearAllActionEvent<T extends RemovableItemType = RemovableItemType> {
  type: T
  isClearAll: true
  removeAction: () => void
}

export type RemoveItemsActionEvent<T extends RemovableItemType> = RemoveItemActionEvent<T> | ClearAllActionEvent<T>

export interface RemoveComponentActionEvent {
  component: FormeoComponent
  componentType: 'row' | 'column' | 'field'
  componentId: ComponentId
  /** Removes the component. Not calling it cancels the removal; only the first call does anything. */
  removeAction: () => void
}

export interface RemovePageActionEvent {
  stage: FormeoComponent
  stageId: ComponentId
  index: number
  /** Falls back to "Page {n}" like its tab. */
  title: string
  isEmpty: boolean
  removeAction: () => void
}

export interface ClickBtnActionEvent {
  /** What the default handler calls; a no-op for the Save button. */
  action: () => void
  coords: Coords
  message: string
  button: HTMLElement
}

export interface FormeoActions {
  add?: {
    attr?: (event: AddAttrActionEvent) => void
    option?: (event: AddOptionActionEvent) => void
    condition?: (event: AddConditionActionEvent) => void
    config?: (event: AddConfigActionEvent) => void
  }
  remove?: {
    attrs?: (event: RemoveItemsActionEvent<'attrs'>) => void
    options?: (event: RemoveItemsActionEvent<'options'>) => void
    conditions?: (event: RemoveItemsActionEvent<'conditions'>) => void
    /** A row, column or field's × button, after `onBeforeRemove`. */
    component?: (event: RemoveComponentActionEvent) => void
    /** A page's × or Delete (editor `pages` option), after `onBeforeRemove`. */
    page?: (event: RemovePageActionEvent) => void
  }
  click?: {
    btn?: (event: ClickBtnActionEvent) => void
  }
  save?: {
    form?: (formData: FormeoFormData) => unknown
  }
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

/** A jQuery object (or anything array-like with a `jquery` key); its first element is used. */
export interface JQueryLike {
  readonly jquery: string
  readonly [index: number]: Element | undefined
}

/**
 * A selector, an element, or a jQuery object. `dom.resolveContainer()` accepts any `Element`, not just
 * `HTMLElement` (e.g. an SVGElement), and passes `null`/`undefined` straight through with no fallback of its own;
 * the editor then treats a container that resolves to nothing as "not attached" rather than throwing. The renderer
 * does the same when it is created, but `render()` throws if the container never resolved.
 */
export type ContainerOption = string | Element | JQueryLike | null

export interface I18nOptions {
  /** Where language files are fetched from. */
  location?: string
  extension?: string
  /** Starting locale; a language picked with `editor.i18n.setLang()` wins for the tab. */
  locale?: string
  langs?: string[]
  override?: Record<string, Record<string, string>>
  preloaded?: Record<string, Record<string, string>>
}

export interface FormeoEditorOptions {
  /** Where the editor is added. Without it the editor is built but not attached. */
  editorContainer?: ContainerOption
  formData?: FormeoFormData | string
  /** URL of a custom sprite. `null` uses the bundled sprite. */
  svgSprite?: string | null
  /** URL of the formeo stylesheet to load. `null` loads none. */
  style?: string | null
  iconFont?: 'glyphicons' | 'font-awesome' | 'fontello' | null
  /** `true` saves to the `formeo-formData` key; a string is the key (give each editor on a page its own). */
  sessionStorage?: boolean | string
  stickyControls?: boolean
  controlOnLeft?: boolean
  /** Page tabs, one per stage. */
  pages?: boolean
  /** @deprecated */
  allowEdit?: boolean
  dataType?: 'json'
  debug?: boolean
  config?: EditorConfig
  events?: FormeoEvents
  actions?: FormeoActions
  controls?: ControlsOptions
  i18n?: I18nOptions
  onLoad?: (editor: FormeoEditor) => void
}

/** @deprecated Use `FormeoEditorOptions`. Kept because the README advertised it. */
export type FormeoOptions = FormeoEditorOptions

export type EditorInitState = 'created' | 'loading' | 'initializing' | 'ready' | 'error' | 'destroyed'

/** `editor.pages` with the `pages` option. The rest of the runtime object is internal. */
export interface EditorPages {
  /** 0-based index of the active page. */
  readonly index: number
  readonly count: number
  activate(stageIdOrIndex: ComponentId | number, options?: { focus?: boolean }): void
  /** Appends a page, activates it and focuses its tab. Runs no before hook. */
  add(options?: { title?: string }): FormeoComponent
  destroy(): void
}

export declare class FormeoEditor {
  constructor(options?: FormeoEditorOptions, formData?: FormeoFormData | string)
  /** Current form definition. Assigning reloads the editor. Empty once destroyed. */
  get formData(): FormeoFormData
  set formData(data: FormeoFormData | string)
  /** formData serialised with a `$schema` reference. */
  readonly json: string
  readonly initState: EditorInitState
  readonly isReady: boolean
  readonly isDestroyed: boolean
  editorContainer?: HTMLElement | null
  /** `null` unless the `pages` option is on. */
  readonly pages: EditorPages | null
  /** Available once ready. */
  controls?: FormeoControls | null
  /** Available once ready. */
  i18n?: { setLang: (locale: string) => Promise<void> }
  loadData(data?: FormeoFormData | string): void
  load(formData?: FormeoFormData | string, opts?: FormeoEditorOptions): void
  clear(): void
  render(): void
  init(): Promise<FormeoEditor>
  /** Resolves once ready; rejects if initialization fails or the editor is destroyed first. */
  whenReady(): Promise<FormeoEditor>
  /** Removes the editor and releases its resources. Safe to call more than once. */
  destroy(): void
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

export interface RendererElementDefinition {
  /** e.g. `onRender`, run once the rendered field is in the page. */
  action?: Record<string, (element: HTMLElement) => void>
  dependencies?: ControlDependencies
}

export interface RendererPaginationLabels {
  previous?: string
  next?: string
  /** `{n}` is the 1-based page number. */
  page?: string
  submit?: string
  tablist?: string
  steps?: string
  navigation?: string
  /** `{title}`, `{n}` and `{count}` are replaced. */
  status?: string
}

export interface RendererPaginationOptions {
  type: 'tabs' | 'wizard'
  /** Wizard only: the step list. @default true */
  progress?: boolean
  /** Add a Submit button. @default false */
  submit?: boolean
  /** Page title headings: `true` for `<h2>`, or a level from 2 to 6. @default false */
  heading?: boolean | 2 | 3 | 4 | 5 | 6
  labels?: RendererPaginationLabels
}

/** Values keyed by input name; repeated names (checkbox groups, multiple selects) become arrays. */
export type UserData = Record<string, FormDataEntryValue | FormDataEntryValue[]>

export interface RendererPageChangeDetail {
  page: number
  previousPage: number
  stageId: ComponentId | null
  previousStageId: ComponentId | null
  form: HTMLFormElement
  renderer: FormeoRenderer
}

/** `event.detail` of `formeo:rowschange`, fired after a repeating table row or an input group copy is added or removed. */
export interface RowsChangeDetail {
  action: 'add' | 'remove'
  /** The row's or copy's index (an input group's original is 0). */
  index: number
}

export interface FormeoRendererEvents {
  /** After `render()` attached the form. */
  onRender?: (event: { form: HTMLFormElement; renderer: FormeoRenderer; formData: FormeoFormData }) => void
  /**
   * Every `input` event in the form, and every `formeo:rowschange` (a `CustomEvent<RowsChangeDetail>`) when a repeating
   * table row or an input group copy is added or removed. For `formeo:rowschange`, `target` is the table's or group's
   * wrapper, which has no `name`: check `event.type` before reading `target.name`.
   */
  onChange?: (event: { event: Event; target: EventTarget | null; form: HTMLFormElement; userData: UserData }) => void
  /** The form's native `submit` event; formeo does not call `preventDefault()`. */
  onSubmit?: (event: { event: SubmitEvent; form: HTMLFormElement; userData: UserData }) => void
  onPageChange?: (event: RendererPageChangeDetail) => void
}

export interface FormeoRendererOptions {
  /** Required by `render()`; `getRenderedForm()` and `html` work without it. */
  renderContainer?: ContainerOption
  formData?: FormeoFormData | string
  /** Keyed by control id (`config.controlId` / `meta.id`). */
  elements?: Record<string, RendererElementDefinition>
  /** Spread onto the rendered `<form>`, e.g. `{ attrs: { novalidate: true } }`. */
  config?: { attrs?: HTMLAttributes; action?: Record<string, AnyFunction>; [key: string]: unknown }
  /** Show the stages one at a time. */
  pagination?: 'tabs' | 'wizard' | RendererPaginationOptions
  events?: FormeoRendererEvents
}

export interface UserFormDataEntry {
  key: string
  value: FormDataEntryValue | FormDataEntryValue[]
  label: string
}

export declare class FormeoRenderer {
  constructor(options?: FormeoRendererOptions, formData?: FormeoFormData | string)
  container?: HTMLElement | null
  get formData(): FormeoFormData
  set formData(data: FormeoFormData | string)
  /** Setting fills the rendered form; names with no field are skipped with a console warning. */
  get userData(): UserData
  set userData(data: UserData)
  readonly userFormData: UserFormDataEntry[]
  /** Outer HTML of the rendered form. */
  readonly html: string
  /** 0-based index of the page on show; setting it shows that page without validating. */
  get page(): number
  set page(index: number)
  readonly pageCount: number
  /** Rendered components' data, keyed by id. */
  readonly components: Record<ComponentId, ComponentDataBase>
  /** Throws without `renderContainer`. */
  render(formData?: FormeoFormData | string): void
  getRenderedForm(formData?: FormeoFormData | string): HTMLFormElement
  /** Removes the rendered form and stops pagination; `render()` works again afterwards. */
  destroy(): void
}

// ---------------------------------------------------------------------------
// UMD globals and DOM events
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    FormeoEditor: typeof FormeoEditor
    FormeoRenderer: typeof FormeoRenderer
  }
  // Formeo events bubble to `document` unless `events.bubbles` is `false`, but they're dispatched on the
  // editor's own elements first, so both event maps need the same members (docs/options/events/README.md
  // recommends listening on the editor's container).
  interface DocumentEventMap extends FormeoDomEventMap {}
  interface HTMLElementEventMap extends FormeoDomEventMap {}
}
