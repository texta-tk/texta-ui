describe('register and login workflows', function () {
  beforeEach(function () {
    cy.visit('/searcher');
    cy.login()
  });
  it('Should be logged in', function () {
    cy.get('[data-cy=navbarLoggedInUserMenu]').should('be.visible');
  });
});
