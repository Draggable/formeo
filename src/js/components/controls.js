import Sortable from 'sortablejs';
import i18n from 'mi18n';
import {data, formData, registeredFields} from '../common/data';
import h from '../common/helpers';
import events from '../common/events';
import {match, unique} from '../common/utils';
import dom from '../common/dom';
import Panels from './panels';
import Column from './column';
import Field from './field';

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
    this.formID = formID;
    let {groupOrder = []} = controlOptions;
    this.groupOrder = unique(groupOrder.concat(['common', 'html', 'layout']));

    this.defaults = {
      sortable: true,
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
          'text-input',
          'checkbox'
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
      elements: [{
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
          className: 'form-control'
        },
        config: {
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
          className: 'form-control'
        },
        config: {
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
          type: 'button',
          className: 'btn-secondary btn'
        },
        content: i18n.get('button'),
        config: {
          label: i18n.get('button'),
          hideLabel: true
        },
        meta: {
          group: 'common',
          icon: 'button',
          id: 'button'
        },
        options: [{
          label: i18n.get('button'),
          value: 'button',
          disabled: false
        }]
      }, {
        tag: 'select',
        className: 'form-control',
        config: {
          label: i18n.get('select')
        },
        attrs: {
          className: 'form-control'
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
        className: 'form-control',
        config: {
          label: i18n.get('textarea')
        },
        meta: {
          group: 'common',
          icon: 'textarea',
          id: 'textarea'
        },
        attrs: {
          maxlength: 10
        }
      }, {
        tag: 'input',
        attrs: {
          type: 'checkbox',
          className: 'form-control'
        },
        config: {
          label: i18n.get('checkbox') + '/' + i18n.get('group'),
          required: true
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
          label: i18n.get('radioGroup')
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
        config: {
          label: i18n.get('header'),
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
        config: {
          label: i18n.get('paragraph'),
          hideLabel: true
        },
        meta: {
          group: 'html',
          icon: 'paragraph',
          id: 'paragraph'
        },
        content: 'Lorem ipsum dolor.'
      }, {
        tag: 'hr',
        config: {
          label: i18n.get('paragraph'),
          noWrap: true
        },
        meta: {
          group: 'html',
          icon: 'divider',
          id: 'divider'
        }
      }]
    };

    opts = h.merge(this.defaults, controlOptions);
    this.dom = this.buildDOM();
  }

  /**
   * Generate control config for UI and bind actions
   * @param  {Object} elem
   * @return {Object} elementControl
   */
  prepElement(elem) {
    let _this = this;
    let dataID = h.uuid();
    let position = {};
    const clicked = (x, y) => {
      let xMin = position.x - 5;
      let xMax = position.x + 5;
      let yMin = position.y - 5;
      let yMax = position.y + 5;

      return (h.numberBetween(x, xMin, xMax) && h.numberBetween(y, yMin, yMax));
    };
    let elementControl = {
      tag: 'li',
      className: [
        'field-control',
        `${elem.meta.group}-control`,
        `${elem.meta.id}-control`,
      ],
      id: dataID,
      action: {
        mousedown: (evt) => {
          position.x = evt.clientX;
          position.y = evt.clientY;
        },
        mouseup: (evt) => {
          if (clicked(evt.clientX, evt.clientY)) {
            _this.addRow(evt.target.id);
          }
        }
      },
      content: [elem.config.label]
    };

    if (elem.meta.icon) {
      elementControl.content.unshift(dom.icon(elem.meta.icon));
    }

    registeredFields[dataID] = elem;
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

    // Apply order to Groups
    groups = h.orderObjectsBy(groups, this.groupOrder, 'id');

    // remove disabled groups
    groups = groups.filter(group => {
      return match(group.id, opts.disable.groups);
    });

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
      let defaultIds = this.defaults.elements.map(element => element.meta.id);

      // Apply order to elements
      if (groups[i].elementOrder) {
        elements = h.orderObjectsBy(
          elements,
          groups[i].elementOrder,
          'meta.id');
      }

      /**
       * Fill control groups with their fields
       * @param  {Object} field Field configuration object.
       * @return {Array}        Filtered array of Field config objects
       */
      group.content = elements.filter(field => {
        let fieldId = field.meta.id || '';
        let filters = [
          match(fieldId, opts.disable.elements),
          (field.meta.group === groups[i].id)
        ];

        let shouldFilter = true;

        if (h.inArray(fieldId, defaultIds)) {
          shouldFilter = filters.every(val => val === true);
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
    let _this = this;
    let btnTemplate = {
        tag: 'button',
        attrs: {
          type: 'button'
        }
      };
    events.formeoSaved = new CustomEvent('formeoSaved', {
      detail: {
        formData: data.get()
      }
    });

    let clearBtn = h.merge(btnTemplate, {
      content: [dom.icon('bin'), i18n.get('clear')],
      className: ['btn', 'btn-secondary', 'clear-form'],
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
    let settingsBtn = h.merge(btnTemplate, {
      content: [dom.icon('settings'), i18n.get('settings')],
      attrs: {
        title: i18n.get('settings')
      },
      className: ['btn', 'btn-secondary', 'edit-settings'],
      action: {
        click: () => {
          console.log('clicked');
          let stage = document.getElementById(_this.formID + '-stage');
          stage.parentElement.classList.toggle('editing-stage');
        }
      }
    });
    let saveBtn = h.merge(btnTemplate, {
      content: [dom.icon('floppy-disk'), i18n.get('save')],
      attrs: {
        title: i18n.get('save')
      },
      className: ['btn', 'btn-secondary', 'save-form'],
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
          document.dispatchEvent(events.formeoSaved);
        }
      }
    });
    let formActions = {
      tag: 'div',
      className: 'form-actions',
      content: [clearBtn, settingsBtn, saveBtn]
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

    let groupedFields = this.groupElements();
    let formActions = this.formActions();
    let controlPanels = new Panels({panels: groupedFields, type: 'controls'});
    let groupsWrapClasses = [
      'control-groups',
      'panels-wrap',
      `panel-count-${groupedFields.length}`
    ];
    let groupsWrap = dom.create({
      tag: 'div',
      className: groupsWrapClasses,
      content: controlPanels.content
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
        let cpContent = controlPanels.content[1];
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
      addElement: (elem) => console.log(elem),
      addGroup: (group) => console.log(group)
    };

    // Make controls sortable
    for (let i = groups.length - 1; i >= 0; i--) {
      Sortable.create(groups[i], {
        animation: 150,
        forceFallback: true,
        ghostClass: 'control-ghost',
        group: {
          name: 'controls',
          pull: 'clone',
          put: false
        },
        sort: opts.sortable
      });
    }

    return element;
  }

  /**
   * Creates a column on the stage
   * @param  {String} id
   * @return {Object} column
   */
  createColumn(id) {
    console.log('controls createCOlumn');
    let field = new Field(id);
    let column = new Column();

    // formData.fields[field.id].parent = column.id;

    field.classList.add('first-field');
    column.appendChild(field);
    formData.columns.get(column.id).fields.push(field.id);
    return column;
  }

  /**
   * Append an element to the stage
   * @param {String} id of elements
   */
  addElement(id) {
    let _this = this;
    let column = _this.createColumn(id);
    let row = dom.addRow();

    // Set parent IDs
    // formData.columns.get(column.id).parent = row.id;
    // formData.rows[row.id].parent = stageID;
    row.appendChild(column);
    row.className = row.className.replace(/\bempty-\w+/, '');
    data.saveColumnOrder(row);
    dom.columnWidths(row);
    // data.saveRowOrder(row);
    data.save();
    // trigger formSaved event
    document.dispatchEvent(events.formeoUpdated);
  }

  /**
   * Append an element to the stage
   * @param {String} id of elements
   */
  addRow() {
    console.log('controls addRow');
    dom.addRow();
    data.save();
    document.dispatchEvent(events.formeoUpdated);
  }

}
