import Sortable from 'sortablejs';
import i18n from 'mi18n';
import {data, formData, registeredFields as rFields} from '../common/data';
import h from '../common/helpers';
import events from '../common/events';
import {match, unique, uuid, closestFtype} from '../common/utils';
import dom from '../common/dom';
import Panels from './panels';

let opts = {};

/**
 *
 */
export class Controls {
  /**
   * Setup defaults and return Controls DOM
   * @param  {Object} controlOptions
   * @param  {String} formID
   */
  constructor(controlOptions, formID) {
    let _this = this;
    this.formID = formID;
    let {groupOrder = []} = controlOptions;
    this.groupOrder = unique(groupOrder.concat([
      'common',
      'html',
      'layout',
    ]));
    this.cPosition = {};
    const defaultElements = [{
        tag: 'div',
        config: {
          label: i18n.get('column')
        },
        meta: {
          group: 'layout',
          icon: 'columns',
          id: 'layout-column'
        }
      }, {
        tag: 'div',
        config: {
          label: i18n.get('row')
        },
        meta: {
          group: 'layout',
          icon: 'rows',
          id: 'layout-row'
        }
      }, {
        tag: 'input',
        attrs: {
          type: 'text',
          required: false,
          className: ''
        },
        config: {
          disabledAttrs: ['type'],
          label: i18n.get('input.text')
        },
        meta: {
          group: 'common',
          icon: 'text-input',
          id: 'text-input'
        },
        fMap: 'attrs.value'
      }, {
        tag: 'input',
        attrs: {
          type: 'date',
          required: false,
          className: ''
        },
        config: {
          disabledAttrs: ['type'],
          label: i18n.get('input.date')
        },
        meta: {
          group: 'common',
          icon: 'calendar',
          id: 'date-input'
        }
      }, {
        tag: 'button',
        attrs: {
          className: [
            {label: i18n.get('grouped'), value: 'f-btn-group'},
            {label: i18n.get('ungrouped'), value: 'f-field-group'},
          ]
        },
        config: {
          label: i18n.get('button'),
          hideLabel: true,
          disabledAttrs: ['type']
        },
        meta: {
          group: 'common',
          icon: 'button',
          id: 'button'
        },
        options: [{
          label: i18n.get('button'),
          type: [
            {label: i18n.get('button'), value: 'button', selected: true},
            {label: i18n.get('reset'), value: 'reset'},
            {label: i18n.get('submit'), value: 'submit'},
          ],
          className: [
            {
              label: i18n.get('default'),
              value: '',
              selected: true
            },
            {
              label: i18n.get('primary'),
              value: 'primary'
            },
            {
              label: i18n.get('danger'),
              value: 'error'},
            {
              label: i18n.get('success'),
              value: 'success'},
            {
              label: i18n.get('warning'),
              value: 'warning'
            }
          ]
        }]
      }, {
        tag: 'select',
        config: {
          label: i18n.get('select')
        },
        attrs: {
          required: false,
          className: ''
        },
        meta: {
          group: 'common',
          icon: 'select',
          id: 'select'
        },
        options: [1, 2, 3, 4].map(i => {
          return {
            label: i18n.get('labelCount', {
              label: i18n.get('option'),
              count: i
            }),
            value: 'option-' + i,
            selected: false
          };
        })
      }, {
        tag: 'textarea',
        config: {
          label: i18n.get('textarea')
        },
        // This is the beginning of actions being supported for render
        // editor field actions should be in config.action
        // action: {
        //   mousedown: function(evt) {
        //     let {target} = evt;
        //     let startHeight = target.style.height;
        //     const onMouseup = evt => {
        //       let {target} = evt;
        //       let endHeight = target.style.height;
        //       if (startHeight !== endHeight) {
        //         //eslint-disable-next-line
        //         let fieldID = closest(target, '.stage-fields').id;
        //         const field = d.fields.get(fieldID).instance;
        //         field.addAttribute('style', `height: ${endHeight}`);
        //       }
        //       target.removeEventListener('mouseup', onMouseup);
        //     };
        //     target.addEventListener('mouseup', onMouseup);
        //   }
        // },
        meta: {
          group: 'common',
          icon: 'textarea',
          id: 'textarea'
        },
        attrs: {
          required: false
        }
      }, {
        tag: 'input',
        attrs: {
          type: 'checkbox',
          required: false
        },
        config: {
          label: i18n.get('checkbox') + '/' + i18n.get('group'),
          disabledAttrs: ['type']
        },
        meta: {
          group: 'common',
          icon: 'checkbox',
          id: 'checkbox'
        },
        options: [{
          label: i18n.get('labelCount', {
            label: i18n.get('checkbox'),
            count: 1
          }),
          value: 'checkbox-1',
          selected: true
        }]
      }, {
        tag: 'input',
        attrs: {
          type: 'radio',
          required: false
        },
        config: {
          label: i18n.get('radioGroup'),
          disabledAttrs: ['type']
        },
        meta: {
          group: 'common',
          icon: 'radio-group',
          id: 'radio'
        },
        options: [1, 2, 3].map(i => {
          return {
            label: i18n.get('labelCount', {label: i18n.get('radio'), count: i}),
            value: 'radio-' + i,
            selected: false
          };
        })
      }, {
        tag: 'h1',
        attrs: {
          tag: [
            {value: 'h1', label: 'H1'},
            {value: 'h2', label: 'H2'},
            {value: 'h3', label: 'H3'},
            {value: 'h4', label: 'H4'}
          ],
          className: ''
        },
        config: {
          label: i18n.get('header'),
          editable: true,
          hideLabel: true
        },
        meta: {
          group: 'html',
          icon: 'header',
          id: 'header'
        },
        content: i18n.get('header')
      }, {
        tag: 'p',
        attrs: {
          className: ''
        },
        config: {
          label: i18n.get('paragraph'),
          hideLabel: true,
          editable: true,
        },
        meta: {
          group: 'html',
          icon: 'paragraph',
          id: 'paragraph'
        },
        //eslint-disable-next-line
        content: 'Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment.'
      }, {
        tag: 'hr',
        config: {
          label: i18n.get('separator'),
          hideLabel: true
        },
        meta: {
          group: 'html',
          icon: 'divider',
          id: 'divider'
        }
      },
      {
        tag: 'input',
        attrs: {
          type: 'file',
          required: false
        },
        config: {
          disabledAttrs: ['type'],
          label: i18n.get('fileUpload')
        },
        meta: {
          group: 'common',
          icon: 'upload',
          id: 'upload'
        },
        fMap: 'attrs.value'
      }, {
        tag: 'input',
        attrs: {
          type: 'number',
          required: false,
          className: ''
        },
        config: {
          label: i18n.get('number'),
          disabledAttrs: ['type']
        },
        meta: {
          group: 'common',
          icon: 'hash',
          id: 'number'
        },
        fMap: 'attrs.value'
      }, {
        tag: 'input',
        attrs: {
          type: 'hidden',
          value: ''
        },
        config: {
          label: i18n.get('hidden'),
          hideLabel: true,
        },
        meta: {
          group: 'common',
          icon: 'hidden',
          id: 'hidden'
        },
        fMap: 'attrs.value'
      }];

    this.defaults = {
      sortable: true,
      elementOrder: {},
      groups: [{
        id: 'layout',
        label: i18n.get('layout'),
        elementOrder: [
          'row',
          'column'
        ]
      }, {
        id: 'common',
        label: i18n.get('commonFields'),
        elementOrder: [
        'button',
        'checkbox',
        ]
      }, {
        id: 'html',
        label: i18n.get('htmlElements'),
        elementOrder: [
          'header',
          'block-text'
        ]
      }],
      disable: {
        groups: [],
        elements: []
      },
      elements: []
    };

    opts = h.merge(this.defaults, controlOptions);

    opts.elements = opts.elements.concat(defaultElements);

    this.controlEvents = {
      focus: evt => {
          let currentGroup = closestFtype(evt.target);
          _this.panels.nav.refresh(h.indexOfNode(currentGroup));
        },
      click: evt => _this.addElement(evt.target.parentElement.id)
      // mousedown: evt => {
      //   let position = _this.cPosition;
      //   position.x = evt.clientX;
      //   position.y = evt.clientY;
      // },
      // mouseup: evt => {
      //   let position = _this.cPosition;
      //   if (clicked(evt.clientX, evt.clientY, position, evt.button)) {
      //     _this.addElement(evt.target.parentElement.id);
      //   }
      // }
    };

    this.buildDOM();
  }

