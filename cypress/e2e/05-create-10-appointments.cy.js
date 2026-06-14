import { faker } from '@faker-js/faker'

describe('Create 10 Appointments in One Login', () => {

  it('Create 10 appointments continuously', () => {

    cy.loginToHIS()

    for (let i = 1; i <= 10; i++) {

      cy.log(`Starting appointment ${i}`)

      const patient = {
        firstName: faker.person.firstName(),
        middleName: faker.person.middleName(),
        lastName: faker.person.lastName(),
        mobile: faker.string.numeric(10),
        email: faker.internet.email(),
        dob: '01-01-1995'
      }

      let mpiNumber = ''

      cy.get('div:visible')
        .contains('Front Desk Management', { timeout: 30000 })
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

          cy.log('Captured MPI: ' + mpiNumber)
          expect(mpiNumber).to.not.equal('')

          cy.writeFile(`cypress/fixtures/patient-${i}.json`, {
            firstName: patient.firstName,
            lastName: patient.lastName,
            mobile: patient.mobile,
            email: patient.email,
            mpi: mpiNumber
          })

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

          cy.contains('button', 'Search')
            .click({ force: true })

          cy.contains('Mr. Shajeer Ks', { timeout: 15000 })
            .should('be.visible')

          cy.contains('button', 'Select')
            .click({ force: true })

          cy.wait(3000)

          cy.get('body').click(835, 345, { force: true })

          cy.contains('Search Patient', { timeout: 15000 })
            .should('be.visible')

          cy.get('input')
            .filter(':visible')
            .first()
            .clear({ force: true })
            .type(mpiNumber, { force: true })

          cy.contains('button', 'Search')
            .click({ force: true })

          cy.contains(mpiNumber, { timeout: 15000 })
            .should('be.visible')

          cy.contains('SELECT')
            .click({ force: true })

          cy.wait(3000)

          cy.contains('Open')
            .first()
            .click({ force: true })

          cy.contains('Book Consult Appointment', { timeout: 15000 })
            .should('be.visible')

          cy.get('body').then(($body) => {
            const hasFirstVisitSelected = $body.text().includes('First Visit')

            if (!hasFirstVisitSelected) {
              cy.get('.p-dropdown')
                .eq(2)
                .click({ force: true })

              cy.contains('First Visit', { timeout: 10000 })
                .click({ force: true })
            }
          })

          cy.wait(1000)

          cy.contains('button', 'Book Appointment')
            .click({ force: true })

          cy.contains('Do you want to Mark Arrive Now?', { timeout: 20000 })
            .should('be.visible')

          cy.wait(5000)

          cy.contains('button', 'Yes')
            .should('be.visible')
            .click({ force: true })

          cy.wait(5000)

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

            expect(billingElement, 'Billing row label found').to.exist

            const billingRect = billingElement.getBoundingClientRect()
            const billingMiddleY = billingRect.top + billingRect.height / 2

            const clickHereElements = [...dialog.querySelectorAll('span.p-button-label')]
              .filter((el) => {
                const label = el.innerText ? el.innerText.trim() : ''
                return isVisible(el) && label === 'Click Here'
              })

            expect(clickHereElements.length, 'Click Here buttons found').to.be.greaterThan(0)

            const billingClickHere = clickHereElements.reduce((closest, current) => {
              const currentRect = current.getBoundingClientRect()
              const currentMiddleY = currentRect.top + currentRect.height / 2
              const distance = Math.abs(currentMiddleY - billingMiddleY)

              if (!closest || distance < closest.distance) {
                return { element: current, distance }
              }

              return closest
            }, null)

            cy.wrap(billingClickHere.element)
              .click({ force: true })
          })

          cy.wait(5000)

          cy.contains('Commit & Print', { timeout: 30000 })
            .scrollIntoView()
            .should('be.visible')
            .click({ force: true })

          cy.wait(10000)

          cy.contains('Mark Arrive Checklist', { timeout: 30000 })
            .should('be.visible')

          cy.contains('button', 'Mark Arrive')
            .scrollIntoView()
            .click({ force: true })

          cy.wait(5000)

          cy.log(`Appointment ${i} completed. MPI: ${mpiNumber}`)

          // Go back home before next appointment
          cy.visit('https://v2qa.lifetrenz.com/#/home')
          cy.wait(3000)

        })

    }

  })

})