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
  return cy.clearCookies({domain: null}).then(()=>{ cy.request('POST', `${Cypress.env('api_host')}${Cypress.env('api_basePath')}/rest-auth/login/`, {
    username: username,
    password: password
  }).then(resp => {
    localStorage.setItem('user', JSON.stringify({key: resp.body.key}));
  })});
});
Cypress.Commands.add('createTestProject', () => {
  return cy.clearCookies({domain: null}).then(()=>{ cy.request({method: 'POST', url:`${Cypress.env('api_host')}${Cypress.env('api_basePath')}/projects/`,
    body:{"indices": ["texta_test_index"], "users": ["http://localhost/api/v1/users/1/"], "title": "integration_test_project"},
    headers: {'Authorization':'Token ' + JSON.parse(localStorage.getItem('user')).key}}).then(x => {
    console.log(x);
  })});
});
Cypress.Commands.add('createTestSavedSearch', (projectId) => {
  return cy.clearCookies({domain: null}).then(()=>{ cy.request({method: 'POST', url:`${Cypress.env('api_host')}${Cypress.env('api_basePath')}/projects/${projectId}/searches/`,
    body:{"query_constraints":"[{\"fields\":[{\"path\":\"comment_content\",\"type\":\"text\"}],\"match\":\"phrase_prefix\",\"slop\":\"0\",\"text\":\"tere\",\"operator\":\"must\"}]","description":"tere","query":"{\"query\":{\"bool\":{\"must\":[],\"filter\":[],\"must_not\":[],\"should\":[{\"bool\":{\"must\":[{\"bool\":{\"should\":[{\"multi_match\":{\"query\":\"tere\",\"type\":\"phrase_prefix\",\"slop\":\"0\",\"fields\":[\"comment_content\"]}}],\"minimum_should_match\":1}}]}}],\"minimum_should_match\":1}},\"highlight\":{\"pre_tags\":[\"<TEXTA_SEARCHER_HIGHLIGHT_START_TAG>\"],\"post_tags\":[\"<TEXTA_SEARCHER_HIGHLIGHT_END_TAG>\"],\"number_of_fragments\":0,\"fields\":{\"comment_content\":{}}},\"from\":0,\"size\":10}"},
    headers: {'Authorization':'Token ' + JSON.parse(localStorage.getItem('user')).key}}).then(x => {
    console.log(x);
  })});
});
Cypress.Commands.add('deleteUser', (url) => {
  cy.clearCookies({domain: null}).then(cookie=>{
    cy.request({
      method: 'DELETE',
      url: url,
      headers: {'Authorization':'Token ' + JSON.parse(localStorage.getItem('user')).key}
    });
  });

  /*  cy.request('DELETE', `${Cypress.env('api_host')}${Cypress.env('api_basePath')}/users/`,
      {"indices": ["texta_test_index"], "users": ["http://localhost/api/v1/users/1/"], "title": "test"}).then(x => {
      console.log(x);
    })*/
});
Cypress.Commands.add('matFormFieldShouldHaveError', (element, containsError) => {
  cy.wrap(element)
    .find('mat-error')
    .should('be.visible')
    .find('strong')
    .contains(containsError);
});
Cypress.Commands.add('closeCurrentCdkOverlay', () => {
  cy.get('.cdk-overlay-backdrop:last()').click(-50, -50, {force: true});
});