  /**
   * Dragging form the control bar clears element
   * events lets add them back after drag.
   * @param  {Object} evt
   */
  applyControlEvents(evt) {
    let {item} = evt;
    let control = document.getElementById(item.id);
    let button = control.querySelector('button');
    let actions = Object.keys(this.controlEvents);
    for (let i = actions.length - 1; i >= 0; i--) {
      let event = actions[i];
      button.addEventListener(event, this.controlEvents[event]);
    }
  }

  /**
   * Generate control config for UI and bind actions
   * @param  {Object} elem
   * @return {Object} elementControl
   */
  prepElement(elem) {
    let _this = this;
    let dataID = uuid();
    let button = {
      tag: 'button',
      attrs: {
        type: 'button'
      },
      content: [elem.config.label],
      action: _this.controlEvents,
    };
    let elementControl = {
      tag: 'li',
      className: [
        'field-control',
        `${elem.meta.group}-control`,
        `${elem.meta.id}-control`,
      ],
      id: dataID,
      cPosition: {},
      content: button
    };

    if (elem.meta.icon) {
      button.content.unshift(dom.icon(elem.meta.icon));
    }

    // Add field to the register by uuid and meta id
    rFields[dataID] = rFields[elem.meta.id] = elem;
    return elementControl;
  }

