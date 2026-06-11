describe("HIS Login Test", () => {
  it("should login successfully to Lifetrenz HIS", () => {
    cy.visit("/");

    cy.get('input[type="text"], input[name="username"]')
      .first()
      .type(Cypress.env("username"));

    cy.get('input[type="password"]')
      .type(Cypress.env("password"));

    cy.contains("button", /login|sign in/i)
      .click();

    cy.url().should("not.include", "login");
  });
});