const { defineConfig } = require('cypress')

const setupPlugins = require('@synthetixio/synpress/plugins')

module.exports = defineConfig({
  userAgent: 'synpress',
  retries: {
    runMode: 0,
    openMode: 0,
  },
  screenshotsFolder: 'e2e/screenshots',
  videosFolder: 'e2e/videos',
  chromeWebSecurity: true,
  viewportWidth: 1366,
  viewportHeight: 768,
  env: {
    coverage: false,
  },
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 30000,
  requestTimeout: 30000,
  e2e: {
    setupNodeEvents(on, config) {
      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config
      return setupPlugins(on, config)
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'e2e/specs/stateless/*.spec.{js,jsx,ts,tsx}',
    supportFile: 'support.js',
  },
})
