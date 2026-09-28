import i18n from '@draggable/i18n'
import dom from '../../common/dom.js'
import { toTitleCase } from '../../common/utils/string.mjs'

export const BASE_NAME = 'f-autocomplete'
export const DISPLAY_FIELD_CLASSNAME = `${BASE_NAME}-display-field`
export const LIST_CLASSNAME = `${BASE_NAME}-list`
export const HIGHLIGHT_CLASSNAME = 'highlight-component'
export const LIST_ITEM_CLASSNAME = `${LIST_CLASSNAME}-item`

/**
 * Counts the number of occurences of a string in an array of strings
 * @param {Array} arr labels
 * @param {String} label
 */
export const labelCount = (arr, label) => {
  const count = arr.reduce((n, x) => n + (x === label), 0)
  return count > 1 ? `(${count})` : ''
}

const fieldLabelPaths = ['config.label', 'config.controlId']
const rowLabelPaths = ['config.legend', 'name']
const componentLabelPaths = [...fieldLabelPaths, ...rowLabelPaths]

const resolveFieldLabel = field => {
  return fieldLabelPaths.reduce((acc, path) => {
    if (!acc) {
      return field.get(path)
    }
    return acc
  }, null)
}

const resolveComponentLabel = component => {
  return (
    componentLabelPaths.reduce((acc, path) => {
      if (!acc) {
        return component.get(path)
      }
      return acc
    }, null) || toTitleCase(component.name)
  )
}

const labelResolverMap = new Map([
  ['condition.source', resolveFieldLabel],
  ['if.condition.source', resolveFieldLabel],
  ['if.condition.target', resolveFieldLabel],
  ['then.condition.target', resolveComponentLabel],
  ['condition.target', resolveComponentLabel],
])

// only a then-action's target can be a page (#122)
const THEN_TARGET_KEYS = new Set(['then.condition.target', 'condition.target'])
const pagesOn = components => Boolean(components?.opts?.pages)

/**
 * Find or generate a label for components
 * @param {Object} Component
 * @param {String} key the autocomplete's key, e.g. 'then.condition.target'
 * @param {Components} [components] the editor's components, to name a stage by its page title when pages are on
 * @return {String} component label
 */
export const getComponentLabel = ({ id, ...component }, key, components) => {
  const { name, label } = component
  if (!name) {
    return label
  }
  // with page tabs, a stage is a page, known by its title (#122)
  if (name === 'stage' && THEN_TARGET_KEYS.has(key) && pagesOn(components)) {
    return components.stages.pageTitle(components.stages.get(id))
  }
  const labelResolver = labelResolverMap.get(key)
  const resolvedLabel = labelResolver(component)

  return resolvedLabel
}

const makeOptionData = ({ selectedId, ...option }) => {
  if (option.value === selectedId) {
    option.selected = true
  }

  return option
}

const realTarget = target => {
  if (!target.classList.contains(LIST_ITEM_CLASSNAME)) {
    target = target.parentElement
  }

  return target
}

const makeListItem = ({ value, textLabel, htmlLabel, componentType, depth = 0 }, autocomplete) => {
  const optionConfig = {
    tag: 'li',
    children: htmlLabel,
    dataset: {
      value,
      label: textLabel,
    },
    className: [LIST_ITEM_CLASSNAME, `${LIST_ITEM_CLASSNAME}-depth-${depth}`, `component-type-${componentType}`],
    action: {
      mousedown: ({ target }) => {
        target = realTarget(target)
        autocomplete.setValue(target)
        autocomplete.selectOption(target)
        autocomplete.hideList()
      },
      mouseover: ({ target }) => {
        target = realTarget(target)
        autocomplete.removeHighlight()
        autocomplete.highlightComponent(target)
      },
      mouseleave: ({ target }) => {
        target = realTarget(target)
        autocomplete.removeHighlight()
      },
    },
  }
  return dom.create(optionConfig)
}

const makeComponentOptionsList = (component, autocomplete) => {
  const items = component.data.options.map((option, index) => {
    const value = `${component.address}.options[${index}]`
    const textLabel = option.label
    const htmlLabel = option.label
    return makeListItem({ value, textLabel, htmlLabel, componentType: 'option', depth: 1 }, autocomplete)
  })

  const list = dom.create({
    tag: 'ul',
    attrs: { className: [LIST_CLASSNAME, 'options-list'] },
    children: items,
  })

  return list
}

/**
 * Generate options for the autolinker component, from the components of the autocomplete's own editor
 * @param {Autocomplete} autocomplete
 * @return {Array} option config objects
 */
export const componentOptions = autocomplete => {
  const selectedId = autocomplete.value
  const labels = []
  const flatList = autocomplete.components.flatList()
  const listsPages = pagesOn(autocomplete.components)
  const options = Object.entries(flatList).reduce((acc, [value, component]) => {
    // without page tabs a stage is the whole form, so only a target already set to one stays listed
    if (component.name === 'stage' && !listsPages && value !== selectedId) {
      return acc
    }
    const label = getComponentLabel(component, autocomplete.key, autocomplete.components)
    if (label) {
      const componentType = component.name
      const typeLabel =
        componentType === 'stage' && listsPages ? i18n.get('pages.page') || 'Page' : toTitleCase(componentType)
      const typeConfig = {
        tag: 'span',
        content: ` ${typeLabel}`,
        className: 'component-type',
      }
      const labelKey = `${componentType}.${label}`
      labels.push(labelKey)
      const count = labelCount(labels, labelKey)

      const countConfig = {
        tag: 'span',
        content: count,
        className: 'component-label-count',
      }
      const htmlLabel = [`${label} `, countConfig, typeConfig]
      const textLabel = [label, count].join(' ').trim()

      if (component.isCheckable) {
        const componentOptionsList = makeComponentOptionsList(component, autocomplete)
        htmlLabel.push(componentOptionsList)
      }
      const optionData = makeOptionData({ value, textLabel, htmlLabel, componentType, selectedId })

      acc.push(makeListItem(optionData, autocomplete))
    }

    return acc
  }, [])

  return options
}
