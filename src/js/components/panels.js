import i18n from 'mi18n';
import Sortable from 'sortablejs';
import helpers from '../common/helpers';
import DOM from '../common/dom';
import { data } from '../common/data';
var dom = new DOM();

var defaults = {
  type: 'field'
};

export default class Panels {
  constructor(options) {
    this.opts = Object.assign({}, defaults, options);

    let labels = this.panelNav(),
      panels = this.panelsWrap();

    this.panels = panels.childNodes;
    this.currentPanel = this.panels[0];
    this.labels = labels;
    this.nav = this.navActions();

    if (this.opts.type === 'field') {
      setTimeout(this.setPanelsHeight.bind(this), 10);
    }

    return {
      content: [labels, panels],
      nav: this.nav
    };
  }

  setPanelsHeight() {
    let field = document.getElementById(this.opts.id);
    this.slideToggle = field.querySelector('.field-edit');

    //temp styles
    this.slideToggle.style.display = 'block';
    this.slideToggle.style.position = 'absolute';
    this.slideToggle.style.opacity = 0;

    this.panelsWrap.style.height = dom.getStyle(this.currentPanel, 'height');

    //reset styles
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

  sortableProperties(panels) {
    let _this = this,
      groups = panels.getElementsByClassName('field-edit-group');

    helpers.forEach(groups, function(index, group) {
      if (group.isSortable) {
        group.fieldID = _this.opts.id;
        Sortable.create(group, {
          animation: 150,
          group: { name: 'edit-' + group.editGroup, pull: true, put: ['properties'] },
          sort: true,
          handle: '.prop-order',
          onAdd: (evt) => {
            _this.propertySave(group);
            _this.panelsWrap.style.height = dom.getStyle(_this.currentPanel, 'height');
          },
          onUpdate: (evt) => {
            _this.propertySave(group);
            _this.panelsWrap.style.height = dom.getStyle(_this.currentPanel, 'height');
          }
        });
      }
    });
  }

  propertySave(group) {
    data.saveOrder(group.editGroup, group);
    data.save(group.editGroup, group.fieldID);
    this.opts.updatePreview();
  }

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
      },
      panels = this.opts.panels.slice(); //make new array

    for (var i = 0; i < panels.length; i++) {
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
          click: () => { this.nav.nextGroup() }
        },
        content: dom.icon('triangle-right')
      },
      prev = {
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
          click: () => { this.nav.prevGroup() }
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

  navActions() {
    let direction = {},
      groupParent = this.currentPanel.parentElement,
      firstControlNav = this.labels.querySelector('.panel-labels').firstChild,
      siblingGroups = this.currentPanel.parentElement.children,
      index = Array.prototype.indexOf.call(siblingGroups, this.currentPanel),
      groupChange = (newIndex) => {
        this.currentPanel = siblingGroups[newIndex];
        this.panelsWrap.style.height = dom.getStyle(this.currentPanel, 'height');
        if (this.opts.type === 'field') {
          this.slideToggle.style.height = 'auto';
        }
      };

    direction.refresh = () => {
      firstControlNav.style.transform = `translateX(-${(firstControlNav.offsetWidth * index)}px)`;
      groupParent.style.transform = `translateX(-${(groupParent.offsetWidth * index)}px)`;
    };

    direction.nextGroup = () => {
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
        firstControlNav.style.transform = `translateX(-${((firstControlNav.offsetWidth * index)+10)}px)`;
        groupParent.style.transform = `translateX(-${((groupParent.offsetWidth * index)+10)}px)`;
        setTimeout(() => {
          firstControlNav.style.transform = curTranslate[0];
          groupParent.style.transform = curTranslate[1];
        }, 150);
      }
    };

    direction.prevGroup = () => {
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
          ],
          nudge = 'translateX(10px)';
        firstControlNav.style.transform = nudge;
        groupParent.style.transform = nudge;
        setTimeout(() => {
          firstControlNav.style.transform = curTranslate[0];
          groupParent.style.transform = curTranslate[1];
        }, 150);
      }
    };

    return direction;
  }

}
