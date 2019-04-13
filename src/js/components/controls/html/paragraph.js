import i18n from 'mi18n'
import Control from '../control'

class ParagraphControl extends Control {
  constructor() {
    const paragraphConfig = {
      tag: 'p',
      attrs: {
        className: '',
      },
      config: {
        label: i18n.get('controls.html.paragraph'),
        hideLabel: true,
        editableContent: true,
      },
      meta: {
        group: 'html',
        icon: 'paragraph',
        id: 'paragraph',
      },
      // eslint-disable-next-line
      content:
        'Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment.',
    }
    super(paragraphConfig)
  }
}

export default ParagraphControl
