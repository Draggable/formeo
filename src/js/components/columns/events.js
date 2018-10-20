import dom from '../../common/dom'
import Components from '..'
import { numToPercent } from '../../common/utils'
import { ROW_CLASSNAME } from '../../constants'

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

    const percent = width => (width / resize.rowWidth) * 100
    const colWidthPercent = parseFloat(percent(newColWidth))
    const sibWidthPercent = parseFloat(percent(newSibWidth))

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

    row.querySelector('.column-preset').value = 'custom'
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
