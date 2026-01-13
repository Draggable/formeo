import i18n from '@draggable/i18n'
import dom from '../common/dom.js'
import { merge } from '../common/utils/index.mjs'
import { labelHelper } from './edit-panel/helpers.mjs'

const defaults = Object.freeze({
  title: '',
  content: null,
  confirmText: () => labelHelper('save'),
  cancelText: () => labelHelper('cancel'),
  onConfirm: () => {},
  onCancel: () => {},
  className: '',
  closeOnEscape: true,
  position: 'top', // 'top' | 'center' | 'trigger'
  triggerElement: null, // Element that triggered the dialog (for position: 'trigger')
  triggerCoords: null, // Or manual coords { x, y } (for position: 'trigger')
})

/**
 * Dialog component for creating modal dialogs
 * Always wraps content in a form element
 */
export class Dialog {
  /**
   * Creates a new Dialog instance
   * @param {Object} options - Dialog configuration options
   * @param {string} [options.title] - Dialog title
   * @param {Object|Array} [options.content] - DOM config for dialog body content
   * @param {Function} [options.onConfirm] - Callback when form is submitted (receives FormData)
   * @param {Function} [options.onCancel] - Callback when dialog is cancelled
   * @param {string|Function} [options.confirmText] - Confirm button text
   * @param {string|Function} [options.cancelText] - Cancel button text
   * @param {string} [options.className] - Additional CSS class name(s)
   * @param {boolean} [options.closeOnEscape] - Whether Escape key closes dialog
   * @param {string} [options.position] - Positioning mode: 'top' (upper center), 'center', or 'trigger' (near trigger element)
   * @param {HTMLElement} [options.triggerElement] - Element that triggered dialog (for position: 'trigger')
   * @param {Object} [options.triggerCoords] - Manual coordinates {x, y} (for position: 'trigger')
   */
  constructor(options) {
    this.opts = merge(defaults, options)
    this.dialog = null
  }

  /**
   * Creates the dialog DOM structure
   * @returns {HTMLDialogElement} The created dialog element
   */
  createDialog() {
    const { title, content, confirmText, cancelText, className, closeOnEscape, position } = this.opts

    // Build positioning class
    const positionClass = `dialog-position-${position}`

    const formChildren = []

    // Add title if provided
    if (title) {
      formChildren.push({
        tag: 'h3',
        className: 'dialog-title',
        textContent: title,
      })
    }

    // Add content body
    if (content) {
      formChildren.push({
        tag: 'div',
        className: 'dialog-body',
        children: Array.isArray(content) ? content : [content],
      })
    }

    // Add action buttons footer
    formChildren.push({
      tag: 'div',
      className: 'dialog-actions',
      children: [
        {
          tag: 'button',
          type: 'button',
          className: 'btn btn-sm btn-secondary',
          textContent: typeof cancelText === 'function' ? cancelText() : cancelText,
          action: {
            click: () => this.handleCancel(),
          },
        },
        {
          tag: 'button',
          type: 'submit',
          className: 'btn btn-sm btn-primary',
          textContent: typeof confirmText === 'function' ? confirmText() : confirmText,
        },
      ],
    })

    const dialogElement = dom.create({
      tag: 'dialog',
      className: ['formeo-dialog', 'formeo', positionClass, className],
      children: [
        {
          tag: 'form',
          className: 'dialog-form',
          method: 'dialog',
          children: formChildren,
          action: {
            submit: e => this.handleSubmit(e),
          },
        },
      ],
      action: {
        cancel: e => {
          if (closeOnEscape) {
            this.handleCancel()
          } else {
            e.preventDefault()
          }
        },
      },
    })

    return dialogElement
  }

  /**
   * Handles form submission
   * @param {Event} e - Submit event
   */
  handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    this.opts.onConfirm(formData, this)
    this.close()
  }

  /**
   * Handles dialog cancellation
   */
  handleCancel() {
    this.opts.onCancel(this)
    this.close()
  }

  /**
   * Sets dialog position based on trigger element or coordinates
   */
  setPosition() {
    const { position, triggerElement, triggerCoords } = this.opts

    if (position !== 'trigger' || !this.dialog) return

    let coords = triggerCoords

    // Get coordinates from trigger element if provided
    if (!coords && triggerElement) {
      const rect = triggerElement.getBoundingClientRect()
      coords = {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8, // 8px gap below trigger
      }
    }

    if (coords) {
      // Position dialog near trigger
      const dialogRect = this.dialog.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let left = coords.x - dialogRect.width / 2
      let top = coords.y

      // Keep within viewport bounds
      const padding = 16
      left = Math.max(padding, Math.min(left, viewportWidth - dialogRect.width - padding))
      top = Math.max(padding, Math.min(top, viewportHeight - dialogRect.height - padding))

      this.dialog.style.left = `${left}px`
      this.dialog.style.top = `${top}px`
      this.dialog.style.transform = 'none'
    }
  }

  /**
   * Opens the dialog
   * @returns {Dialog} This dialog instance for chaining
   */
  open() {
    if (!this.dialog) {
      this.dialog = this.createDialog()
    }
    document.body.appendChild(this.dialog)
    this.dialog.showModal()

    // Apply trigger-based positioning after dialog is in DOM
    if (this.opts.position === 'trigger') {
      // Use setTimeout to ensure dialog is rendered and has dimensions
      const setTimeoutId = setTimeout(() => {
        this.setPosition()
        clearTimeout(setTimeoutId)
      }, 0)
    }

    return this
  }

  /**
   * Closes and removes the dialog
   */
  close() {
    if (this.dialog) {
      this.dialog.close()
      this.dialog.remove()
      this.dialog = null
    }
  }

  /**
   * Static shorthand for simple alert dialog
   * @param {string} message - Alert message
   * @param {Function} [onConfirm] - Optional callback when confirmed
   * @returns {Dialog} Dialog instance
   */
  static alert(message, onConfirm = () => {}) {
    return new Dialog({
      content: {
        tag: 'p',
        className: 'dialog-message',
        textContent: message,
      },
      confirmText: () => i18n.get('ok') || 'OK',
      cancelText: '', // Hide cancel button by returning empty string
      onConfirm: () => onConfirm(),
    })
  }

  /**
   * Static shorthand for confirmation dialog
   * @param {string} message - Confirmation question
   * @param {Function} [onConfirm] - Callback when confirmed
   * @param {Function} [onCancel] - Callback when cancelled
   * @returns {Dialog} Dialog instance
   */
  static confirm(message, onConfirm = () => {}, onCancel = () => {}) {
    return new Dialog({
      content: {
        tag: 'p',
        className: 'dialog-message',
        textContent: message,
      },
      confirmText: () => i18n.get('confirm') || 'Confirm',
      onConfirm: () => onConfirm(),
      onCancel: () => onCancel(),
    })
  }

  /**
   * Static shorthand for prompt dialog
   * @param {string} message - Prompt message
   * @param {Function} onSubmit - Callback with user input value
   * @param {string} [defaultValue] - Default input value
   * @returns {Dialog} Dialog instance
   */
  static prompt(message, onSubmit = () => {}, defaultValue = '') {
    return new Dialog({
      content: [
        {
          tag: 'label',
          className: 'dialog-prompt-label',
          children: [
            {
              tag: 'p',
              className: 'dialog-message',
              textContent: message,
            },
            {
              tag: 'input',
              type: 'text',
              name: 'prompt-value',
              className: 'dialog-prompt-input',
              value: defaultValue,
            },
          ],
        },
      ],
      onConfirm: formData => {
        const value = formData.get('prompt-value')
        onSubmit(value)
      },
    })
  }
}

export default Dialog
