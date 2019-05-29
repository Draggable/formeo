import mi18n from 'mi18n'
import { isIE } from './common/helpers'

// eslint-disable-next-line no-undef
mi18n.addLanguage('en-US', EN_US)

export const defaults = {
  get editor() {
    return {
      stickyControls: false,
      allowEdit: true,
      dataType: 'json',
      debug: false,
      sessionStorage: false,
      editorContainer: null, // element or selector to attach editor to
      external: {}, // assign external data to be used in conditions autolinker
      svgSprite: null, // change to null
      iconFont: null, // 'glyphicons' || 'font-awesome' || 'fontello'
      config: {}, // stages, rows, columns, fields
      events: {},
      actions: {},
      controls: {},
      polyfills: isIE(), // loads csspreloadrel
      i18n: {
        location: 'https://draggable.github.io/formeo/assets/lang/',
      },
    }
  },
}
