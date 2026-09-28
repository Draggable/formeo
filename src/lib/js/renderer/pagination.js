import { STAGE_CLASSNAME } from '../constants.js'

const CONTROLS = 'input, select, textarea'
const FOCUSABLE = 'input:not([type="hidden"]), select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])'
// Enter in these inputs keeps its native meaning instead of acting as Next
const ENTER_NATIVE_TYPES = new Set(['submit', 'button', 'reset', 'image', 'file'])
const nextTab = (index, count) => (index + 1) % count
const previousTab = (index, count) => (index - 1 + count) % count
const TAB_KEYS = {
  ArrowRight: nextTab,
  ArrowLeft: previousTab,
  Home: () => 0,
  End: (_index, count) => count - 1,
}
// in a right-to-left form the tabs run from right to left, so the arrows swap
const RTL_TAB_KEYS = { ...TAB_KEYS, ArrowRight: previousTab, ArrowLeft: nextTab }

// numbers each paginated form, so its tab and page ids never clash with another form's or the editor's
let paginatedForms = 0

/**
 * Creates an element with a class and text, leaving any other attributes to the caller
 * @param {String} tag
 * @param {String} className
 * @param {String} [text]
 * @return {HTMLElement}
 */
const create = (tag, className, text = '') => {
  const elem = document.createElement(tag)
  elem.className = className
  elem.textContent = text
  return elem
}

/**
 * Fills `{name}` placeholders from `values`, leaving unknown ones as typed. A replacer function rather than a
 * replacement string, so `$&` or `$$` in a page title stays literal.
 * @param {String} text
 * @param {Object} values
 * @return {String}
 */
const fillLabel = (text, values) =>
  text.replace(/\{(\w+)\}/g, (token, name) => (Object.hasOwn(values, name) ? String(values[name]) : token))

/**
 * Moves focus to the first control a user can reach on a page, or to the page itself when it has none,
 * so that focus is never lost to the body
 * @param {HTMLElement} page
 */
const focusFirst = page => {
  const target = Array.from(page.querySelectorAll(FOCUSABLE)).find(elem => !elem.disabled && !elem.closest('[hidden]'))
  if (target) {
    target.focus()
    return
  }
  if (!page.hasAttribute('tabindex')) {
    page.tabIndex = -1
  }
  page.focus()
}

/**
 * Shows one stage of a rendered form at a time, as tabs or as a wizard
 * @param {HTMLFormElement} form rendered form
 * @param {{type: String, progress: Boolean, submit: Boolean, heading: Number, labels: Object}} options output of
 *   normalizePagination; `progress` only affects the wizard, adding a clickable step list above the pages
 * @param {Array<Object>} stages stage data in render order, for page titles
 * @param {Function} [onChange] called with (page, previousPage) whenever the page changes
 * @return {{show: Function, index: Number, count: Number, destroy: Function}|null} null when there is only one page
 */
