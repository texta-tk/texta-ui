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
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
Cypress.Commands.add('login', (username, password) => {
  cy.get('[data-cy=appSharedLoginDialogUsername]').type(username);
  cy.get('[data-cy=appSharedLoginDialogPassword]').type(password);
  cy.get('[data-cy=appSharedLoginDialogSubmit]').click();
  cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('be.visible');
});
Cypress.Commands.add('matFormFieldShouldHaveError', (element, containsError) => {
  cy.wrap(element)
    .find('mat-error')
    .should('be.visible')
    .find('strong')
    .contains(containsError);
});
Cypress.Commands.add('closeCurrentCdkOverlay', () => {
  cy.get('body').type('{esc}'); // todo better way?
});
