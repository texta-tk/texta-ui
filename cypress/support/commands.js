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
Cypress.Commands.add('login', function () {
  cy.fixture('users').as('usersJSON');
  console.log(this.usersJSON);
  // todo

  cy.request({
    method: 'POST',
    url: '/api/v1/rest-auth/login',
    body: {
      username: this.usersJSON.username,
      password: this.usersJSON.password,
    }
  }).then((resp) => {
    console.log(resp);
    window.localStorage.setItem('user', resp.body.key)
  })

});