export const paginate = (form, { type, progress, submit, labels }, stages, onChange) => {
  const pages = Array.from(form.children).filter(elem => elem.classList.contains(STAGE_CLASSNAME))
  if (pages.length < 2) {
    return null
  }

  const count = pages.length
  const last = count - 1
  let current = 0
  let tabs = []
  let steps = []
  let previous
  let next
  let status

  // the pages a user can reach, in order. Every page for now; page conditions will leave skipped ones out, and
  // "first", "last" and the status count follow this list rather than the stage count
  const playable = pages.map((_page, i) => i)
  const isFirstPlayable = i => i === playable[0]
  const isLastPlayable = i => i === playable.at(-1)

  // steps before the current page are done, the current one is current, the rest are upcoming
  const stepState = i => (i < current ? 'done' : i === current ? 'current' : 'upcoming')

  const update = () => {
    pages.forEach((page, i) => {
      page.hidden = i !== current
    })
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === current))
      tab.tabIndex = i === current ? 0 : -1
    })
    if (type === 'wizard') {
      previous.disabled = isFirstPlayable(current)
      next.hidden = isLastPlayable(current)
      if (submitButton) {
        submitButton.hidden = !isLastPlayable(current)
      }
      status.textContent = fillLabel(labels.status, {
        title: title(current),
        n: playable.indexOf(current) + 1,
        count: playable.length,
      })
      steps.forEach((step, i) => {
        step.dataset.state = stepState(i)
        const button = step.querySelector('button')
        if (i === current) {
          button.setAttribute('aria-current', 'step')
        } else {
          button.removeAttribute('aria-current')
        }
      })
    }
  }

  /**
   * @param {Number} index page to show, clamped to the available pages
   * @param {{focus: Boolean}} [options] focus the first control of the new page
   */
  const show = (index, { focus = false } = {}) => {
    const previousPage = current
    const parsed = Number(index)
    const normalized = Number.isFinite(parsed) ? Math.trunc(parsed) : 0
    current = Math.max(0, Math.min(normalized, last))
    update()
    if (focus) {
      focusFirst(pages[current])
    }
    if (current !== previousPage) {
      onChange?.(current, previousPage)
    }
  }

  // set while the wizard checks a page itself, so the `invalid` listener below leaves the page alone
  let checkingPage = false

  /**
   * Checks the controls of a page the way native submit would, reporting the first invalid one.
   * Only meaningful for the page currently on screen: `reportValidity` focuses and shows its bubble
   * on the first invalid control in place, without moving the page.
   * @param {HTMLElement} page
   * @return {Boolean} true when every control on the page is valid
   */
  const pageIsValid = page => {
    checkingPage = true
    try {
      return Array.from(page.querySelectorAll(CONTROLS)).every(
        control => !control.willValidate || control.reportValidity()
      )
    } finally {
      checkingPage = false
    }
  }

  /**
   * Finds a page's first invalid control without triggering any native UI, so a still-hidden page
   * can be checked before it is shown
   * @param {HTMLElement} page
   * @return {Element|null}
   */
  const firstInvalidControl = page => {
    checkingPage = true
    try {
      return (
        Array.from(page.querySelectorAll(CONTROLS)).find(control => control.willValidate && !control.checkValidity()) ??
        null
      )
    } finally {
      checkingPage = false
    }
  }

  /**
   * Moves toward a target page. Clicking the current step is a no-op. Going back is unconditional.
   * Moving forward validates every page from the current one up to (but not including) the target,
   * in order, stopping at the first invalid one instead of reaching it:
   *  - when that page is the current, still-visible one, `pageIsValid`'s own `reportValidity` calls
   *    already focused and reported the problem in place, so nothing more happens here - showing the
   *    page again would only steal focus back to its first control.
   *  - when it's a later, still-hidden page, it's shown first without moving focus (a hidden
   *    control can't take focus or show a bubble anyway), then its actual invalid control - not
   *    necessarily the first one on the page - is reported directly, now that it can be seen.
   * A `novalidate` form is never checked, just as native submit wouldn't check it.
   * Shared by the Next button and the step list.
   * @param {Number} target page to reach
   */
  const goTo = target => {
    if (target === current) {
      return
    }
    for (let i = current; i < target && !form.noValidate; i++) {
      if (i === current) {
        if (!pageIsValid(pages[i])) {
          return
        }
        continue
      }
      const invalidControl = firstInvalidControl(pages[i])
      if (invalidControl) {
        show(i)
        checkingPage = true
        try {
          invalidControl.reportValidity()
        } finally {
          checkingPage = false
        }
        return
      }
    }
    show(target, { focus: true })
  }

  const goNext = () => goTo(current + 1)

  const title = i => stages[i]?.config?.title || labels.page.replaceAll('{n}', String(i + 1))

  // a real submit button, so Enter on the last page submits natively even with no submit field in the form
  let submitButton
  if (submit) {
    submitButton = create('button', 'formeo-pages-submit', labels.submit)
    submitButton.type = 'submit'
  }

  if (type === 'tabs') {
    const tablist = create('nav', 'formeo-pages-nav formeo-pages-tabs')
    tablist.setAttribute('role', 'tablist')
    tablist.setAttribute('aria-label', labels.tablist)
    // a stage's own id is also its id in the editor and in any other form rendered from the same
    // formData, so aria-controls needs ids unique to this form; the stage id moves to data-stage-id
    const idPrefix = `formeo-pages-${++paginatedForms}`
    tabs = pages.map((page, i) => {
      page.dataset.stageId = page.id
      page.id = `${idPrefix}-page-${i + 1}`
      const tab = create('button', 'formeo-pages-tab', title(i))
      tab.type = 'button'
      tab.id = `${idPrefix}-tab-${i + 1}`
      tab.setAttribute('role', 'tab')
      tab.setAttribute('aria-controls', page.id)
      tab.addEventListener('click', () => show(i))
      page.setAttribute('role', 'tabpanel')
      page.tabIndex = 0
      page.setAttribute('aria-labelledby', tab.id)
      return tab
    })
    tablist.append(...tabs)
    // automatic activation: moving to a tab shows its page
    tablist.addEventListener('keydown', event => {
      const index = tabs.indexOf(event.target)
      const isRtl = tablist.ownerDocument.defaultView.getComputedStyle(tablist).direction === 'rtl'
      const move = (isRtl ? RTL_TAB_KEYS : TAB_KEYS)[event.key]
      if (index === -1 || !move) {
        return
      }
      event.preventDefault()
      const target = move(index, count)
      show(target)
      tabs[target].focus()
    })
    form.prepend(tablist)
    if (submitButton) {
      // below every page, and always shown: any tab may be the last one a user fills in
      const actions = create('div', 'formeo-pages-actions')
      actions.append(submitButton)
      form.append(actions)
    }
  } else {
    if (progress) {
      const stepList = document.createElement('ol')
      stepList.className = 'formeo-pages-steps'
      stepList.setAttribute('aria-label', labels.steps)
      steps = pages.map((_page, i) => {
        const step = document.createElement('li')
        step.className = 'formeo-pages-step'
        const button = create('button', '', title(i))
        button.type = 'button'
        button.addEventListener('click', () => goTo(i))
        step.append(button)
        return step
      })
      stepList.append(...steps)
      form.prepend(stepList)
    }

    previous = create('button', 'formeo-pages-previous', labels.previous)
    previous.type = 'button'
    previous.addEventListener('click', () => show(current - 1, { focus: true }))
    status = create('span', 'formeo-pages-status')
    status.setAttribute('aria-live', 'polite')
    next = create('button', 'formeo-pages-next', labels.next)
    next.type = 'button'
    next.addEventListener('click', goNext)
    // a group, not a <nav>: moving between the pages of one form is not site navigation
    const bar = create('div', 'formeo-pages-nav formeo-pages-wizard')
    bar.setAttribute('role', 'group')
    bar.setAttribute('aria-label', labels.navigation)
    bar.append(previous, status, next)
    if (submitButton) {
      bar.append(submitButton)
    }
    form.append(bar)

    // Enter before the last page moves on instead of submitting a half-filled form
    form.addEventListener('keydown', event => {
      const { target } = event
      if (
        event.key !== 'Enter' ||
        event.isComposing ||
        event.defaultPrevented ||
        isLastPlayable(current) ||
        target.tagName !== 'INPUT' ||
        ENTER_NATIVE_TYPES.has(target.type)
      ) {
        return
      }
      event.preventDefault()
      goNext()
    })
  }

  // Only a validation pass the browser reports to the user may switch pages: submitting (a submit
  // button, Enter's implicit submission, requestSubmit()) or form.reportValidity(). A silent
  // checkValidity() - e.g. an onChange handler toggling a submit button - must leave the page alone.
  // The flag only covers the browser validation pass triggered by a reported action.
  let reporting = false
  // a click or Enter keeps the flag for the rest of the task: a trusted event runs microtasks after
  // each listener, before the validation pass it triggers, so a microtask reset would come too soon
  const markReported = () => {
    reporting = true
    setTimeout(() => {
      reporting = false
    }, 0)
  }
  const withReportedValidation = call => {
    reporting = true
    try {
      return call()
    } finally {
      reporting = false
    }
  }
  const ownerDocument = form.ownerDocument
  const onDocumentClick = ({ target }) => {
    const control = target.closest?.('button, input')
    if (control?.form !== form) {
      return
    }
    if (control?.type === 'submit' || (control?.tagName === 'INPUT' && control.type === 'image')) {
      markReported()
    }
  }
  const onDocumentKeydown = ({ key, target }) => {
    if (key === 'Enter' && target.tagName === 'INPUT' && target.form === form) {
      markReported()
    }
  }
  ownerDocument.addEventListener('click', onDocumentClick, true)
  ownerDocument.addEventListener('keydown', onDocumentKeydown, true)
  for (const method of ['requestSubmit', 'reportValidity']) {
    const native = HTMLFormElement.prototype[method]
    if (typeof native !== 'function') {
      continue
    }
    form[method] = function (...args) {
      return withReportedValidation(() => native.apply(this, args))
    }
  }

  // a validation pass fires `invalid` on every invalid control, and the browser then focuses and reports
  // the first one in tree order, so every event shows that control's page. Browsers may run microtasks
  // between the events of a user-triggered pass, so no per-pass state is kept.
  form.addEventListener(
    'invalid',
    ({ target }) => {
      if (checkingPage || !reporting) {
        return
      }
      const firstInvalid = Array.from(form.elements).find(elem => elem.willValidate && !elem.validity.valid)
      const index = pages.findIndex(page => page.contains(firstInvalid || target))
      if (index !== -1) {
        show(index)
      }
    },
    true
  )

  update()

  return {
    show,
    get index() {
      return current
    },
    count,
    // the only listeners that outlive the form: everything else is on the form and goes with it
    destroy() {
      ownerDocument.removeEventListener('click', onDocumentClick, true)
      ownerDocument.removeEventListener('keydown', onDocumentKeydown, true)
    },
  }
}
