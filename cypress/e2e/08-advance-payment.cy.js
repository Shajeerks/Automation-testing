import { faker } from '@faker-js/faker'

describe('Advance Payment Collection Workflow', () => {

  it('Register patient and collect advance payment', () => {

    cy.viewport(1920, 1080)

    const patient = {
      firstName: faker.person.firstName(),
      middleName: faker.person.middleName(),
      lastName: faker.person.lastName(),
      mobile: faker.string.numeric(10),
      email: faker.internet.email(),
      dob: '01-01-1995'
    }

    let mpiNumber = ''

    cy.loginToHIS()

    // ===========================
    // REGISTRATION
    // ===========================

    cy.contains('Front Desk Management', { timeout: 30000 })
      .click({ force: true })

    cy.wait(3000)

    cy.get('input:visible').eq(0).clear({ force: true }).type(patient.firstName, { force: true })
    cy.get('input:visible').eq(1).clear({ force: true }).type(patient.middleName, { force: true })
    cy.get('input:visible').eq(2).clear({ force: true }).type(patient.lastName, { force: true })
    cy.get('input:visible').eq(4).clear({ force: true }).type(patient.dob, { force: true })
    cy.get('input:visible').eq(5).clear({ force: true }).type(patient.mobile, { force: true })
    cy.get('input:visible').eq(7).clear({ force: true }).type(patient.email, { force: true })

    cy.contains('Select', { timeout: 30000 }).first().click({ force: true })
    cy.contains('Mr.', { timeout: 10000 }).click({ force: true })

    cy.contains('button', 'Register', { timeout: 30000 })
      .click({ force: true })

    cy.wait(3000)

    cy.contains('MPI:', { timeout: 30000 })
      .parent()
      .invoke('text')
      .then((text) => {
        const match = text.match(/MPI:\s*([A-Z0-9]+)/i)
        mpiNumber = match ? match[1].trim() : ''

        cy.log('Captured MPI: ' + mpiNumber)
        expect(mpiNumber).to.not.equal('')

        cy.writeFile('cypress/fixtures/advance-patient.json', {
          firstName: patient.firstName,
          lastName: patient.lastName,
          mobile: patient.mobile,
          email: patient.email,
          mpi: mpiNumber
        })
      })

    // ===========================
    // OPEN ADVANCE PAYMENT
    // ===========================

    cy.then(() => {

      cy.contains('Billing', { timeout: 30000 })
        .scrollIntoView()
        .click({ force: true })

      cy.wait(1000)

      cy.contains('Advance Payment', { timeout: 30000 })
        .scrollIntoView()
        .click({ force: true })

      cy.contains('Patient Ledger', { timeout: 30000 })
        .should('be.visible')

      cy.wait(2000)

      // ===========================
      // ===========================
// SEARCH PATIENT FROM TOP SEARCH FIELD
// ===========================

cy.get('input[placeholder*="Search Patient"]', { timeout: 30000 })
  .should('be.visible')
  .clear({ force: true })
  .type(patient.firstName, { force: true })
  .type('{enter}', { force: true })

cy.wait(3000)

// Select the radio button from displayed result for captured MPI
cy.contains('tr', mpiNumber, { timeout: 30000 })
  .should('be.visible')
  .within(() => {
    cy.get('.p-radiobutton-box, input[type="radio"]')
      .first()
      .click({ force: true })
  })

cy.wait(3000)

cy.contains('No patient selected')
  .should('not.exist')

      // ===========================
// ===========================
// ADVANCE TAB
// ===========================

// Click the exact Advance tab: li[2]
cy.get('p-tabmenu ul li')
  .eq(1)
  .find('a')
  .click({ force: true })

cy.wait(3000)

// Confirm Advance tab selected
cy.get('p-tabmenu ul li')
  .eq(1)
  .should('have.class', 'p-highlight')

// Click Add Advance after tab loads
cy.get('body').then(($body) => {
  if ($body.text().includes('Add Advance')) {
    cy.contains('button, span', 'Add Advance', { timeout: 30000 })
      .click({ force: true })
  } else {
    cy.log('Add Advance button not found after selecting Advance tab')
  }
})
      // ===========================
      // ===========================
// CASH PAYMENT - 1000
// ===========================

cy.contains('Payment Mode', { timeout: 30000 })
  .parent()
  .find('.p-dropdown')
  .first()
  .click({ force: true })

cy.contains('.p-dropdown-item, li, span', 'Cash', { timeout: 10000 })
  .click({ force: true })

cy.get('input[placeholder="Amount"]', { timeout: 30000 })
  .filter(':visible')
  .first()
  .clear({ force: true })
  .type('1000', { force: true })

// Click yellow payment add icon
cy.get('.p-dialog:visible')
  .find('button')
  .filter(':visible')
  .then(($buttons) => {
    const plusButton = [...$buttons].find((btn) => {
      return btn.querySelector('.pi-plus') || btn.innerText.trim() === '+'
    })

    expect(plusButton, 'Cash plus button found').to.exist

    cy.wrap(plusButton)
      .click({ force: true })
  })

cy.wait(2000)

// ===========================
// ONLINE PAYMENT - 2000
// ===========================

// Select Payment Mode dropdown
cy.xpath('/html/body/app-root/app-layout/div/div/div/lib-fdm-main/lib-patient-advance-ledger/div/div/div[3]/div/app-service-order-advance/p-dialog[2]/div/div/div[3]/div[2]/div/app-new-payment/div/div/form/div[1]/div[1]/p-dropdown/div/div')
  .should('be.visible')
  .click({ force: true })

cy.wait(1000)

// Select Online
cy.contains('Online', { timeout: 10000 })
  .should('be.visible')
  .click({ force: true })

cy.wait(1000)

// Select Online Type dropdown
cy.xpath('/html/body/app-root/app-layout/div/div/div/lib-fdm-main/lib-patient-advance-ledger/div/div/div[3]/div/app-service-order-advance/p-dialog[2]/div/div/div[3]/div[2]/div/app-new-payment/div/div/form/div[1]/div[2]/p-dropdown/div/div')
  .should('be.visible')
  .click({ force: true })

cy.wait(1000)

// Select UPI
cy.contains('UPI', { timeout: 10000 })
  .should('be.visible')
  .click({ force: true })

cy.wait(1000)

// Amount
cy.get('input[placeholder="Amount"]')
  .filter(':visible')
  .first()
  .clear({ force: true })
  .type('2000', { force: true })

// Bank Name
cy.get('input[placeholder="Bank Name"]')
  .filter(':visible')
  .first()
  .clear({ force: true })
  .type('HDFC', { force: true })

// Transaction ID
cy.get('input[placeholder="Transaction ID"]')
  .filter(':visible')
  .first()
  .clear({ force: true })
  .type('123456', { force: true })

cy.wait(1000)

// Add Online Payment
cy.get('.p-dialog:visible')
  .find('.pi-plus')
  .should('be.visible')
  .click({ force: true })

cy.wait(3000)

// Verify amount updated
cy.contains('₹2,000.00', { timeout: 10000 })
  .should('exist')

      // ===========================
      // COMMIT & PRINT
      // ===========================

      cy.contains('button', 'Commit & Print', { timeout: 30000 })
        .scrollIntoView()
        .click({ force: true })

      cy.contains('Are you sure you want to print Receipt', { timeout: 30000 })
        .should('be.visible')

      cy.contains('button', 'Yes', { timeout: 30000 })
        .click({ force: true })

      cy.wait(5000)

      cy.log('Advance payment collected for MPI: ' + mpiNumber)
    })
  })
})