  /**
   * Group elements into their respective control group
   * @return {Array} allGroups
   */
  groupElements() {
    let _this = this;
    let groups = opts.groups.slice();
    let elements = opts.elements.slice();
    let allGroups = [];
    let usedElementIds = [];

    // Apply order to Groups
    groups = h.orderObjectsBy(groups, this.groupOrder, 'id');

    // remove disabled groups
    groups = groups.filter(group => match(group.id, opts.disable.groups));

    // create group config
    allGroups = h.map(groups, (i) => {
      let group = {
        tag: 'ul',
        attrs: {
          className: 'control-group',
          id: _this.formID + '-' + groups[i].id + '-control-group'
        },
        fType: 'controlGroup',
        config: {
          label: groups[i].label || ''
        }
      };

      // Apply order to elements
      if (opts.elementOrder[groups[i].id]) {
        let userOrder = opts.elementOrder[groups[i].id];
        let newOrder = unique(userOrder.concat(groups[i].elementOrder));
        groups[i].elementOrder = newOrder;
      }
      elements = h.orderObjectsBy(elements, groups[i].elementOrder, 'meta.id');

      /**
       * Fill control groups with their fields
       * @param  {Object} field Field configuration object.
       * @return {Array}        Filtered array of Field config objects
       */
      group.content = elements.filter(field => {
        let fieldId = field.meta.id || '';
        let filters = [
          match(fieldId, opts.disable.elements),
          (field.meta.group === groups[i].id),
          !h.inArray(field.meta.id, usedElementIds)
        ];

        let shouldFilter = true;
        shouldFilter = filters.every(val => val === true);
        if (shouldFilter) {
          usedElementIds.push(fieldId);
        }

        return shouldFilter;
      }).map(field => _this.prepElement.call(this, field));

      return group;
    });

    return allGroups;
  }

  /**
   * [formActions description]
   * @return {[type]} [description]
   */
  formActions() {
    let btnTemplate = {
        tag: 'button',
        attrs: {
          type: 'button'
        }
      };

    let clearBtn = h.merge(btnTemplate, {
      content: [dom.icon('bin'), i18n.get('clear')],
      className: ['clear-form'],
      attrs: {
        title: i18n.get('clearAll')
      },
      action: {
        click: evt => {
          if (formData.rows.size) {
            events.confirmClearAll = new CustomEvent('confirmClearAll', {
              detail: {
                confirmationMessage: i18n.get('confirmClearAll'),
                clearAllAction: dom.clearForm.bind(dom),
                btnCoords: dom.coords(evt.target),
                rows: dom.rows,
                rowCount: dom.rows.size
              }
            });

            document.dispatchEvent(events.confirmClearAll);
          } else {
            alert('There are no fields to clear');
          }
        }
      }
    });
    // let settingsBtn = h.merge(btnTemplate, {
    //   content: [dom.icon('settings'), i18n.get('settings')],
    //   attrs: {
    //     title: i18n.get('settings')
    //   },
    //   className: ['btn', 'btn-secondary', 'edit-settings'],
    //   action: {
    //     click: () => {
    //       console.log('clicked');
    //       let stage = document.getElementById(_this.formID + '-stage');
    //       stage.parentElement.classList.toggle('editing-stage');
    //     }
    //   }
    // });
    let saveBtn = h.merge(btnTemplate, {
      content: [dom.icon('floppy-disk'), i18n.get('save')],
      attrs: {
        title: i18n.get('save')
      },
      className: ['save-form'],
      action: {
        click: (evt) => {
          // @todo: complete actions connection
          // let saveEvt = {
          //   action: () => {},
          //   coords: dom.coords(evt.target),
          //   message: ''
          // };

          // actions.click.btn(saveEvt);
          data.save();
        }
      }
    });
    let formActions = {
      tag: 'div',
      className: 'form-actions f-btn-group',
      // content: [clearBtn, settingsBtn, saveBtn]
      content: [clearBtn, saveBtn]
    };

    return formActions;
  }

