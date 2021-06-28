describe('/health and project table tests', function () {
  beforeEach(function () {
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
    });

  });
  it('should check if /health endpoint stats are visible', function () {
    cy.intercept('GET', 'health').as('health');
    cy.visit('/');
    cy.wait('@health', {timeout: 30000});
    cy.get('[data-cy=appHomeHealth]').should('be.visible');
  });
  it('should be able to create a project', function () {
    cy.visit('/');
    cy.intercept('GET', 'get_indices').as('getIndices');
    cy.get('[data-cy=appProjectCreateProject]').should('be.visible').click();
    cy.wait('@getIndices');
    cy.get('[data-cy=appProjectCreateDialogTitle]').then((projTitle => {
      cy.wrap(projTitle).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(projTitle, 'required');
      cy.wrap(projTitle).type('testProject');
    }));

    cy.get('[data-cy=appProjectCreateDialogIndices]').click().then((projIndices => {
      cy.wrap(projIndices).should('have.class', 'mat-focused');
      cy.get('input.mat-select-search-input:last').type('texta_test_index');
      cy.get('.mat-option-text').contains('texta_test_index').should('be.visible').click(); // todo texta test index
      cy.closeCurrentCdkOverlay();
    }));
    cy.intercept('POST', 'projects').as('postProjects');
    cy.intercept('GET', '**/projects/?undefined').as('getProjects');
    cy.get('[data-cy=appProjectCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postProjects');
    cy.wait('@getProjects');
    cy.wait(100); // projectStore, update table
    cy.get('tbody > :nth-child(1) > .cdk-column-title').contains('testProject');
    cy.get(':nth-child(1) > .cdk-column-Modify > .mat-focus-indicator > .mat-button-wrapper > .mat-icon').click();
    cy.intercept('DELETE', '**/projects/**').as('deleteProjects');
    cy.get(':nth-child(1) > .mat-focus-indicator.ng-star-inserted').should('be.visible').contains('Delete').click();
    cy.get('[data-cy=appConfirmDialogSubmit]').should('be.visible').click();
    cy.wait('@deleteProjects').then(x=>{
      cy.wait('@getProjects');
    });
  });
});
