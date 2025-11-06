import { loadAngularDemo } from './frameworks/angular.js'
import { loadReactDemo } from './frameworks/react.js'
import { loadVanillaDemo } from './frameworks/vanilla.js'

/**
 * FrameworkLoader - Manages loading and switching between different framework demos
 *
 * Features:
 * - Lazy loading of framework-specific code
 * - Proper resource cleanup when switching frameworks
 * - Error handling with user-friendly messages
 * - Loading states for better UX
 * - Automatic synchronization with framework selector
 * - URL query parameter support for shareable links
 * - Browser history integration for back/forward navigation
 */
class FrameworkLoader {
  constructor() {
    this.currentFramework = null
    this.frameworkContainer = document.getElementById('framework-container')
    this.frameworkSelect = document.getElementById('framework-select')
    this.currentDemo = null
    this.isLoading = false
    this.validFrameworks = ['vanilla', 'angular', 'react']

    // Validate required DOM elements
    if (!this.frameworkContainer) {
      console.error('Framework container not found')
      return
    }

    if (!this.frameworkSelect) {
      console.error('Framework selector not found')
      return
    }

    this.init()
  }

  /**
   * Initialize the framework loader
   */
  init() {
    // Handle framework selection changes
    this.frameworkSelect.addEventListener('change', e => {
      this.switchFramework(e.target.value)
    })

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      const framework = this.getFrameworkFromURL()
      this.switchFramework(framework, { updateURL: false })
    })

    // Load initial framework from URL or default to vanilla
    const initialFramework = this.getFrameworkFromURL()
    this.switchFramework(initialFramework)
  }

  /**
   * Switch to a different framework demo
   * @param {string} framework - The framework to load ('vanilla', 'angular', etc.)
   * @param {Object} options - Options for framework switching
   * @param {boolean} options.updateURL - Whether to update the URL (default: true)
   */
  async switchFramework(framework, options = {}) {
    const { updateURL = true } = options

    // Prevent concurrent loading
    if (this.isLoading) {
      console.warn('Framework switch already in progress')
      return
    }

    // Prevent loading the same framework when it's already loaded
    if (this.currentFramework === framework && this.currentDemo !== null) {
      return
    }

    this.isLoading = true
    this.showLoadingState()

    try {
      // Cleanup current demo
      await this.cleanupCurrentDemo()

      // Clear container
      this.frameworkContainer.innerHTML = ''

      // Load the requested framework
      switch (framework) {
        case 'vanilla':
          this.currentDemo = await loadVanillaDemo(this.frameworkContainer)
          break
        case 'angular':
          this.currentDemo = await loadAngularDemo(this.frameworkContainer)
          break
        case 'react':
          this.currentDemo = await loadReactDemo(this.frameworkContainer)
          break
        default:
          throw new Error(`Unknown framework: ${framework}`)
      }

      this.currentFramework = framework
      this.syncFrameworkSelector(framework)

      // Update URL if requested
      if (updateURL) {
        this.updateURL(framework)
      }

      console.log(`Loaded ${framework} demo successfully`)
    } catch (error) {
      console.error(`Failed to load ${framework} demo:`, error)
      this.showErrorState(framework, error)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Cleanup current demo resources
   */
  async cleanupCurrentDemo() {
    if (this.currentDemo?.cleanup) {
      try {
        await Promise.resolve(this.currentDemo.cleanup())
      } catch (error) {
        console.warn('Error during demo cleanup:', error)
      }
    }
    this.currentDemo = null
  }

  /**
   * Synchronize framework selector with current framework
   * @param {string} framework - The framework to select
   */
  syncFrameworkSelector(framework) {
    if (this.frameworkSelect.value !== framework) {
      this.frameworkSelect.value = framework
    }
  }

  /**
   * Get framework from URL query parameters
   * @returns {string} The framework from URL or default 'vanilla'
   */
  getFrameworkFromURL() {
    const urlParams = new URLSearchParams(window.location.search)
    const framework = urlParams.get('framework')

    // Validate framework and return default if invalid
    if (framework && this.validFrameworks.includes(framework)) {
      return framework
    }

    return 'vanilla'
  }

  /**
   * Update URL with current framework
   * @param {string} framework - The framework to set in URL
   */
  updateURL(framework) {
    const url = new URL(window.location)

    if (framework === 'vanilla') {
      // Remove framework parameter for vanilla (default)
      url.searchParams.delete('framework')
    } else {
      url.searchParams.set('framework', framework)
    }

    // Update URL without reloading the page
    window.history.pushState({ framework }, '', url.toString())
  }

  /**
   * Show loading state in the framework container
   */
  showLoadingState() {
    this.frameworkContainer.innerHTML = `
      <div class="loading-message">
        <p>Loading ${this.frameworkSelect.options[this.frameworkSelect.selectedIndex]?.text || 'framework'} demo...</p>
      </div>
    `
  }

  /**
   * Show error state in the framework container
   * @param {string} framework - The framework that failed to load
   * @param {Error} error - The error that occurred
   */
  showErrorState(framework, error) {
    this.frameworkContainer.innerHTML = `
      <div class="error-message">
        <h3>Failed to load ${framework} demo</h3>
        <p>${error.message}</p>
        <button class="retry-button" onclick="window.frameworkLoader?.switchFramework('${framework}')">Retry</button>
      </div>
    `
  }
}

// Initialize framework loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.frameworkLoader = new FrameworkLoader()
})
