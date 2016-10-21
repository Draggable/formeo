import i18n from 'mi18n';
import Sortable from 'sortablejs';
import helpers from '../common/helpers';
import DOM from '../common/dom';
import {data} from '../common/data';
const dom = new DOM();

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

    let labels = _this.panelNav();
    let panels = _this.panelsWrap();

    _this.panels = panels.childNodes;
    _this.currentPanel = _this.panels[0];
    _this.labels = labels;
console.log(_this.navActions());
    _this.nav = _this.navActions();
    if (_this.opts.type === 'field') {
      setTimeout(_this.setPanelsHeight.bind(_this), 10);
    }

    return {
      content: [labels, panels],
      nav: _this.nav,
      actions: {
        resize: _this.resizePanels.bind(_this)
      }
    };
  }

  resizePanels() {
    this.panelsWrap.style.height = dom.getStyle(this.currentPanel, 'height');
  }

  setPanelsHeight() {
    let field = document.getElementById(this.opts.id);
    this.slideToggle = field.querySelector('.field-edit');

    // temp styles
    this.slideToggle.style.display = 'block';
    this.slideToggle.style.position = 'absolute';
    this.slideToggle.style.opacity = 0;

    this.panelsWrap.style.height = dom.getStyle(this.currentPanel, 'height');

    // reset styles
    this.slideToggle.style.display = 'none';
    this.slideToggle.style.position = 'relative';
    this.slideToggle.style.opacity = 1;
    this.slideToggle.style.height = 'auto';
  }

  panelsWrap() {
    let panelsWrap = dom.create({
      tag: 'div',
      attrs: {
        className: 'panels'
      },
      content: this.opts.panels
    });

    this.panelsWrap = panelsWrap;

    if (this.opts.type === 'field') {
      this.sortableProperties(panelsWrap);
    }

    return panelsWrap;
  }

  /**
   * Sortable panel properties
   * @param  {Array} panels
   * @return {[type]}        [description]
   */
  sortableProperties(panels) {
    let _this = this,
      groups = panels.getElementsByClassName('field-edit-group');

    helpers.forEach(groups, function(index, group) {
      if (group.isSortable) {
        group.fieldID = _this.opts.id;
        Sortable.create(group, {
          animation: 150,
          group: {
            name: 'edit-' + group.editGroup,
            pull: true, put: ['properties']
          },
          sort: true,
          handle: '.prop-order',
          onAdd: (evt) => {
            _this.propertySave(group);
            _this.panelsWrap.style.height = dom.getStyle(_this.currentPanel, 'height');
          },
          onUpdate: () => {
            _this.propertySave(group);
            _this.panelsWrap.style.height = dom.getStyle(_this.currentPanel, 'height');
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
    data.saveOrder(group.editGroup, group);
    data.save(group.editGroup, group.fieldID);
    return this.opts.updatePreview();
  }

  /**
   * Panel navigation, tabs and arrow buttons for slider
   * @return {Object} DOM object for panel navigation wrapper
   */
  panelNav() {
    let panelNavUL = {
        tag: 'div',
        attrs: {
          className: 'panel-labels'
        },
        content: {
          tag: 'div',
          content: []
        }
      };
    let panels = this.opts.panels.slice(); // make new array

    for (let i = 0; i < panels.length; i++) {
      let group = {
        tag: 'h5'
      };

      if (panels[i].config) {
        if (panels[i].config.label) {
          group.content = panels[i].config.label;
          delete panels[i].config;
        }
      }

      if (panels[i].label) {
        if (panels[i].label) {
          group.content = panels[i].label;
          delete panels[i].label;
        }
      }

      panelNavUL.content.content.push(group);
    }

    let next = {
        tag: 'button',
        attrs: {
          className: 'btn next-group',
          title: i18n.get('controlGroups.nextGroup'),
          type: 'button'
        },
        dataset: {
          toggle: 'tooltip',
          placement: 'top'
        },
        action: {
          click: this.nav.nextGroup
        },
        content: dom.icon('triangle-right')
      };
    let prev = {
        tag: 'button',
        attrs: {
          className: 'btn prev-group',
          title: i18n.get('controlGroups.prevGroup'),
          type: 'button'
        },
        dataset: {
          toggle: 'tooltip',
          placement: 'top'
        },
        action: {
          click: this.nav.prevGroup
        },
        content: dom.icon('triangle-left')
      };

    return dom.create({
      tag: 'nav',
      attrs: {
        className: 'panel-nav'
      },
      content: [prev, panelNavUL, next]
    });
  }

  /**
   * Handlers for navigating between panel groups
   * @return {Object} actions that control panel groups
   */
  navActions() {
    let action = {};
    let groupParent = this.currentPanel.parentElement;
    let firstControlNav = this.labels.querySelector('.panel-labels').firstChild;
    let siblingGroups = this.currentPanel.parentElement.children;
    let index = Array.prototype.indexOf.call(siblingGroups, this.currentPanel);

    const groupChange = (newIndex) => {
      this.currentPanel = siblingGroups[newIndex];
      this.panelsWrap.style.height = dom.getStyle(this.currentPanel, 'height');
      if (this.opts.type === 'field') {
        this.slideToggle.style.height = 'auto';
      }
    };

    action.refresh = () => {
      firstControlNav.style.transform = `translateX(-${(firstControlNav.offsetWidth * index)}px)`;
      groupParent.style.transform = `translateX(-${(groupParent.offsetWidth * index)}px)`;
    };

    action.nextGroup = () => {
      let newIndex = (index + 1);
      if (newIndex !== siblingGroups.length) {
        firstControlNav.style.transform = `translateX(-${(firstControlNav.offsetWidth * newIndex)}px)`;
        groupParent.style.transform = `translateX(-${(groupParent.offsetWidth * newIndex)}px)`;
        groupChange(newIndex);
        index++;
      } else {
        let curTranslate = [
          firstControlNav.style.transform,
          groupParent.style.transform
        ];
        firstControlNav.style.transform = `translateX(-${((firstControlNav.offsetWidth * index) + 10)}px)`;
        groupParent.style.transform = `translateX(-${((groupParent.offsetWidth * index) + 10)}px)`;
        setTimeout(() => {
          firstControlNav.style.transform = curTranslate[0];
          groupParent.style.transform = curTranslate[1];
        }, 150);
      }
    };

    action.prevGroup = () => {
      if (index !== 0) {
        let newIndex = (index - 1);
        firstControlNav.style.transform = `translateX(-${(firstControlNav.offsetWidth * newIndex)}px)`;
        groupParent.style.transform = `translateX(-${(groupParent.offsetWidth * newIndex)}px)`;
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
