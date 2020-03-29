import i18n from 'mi18n'
import Sortable from 'sortablejs'
import h, { indexOfNode } from '../common/helpers'
import dom from '../common/dom'
import { ANIMATION_SPEED_SLOW, ANIMATION_SPEED_FAST } from '../constants'
import { merge } from '../common/utils'

const defaults = Object.freeze({
  type: 'field',
  displayType: 'slider',
})

const getTransition = val => ({ transform: `translateX(${val ? `${val}px` : 0})` })

/**
 * Edit and control sliding panels
 */
export default class Panels {
  /**
   * Panels initial setup
   * @param  {Object} options Panels config
   * @return {Object} Panels
   */
  constructor(options) {
    this.opts = merge(defaults, options)
    this.panelDisplay = this.opts.displayType

    this.activePanelIndex = 0

    this.panelNav = this.createPanelNav()
    const panelsWrap = this.createPanelsWrap()
    this.nav = this.navActions()

    const resizeObserver = new window.ResizeObserver(([{ contentRect: { width } }]) => {
      if (this.currentWidth !== width) {
        this.toggleTabbedLayout()
        this.currentWidth = width
        this.nav.setTranslateX(this.activePanelIndex, false)
      }
    })

    const observeTimeout = window.setTimeout(() => {
      resizeObserver.observe(panelsWrap)
      window.clearTimeout(observeTimeout)
    }, ANIMATION_SPEED_SLOW)
  }

  getPanelDisplay() {
    const column = this.panelsWrap
    const width = parseInt(dom.getStyle(column, 'width'))
    const autoDisplayType = width > 390 ? 'tabbed' : 'slider'
    const isAuto = this.opts.displayType === 'auto'
    this.panelDisplay = isAuto ? autoDisplayType : this.opts.displayType || defaults.displayType
    return this.panelDisplay
  }

  toggleTabbedLayout = () => {
    this.getPanelDisplay()
    const isTabbed = this.isTabbed
    this.panelsWrap.parentElement.classList.toggle('tabbed-panels', isTabbed)
    if (isTabbed) {
      this.panelNav.removeAttribute('style')
    }
    return isTabbed
  }

  /**
   * Resize the panel after its contents change in height
   * @return {String} panel's height in pixels
   */
  resizePanels = () => {
    this.toggleTabbedLayout()
    const panelStyle = this.panelsWrap.style
    const activePanelHeight = dom.getStyle(this.currentPanel, 'height')
    panelStyle.height = activePanelHeight
    return activePanelHeight
  }

  /**
   * Wrap a panel and make properties sortable
   * if the panel belongs to a field
   * @return {Object} DOM element
   */
  createPanelsWrap() {
    const panelsWrap = dom.create({
      className: 'panels',
      content: this.opts.panels.map(({ config: { label }, ...panel }) => panel),
    })

    if (this.opts.type === 'field') {
      this.sortableProperties(panelsWrap)
    }

    this.panelsWrap = panelsWrap
    this.panels = panelsWrap.children
    this.currentPanel = this.panels[this.activePanelIndex]

    return panelsWrap
  }

  /**
   * Sortable panel properties
   * @param  {Array} panels
   * @return {Array} panel groups
   */
  sortableProperties(panels) {
    const _this = this
    const groups = panels.getElementsByClassName('field-edit-group')

    return h.forEach(groups, (group, index) => {
      group.fieldId = _this.opts.id
      if (group.isSortable) {
        Sortable.create(group, {
          animation: 150,
          group: {
            name: 'edit-' + group.editGroup,
            pull: true,
            put: ['properties'],
          },
          sort: true,
          handle: '.prop-order',
          onSort: evt => {
            _this.propertySave(evt.to)
            _this.resizePanels()
          },
        })
      }
    })
  }

  createPanelNavLabels() {
    const labels = this.opts.panels.map(panel => ({
      tag: 'h5',
      action: {
        click: evt => {
          const index = indexOfNode(evt.target, evt.target.parentElement)
          this.currentPanel = this.panels[index]
          const labels = evt.target.parentElement.childNodes
          this.nav.refresh(index)
          dom.removeClasses(labels, 'active-tab')
          evt.target.classList.add('active-tab')
        },
      },
      content: panel.config.label,
    }))

    const panelLabels = {
      className: 'panel-labels',
      content: {
        content: labels,
      },
    }

    const [firstLabel] = labels
    firstLabel.className = 'active-tab'

    return dom.create(panelLabels)
  }

