describe('Procurement - PR Creation Workflow', () => {

  it('Login and open New Purchase Request screen', () => {

    cy.visit('https://v2qa.lifetrenz.com/#/auth/login')
    cy.wait(3000)

    cy.get('input').eq(0).type('shajeer')
    cy.get('input[type="password"]').type('123456')

    cy.contains('button', 'LOGIN').click({ force: true })

    cy.url().should('include', '/home')
    cy.wait(3000)

    cy.contains('button', 'Show more', { timeout: 30000 })
      .click({ force: true })

    cy.wait(2000)

    cy.contains('Procurement', { timeout: 30000 })
      .click({ force: true })

    cy.wait(5000)

    cy.contains('Create Purchase Request', { timeout: 30000 })
      .click({ force: true })

    cy.wait(3000)

    cy.contains('button', 'New PR', { timeout: 30000 })
      .click({ force: true })

    cy.contains('Purchase Request', { timeout: 30000 })
      .should('be.visible')

    cy.wait(2000)

    // Requesting Store
cy.get('.p-dropdown:visible').eq(1).click({ force: true })
cy.contains('li, span', 'dWise Healthcare').click({ force: true })
cy.wait(1000)

// Purchasing Store
cy.get('.p-dropdown:visible').eq(4).click({ force: true })
cy.contains('li, span', 'dWise Healthcare').click({ force: true })
cy.wait(1000)

// Purchase Type
cy.get('.p-dropdown:visible').eq(5).click({ force: true })
cy.contains('li, span', 'Central').click({ force: true })
cy.wait(1000)

// Item Type
cy.get('.p-dropdown:visible').eq(6).click({ force: true })
cy.contains('li, span', 'Item').click({ force: true })
cy.wait(1000)

// PR Priority
cy.get('.p-dropdown:visible').eq(7).click({ force: true })
cy.contains('li, span', 'Regular').click({ force: true })
cy.wait(1000)

cy.contains('button', 'Add Items').click({ force: true })

    // Now click Add Items
    cy.contains('button', 'Add Items', { timeout: 30000 })
      .click({ force: true })

    cy.wait(3000)

    cy.log('Dropdowns selected and Add Items clicked successfully')

  })

})