import dom from '../../common/dom.js'
import { map } from '../../common/helpers.mjs'
import { numToPercent, percent } from '../../common/utils/index.mjs'
import {
  bsColRegExp,
  COLUMN_PRESET_CLASSNAME,
  COLUMN_RESIZE_CLASSNAME,
  CUSTOM_COLUMN_OPTION_CLASSNAME,
  ROW_CLASSNAME,
} from '../../constants.js'
import Components from '../index.js'

export class ResizeColumn {
  /**
   * Binds the event handlers to the instance.
   */
  constructor() {
    this.onMove = this.onMove.bind(this)
    this.onStop = this.onStop.bind(this)
    this.cleanup = this.cleanup.bind(this)
  }

  /**
   * Calculates the total width of a row excluding the gaps between columns.
   * @param {HTMLElement} row - The row element.
   * @returns {number} - The total width of the row.
   */
  getRowWidth(row) {
    const rowChildren = row.querySelector('.children')
    if (!rowChildren) return 0

    const numberOfColumns = rowChildren.children.length
    const gapSize = dom.getStyle(rowChildren, 'gap') || '0px'
    const gapPixels = parseFloat(gapSize, 10) || 0

    // Cache the total gap width for potential future use
    this.totalGapWidth = gapPixels * (numberOfColumns - 1)

    return rowChildren.offsetWidth - this.totalGapWidth
  }

  /**
   * Validates if the resize target columns are valid.
   * @param {HTMLElement} column - The column being resized.
   * @param {HTMLElement} sibling - The sibling column.
   * @returns {boolean} - True if both columns are valid, false otherwise.
   */
  validateResizeTarget(column, sibling) {
    return column && sibling && column.offsetWidth && sibling.offsetWidth
  }

  /**
   * Handles the start of the resize event.
   * @param {Event} evt - The event object.
   */
  onStart(evt) {
    evt.preventDefault()
    this.resized = false

    if (evt.button !== 0) return

    const column = evt.target.parentElement
    const sibling = column.nextSibling || column.previousSibling
    const row = column.closest(`.${ROW_CLASSNAME}`)

    // Validate resize targets
    if (!this.validateResizeTarget(column, sibling)) {
      console.warn('Invalid resize targets')
      this.cleanup()
      return
    }

    this.startX = evt.type === 'touchstart' ? evt.touches[0].clientX : evt.clientX

    row.classList.add(COLUMN_RESIZE_CLASSNAME)
    this.columnPreset = row.querySelector(`.${COLUMN_PRESET_CLASSNAME}`)

    // Store original classes in case we need to revert
    this.originalColumnClass = column.className
    this.originalSiblingClass = sibling.className

    // remove bootstrap column classes since we are custom sizing
    column.className = column.className.replace(bsColRegExp, '')
    sibling.className = sibling.className.replace(bsColRegExp, '')

    this.colStartWidth = column.offsetWidth
    this.sibStartWidth = sibling.offsetWidth
    this.rowWidth = this.getRowWidth(row)

    // Validate calculated width
    if (this.rowWidth <= 0) {
      console.warn('Invalid row width calculated')
      this.cleanup()
      return
    }

    this.column = column
    this.sibling = sibling
    this.row = row

    try {
      window.addEventListener('pointermove', this.onMove, false)
      window.addEventListener('pointerup', this.onStop, false)
    } catch (error) {
      console.error('Failed to initialize resize listeners:', error)
      this.cleanup()
    }
  }

  /**
   * Calculates the new widths for the columns based on the mouse position.
   * @param {number} clientX - The current X position of the mouse.
   * @returns {Object|null} - The new widths for the columns or null if invalid.
   */
  calculateNewWidths(clientX) {
    const newColWidth = this.colStartWidth + clientX - this.startX
    const newSibWidth = this.sibStartWidth - clientX + this.startX

    const colWidthPercent = parseFloat(percent(newColWidth, this.rowWidth))
    const sibWidthPercent = parseFloat(percent(newSibWidth, this.rowWidth))

    // Add minimum width check
    if (colWidthPercent < 10 || sibWidthPercent < 10) {
      return null
    }

    return {
      colWidth: numToPercent(colWidthPercent.toFixed(1)),
      siblingColWidth: numToPercent(sibWidthPercent.toFixed(1)),
    }
  }

  /**
   * Handles the movement during the resize event.
   * @param {Event} evt - The event object.
   */
  onMove(evt) {
    evt.preventDefault()
    const { column, sibling } = this

    const clientX = evt.type === 'touchmove' ? evt.touches[0].clientX : evt.clientX

    const newWidths = this.calculateNewWidths(clientX)
    if (!newWidths) return

    const { colWidth, siblingColWidth } = newWidths

    column.dataset.colWidth = colWidth
    sibling.dataset.colWidth = siblingColWidth
    column.style.width = colWidth
    sibling.style.width = siblingColWidth
    this.resized = true
  }

  onStop() {
    const { column, sibling } = this

    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerup', this.onStop)

    if (!this.resized) {
      return
    }

    this.setCustomWidthValue()

    Components.setAddress(`columns.${column.id}.config.width`, column.dataset.colWidth)
    Components.setAddress(`columns.${sibling.id}.config.width`, sibling.dataset.colWidth)
    this.row.classList.remove(COLUMN_RESIZE_CLASSNAME)

    this.resized = false

    this.cleanup()
  }

  // Helper method to clean up if resize fails
  cleanup() {
    if (this.column && this.originalColumnClass) {
      this.column.className = this.originalColumnClass
    }
    if (this.sibling && this.originalSiblingClass) {
      this.sibling.className = this.originalSiblingClass
    }
    if (this.row) {
      this.row.classList.remove(COLUMN_RESIZE_CLASSNAME)
    }
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerup', this.onStop)
  }

  /**
   * Adds a custom option from the column width present selecy
   * @param {Node} row
   */
  setCustomWidthValue() {
    const columnPreset = this.columnPreset
    let customOption = columnPreset.querySelector(`.${CUSTOM_COLUMN_OPTION_CLASSNAME}`)
    const cols = this.row.querySelector('.children').children
    const widths = map(cols, col => percent(col.clientWidth, this.rowWidth).toFixed(1))
    const value = widths.join(',')
    const content = widths.join(' | ')

    if (!customOption) {
      customOption = dom.create({
        tag: 'option',
        attrs: {
          className: CUSTOM_COLUMN_OPTION_CLASSNAME,
          value,
          selected: true,
        },
        content,
      })

      columnPreset.append(customOption)
    }

    customOption.value = value
    customOption.textContent = content

    return value
  }
}
