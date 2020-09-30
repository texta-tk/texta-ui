describe('mlp should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.server();
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.route('GET', '**user**').as('getUser');
        cy.route('GET', '**get_fields**').as('getProjectIndices');
        cy.route('GET', '**/mlp_index/**').as('getMLPTasks');
        cy.route('OPTIONS', '**/mlp_index/**').as('optionsMLPTasks');
        cy.route('DELETE', '**/mlp_index/**').as('bulkDeleteMLPTasks');
        cy.route('POST', '**/mlp_index/**').as('createMLPTask');
        cy.route('POST', '**/mlp/texts/**').as('MLPTexts');
      });
    });
  });

  function initMLPPage() {
    cy.visit('/mlp');
    cy.wait('@getMLPTasks');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('should be able to create a new MLP task', function () {
    initMLPPage();
    cy.get('[data-cy=appToolsMLPCreateBtn]').should('be.visible').click();
    cy.wait('@optionsMLPTasks');
    cy.get('[data-cy=appMLPCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testMLP');
    }));
    cy.get('[data-cy=appMLPCreateDialogAnalyzers]').click().then((analyzers => {
      cy.wrap(analyzers).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(analyzers, '1 analyzer');
      cy.wrap(analyzers).click();
      cy.get('.mat-option > .mat-pseudo-checkbox:first()').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(analyzers).find('mat-error').should('have.length', 0);
    }));
    cy.get('[data-cy=appMLPCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@createMLPTask').then(created => {
      expect(created.status).to.eq(201);
      assert.equal(created.response.body.task.status, 'created');
    });
    cy.get('.mat-header-row > .cdk-column-id').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0, 0, 0, 0, 0, 0]).each(y => { // hack to wait for task to complete
        cy.wrap(bb).click();
        return cy.wait('@getMLPTasks').then((x) => {
          if (x?.response?.body?.results[0]?.task?.status === 'completed') {
            assert.equal(x?.response?.body?.results[0]?.task?.status, 'completed');
            return false;
          }
          return cy.wait(10000);
        });
      })
    });

    cy.get('[data-cy=appToolsMLPApplyTextBtn]').click();
    cy.wait('@optionsMLPTasks');
    cy.get('[data-cy=appMLPApplyDialogText]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('Eesti autopargi läbisoit on 5455 miljonilt autokilomeetrilt 1995. aastal kasvanud 6535 miljonile autokilomeetrile 2001. aastal, ehk 19,8%. 2001. aastal oli soiduautode aasta keskmine läbisoit registris oleva soiduauto kohta 12861 km, bussidel oli 30800 km ja veoautodel 14000 km.');
    }));
    cy.get('[data-cy=appMLPApplyDialogAnalyzers]').click().then((analyzers => {
      cy.wrap(analyzers).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(analyzers, '1 analyzer');
      cy.wrap(analyzers).click();
      cy.get('.mat-option > .mat-pseudo-checkbox:first()').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(analyzers).find('mat-error').should('have.length', 0);
    }));

    cy.get('[data-cy=appMLPApplyDialogSubmit]').should('be.visible').click();
    cy.wait('@MLPTexts').then(created => {
      expect(created.status).to.eq(200);
    });
  });
});