  /**
   * Returns the markup for the form controls/fields
   * @return {DOM}
   */
  buildDOM() {
    if (this.element) {
      return this.element;
    }
    let _this = this;
    let groupedFields = this.groupElements();
    let formActions = this.formActions();
    _this.panels = new Panels({panels: groupedFields, type: 'controls'});
    let groupsWrapClasses = [
      'control-groups',
      'panels-wrap',
      `panel-count-${groupedFields.length}`
    ];
    let groupsWrap = dom.create({
      tag: 'div',
      className: groupsWrapClasses,
      content: _this.panels.content
    });

    let element = dom.create({
        tag: 'div',
        className: this.formID + '-controls formeo-controls',
        content: [groupsWrap, formActions]
      });
    let groups = element.getElementsByClassName('control-group');

    this.element = element;
    this.groups = groups;
    this.currentGroup = groups[0];

    this.actions = {
      filter: (term) => {
        let cpContent = _this.panels.content[1];
        let filtering = (term !== '');
        let filteredTerm = groupsWrap.querySelector('.filtered-term');
        let fields = cpContent.querySelectorAll('.field-control');

        h.toggleElementsByStr(fields, term);

        if (filtering) {
          // @todo change to use language file
          let filteredStr = `Filtering '${term}'`;

          element.classList.add('filtered');

          if (filteredTerm) {
            filteredTerm.textContent = filteredStr;
          } else {
            filteredTerm = dom.create({
              tag: 'h5',
              className: 'filtered-term',
              content: filteredStr
            });
            groupsWrap.insertBefore(filteredTerm, groupsWrap.firstChild);
          }
        } else if (filteredTerm) {
          element.classList.remove('filtered');
          filteredTerm.remove();
        }
      },
      addElement: _this.addElement,
      addGroup: (group) => console.log(group)
    };

    // Make controls sortable
    for (let i = groups.length - 1; i >= 0; i--) {
      let storeID = `formeo-controls-${groups[i]}`;
      if (!opts.sortable) {
        localStorage.removeItem(storeID);
      }
      Sortable.create(groups[i], {
        animation: 150,
        forceFallback: true,
        fallbackClass: 'control-moving',
        fallbackOnBody: true,
        group: {
          name: 'controls',
          pull: 'clone',
          put: false
        },
        onRemove: _this.applyControlEvents.bind(_this),
        sort: opts.sortable,
        store: {
          /**
           * Get the order of elements.
           * @param   {Sortable}  sortable
           * @return {Array}
           */
          get: sortable => {
            let order = localStorage.getItem(storeID);
            return order ? order.split('|') : [];
          },

          /**
           * Save the order of elements.
           * @param {Sortable}  sortable
           */
          set: sortable => {
            let order = sortable.toArray();
            localStorage.setItem(storeID, order.join('|'));
          }
        }
      });
    }

    return element;
  }

  /**
   * Append an element to the stage
   * @param {String} id of elements
   */
  addElement(id) {
    let row = dom.addRow();
    let meta = h.get(rFields[id], 'meta');
    if (meta.group !== 'layout') {
      let column = dom.addColumn(row.id);
      dom.addField(column.id, id);
    } else if (meta.id === 'layout-column') {
      dom.addColumn(row.id);
    }

    data.saveColumnOrder(row);
    dom.columnWidths(row);
    data.save();
  }

}
