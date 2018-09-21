import Sortable from 'sortablejs'
import dom from '../../common/dom'
import Component from '../component'
import { STAGE_CLASSNAME } from '../../constants'
import Stages from '.'
import animate from '../../common/animation'

const DEFAULT_DATA = () => Object.freeze({ children: [] })

/**
 * Stage is where fields and elements are dragged to.
 */
export default class Stage extends Component {
  /**
   * Process options and load existing fields from data to the stage
   * @param  {Object} formeoOptions
   * @param  {String} stageData uuid
   * @return {Object} DOM element
   */
  constructor(stageData) {
    super('stage', Object.assign({}, DEFAULT_DATA(), stageData))

    // @todo move formSettings to its own component
    // const defaultOptions = {
    //   formSettings: [
    //     {
    //       tag: 'input',
    //       id: 'form-title',
    //       attrs: {
    //         className: 'form-title',
    //         placeholder: i18n.get('Untitled Form'),
    //         value: i18n.get('Untitled Form'),
    //         type: 'text',
    //       },
    //       config: {
    //         label: i18n.get('Form Title'),
    //       },
    //     },
    //     {
    //       tag: 'input',
    //       id: 'form-novalidate',
    //       attrs: {
    //         className: 'form-novalidate',
    //         value: false,
    //         type: 'checkbox',
    //       },
    //       config: {
    //         label: i18n.get('Form novalidate'),
    //       },
    //     },
    //     {
    //       tag: 'input',
    //       id: 'form-tags',
    //       attrs: {
    //         className: 'form-tags',
    //         type: 'text',
    //       },
    //       config: {
    //         label: i18n.get('Tags'),
    //       },
    //     },
    //   ],
    // }

    this.dom = dom.create({
      tag: 'ul',
      attrs: {
        className: [STAGE_CLASSNAME, 'empty'],
        id: this.id,
      },
    })

    this.sortable = Sortable.create(this.dom, {
      animation: 150,
      fallbackClass: 'row-moving',
      forceFallback: true,
      group: {
        name: 'stage',
        pull: true,
        put: ['row', 'column', 'controls'],
      },
      sort: true,
      disabled: false,
      onAdd: this.onAdd,
      onRemove: this.onRemove,
      onStart: () => (Stages.active = this),
      onSort: this.onSort,
      draggable: '.stage-rows',
      handle: '.item-handle',
    })
  }
  empty() {
    this.dom.classList.add('removing-all-fields')
    animate.slideUp(this.dom, 600, () => {
      super.empty()
      this.dom.classList.remove('removing-all-fields')
      animate.slideDown(this.dom, 300)
    })
    return this
  }
}
