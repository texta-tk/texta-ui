describe('should be able to build searches', function () {
  beforeEach(function () {
    cy.server();
    cy.route('GET', 'health').as('health');
    cy.route('GET', 'user').as('user');
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.visit('/');
    });

    cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('be.visible');
  });
  it('should check if /health endpoint stats are visible', function () {
    cy.wait('@health', {timeout: 6000});
    cy.get('[data-cy=appHomeHealth]').should('be.visible');
  });
  it('should be able to create a project', function () {
    cy.wait('@user');
    cy.get('[data-cy=appProjectCreateProject]').should('be.visible').click();
    cy.get('[data-cy=appProjectCreateDialogTitle]').then((projTitle => {
      cy.wrap(projTitle).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(projTitle, 'required');
      cy.wrap(projTitle).type('testProject');
    }));
    cy.get('[data-cy=appProjectCreateDialogUsers]').click().then((projUsers => {
      cy.wrap(projUsers).should('have.class', 'mat-focused');
      // todo currently best way to close a mat select?
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(projUsers, 'required');
      cy.wrap(projUsers).click();
      cy.fixture('users').then((user) => {
        cy.get('.mat-option-text').contains(user.username).should('be.visible').click();
      });
      cy.closeCurrentCdkOverlay();
      cy.wrap(projUsers).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appProjectCreateDialogIndices]').click().then((projIndices => {
      cy.wrap(projIndices).should('have.class', 'mat-focused');
      // todo currently best way to close a mat select?
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(projIndices, 'required');
      cy.wrap(projIndices).click();
      cy.fixture('projects').then((projects) => {
        console.log(projects[0].indices[0]);
        cy.get('.mat-option-text').contains(projects[0].indices[0]).should('be.visible').click();
      });
      cy.closeCurrentCdkOverlay();
      cy.wrap(projIndices).find('mat-error').should('have.length', 0);
    }));
    cy.get('[data-cy=appProjectCreateDialogSubmit]').should('be.visible').click();
    // todo appProjectCreateDialogIndices
  });
});
