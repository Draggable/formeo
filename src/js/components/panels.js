import i18n from 'mi18n'
import Sortable from 'sortablejs'
import h, { indexOfNode } from '../common/helpers'
import dom from '../common/dom'

const defaults = {
  type: 'field',
}

const getTransition = val => ({ transform: `translateX(${val}px)` })

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
    const _this = this
    this.opts = Object.assign({}, defaults, options)

    this.labels = _this.panelNav()
    const panels = _this.panelsWrap()

    this.panels = panels.childNodes
    this.currentPanel = _this.panels[0]
    this.nav = _this.navActions()

    this.panelDisplay = this.opts.displayType || 'slider'

    return {
      children: [_this.labels, panels],
      nav: _this.nav,
      action: {
        resize: _this.resizePanels,
      },
    }
  }

  /**
   * Resize the panel after its contents change in height
   * @return {String} panel's height in pixels
   */
  resizePanels = () => {
    const panelsWrap = this.panelsWrap
    const column = panelsWrap.parentElement.parentElement
    const width = parseInt(dom.getStyle(column, 'width'))
    const autoDisplayType = width > 390 ? 'tabbed' : 'slider'
    this.panelDisplay = this.opts.displayType || autoDisplayType
    const isTabbed = this.panelDisplay === 'tabbed'
    panelsWrap.parentElement.classList.toggle('tabbed-panels', isTabbed)
    const panelStyle = panelsWrap.style
    const activePanelHeight = dom.getStyle(this.currentPanel, 'height')
    if (isTabbed) {
      column.querySelector('.panel-labels div').removeAttribute('style')
    }
    panelStyle.height = activePanelHeight
    return activePanelHeight
  }

  /**
   * Wrap a panel and make properties sortable
   * if the panel belongs to a field
   * @return {Object} DOM element
   */
  panelsWrap() {
    this.panelsWrap = dom.create({
      className: 'panels',
      content: this.opts.panels,
    })

    this.panelsWrap = this.panelsWrap

    if (this.opts.type === 'field') {
      this.sortableProperties(this.panelsWrap)
    }

    return this.panelsWrap
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

  /**
   * Panel navigation, tabs and arrow buttons for slider
   * @return {Object} DOM object for panel navigation wrapper
   */
  panelNav() {
    const _this = this
    const panelNavLabels = {
      className: 'panel-labels',
      content: {
        content: [],
      },
    }
    const panels = this.opts.panels // make new array

    for (let i = 0; i < panels.length; i++) {
      const panelLabel = {
        tag: 'h5',
        action: {
          click: evt => {
            const index = indexOfNode(evt.target, evt.target.parentElement)
            _this.currentPanel = _this.panels[index]
            const labels = evt.target.parentElement.childNodes
            _this.nav.refresh(index)
            dom.removeClasses(labels, 'active-tab')
            evt.target.classList.add('active-tab')
          },
        },
        content: panels[i].config.label,
      }
      delete panels[i].config.label

      if (i === 0) {
        panelLabel.className = 'active-tab'
      }

      panelNavLabels.content.content.push(panelLabel)
    }

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
      content: [prev, panelNavLabels, next],
    })
  }

  /**
   * Handlers for navigating between panel groups
   * @todo refactor to use requestAnimationFrame instead of css transitions
   * @return {Object} actions that control panel groups
   */
  navActions() {
    const _this = this
    const action = {}
    const groupParent = this.currentPanel.parentElement
    const firstControlNav = this.labels.querySelector('.panel-labels').firstChild
    const siblingGroups = this.currentPanel.parentElement.childNodes
    let index = indexOfNode(this.currentPanel, groupParent)
    let offset = { nav: 0, panel: 0 }
    let lastOffset = { ...offset }

    const groupChange = newIndex => {
      const labels = this.labels.querySelector('.panel-labels div').children
      dom.removeClasses(siblingGroups, 'active-panel')
      dom.removeClasses(labels, 'active-tab')
      this.currentPanel = siblingGroups[newIndex]
      this.currentPanel.classList.add('active-panel')

      labels[newIndex].classList.add('active-tab')
      return this.currentPanel
    }

    const translateX = (offset, reset) => {
      if (_this.panelDisplay === 'tabbed') {
        firstControlNav.removeAttribute('style')
        const { transform } = getTransition(offset.panel)
        groupParent.style.transform = transform
        return null
      }

      const panelQueue = [getTransition(lastOffset.panel), getTransition(offset.panel)]
      const navQueue = [getTransition(lastOffset.nav), getTransition(offset.nav)]

      if (reset) {
        const [panelStart] = panelQueue
        const [navStart] = navQueue
        panelQueue.push(panelStart)
        navQueue.push(navStart)
      }

      const animationOptions = {
        easing: 'ease-in-out',
        duration: 150,
        fill: 'forwards',
      }

      const panelTransition = groupParent.animate(panelQueue, animationOptions)
      firstControlNav.animate(navQueue, animationOptions)
      const handleFinish = () => {
        this.panelsWrap.style.height = dom.getStyle(this.currentPanel, 'height')
        panelTransition.removeEventListener('finish', handleFinish)
        if (!reset) {
          lastOffset = offset
        }
      }
      panelTransition.addEventListener('finish', handleFinish)
    }

    action.refresh = newIndex => {
      if (newIndex !== undefined) {
        index = newIndex
        groupChange(newIndex)
      }
      _this.resizePanels()
      offset = {
        nav: -firstControlNav.offsetWidth * index,
        panel: -groupParent.offsetWidth * index,
      }
      translateX(offset)
    }

    /**
     * Slides panel to the next group
     * @return {Object} current group after navigation
     */
    action.nextGroup = () => {
      const newIndex = index + 1
      if (newIndex !== siblingGroups.length) {
        const curPanel = groupChange(newIndex)
        offset = {
          nav: -firstControlNav.offsetWidth * newIndex,
          panel: -curPanel.offsetLeft,
        }
        translateX(offset)
        index++
      } else {
        offset = {
          nav: lastOffset.nav - 8,
          panel: lastOffset.panel - 8,
        }
        translateX(offset, true)
      }

      return this.currentPanel
    }

    action.prevGroup = () => {
      if (index !== 0) {
        const newIndex = index - 1
        const curPanel = groupChange(newIndex)
        offset = {
          nav: -firstControlNav.offsetWidth * newIndex,
          panel: -curPanel.offsetLeft,
        }
        translateX(offset)
        index--
      } else {
        offset = {
          nav: 8,
          panel: 8,
        }
        translateX(offset, true)
      }
    }

    return action
  }
}
