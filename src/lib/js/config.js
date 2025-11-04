import mi18n from '@draggable/i18n'
import { isIE } from './common/helpers'
import { CSS_URL, SVG_SPRITE_URL } from './constants'

const enUS = import.meta.env.enUS

mi18n.addLanguage('en-US', enUS)

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
      svgSprite: SVG_SPRITE_URL, // change to null
      style: CSS_URL, // change to null
      iconFont: null, // 'glyphicons' || 'font-awesome' || 'fontello'
      config: {}, // stages, rows, columns, fields
      events: {},
      actions: {},
      controls: {},
      polyfills: isIE(), // loads csspreloadrel
      i18n: {
        location: 'https://draggable.github.io/formeo/assets/lang/',
      },
      onLoad: () => {},
    }
  },
}
