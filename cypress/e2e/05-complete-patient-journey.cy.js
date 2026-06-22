import { faker } from '@faker-js/faker'

describe('10 Patient Complete Journey', () => {

  for (let patientNo = 1; patientNo <= 10; patientNo++) {

    it(`Patient ${patientNo} - Appointment → Nursing → Physician`, () => {

      const patient = {
        firstName: faker.person.firstName(),
        middleName: faker.person.middleName(),
        lastName: faker.person.lastName(),
        mobile: faker.string.numeric(10),
        email: faker.internet.email(),
        dob: '01-01-1995'
      }

      let mpiNumber = ''

      // ===========================
      // 1. APPOINTMENT WORKFLOW
      // ===========================

      cy.loginToHIS()

      cy.get('div:visible')
        .contains('Front Desk Management')
        .click({ force: true })

      cy.get('input:visible').eq(0).type(patient.firstName)
      cy.get('input:visible').eq(1).type(patient.middleName)
      cy.get('input:visible').eq(2).type(patient.lastName)
      cy.get('input:visible').eq(4).clear().type(patient.dob)
      cy.get('input:visible').eq(5).clear().type(patient.mobile)
      cy.get('input:visible').eq(7).clear().type(patient.email)

      cy.contains('Select').first().click({ force: true })
      cy.contains('Mr.').click({ force: true })

      cy.contains('button', 'Register').click({ force: true })

      cy.wait(3000)

      cy.contains('MPI:')
        .parent()
        .invoke('text')
        .then((text) => {

          const match = text.match(/DWH\d+/)
          mpiNumber = match ? match[0] : ''

          expect(mpiNumber).to.not.equal('')
          cy.log(`Patient ${patientNo} MPI: ${mpiNumber}`)

          cy.writeFile(`cypress/fixtures/patient-${patientNo}.json`, {
            firstName: patient.firstName,
            lastName: patient.lastName,
            mobile: patient.mobile,
            email: patient.email,
            mpi: mpiNumber
          })

          // Appointment
          cy.contains('Appointment').click({ force: true })
          cy.contains('New Appointment').click({ force: true })

          cy.url().should('include', 'appointment-calendar')
          cy.wait(3000)

          cy.get('#SelectDoctors', { timeout: 15000 })
            .should('be.visible')
            .click({ force: true })

          cy.contains('Search Physician', { timeout: 15000 })
            .should('be.visible')

          cy.get('input')
            .filter(':visible')
            .first()
            .clear({ force: true })
            .type('shajeer', { force: true })

          cy.contains('button', 'Search').click({ force: true })

          cy.contains('Mr. Shajeer Ks', { timeout: 15000 })
            .should('be.visible')

          cy.contains('button', 'Select').click({ force: true })

          cy.wait(3000)

          // Select Patient
          cy.get('body').click(835, 345, { force: true })

          cy.contains('Search Patient', { timeout: 15000 })
            .should('be.visible')

          cy.get('input')
            .filter(':visible')
            .first()
            .clear({ force: true })
            .type(mpiNumber, { force: true })

          cy.contains('button', 'Search').click({ force: true })

          cy.contains(mpiNumber, { timeout: 15000 })
            .should('be.visible')

          cy.contains('SELECT').click({ force: true })

          cy.wait(3000)

          cy.contains('Open')
            .first()
            .click({ force: true })

          cy.contains('Book Consult Appointment', { timeout: 15000 })
            .should('be.visible')

          cy.get('body').then(($body) => {
            if (!$body.text().includes('First Visit')) {
              cy.get('.p-dropdown').eq(2).click({ force: true })
              cy.contains('First Visit', { timeout: 10000 }).click({ force: true })
            }
          })

          cy.wait(1000)

          cy.contains('button', 'Book Appointment')
            .click({ force: true })

          cy.contains('Do you want to Mark Arrive Now?', { timeout: 20000 })
            .should('be.visible')

          cy.wait(5000)

          cy.contains('button', 'Yes')
            .click({ force: true })

          cy.wait(5000)

          // Billing Click Here
          cy.contains('Mark Arrive Checklist', { timeout: 30000 })
            .should('be.visible')

          cy.wait(1000)

          cy.get('.p-dialog:visible').then(($dialog) => {

            const dialog = $dialog[0]

            const isVisible = (el) => {
              const rect = el.getBoundingClientRect()
              return rect.width > 0 && rect.height > 0
            }

            const billingElement = [...dialog.querySelectorAll('*')]
              .find((el) => {
                const label = el.innerText ? el.innerText.trim() : ''
                return isVisible(el) && (label === 'Billing' || label === 'Billing*')
              })

            expect(billingElement, 'Billing row found').to.exist

            const billingRect = billingElement.getBoundingClientRect()
            const billingMiddleY = billingRect.top + billingRect.height / 2

            const clickHereElements = [...dialog.querySelectorAll('span.p-button-label')]
              .filter((el) => {
                const label = el.innerText ? el.innerText.trim() : ''
                return isVisible(el) && label === 'Click Here'
              })

            const billingClickHere = clickHereElements.reduce((closest, current) => {
              const currentRect = current.getBoundingClientRect()
              const currentMiddleY = currentRect.top + currentRect.height / 2
              const distance = Math.abs(currentMiddleY - billingMiddleY)

              if (!closest || distance < closest.distance) {
                return { element: current, distance }
              }

              return closest
            }, null)

            cy.wrap(billingClickHere.element).click({ force: true })
          })

          cy.wait(5000)

          cy.contains('Commit & Print', { timeout: 30000 })
            .scrollIntoView()
            .click({ force: true })

          cy.wait(10000)

          cy.contains('Mark Arrive Checklist', { timeout: 30000 })
            .should('be.visible')

          cy.contains('button', 'Mark Arrive')
            .scrollIntoView()
            .click({ force: true })

          cy.wait(5000)

          cy.log(`Appointment completed for Patient ${patientNo}: ${mpiNumber}`)

          // ===========================
          // 2. NURSING WORKFLOW
          // ===========================

          cy.visit('https://v2qa.lifetrenz.com/#/auth/login')
          cy.wait(3000)

          cy.get('input').eq(0).type(Cypress.env('nurseUsername'))
          cy.get('input[type="password"]').type(Cypress.env('nursePassword'))

          cy.contains('button', 'LOGIN').click({ force: true })
          cy.url().should('include', '/home')

          cy.get('div:visible')
            .contains('Outpatient Nursing')
            .click({ force: true })

          cy.contains('Pre-Consultation Q', { timeout: 60000 })
            .should('be.visible')

          cy.contains(mpiNumber, { timeout: 60000 })
            .parents('tr')
            .within(() => {
              cy.contains('button', /Start Nursing|Continue/)
                .click({ force: true })
            })

          cy.wait(3000)

          cy.get('body').then(($body) => {
            if ($body.text().includes('Call Next Patient')) {
              cy.get('.p-dialog')
                .find('span.p-button-label')
                .contains('Start Nursing')
                .click({ force: true })

              cy.wait(5000)
            }
          })

          cy.contains('Casesheet', { timeout: 60000 }).should('be.visible')
          cy.contains('Complete Nursing Assessment', { timeout: 60000 }).should('be.visible')

          // Nursing Allergy
          cy.contains('Allergies')
            .parents('.card-header, .p-card, div')
            .first()
            .find('button')
            .click({ force: true })

          cy.contains('Add Patient Allergy', { timeout: 20000 })
            .should('be.visible')

          cy.get('body').then(($body) => {
            const checked = $body.find('.p-checkbox-box.p-highlight').length > 0

            if (!checked) {
              cy.contains('No Known Allergy')
                .parent()
                .find('.p-checkbox-box')
                .click({ force: true })
            }
          })

          cy.wait(1000)

          cy.get('button[aria-label="Close"], .p-dialog-header-close')
            .first()
            .click({ force: true })

          cy.wait(2000)

          // Nursing HPI
          cy.contains('HPI')
            .parents('.card-header, .p-card, div')
            .first()
            .find('button')
            .click({ force: true })

          cy.contains('Add HPI', { timeout: 20000 })
            .should('be.visible')

          cy.wait(2000)

          cy.get('body').then(($body) => {
            if ($body.text().includes('Update & Exit')) {
              cy.contains('button', 'Close').click({ force: true })
            } else {
              cy.get('.ql-editor')
                .first()
                .click({ force: true })
                .type(
                  'Patient presented with complaints of fever for the past 3 days, associated with severe headache since yesterday. Fever is intermittent, moderate in intensity, and partially relieved with over-the-counter medications. No recent travel history. Patient is hemodynamically stable at presentation.',
                  { force: true }
                )

              cy.contains('button', 'Save & Exit').click({ force: true })
            }
          })

          cy.wait(3000)

          // Nursing Vitals
          cy.contains('Vitals')
            .parents('.card-header, .p-card, div')
            .first()
            .find('button')
            .click({ force: true })

          cy.contains('Vital Signs', { timeout: 20000 }).should('be.visible')

          cy.get('input[placeholder="Enter Height"]').type('170', { force: true })
          cy.get('input[placeholder="Enter Weight"]').type('70', { force: true })
          cy.get('input[placeholder="Enter Temperature"]').type('98.6', { force: true })
          cy.get('input[placeholder="Enter Pulse Rate"]').type('78', { force: true })
          cy.get('input[placeholder*="Enter Res"]').type('18', { force: true })
          cy.get('input[placeholder*="Enter SPO2"]').type('98', { force: true })

          cy.get('input:visible').then(($inputs) => {
            cy.wrap($inputs.eq(6)).type('120', { force: true })
            cy.wrap($inputs.eq(7)).type('80', { force: true })
          })

          cy.contains('button', 'Save & Exit').click({ force: true })

          cy.wait(3000)

          cy.contains('button', 'Complete Nursing Assessment')
            .click({ force: true })

          cy.contains('Are You Sure Want To Complete Nursing?', { timeout: 20000 })
            .should('be.visible')

          cy.contains('button', 'Yes')
            .click({ force: true })

          cy.wait(5000)

          cy.log(`Nursing completed for Patient ${patientNo}: ${mpiNumber}`)

          // ===========================
          // 3. PHYSICIAN WORKFLOW
          // ===========================

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

          cy.contains(mpiNumber, { timeout: 60000 })
            .parents('tr')
            .within(() => {
              cy.contains('button', /Start|Continue/)
                .click({ force: true })
            })

          cy.wait(3000)

          cy.get('body').then(($body) => {
            if ($body.text().includes('Call Next Patient')) {
              cy.contains('button', 'Start-Consult').click({ force: true })
              cy.wait(8000)
            }
          })

          cy.contains('Current Visit', { timeout: 60000 }).should('be.visible')

          // Physician Complaints
          cy.get('body').then(($body) => {
            if (!($body.text().includes('Fever') && $body.text().includes('Headache'))) {
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

          // Physician Diagnosis
          cy.get('body').then(($body) => {
            if (!$body.text().includes('Fever, unspecified')) {
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

          // Order Set
          cy.contains('Order Set')
            .parents('.card-header, .p-card, div')
            .first()
            .find('button')
            .click({ force: true })

          cy.contains('Order Set', { timeout: 30000 }).should('be.visible')

          cy.get('input:visible')
            .first()
            .clear({ force: true })
            .type('orderset-2{enter}', { force: true })

          cy.wait(3000)

          cy.contains('orderset-2', { timeout: 30000 })
            .click({ force: true })

          cy.wait(2000)

          cy.contains('button', 'Confirm').click({ force: true })

          cy.wait(3000)

          cy.get('body').then(($body) => {
            if ($body.find('button:contains("Close")').length > 0) {
              cy.contains('button', 'Close').click({ force: true })
            }
          })

          cy.wait(3000)

          // Order Basket
          cy.get('body').then(($body) => {
            if (!$body.text().includes('Submit Order')) {
              cy.contains('button', 'Order Basket').click({ force: true })
            }
          })

          cy.contains('Submit Order', { timeout: 30000 }).should('be.visible')

          cy.contains('button', 'Submit Order').click({ force: true })

          cy.wait(3000)

          cy.get('body').then(($body) => {
            if ($body.find('button:contains("Close")').length > 0) {
              cy.contains('button', 'Close').click({ force: true })
            }
          })

          cy.wait(3000)

          // Mark To Bill
          cy.contains('button', 'Mark To Bill').click({ force: true })

          cy.contains('button', 'Continue', { timeout: 30000 })
            .click({ force: true })

          cy.wait(3000)

          cy.contains('Are you sure want to complete Consult?', { timeout: 30000 })
            .should('be.visible')

          cy.contains('button', 'Yes').click({ force: true })

          cy.wait(5000)

          cy.log(`Patient ${patientNo} completed successfully: ${mpiNumber}`)

        })

    })

  }

})