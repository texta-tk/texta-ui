describe('should be able to build searches', function () {
  beforeEach(function () {
    cy.server();
    cy.route('GET', '**projects**', 'fixture:projects.json');
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.visit('/searcher');
    });

    cy.get('[data-cy=navbarLoggedInUserMenu]').should('be.visible');
    cy.get('[data-cy=navbarProjectSelect]').click();
    cy.get('mat-option').should('to.have.length', 1).click();
  });
  it('should display search results in a table', function () {
    cy.get('[data-cy=buildSearchSubmit]').click();
    cy.route('POST', 'search_by_query').as('searcherQuery');
    cy.wait('@searcherQuery');
    cy.get('.mat-paginator-navigation-next').click();
    cy.wait('@searcherQuery');
    cy.get('.mat-paginator-navigation-last').click();
    cy.wait('@searcherQuery');
    cy.get('.mat-paginator-navigation-first').click();
    cy.wait('@searcherQuery');
    // todo test
  });
});
