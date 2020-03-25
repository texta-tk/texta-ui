describe('tagger extra actions should work', function () {
  beforeEach(function () {
    cy.visit('/');
    cy.server();
    cy.route('GET', '**user**').as('getUser');
    cy.route('GET', '**projects**').as('projects');
    cy.route('GET', '**get_fields**').as('getProjectFields');
    cy.route('POST', 'search_by_query').as('searcherQuery');
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.wait('@getUser');
      cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('be.visible');
      cy.get('[data-cy=appNavbarModels]').should('be.visible').click();
      cy.route('GET','**/taggers/**').as('getTaggers');
      cy.get('[ng-reflect-router-link="taggers"]').should('be.visible').click();
      cy.wait('@getTaggers');
    });
    cy.wait('@getProjectFields');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  });
  it('extra_actions should work', function () {
    cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
    cy.get('.mat-menu-content button:first()').should('be.visible').click();
  });
});
