import i18n from 'mi18n';
import Sortable from 'sortablejs';
import h from '../common/helpers';
import dom from '../common/dom';
import {data} from '../common/data';

const defaults = {
  type: 'field'
};

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
    let _this = this;
    _this.opts = Object.assign({}, defaults, options);

    _this.labels = _this.panelNav();
    let panels = _this.panelsWrap();

    _this.panels = panels.childNodes;
    _this.currentPanel = _this.panels[0];
    _this.nav = _this.navActions();
    if (_this.opts.type === 'field') {
      setTimeout(_this.setPanelsHeight.bind(_this), 100);
    }

    _this.panelDisplay = 'slider';

    return {
      content: [_this.labels, panels],
      nav: _this.nav,
      actions: {
        resize: _this.resizePanels.bind(_this)
      }
    };
  }

  /**
   * Resize the panel after its contents change in height
   * @return {String} panel's height in pixels
   */
  resizePanels() {
    let panelsWrap = this.panelsWrap;
    let column = panelsWrap.parentElement.parentElement;
    let width = parseInt(dom.getStyle(column, 'width'));
    let isTabbed = (width > 390);
    this.panelDisplay = isTabbed ? 'tabbed' : 'slider';
    panelsWrap.parentElement.classList.toggle('tabbed-panels', isTabbed);
    let panelStyle = panelsWrap.style;
    let activePanelHeight = dom.getStyle(this.currentPanel, 'height');
    return panelStyle.height = activePanelHeight;
  }

  /**
   * Set panel height so we can animate it with css
   */
  setPanelsHeight() {
    let field = document.getElementById(this.opts.id);
    this.slideToggle = field.querySelector('.field-edit');

    // temp styles
    this.slideToggle.style.display = 'block';
    this.slideToggle.style.position = 'absolute';
    this.slideToggle.style.opacity = 0;

    this.resizePanels();

    // reset styles
    this.slideToggle.style.display = 'none';
    this.slideToggle.style.position = 'relative';
    this.slideToggle.style.opacity = 1;
    this.slideToggle.style.height = 'auto';
  }

  /**
   * Wrap a panel and make properties sortable
   * if the panel belongs to a field
   * @return {Object} DOM element
   */
  panelsWrap() {
    this.panelsWrap = dom.create({
      tag: 'div',
      attrs: {
        className: 'panels'
      },
      content: this.opts.panels
    });

    this.panelsWrap = this.panelsWrap;

    if (this.opts.type === 'field') {
      this.sortableProperties(this.panelsWrap);
    }

    return this.panelsWrap;
  }

  /**
   * Sortable panel properties
   * @param  {Array} panels
   * @return {Array} panel groups
   */
  sortableProperties(panels) {
    let _this = this;
    let groups = panels.getElementsByClassName('field-edit-group');

    return h.forEach(groups, (group, index) => {
      group.fieldID = _this.opts.id;
      if (group.isSortable) {
        Sortable.create(group, {
          animation: 150,
          group: {
            name: 'edit-' + group.editGroup,
            pull: true, put: ['properties']
          },
          sort: true,
          handle: '.prop-order',
          onSort: evt => {
            _this.propertySave(evt.to);
            _this.resizePanels();
          }
        });
      }
    });
  }

  /**
   * Save a fields' property
   * @param  {Object} group property group
   * @return {Object}       DOM node for updated property preview
   */
  propertySave(group) {
    const field = dom.fields.get(this.opts.id);
    data.save(group.editGroup, group, false);
    return field.instance.updatePreview();
  }

  /**
   * Panel navigation, tabs and arrow buttons for slider
   * @return {Object} DOM object for panel navigation wrapper
   */
  panelNav() {
    let _this = this;
    let panelNavLabels = {
        tag: 'div',
        attrs: {
          className: 'panel-labels'
        },
        content: {
          tag: 'div',
          content: []
        }
      };
    let panels = this.opts.panels; // make new array

    for (let i = 0; i < panels.length; i++) {
      let panelLabel = {
        tag: 'h5',
        action: {
          click: evt => {
            let index = h.indexOfNode(evt.target, evt.target.parentElement);
            _this.currentPanel = _this.panels[index];
            let labels = evt.target.parentElement.childNodes;
            _this.nav.refresh(index);
            dom.removeClasses(labels, 'active-tab');
            evt.target.classList.add('active-tab');
          }
        },
        content: panels[i].config.label
      };
      delete panels[i].config.label;

      if (i === 0) {
        panelLabel.className = 'active-tab';
      }

      panelNavLabels.content.content.push(panelLabel);
    }

    let next = {
        tag: 'button',
        attrs: {
          className: 'next-group',
          title: i18n.get('controlGroups.nextGroup'),
          type: 'button'
        },
        dataset: {
          toggle: 'tooltip',
          placement: 'top'
        },
        action: {
          click: (e) => this.nav.nextGroup(e)
        },
        content: dom.icon('triangle-right')
      };
    let prev = {
        tag: 'button',
        attrs: {
          className: 'prev-group',
          title: i18n.get('controlGroups.prevGroup'),
          type: 'button'
        },
        dataset: {
          toggle: 'tooltip',
          placement: 'top'
        },
        action: {
          click: (e) => this.nav.prevGroup(e)
        },
        content: dom.icon('triangle-left')
      };

    return dom.create({
      tag: 'nav',
      attrs: {
        className: 'panel-nav'
      },
      content: [prev, panelNavLabels, next]
    });
  }

  /**
   * Handlers for navigating between panel groups
   * @todo refactor to use requestAnimationFrame instead of css transitions
   * @return {Object} actions that control panel groups
   */
  navActions() {
    let _this = this;
    let action = {};
    let groupParent = this.currentPanel.parentElement;
    let firstControlNav = this.labels.querySelector('.panel-labels').firstChild;
    let siblingGroups = this.currentPanel.parentElement.childNodes;
    let index = h.indexOfNode(this.currentPanel, groupParent);
    let offset = {};

    const groupChange = newIndex => {
      this.currentPanel = siblingGroups[newIndex];
      this.panelsWrap.style.height = dom.getStyle(this.currentPanel, 'height');
      if (this.opts.type === 'field') {
        this.slideToggle.style.height = 'auto';
      }
      return this.currentPanel;
    };

    const translateX = offset => {
      if (_this.panelDisplay !== 'tabbed') {
        firstControlNav.style.transform = `translateX(-${offset.nav}px)`;
      } else {
        firstControlNav.removeAttribute('style');
      }
      groupParent.style.transform = `translateX(-${offset.panel}px)`;
    };

    action.refresh = newIndex => {
      if (newIndex !== undefined) {
        index = newIndex;
        groupChange(newIndex);
      }
      _this.resizePanels();
      offset = {
        nav: firstControlNav.offsetWidth * index,
        panel: groupParent.offsetWidth * index
      };
      translateX(offset);
    };

    /**
     * Slides panel to the next group
     * @return {Object} current group after navigation
     */
    action.nextGroup = () => {
      let newIndex = index + 1;
      if (newIndex !== siblingGroups.length) {
        offset = {
          nav: firstControlNav.offsetWidth * newIndex,
          panel: groupParent.offsetWidth * newIndex
        };
        translateX(offset);
        groupChange(newIndex);
        index++;
      } else {
        let origOffset = {
          nav: firstControlNav.style.transform,
          panel: groupParent.style.transform
        };
        offset = {
          nav: (firstControlNav.offsetWidth * index) + 10,
          panel: (groupParent.offsetWidth * index) + 10
        };
        translateX(offset);
        setTimeout(() => {
          firstControlNav.style.transform = origOffset.nav;
          groupParent.style.transform = origOffset.panel;
        }, 150);
      }

      return this.currentPanel;
    };

    action.prevGroup = () => {
      if (index !== 0) {
        let newIndex = (index - 1);
        offset = {
          nav: firstControlNav.offsetWidth * newIndex,
          panel: groupParent.offsetWidth * newIndex
        };
        translateX(offset);
        groupChange(newIndex);
        index--;
      } else {
        let curTranslate = [
            firstControlNav.style.transform,
            groupParent.style.transform
          ];
        let nudge = 'translateX(10px)';
        firstControlNav.style.transform = nudge;
        groupParent.style.transform = nudge;
        setTimeout(() => {
          firstControlNav.style.transform = curTranslate[0];
          groupParent.style.transform = curTranslate[1];
        }, 150);
      }
    };

    return action;
  }

}
