import mi18n from 'mi18n'
import { isIE } from './common/helpers'
import pkg from '../../package.json'
import { FALLBACK_SVG_SPRITE } from './constants'
import { enUS } from 'formeo-i18n'

export const defaults = {
  get editor() {
    return {
      allowEdit: true,
      dataType: 'json',
      debug: false,
      sessionStorage: false,
      editorContainer: `.${pkg.name}-wrap`,
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
        locale: 'en-US',
        langs: ['en-US'],
        override: {
          'en-US': mi18n.processFile(enUS),
        },
      },
    }
  },
}
