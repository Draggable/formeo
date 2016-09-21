import Sortable from 'sortablejs';
import i18n from 'mi18n';
import { data, dataMap, registeredFields } from '../common/data';
import helpers from '../common/helpers';
import events from '../common/events';
import actions from '../common/actions';
import DOM from '../common/dom';
import Panels from './panels';
import Row from './row';
import Column from './column';
import Field from './field';
var dom = new DOM();

var opts = {};

export class Controls {
  constructor(controlOptions, formID) {
    this.formID = formID;

    let defaults = {
      sortable: true,
      controlGroupOrder: [
        'common',
        'html'
      ],
      groups: [{
        id: 'common',
        label: i18n.get('commonFields'),
        order: [
          'text-input',
          'checkbox'
        ]
      }, {
        id: 'html',
        label: i18n.get('htmlElements'),
        order: [
          'header',
          'block-text'
        ]
      }],
      disable: {
        groups: [],
        elements: []
      },
      elements: [{
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
            label: i18n.get('labelCount', { label: i18n.get('option'), count: i }),
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
          label: i18n.get('labelCount', { label: i18n.get('checkbox'), count: 1 }),
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
            label: i18n.get('labelCount', { label: i18n.get('radio'), count: i }),
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
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non nibh massa. Curabitur quis dictum lorem. Quisque ac lacus dignissim, malesuada turpis eget, venenatis nunc. '
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

    opts = helpers.merge(defaults, controlOptions);
  }

  prepElement(elem) {
    let _this = this,
      dataID = helpers.uuid(),
      position = {},
      clicked = (x, y) => {
        let xMin = position.x - 5,
          xMax = position.x + 5,
          yMin = position.y - 5,
          yMax = position.y + 5;

        return (helpers.numberBetween(x, xMin, xMax) && helpers.numberBetween(y, yMin, yMax));
      };
    let elementControl = {
      tag: 'li',
      className: 'field-control',
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

  groupFields() {
    let _this = this,
      groups = opts.groups.slice(),
      elements = opts.elements.slice(),
      allGroups = [];

    // Apply order
    groups = helpers.orderObjectsBy(groups, opts.controlGroupOrder, 'id');

    allGroups = helpers.map(groups, (i) => {
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

      if (groups[i].order) {
        elements = helpers.orderObjectsBy(elements, groups[i].order, 'meta.id');
      }

      group.content = elements.filter(field => {
        let filter = false;

        return (field.meta.group === groups[i].id && !helpers.inArray(field.meta.id, opts.disable.elements));
      }).map(field => _this.prepElement.call(this, field));

      return group;
    });

    return allGroups;
  }

  clearAll(rows) {
    let stage = rows[0].parentElement;
    stage.classList.add('removing-all-fields');
    // var markEmptyArray = [];

    // if (opts.prepend) {
    //   markEmptyArray.push(true);
    // }

    // if (opts.append) {
    //   markEmptyArray.push(true);
    // }

    // if (!markEmptyArray.some(elem => elem === true)) {
    // stage.classList.add('stage-empty');
    // }

    var outerHeight = 0;
    helpers.forEach(rows, (i) => {
      outerHeight += rows[i].offsetHeight + 5;
    });

    rows[0].style.marginTop = (-outerHeight) + 'px';
    stage.classList.add('stage-empty');

    setTimeout(function() {
      while (stage.firstChild) {
        stage.removeChild(stage.firstChild);
      }
      stage.classList.remove('removing-all-fields');
      dataMap.stage.rows = [];
      data.save();
      document.dispatchEvent(events.formeoUpdated);
    }, 300);
  }

  formActions() {
    let _this = this,
      btnTemplate = {
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

    let clearBtn = Object.assign({}, btnTemplate, {
        content: [dom.icon('bin'), i18n.get('clear')],
        className: ['clear-form'],
        action: {
          click: (evt) => {
            let stage = document.getElementById(_this.formID + '-stage'),
              rows = stage.getElementsByClassName('stage-row'),
              buttonPosition = evt.target.getBoundingClientRect(),
              bodyRect = document.body.getBoundingClientRect(),
              coords = {
                pageX: buttonPosition.left + (buttonPosition.width / 2),
                pageY: (buttonPosition.top - bodyRect.top) - 12
              };

            if (rows.length) {
              events.confirmClearAll = new CustomEvent('confirmClearAll', {
                detail: {
                  confirmationMessage: i18n.get('confirmClearAll'),
                  clearAllAction: _this.clearAll,
                  btnCoords: coords,
                  rows: rows
                }
              });

              document.dispatchEvent(events.confirmClearAll);

            } else {
              alert('There are no fields to clear');
            }
          }
        }
      }),
      settingsBtn = Object.assign({}, btnTemplate, {
        content: [dom.icon('settings'), i18n.get('settings')],
        attrs: { title: i18n.get('settings') },
        className: ['edit-settings']
      }),
      saveBtn = Object.assign({}, btnTemplate, {
        content: [dom.icon('floppy-disk'), i18n.get('save')],
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
            document.dispatchEvent(events.formeoSaved);
          }
        }
      }),
      formActions = {
        tag: 'div',
        className: 'form-actions',
        content: [clearBtn, settingsBtn, saveBtn]
      };

    for (var i = formActions.content.length - 1; i >= 0; i--) {
      formActions.content[i].className.push('btn', 'btn-secondary');
    }

    return formActions;
  }

  /**
   * Returns the markup for the form controls/fields
   * @return {DOM}
   */
  get dom() {
    if (this.element) {
      return this.element;
    }

    let groupedFields = this.groupFields();
    let formActions = this.formActions();
    let controlPanels = new Panels({ panels: groupedFields, type: 'controls' });
    let groupsWrap = dom.create({
      tag: 'div',
      className: 'control-groups panels-wrap panel-count-' + groupedFields.length,
      content: controlPanels.content
    });

    let element = dom.create({
        tag: 'div',
        className: this.formID + '-controls formeo-controls',
        content: [groupsWrap, formActions]
      }),
      groups = element.getElementsByClassName('control-group');

    this.element = element;
    this.groups = groups;
    this.currentGroup = groups[0];

    this.actions = {
      filter: (term) => {
        let filtering = (term !== ''),
          filteredTerm = groupsWrap.querySelector('.filtered-term'),
          fields = controlPanels.content[1].querySelectorAll('.field-control');

        helpers.toggleElementsByStr(fields, term);

        if (filtering) {
          let filteredStr = `Filtering '${term}'`; // @todo change to use language file

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
    for (var i = groups.length - 1; i >= 0; i--) {
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

  createColumn(id) {
    let field = new Field(id),
      column = new Column();

    dataMap.fields[field.id].parent = column.id;

    field.classList.add('first-field');
    column.appendChild(field);
    dataMap.columns[column.id].fields.push(field.id);
    return column;
  }

  addRow(id) {
    let _this = this;
    let stageID = _this.formID + '-stage',
      stage = document.getElementById(stageID),
      column = _this.createColumn(id),
      row = new Row();

    // Set parent IDs
    dataMap.columns[column.id].parent = row.id;
    dataMap.rows[row.id].parent = stageID;
    row.appendChild(column);
    data.saveColumnOrder(row);
    stage.appendChild(row);
    data.saveRowOrder(row);
    data.save();
    //trigger formSaved event
    document.dispatchEvent(events.formeoUpdated);
  }

}
