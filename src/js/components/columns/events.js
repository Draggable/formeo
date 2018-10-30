import dom from '../../common/dom'
import Components from '..'
import { percent, numToPercent } from '../../common/utils'
import { ROW_CLASSNAME } from '../../constants'
import { map } from '../../common/helpers'

const CUSTOM_COLUMN_OPTION_CLASSNAME = 'custom-column-widths'
const COLUMN_PRESET_CLASSNAME = 'column-preset'

/**
 * Handle column resizing
 * @param  {Object} evt resize event
 */
export function resize(evt) {
  const resize = this
  const column = evt.target.parentElement
  const sibling = column.nextSibling || column.previousSibling
  const row = column.closest(`.${ROW_CLASSNAME}`)
  const rowStyle = dom.getStyle(row)
  const rowPadding = parseFloat(rowStyle.paddingLeft) + parseFloat(rowStyle.paddingRight)

  /**
   * Set the width before resizing so the column
   * does not resize near window edges
   * @param  {Object} evt
   */
  resize.move = evt => {
    let clientX
    if (evt.type === 'touchmove') {
      clientX = evt.touches[0].clientX
    } else {
      clientX = evt.clientX
    }
    const newColWidth = resize.colStartWidth + clientX - resize.startX
    const newSibWidth = resize.sibStartWidth - clientX + resize.startX

    const colWidthPercent = parseFloat(percent(newColWidth, resize.rowWidth))
    const sibWidthPercent = parseFloat(percent(newSibWidth, resize.rowWidth))

    column.dataset.colWidth = numToPercent(colWidthPercent.toFixed(1))
    sibling.dataset.colWidth = numToPercent(sibWidthPercent.toFixed(1))

    column.style.width = numToPercent(colWidthPercent)
    sibling.style.width = numToPercent(sibWidthPercent)
    resize.resized = true
  }

  resize.stop = function() {
    window.removeEventListener('mousemove', resize.move)
    window.removeEventListener('mouseup', resize.stop)
    window.removeEventListener('touchmove', resize.move)
    window.removeEventListener('touchend', resize.stop)
    if (!resize.resized) {
      return
    }

    setCustomWidthValue(row, resize.rowWidth)
    row.classList.remove('resizing-columns')

    Components.setAddress(`columns.${column.id}.config.width`, column.dataset.colWidth)
    Components.setAddress(`columns.${sibling.id}.config.width`, sibling.dataset.colWidth)
    resize.resized = false
  }

  resize.start = (function(evt) {
    if (evt.type === 'touchstart') {
      resize.startX = evt.touches[0].clientX
    } else {
      resize.startX = evt.clientX
    }
    row.classList.add('resizing-columns')

    // remove bootstrap column classes since we are custom sizing
    const reg = /\bcol-\w+-\d+/g
    column.className.replace(reg, '')
    sibling.className.replace(reg, '')

    // eslint-disable-next-line
    resize.colStartWidth = column.offsetWidth || dom.getStyle(column, 'width')
    // eslint-disable-next-line
    resize.sibStartWidth = sibling.offsetWidth || dom.getStyle(sibling, 'width')
    resize.rowWidth = row.offsetWidth - rowPadding // compensate for padding

    window.addEventListener('mouseup', resize.stop, false)
    window.addEventListener('mousemove', resize.move, false)
    window.addEventListener('touchend', resize.stop, false)
    window.addEventListener('touchmove', resize.move, false)
  })(evt)
}

/**
 * Removes a custom option from the column width present selecy
 * @param {Node} row
 * @return {Node} columnPreset input || null
 */
export const removeCustomOption = (row, columnPreset = row.querySelector(`.${COLUMN_PRESET_CLASSNAME}`)) => {
  const customOption = columnPreset.querySelector(`.${CUSTOM_COLUMN_OPTION_CLASSNAME}`)
  return customOption && columnPreset.removeChild(customOption)
}

/**
 * Adds a custom option from the column width present selecy
 * @param {Node} row
 */
export const setCustomWidthValue = (row, rowWidth) => {
  const columnPreset = row.querySelector(`.${COLUMN_PRESET_CLASSNAME}`)
  const customOption = columnPreset.querySelector(`.${CUSTOM_COLUMN_OPTION_CLASSNAME}`)
  const cols = row.querySelector('.children').children
  const widths = map(cols, col => percent(col.clientWidth, rowWidth).toFixed(1))
  const value = widths.join(',')
  const content = widths.join(' | ')

  if (customOption) {
    removeCustomOption(row, columnPreset)
  }

  const newCustomOption = dom.create({
    tag: 'option',
    attrs: {
      className: CUSTOM_COLUMN_OPTION_CLASSNAME,
      value,
    },
    content,
  })

  columnPreset.add(newCustomOption)
  columnPreset.value = value

  return value
}
