import DOM from './dom';
import helpers from './helpers';
import { registeredFields } from './data';
import Sortable from 'sortablejs';
import Panels from './panels';
var dom = new DOM();

var i18n = {
  actions: {
    clear: 'Clear',
    settings: 'Settings',
    save: 'Save',
    saved: 'Saved'
  },
  controlGroups: {
    common: 'Common Fields',
    html: 'HTML Elements'
  },
  elements: {
    text: 'Text',
    select: 'Select',
    textarea: 'Textarea',
    checkbox: 'Checkbox'
  }
};

export class Controls {
  constructor(controlOptions) {
    let defaults = {
      sortable: true,
      controlGroupOrder: [
        'common',
        'html'
      ],
      controlGroups: [{
          id: 'common',
          label: i18n.controlGroups.common,
          order: [
            'text-input',
            'checkbox'
          ]
        }
        // , {
        //   id: 'html',
        //   label: i18n.controlGroups.html,
        //   order: [
        //     'header',
        //     'block-text'
        //   ]
        // }
      ],
      elements: [{
          tag: 'input',
          attrs: {
            type: 'text',
            className: 'form-control'
          },
          config: {
            label: 'Text'
          },
          meta: {
            group: 'common',
            icon: 'text-input',
            id: 'text-input'
          }
        }, {
          tag: 'input',
          attrs: {
            type: 'date',
            className: 'form-control'
          },
          config: {
            label: 'Date'
          },
          meta: {
            group: 'common',
            icon: 'calendar',
            id: 'date-input'
          }
        }

        , {
          tag: 'button',
          attrs: {
            type: 'button',
            className: 'btn-secondary btn'
          },
          content: 'Button',
          config: {
            label: 'Button',
            hideLabel: true
          },
          meta: {
            group: 'common',
            icon: 'button',
            id: 'button'
          },
          options: [{
            label: 'Button',
            value: 'button',
            selected: true,
            disabled: false
          }]
        }

        , {
          tag: 'select',
          className: 'form-control',
          config: {
            label: 'Select'
          },
          meta: {
            group: 'common',
            icon: 'select',
            id: 'select'
          },
          options: [{
            label: 'Option 1',
            value: 'option-1',
            selected: true
          }, {
            label: 'Option 2',
            value: 'option-2',
            selected: false
          }]
        }, {
          tag: 'textarea',
          className: 'form-control',
          config: {
            label: 'Textarea'
          },
          meta: {
            group: 'common',
            icon: 'textarea',
            id: 'textarea'
          },
          attrs: {
            maxlength: 10
          }
        },
        // {
        //   tag: 'canvas',
        //   config: {
        //     label: 'Signature'
        //   },
        //   meta: {
        //     group: 'common',
        //     icon: 'signature',
        //     id: 'signature'
        //   }
        // },
        {
          tag: 'input',
          attrs: {
            type: 'checkbox',
            checked: true
          },
          config: {
            label: 'Checkbox/Group'
          },
          meta: {
            group: 'common',
            icon: 'checkbox',
            id: 'checkbox'
          },
          options: [{
            label: 'Checkbox 1',
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
            label: 'Radio Group'
          },
          meta: {
            group: 'common',
            icon: 'radio-group',
            id: 'radio'
          },
          options: [{
            label: 'Radio 1',
            value: 'radio-1',
            selected: true
          }, {
            label: 'Radio 2',
            value: 'radio-2',
            selected: false
          }]
        }, {
          tag: 'h1',
          config: {
            label: 'Header'
          },
          meta: {
            group: 'html',
            icon: 'header',
            id: 'header'
          }
        }, {
          tag: 'p',
          config: {
            label: 'Paragraph'
          },
          meta: {
            group: 'html',
            icon: 'paragraph',
            id: 'paragraph'
          }
        }, {
          tag: 'hr',
          config: {
            label: 'Divider'
          },
          meta: {
            group: 'html',
            icon: 'divider',
            id: 'divider'
          }
        }
      ]
    };

    this.opts = Object.assign({}, defaults, controlOptions);
  }

  appendField(dataID) {
    // let _this = this;
    // console.log(this);
    // let stage = document.getElementById(_this.opts.formID + '-stage'),
    // row =
    // field = new Field(dataID);
    // stage.appendChild(dom.create(row));
  }

  mergeGroups() {
    let _this = this,
      opts = this.opts,
      groups = this.opts.controlGroups.slice(),
      elements = this.opts.elements.slice(),
      allGroups = [],
      groupControlMap = function(elem) {
        let dataID = helpers.uuid();
        let elementControl = {
          tag: 'li',
          className: 'field-control',
          id: dataID,
          action: {
            click: (evt) => {
              _this.appendField(evt.target.id);
              // fire fieldAdded event
            }
          },
          content: [elem.config.label]
        };

        if (elem.meta.icon) {
          elementControl.content.unshift(dom.icon(elem.meta.icon));
        }

        registeredFields[dataID] = elem;
        return elementControl;
      };

    allGroups = helpers.map(groups, (i) => {
      let group = {
        tag: 'ul',
        attrs: {
          className: 'control-group',
          id: opts.formID + '-' + groups[i].id + '-control-group'
        },
        fType: 'controlGroup',
        config: {
          label: groups[i].label || ''
        }
      };

      if (groups[i].order) {
        elements = helpers.orderObjectsBy(elements, groups[i].order, 'meta.id');
      }
      group.content = elements.filter((field) => {
        return field.meta.group === groups[i].id;
      }).map(groupControlMap);

      return group;
    });

    return allGroups;
  }

  formActions() {
    let btnTemplate = {
        tag: 'button'
      },
      clearBtn = Object.assign({}, btnTemplate, {
        content: [dom.icon('bin'), i18n.actions.clear],
        className: ['clear-form']
      }),
      settingsBtn = Object.assign({}, btnTemplate, {
        content: [dom.icon('settings'), i18n.actions.settings],
        attrs: { title: i18n.settings },
        className: ['edit-settings']
      }),
      saveBtn = Object.assign({}, btnTemplate, {
        content: [dom.icon('floppy-disk'), i18n.actions.save],
        className: ['save-form']
      }),
      formActions = {
        tag: 'div',
        className: 'form-actions btn-group',
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
    if (this.controls) {
      return this.controls;
    }

    // let controlNavElements = this.controlNavElements(), // Navigation for all the form elements
    //   groupedFields = dom.create(this.mergeGroups()), // grouped form and html elements
    let groupedFields = this.mergeGroups();
    let formActions = this.formActions();
    let controlPanels = new Panels({ panels: groupedFields, type: 'controls' });
    this.controlGroupsWrap = dom.create({
      tag: 'div',
      className: 'control-groups panels-wrap panel-count-' + groupedFields.length,
      content: controlPanels
    });
    let controls = dom.create({
        tag: 'div',
        className: this.opts.className + '-controls',
        content: [this.controlGroupsWrap, formActions]
      }),
      controlGroups = controls.getElementsByClassName('control-group');

    this.controls = controls;
    this.controlGroups = controlGroups;
    this.currentGroup = controlGroups[0];

    // Make controls sortable
    for (var i = controlGroups.length - 1; i >= 0; i--) {
      Sortable.create(controlGroups[i], {
        animation: 150,
        forceFallback: true,
        ghostClass: 'control-ghost',
        group: { name: 'controls', pull: 'clone', put: false },
        sort: this.opts.sortable
      });
    }

    return controls;
  }
}
