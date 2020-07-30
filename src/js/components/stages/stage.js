import Sortable from 'sortablejs'
import dom from '../../common/dom'
import Component from '../component'
import { STAGE_CLASSNAME, ANIMATION_SPEED_BASE, ROW_CLASSNAME } from '../../constants'
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
  constructor(stageData, render) {
    super('stage', Object.assign({}, DEFAULT_DATA(), stageData), render)

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

    const children = this.createChildWrap()

    this.dom = dom.create({
      attrs: {
        className: [STAGE_CLASSNAME, 'empty'],
        id: this.id,
      },
      children,
    })

    this.sortable = Sortable.create(children, {
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
      onAdd: this.onAdd.bind(this),
      onRemove: this.onRemove.bind(this),
      onStart: () => (Stages.active = this),
      onSort: this.onSort.bind(this),
      draggable: `.${ROW_CLASSNAME}`,
      handle: '.item-handle',
    })
  }
  empty(isAnimated = true) {
    return new Promise(resolve => {
      if (isAnimated) {
        this.dom.classList.add('removing-all-fields')
        animate.slideUp(this.dom, ANIMATION_SPEED_BASE, () => {
          resolve(super.empty(isAnimated))
          this.dom.classList.remove('removing-all-fields')
          animate.slideDown(this.dom, ANIMATION_SPEED_BASE)
        })
      } else {
        resolve(super.empty())
      }
    })
  }

  onAdd(...args) {
    const component = super.onAdd(...args)
    if (component && component.name === 'column') {
      component.parent.autoColumnWidths()
    }
  }
}
