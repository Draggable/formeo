import { enUS } from '@draggable/formeo-languages'
import mi18n from '@draggable/i18n'
import { CSS_URL } from './constants'

const locale = 'en-US'
mi18n.addLanguage(locale, enUS)
mi18n.setCurrent(locale)

export const defaults = {
  get editor() {
    return {
      stickyControls: false,
      allowEdit: true,
      dataType: 'json',
      debug: false,
      sessionStorage: false,
      editorContainer: null, // element or selector to attach editor to
      svgSprite: null, // null = use bundled sprite, or provide custom URL
      style: CSS_URL, // change to null
      iconFont: null, // 'glyphicons' || 'font-awesome' || 'fontello'
      config: {}, // stages, rows, columns, fields
      events: {},
      actions: {},
      controls: {},
      i18n: {
        location: 'https://draggable.github.io/formeo/assets/lang/',
      },
      onLoad: () => {},
    }
  },
}
