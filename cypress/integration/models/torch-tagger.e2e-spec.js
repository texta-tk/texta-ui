describe('torchTagger extra actions should work', function () {
  beforeEach(function () {
    cy.visit('/');
    cy.server();
    cy.route('GET', '**user**').as('getUser');
    cy.route('GET', '**get_fields**').as('getProjectFields');
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.wait('@getUser');
      cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('be.visible');
      cy.get('[data-cy=appNavbarModels]').should('be.visible').click();
      cy.route('GET','**/torchtaggers/**').as('getTorchTaggers');
      cy.get('[ng-reflect-router-link="torchtaggers"]').should('be.visible').click();
      cy.wait('@getTorchTaggers');
    });
    cy.wait('@getProjectFields');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  });
  it('extra_actions should work', function () {
    cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appTorchTaggerMenuTagText]').should('be.visible').click();
    // phrase
    cy.get('app-torch-tag-text-dialog input:first()').should('be.visible').click()
      .clear()
      .type('Kinnipeetavate arvu vähenedes nende ülalpidamiskulud suurenevad. ');
    cy.route('POST', '**/torchtaggers/**').as('postTorchTaggers');
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.wait('@postTorchTaggers');
    cy.closeCurrentCdkOverlay();
  });
});
