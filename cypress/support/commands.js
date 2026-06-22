// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })



Cypress.Commands.add('loginToHIS', () => {
  cy.visit('https://v2qa.lifetrenz.com/#/auth/login')

  cy.get('input').eq(0).type('admin@cloudnine')
  cy.get('input[type="password"]').type('Cloudnine@2026')
  cy.contains('button', 'LOGIN').click()

  cy.wait(5000)
})




// Cypress.Commands.add('loginToHIS', () => {
//   cy.visit('https://rmh-sit.corazonkare.com/#/auth/login')

//   cy.get('input').eq(0).type('shajeer.m')
//   cy.get('input[type="password"]').type('shajeer@1')
//   cy.contains('button', 'LOGIN').click()

//   cy.wait(5000)
// })
