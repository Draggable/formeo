import mi18n from 'mi18n'
import { isIE } from './common/helpers'
import { FALLBACK_SVG_SPRITE, PACKAGE_NAME } from './constants'

// eslint-disable-next-line no-undef
mi18n.addLanguage('en-US', EN_US)

export const defaults = {
  get editor() {
    return {
      allowEdit: true,
      dataType: 'json',
      debug: false,
      sessionStorage: false,
      editorContainer: `.${PACKAGE_NAME}-wrap`,
      external: {}, // assign external data to be used in conditions autolinker
      svgSprite: FALLBACK_SVG_SPRITE, // change to null
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
