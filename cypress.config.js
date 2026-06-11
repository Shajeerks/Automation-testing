const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://v2qa.lifetrenz.com",
    defaultCommandTimeout: 10000
  }
});