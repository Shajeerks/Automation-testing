const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://v2qa.lifetrenz.com',

    viewportWidth: 1920,
    viewportHeight: 1080,

    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,

    video: false
  }
})