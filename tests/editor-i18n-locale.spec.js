// @ts-check
import { expect, test } from '@playwright/test'

// a made-up locale registered through i18n.override, so nothing is fetched.
// Only the "save" key is overridden - @draggable/i18n falls back to en-US
// for any other key that a fresh, empty editor renders.
const LOCALE = 'xx-XX'
const MARKER = 'XX-MARKER'

const mountEditor = (page, { stored } = {}) =>
  page.evaluate(
    async ({ locale, marker, stored }) => {
      sessionStorage.removeItem('formeo-locale')
      if (stored) {
        sessionStorage.setItem('formeo-locale', stored)
      }
      const container = Object.assign(document.createElement('div'), { id: 'i18n-editor' })
      document.body.appendChild(container)
      const editor = new window.FormeoEditor({
        editorContainer: container,
        sessionStorage: false,
        i18n: { locale, override: { [locale]: { save: marker } } },
      })
      await editor.whenReady()
    },
    { locale: LOCALE, marker: MARKER, stored }
  )

test.describe('i18n.locale option', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.formeo-editor').first()).toBeVisible()
  })

  test('the configured locale is used when nothing is stored', async ({ page }) => {
    await mountEditor(page)
    await expect(page.locator('#i18n-editor')).toContainText(MARKER)
  })

  test('a locale stored by setLang still wins over the config', async ({ page }) => {
    await mountEditor(page, { stored: 'en-US' })
    await expect(page.locator('#i18n-editor')).not.toContainText(MARKER)
  })
})
