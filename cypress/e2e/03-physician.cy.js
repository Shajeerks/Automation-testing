describe('Physician Consultation Workflow', () => {

  it('Login as doctor and start consultation for same patient', () => {

    cy.fixture('patient.json').then((patient) => {

      cy.visit('https://v2qa.lifetrenz.com/#/auth/login')
      cy.wait(3000)

      cy.get('input').eq(0).type(Cypress.env('doctorUsername'))
      cy.get('input[type="password"]').type(Cypress.env('doctorPassword'))

      cy.contains('button', 'LOGIN').click({ force: true })
      cy.url().should('include', '/home')
      cy.wait(3000)

      cy.get('div:visible')
        .contains('Outpatient Consultation')
        .click({ force: true })

      cy.wait(5000)

      cy.get('body').then(($body) => {
        if ($body.text().includes('Doctor Consultation Queue')) {
          cy.contains('Doctor Consultation Queue').click({ force: true })
        }
      })

      cy.contains('Consultation Q', { timeout: 60000 }).should('be.visible')
      cy.wait(5000)

      cy.contains(patient.mpi, { timeout: 60000 })
        .parents('tr')
        .within(() => {
          cy.contains('button', /Start|Continue/).click({ force: true })
        })

      cy.wait(3000)

      cy.get('body').then(($body) => {
        if ($body.text().includes('Call Next Patient')) {
          cy.contains('button', 'Start-Consult').click({ force: true })
          cy.wait(8000)
        }
      })

      cy.contains('Current Visit', { timeout: 60000 }).should('be.visible')

      // ALLERGY
      cy.get('body').then(($body) => {
        if (!$body.text().includes('Patient Has No Known Allergy')) {
          cy.contains('Allergies')
            .parents('.card-header, .p-card, div')
            .first()
            .find('button')
            .click({ force: true })

          cy.contains('Add Patient Allergy', { timeout: 20000 }).should('be.visible')

          cy.contains('No Known Allergy')
            .parent()
            .find('.p-checkbox-box')
            .click({ force: true })

          cy.wait(1000)
          cy.get('.p-dialog-header-close').click({ force: true })
        }
      })

      cy.wait(2000)

      // PATIENT COMPLAINTS
      cy.get('body').then(($body) => {
        if ($body.text().includes('Fever') && $body.text().includes('Headache')) {
          cy.log('Patient complaints already captured')
        } else {
          cy.contains('Patient Complaints')
            .parents('.card-header, .p-card, div')
            .first()
            .find('button')
            .click({ force: true })

          cy.contains('Add Patient Complaints', { timeout: 20000 }).should('be.visible')

          cy.contains('tr', 'Fever')
            .find('input[type="checkbox"]')
            .check({ force: true })

          cy.contains('tr', 'Headache')
            .find('input[type="checkbox"]')
            .check({ force: true })

          cy.contains('button', 'Save & Exit').click({ force: true })
        }
      })

      cy.wait(3000)

      // VITALS
      cy.get('body').then(($body) => {
        if ($body.text().includes('Height') && $body.text().includes('170 cm')) {
          cy.log('Vitals already captured')
        } else {
          cy.contains('Vitals')
            .parents('.card-header, .p-card, div')
            .first()
            .find('button')
            .click({ force: true })

          cy.contains('Vital Signs', { timeout: 20000 }).should('be.visible')

          cy.get('input[placeholder="Enter Height"]').clear().type('170', { force: true })
          cy.get('input[placeholder="Enter Weight"]').clear().type('70', { force: true })
          cy.get('input[placeholder="Enter Temperature"]').clear().type('101', { force: true })
          cy.get('input[placeholder="Enter Pulse Rate"]').clear().type('92', { force: true })
          cy.get('input[placeholder*="Resp"]').clear().type('20', { force: true })
          cy.get('input[placeholder*="SPO2"]').clear().type('98', { force: true })

          cy.contains('button', 'Save & Exit').click({ force: true })
        }
      })

      cy.wait(3000)

      // CURRENT DIAGNOSIS
      cy.get('body').then(($body) => {
        if ($body.text().includes('Fever, unspecified')) {
          cy.log('Diagnosis already captured')
        } else {
          cy.contains('Current Diagnosis')
            .parents('.card-header, .p-card, div')
            .first()
            .find('button')
            .click({ force: true })

          cy.contains('Current Diagnosis', { timeout: 20000 }).should('be.visible')

          cy.get('input:visible')
            .first()
            .clear({ force: true })
            .type('Fever, unspecified', { force: true })

          cy.wait(2000)

          cy.contains('Fever, unspecified', { timeout: 20000 })
            .click({ force: true })

          cy.contains('button', 'Save & Exit').click({ force: true })
        }
      })

      cy.wait(3000)

      // ORDER SET
      cy.contains('Order Set')
        .parents('.card-header, .p-card, div')
        .first()
        .find('button')
        .click({ force: true })

      cy.contains('Order Set', { timeout: 30000 }).should('be.visible')
      cy.wait(2000)

      cy.get('input:visible')
        .first()
        .clear({ force: true })
        .type('orderset-2{enter}', { force: true })

      cy.wait(3000)

      cy.contains('orderset-2', { timeout: 30000 })
        .click({ force: true })

      cy.wait(2000)

      cy.contains('button', 'Confirm')
        .click({ force: true })

      cy.wait(3000)

      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Close")').length > 0) {
          cy.contains('button', 'Close').click({ force: true })
        }
      })

      cy.wait(3000)

      // ORDER BASKET
      cy.get('body').then(($body) => {
        if (!$body.text().includes('Submit Order')) {
          cy.contains('button', 'Order Basket').click({ force: true })
        }
      })

      cy.contains('Submit Order', { timeout: 30000 }).should('be.visible')

      cy.contains('button', 'Submit Order')
        .click({ force: true })

      cy.wait(3000)

      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Close")').length > 0) {
          cy.contains('button', 'Close').click({ force: true })
        }
      })

      cy.wait(3000)

      // MARK TO BILL
      cy.contains('button', 'Mark To Bill')
        .click({ force: true })

      cy.contains('button', 'Continue', { timeout: 30000 })
        .click({ force: true })

      cy.wait(3000)

      cy.contains('Are you sure want to complete Consult?', { timeout: 30000 })
        .should('be.visible')

      cy.contains('button', 'Yes')
        .click({ force: true })

      cy.wait(5000)

      cy.log('Physician consultation completed for MPI: ' + patient.mpi)

    })

  })

})