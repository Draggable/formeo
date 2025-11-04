import { GOOGLE_ANALYTICS, IS_SITE } from './constants'

/**
 * Prepends script tags
 * @param {String} src script src
 * @param {String} id script id
 */
function injectScript(props) {
  const [firstScript] = document.getElementsByTagName('script')
  if (document.getElementById(props.id)) {
    return
  }
  const js = Object.assign(document.createElement('script'), props)
  firstScript.parentNode.insertBefore(js, firstScript)
}

if (IS_SITE) {
  if (window.location.protocol !== 'https:') {
    window.location.protocol = 'https:'
  }

  const scripts = [
    {
      src: '//platform.twitter.com/widgets.js',
      id: 'twitter-script',
    },
    {
      src: '//buttons.github.io/buttons.js',
      id: 'github-script',
    },
    {
      src: '//www.google-analytics.com/analytics.js',
      id: 'google-analytics',
      onload: () => {
        window.ga('create', GOOGLE_ANALYTICS, 'auto')
        window.ga('send', 'pageview')
      },
    },
  ]

  scripts.forEach(injectScript)
}