  /**
   * Panel navigation, tabs and arrow buttons for slider
   * @return {Object} DOM object for panel navigation wrapper
   */
  createPanelNav() {
    this.labels = this.createPanelNavLabels()

    const next = {
      tag: 'button',
      attrs: {
        className: 'next-group',
        title: i18n.get('controlGroups.nextGroup'),
        type: 'button',
      },
      dataset: {
        toggle: 'tooltip',
        placement: 'top',
      },
      action: {
        click: e => this.nav.nextGroup(e),
      },
      content: dom.icon('triangle-right'),
    }
    const prev = {
      tag: 'button',
      attrs: {
        className: 'prev-group',
        title: i18n.get('controlGroups.prevGroup'),
        type: 'button',
      },
      dataset: {
        toggle: 'tooltip',
        placement: 'top',
      },
      action: {
        click: e => this.nav.prevGroup(e),
      },
      content: dom.icon('triangle-left'),
    }

    return dom.create({
      tag: 'nav',
      attrs: {
        className: 'panel-nav',
      },
      content: [prev, this.labels, next],
    })
  }

  get isTabbed() {
    return this.panelDisplay === 'tabbed'
  }

  /**
   * Handlers for navigating between panel groups
   * @todo refactor to use requestAnimationFrame instead of css transitions
   * @return {Object} actions that control panel groups
   */
  navActions() {
    const action = {}
    const groupParent = this.currentPanel.parentElement
    const labelWrap = this.labels.firstChild
    const siblingGroups = this.currentPanel.parentElement.childNodes
    this.activePanelIndex = indexOfNode(this.currentPanel, groupParent)
    let offset = { nav: 0, panel: 0 }
    let lastOffset = { ...offset }

    const groupChange = newIndex => {
      const labels = labelWrap.children
      dom.removeClasses(siblingGroups, 'active-panel')
      dom.removeClasses(labels, 'active-tab')
      this.currentPanel = siblingGroups[newIndex]
      this.currentPanel.classList.add('active-panel')

      labels[newIndex].classList.add('active-tab')
      return this.currentPanel
    }

    const getOffset = index => {
      return {
        nav: -labelWrap.offsetWidth * index,
        panel: -groupParent.offsetWidth * index,
      }
    }

    const translateX = ({ offset, reset, duration = ANIMATION_SPEED_FAST, animate = !this.isTabbed }) => {
      const panelQueue = [getTransition(lastOffset.panel), getTransition(offset.panel)]
      const navQueue = [getTransition(lastOffset.nav), getTransition(this.isTabbed ? 0 : offset.nav)]

      if (reset) {
        const [panelStart] = panelQueue
        const [navStart] = navQueue
        panelQueue.push(panelStart)
        navQueue.push(navStart)
      }

      const animationOptions = {
        easing: 'ease-in-out',
        duration: animate ? duration : 0,
        fill: 'forwards',
      }

      const panelTransition = groupParent.animate(panelQueue, animationOptions)
      labelWrap.animate(navQueue, animationOptions)

      const handleFinish = () => {
        this.panelsWrap.style.height = dom.getStyle(this.currentPanel, 'height')
        panelTransition.removeEventListener('finish', handleFinish)
        if (!reset) {
          lastOffset = offset
        }
      }
      panelTransition.addEventListener('finish', handleFinish)
    }

    action.setTranslateX = (panelIndex, animate = true) => {
      offset = getOffset(panelIndex || this.activePanelIndex)
      translateX({ offset, animate })
    }

    action.refresh = newIndex => {
      if (newIndex !== undefined) {
        this.activePanelIndex = newIndex
        groupChange(newIndex)
      }
      this.resizePanels()
      action.setTranslateX(this.activePanelIndex, false)
    }

    /**
     * Slides panel to the next group
     * @return {Object} current group after navigation
     */
    action.nextGroup = () => {
      const newIndex = this.activePanelIndex + 1
      if (newIndex !== siblingGroups.length) {
        const curPanel = groupChange(newIndex)
        offset = {
          nav: -labelWrap.offsetWidth * newIndex,
          panel: -curPanel.offsetLeft,
        }
        translateX({ offset })
        this.activePanelIndex++
      } else {
        offset = {
          nav: lastOffset.nav - 8,
          panel: lastOffset.panel - 8,
        }
        translateX({ offset, reset: true })
      }

      return this.currentPanel
    }

    action.prevGroup = () => {
      if (this.activePanelIndex !== 0) {
        const newIndex = this.activePanelIndex - 1
        const curPanel = groupChange(newIndex)
        offset = {
          nav: -labelWrap.offsetWidth * newIndex,
          panel: -curPanel.offsetLeft,
        }
        translateX({ offset })
        this.activePanelIndex--
      } else {
        offset = {
          nav: 8,
          panel: 8,
        }
        translateX({ offset, reset: true })
      }
    }

    return action
  }
}
