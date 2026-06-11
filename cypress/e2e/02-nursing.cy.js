describe('Nursing Activity Workflow', () => {

  it('Login as nurse and start nursing for same patient', () => {

    cy.fixture('patient.json').then((patient) => {

      cy.visit('https://v2qa.lifetrenz.com/#/auth/login')

      cy.wait(3000)

      cy.get('input').eq(0).type(Cypress.env('nurseUsername'))
      cy.get('input[type="password"]').type(Cypress.env('nursePassword'))

      cy.contains('button', 'LOGIN').click()

      cy.url().should('include', '/home')

      cy.get('div:visible')
        .contains('Outpatient Nursing')
        .click({ force: true })

      cy.contains('Pre-Consultation Q', { timeout: 60000 })
        .should('be.visible')

      cy.contains(patient.mpi, { timeout: 60000 })
  .parents('tr')
  .within(() => {
    cy.contains('button', /Start Nursing|Continue/)
      .click({ force: true })
  })

      // If Call Next Patient popup appears, click Start Nursing.
// If already opened Casesheet, continue.
cy.wait(3000)

cy.get('body').then(($body) => {
  if ($body.text().includes('Call Next Patient')) {
    cy.get('.p-dialog')
      .find('span.p-button-label')
      .contains('Start Nursing')
      .click({ force: true })

    cy.wait(5000)
  } else {
    cy.log('Casesheet opened directly, no popup found')
  }
})

cy.contains('Casesheet', { timeout: 60000 })
  .should('be.visible')

// If still in popup, click again
cy.get('body').then(($body) => {
  if ($body.text().includes('Call Next Patient')) {
    cy.get('.p-dialog')
      .find('span.p-button-label')
      .contains('Start Nursing')
      .click({ force: true })
  }
})

cy.wait(8000)

// Confirm casesheet opened
cy.contains('Casesheet', { timeout: 60000 })
  .should('be.visible')
// Confirm nursing casesheet page opened
cy.contains('Casesheet', { timeout: 60000 })
  .should('be.visible')

cy.contains('Complete Nursing Assessment', { timeout: 60000 })
  .should('be.visible')



cy.log('Nursing casesheet opened for MPI: ' + patient.mpi)

      cy.log('Nursing started for MPI: ' + patient.mpi)

      // Confirm nursing casesheet opened
cy.contains('Casesheet', { timeout: 60000 }).should('be.visible')
cy.contains('Complete Nursing Assessment', { timeout: 60000 }).should('be.visible')

// ===========================
// ===========================
// ALLERGIES
// ===========================

// Open Allergies
cy.contains('Allergies')
  .parents('.card-header, .p-card, div')
  .first()
  .find('button')
  .click({ force: true })

cy.contains('Add Patient Allergy', { timeout: 20000 })
  .should('be.visible')

// Check if No Known Allergy already selected
cy.get('body').then(($body) => {

  const checked =
    $body.find('.p-checkbox-box.p-highlight').length > 0

  if (!checked) {

    cy.contains('No Known Allergy')
      .parent()
      .find('.p-checkbox-box')
      .click({ force: true })

    cy.wait(1000)
  }

})

// Close popup using X button
cy.get('button[aria-label="Close"], .p-dialog-header-close')
  .first()
  .click({ force: true })

cy.wait(2000)
// ===========================
// Open HPI
cy.contains('HPI')
  .parents('.card-header, .p-card, div')
  .first()
  .find('button')
  .click({ force: true })

cy.contains('Add HPI', { timeout: 20000 })
  .should('be.visible')

cy.wait(2000)

// Check if HPI already exists
cy.get('body').then(($body) => {

  const hpiExists =
    $body.text().includes('Update & Exit')

  if (hpiExists) {

    cy.log('HPI already exists')

    cy.contains('button', 'Close')
      .click({ force: true })

  } else {

    cy.log('Creating new HPI')

    cy.get('.ql-editor')
      .first()
      .click({ force: true })
      .type(
        'Patient came for outpatient consultation. No major complaints reported. General condition stable.',
        { force: true }
      )

    cy.contains('button', 'Save & Exit')
      .click({ force: true })
  }
})

cy.wait(3000)
// ===========================
// VITALS
// ===========================
cy.contains('Vitals')
  .parents('.card-header, .p-card, div')
  .first()
  .find('button')
  .click({ force: true })

cy.contains('Vital Signs', { timeout: 20000 })
  .should('be.visible')

cy.contains('Vital Signs', { timeout: 20000 }).should('be.visible')

cy.get('input[placeholder="Enter Height"]').type('170', { force: true })
cy.get('input[placeholder="Enter Weight"]').type('70', { force: true })
cy.get('input[placeholder="Enter Temperature"]').type('98.6', { force: true })
cy.get('input[placeholder="Enter Pulse Rate"]').type('78', { force: true })

cy.get('input[placeholder*="Enter Res"]')
  .type('18', { force: true })

cy.get('input[placeholder*="Enter SPO2"]')
  .type('98', { force: true })

// BP fields
cy.get('input:visible').then(($inputs) => {
  cy.wrap($inputs.eq(6)).type('120', { force: true })
  cy.wrap($inputs.eq(7)).type('80', { force: true })
})

cy.contains('button', 'Save & Exit')
  .click({ force: true })

cy.wait(3000)

// ===========================
// COMPLETE NURSING ASSESSMENT
// ===========================
cy.contains('button', 'Complete Nursing Assessment')
  .click({ force: true })

cy.wait(5000)

// Confirmation popup
cy.contains('Are You Sure Want To Complete Nursing?', { timeout: 20000 })
  .should('be.visible')

cy.contains('button', 'Yes')
  .should('be.visible')
  .click({ force: true })

cy.wait(5000)

cy.log('Nursing assessment completed successfully')


    })

  })

})