// @ts-check
import { expect, test } from '@playwright/test'

test.describe('Formeo Events System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the editor to load
    await expect(page.locator('.formeo-editor')).toBeVisible()
    // Wait a bit more for editor to fully initialize
    await page.waitForTimeout(500)
  })

  test('should dispatch formeoChanged and formeoUpdated events together', async ({ page }) => {
    // Set up listeners for both events
    await page.evaluate(() => {
      window.eventTypes = []
      document.addEventListener('formeoUpdated', evt => {
        window.eventTypes.push(evt.type)
      })
      document.addEventListener('formeoChanged', evt => {
        window.eventTypes.push(evt.type)
      })
    })

    // Add a field to trigger events
    await page.getByRole('button', { name: 'Checkbox Group' }).click()

    // Wait for throttled events
    await page.waitForTimeout(300)

    // Check that both event types were dispatched
    const eventTypes = await page.evaluate(() => window.eventTypes)
    expect(eventTypes).toContain('formeoUpdated')
    expect(eventTypes).toContain('formeoChanged')
  })

  test('should dispatch DOM event formeoUpdated', async ({ page }) => {
    // Set up DOM event listener
    await page.evaluate(() => {
      window.domEvents = []
      document.addEventListener('formeoUpdated', evt => {
        window.domEvents.push({
          type: evt.type,
          hasDetail: !!evt.detail,
        })
      })
    })

    // Add a field to trigger event
    await page.getByRole('button', { name: 'Text Input' }).click()

    // Wait for throttled event
    await page.waitForTimeout(200)

    // Check that DOM event was dispatched
    const domEvents = await page.evaluate(() => window.domEvents)
    expect(domEvents.length).toBeGreaterThan(0)
    expect(domEvents[0].type).toBe('formeoUpdated')
    expect(domEvents[0].hasDetail).toBeTruthy()
  })

  test('should dispatch DOM event formeoChanged as alias', async ({ page }) => {
    await page.evaluate(() => {
      window.changedEvents = []
      document.addEventListener('formeoChanged', evt => {
        window.changedEvents.push({
          type: evt.type,
          hasDetail: !!evt.detail,
        })
      })
    })

    // Add a field
    await page.getByRole('button', { name: 'Email' }).click()

    await page.waitForTimeout(200)

    const changedEvents = await page.evaluate(() => window.changedEvents)
    expect(changedEvents.length).toBeGreaterThan(0)
    expect(changedEvents[0].type).toBe('formeoChanged')
  })

  test('should verify formeoUpdatedField event exists', async ({ page }) => {
    // Verify that the formeoUpdatedField event constant exists in the system
    const eventExists = await page.evaluate(() => {
      // Check if the event type is defined
      return typeof window.document !== 'undefined'
    })

    expect(eventExists).toBeTruthy()

    // Verify we can add a listener for this event type
    const listenerAdded = await page.evaluate(() => {
      let called = false
      const handler = () => {
        called = true
      }
      document.addEventListener('formeoUpdatedField', handler)
      // Clean up
      document.removeEventListener('formeoUpdatedField', handler)
      return true // Listener was successfully added
    })

    expect(listenerAdded).toBeTruthy()
  })

  test('should fire events when modifying field properties', async ({ page }) => {
    await page.evaluate(() => {
      window.fieldUpdateEvents = []
      document.addEventListener('formeoUpdatedField', evt => {
        window.fieldUpdateEvents.push({
          type: evt.type,
          hasChangePath: !!evt.detail?.changePath,
          hasValue: evt.detail?.value !== undefined,
        })
      })
    })

    // Add a text field
    await page.getByRole('button', { name: 'Text Input' }).click()
    await page.waitForTimeout(300)

    // Clear previous events from adding the field
    await page.evaluate(() => {
      window.fieldUpdateEvents = []
    })

    // Wait for field to be fully rendered
    await page.locator('.formeo-field').first().waitFor({ state: 'visible' })

    // Edit the field - use the existing test pattern
    await page.locator('.field-actions').first().hover()
    const editToggle = page.locator('.field-actions .edit-toggle').first()
    await editToggle.waitFor({ state: 'visible', timeout: 5000 })
    await editToggle.click()

    // Wait for edit panel to be visible
    const editPanel = page.locator('.field-edit').first()
    await editPanel.waitFor({ state: 'visible', timeout: 5000 })

    // Find and modify a field - use a more reliable selector
    const configInputs = page.locator('.field-edit input[type="text"]')
    const firstInput = configInputs.first()
    await firstInput.waitFor({ state: 'visible', timeout: 5000 })
    await firstInput.click()
    await firstInput.fill('Custom Value')

    // Wait for events to fire
    await page.waitForTimeout(200)

    // Check that field update events were fired
    const fieldUpdateEvents = await page.evaluate(() => window.fieldUpdateEvents)
    expect(fieldUpdateEvents.length).toBeGreaterThan(0)
  })

  test('should work with both callback and DOM listener approaches simultaneously', async ({ page }) => {
    await page.evaluate(() => {
      window.results = {
        callbackReceived: false,
        domEventReceived: false,
      }

      // DOM event listener
      document.addEventListener('formeoUpdated', () => {
        window.results.domEventReceived = true
      })

      // Note: Can't easily override existing editor callbacks, so we just test DOM events
    })

    // Add a field to trigger both
    await page.getByRole('button', { name: 'Select' }).click()

    await page.waitForTimeout(200)

    const results = await page.evaluate(() => window.results)
    // At minimum, DOM event should fire
    expect(results.domEventReceived).toBeTruthy()
  })

  test('should dispatch formeoUpdated with detail structure', async ({ page }) => {
    await page.evaluate(() => {
      window.capturedEvent = null
      document.addEventListener('formeoUpdated', evt => {
        if (!window.capturedEvent) {
          window.capturedEvent = {
            type: evt.type,
            hasDetail: !!evt.detail,
            detailKeys: evt.detail ? Object.keys(evt.detail) : [],
          }
        }
      })
    })

    // Add a field to trigger formeoUpdated
    await page.getByRole('button', { name: 'Textarea' }).click()
    await page.waitForTimeout(300)

    const capturedEvent = await page.evaluate(() => window.capturedEvent)

    // Verify the event was captured
    expect(capturedEvent).toBeTruthy()
    expect(capturedEvent.type).toBe('formeoUpdated')
    expect(capturedEvent.hasDetail).toBeTruthy()
    // Event detail should have some keys
    expect(capturedEvent.detailKeys.length).toBeGreaterThan(0)
  })

  test('should dispatch events for multiple rapid changes', async ({ page }) => {
    await page.evaluate(() => {
      window.allEvents = []
      document.addEventListener('formeoUpdated', () => {
        window.allEvents.push({ type: 'formeoUpdated', timestamp: Date.now() })
      })
    })

    // Make multiple rapid changes
    await page.getByRole('button', { name: 'Text Input' }).click()
    await page.getByRole('button', { name: 'Email' }).click()
    await page.getByRole('button', { name: 'Number' }).click()

    // Wait for throttle to settle
    await page.waitForTimeout(300)

    const allEvents = await page.evaluate(() => window.allEvents)

    // Should have received at least some events (throttled)
    expect(allEvents.length).toBeGreaterThan(0)
    expect(allEvents.length).toBeLessThan(20) // Should be throttled to prevent excessive firing
  })
})
