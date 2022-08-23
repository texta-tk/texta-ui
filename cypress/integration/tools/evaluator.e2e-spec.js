describe('Evaluator should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/evaluators/**').as('getEvaluators');
        cy.intercept('POST', '**/evaluators/**').as('postEvaluator');
        cy.intercept('PATCH', '**/evaluators/**').as('patchEvaluator');
      });
    });
  });

  function initEvaluatorPage() {
    cy.visit('/evaluators');
    cy.wait('@getEvaluators');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('Evaluators should work', function () {
    initEvaluatorPage();
    cy.get('[data-cy=appEvaluatorCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appEvaluatorCreateBtnMenuMultilabel]').click()
    cy.get('[data-cy=appEvaluatorCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testEvaluator');
    }));

    cy.get('[data-cy=appEvaluatorCreateDialogTrueFactName]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('TEEMA').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));

    cy.get('[data-cy=appEvaluatorCreateDialogPredictedFactName]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('TEEMA').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));

    cy.get('[data-cy=appEvaluatorCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postEvaluator').then(created => {
      expect(created.response.statusCode).to.eq(201);
    });

    cy.get('.mat-header-row > .cdk-column-description').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0]).each(y => { // hack to wait for task to complete
        cy.wrap(bb).click();
        return cy.wait('@getEvaluators').then((x) => {
          if (x?.response?.body?.results[0]?.tasks[0]?.status === 'completed') {
            assert.equal(x?.response?.body?.results[0]?.tasks[0]?.status, 'completed');
            return false;
          }
          return cy.wait(2000);
        });
      })
    });
    cy.wait(2000);
    //FilteredAverage
    cy.get('.cdk-column-Modify:nth(1)').click();
    cy.get('[data-cy=appEvaluatorMenuFilteredAverage]').click();
    cy.wait('@postEvaluator').its('response.statusCode').should('eq', 200);
    cy.closeCurrentCdkOverlay();
    //IndividualResults
    cy.get('.cdk-column-Modify:nth(1)').click();
    cy.get('[data-cy=appEvaluatorMenuIndividualResults]').click();
    cy.wait('@postEvaluator').its('response.statusCode').should('eq', 200);
    cy.closeCurrentCdkOverlay();
    //edit
    cy.get('.cdk-column-Modify:nth(1)').click();
    cy.get('[data-cy=appEvaluatorMenuEdit]').click();
    cy.get('[data-cy=appEvaluatorEditDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testEvaluator2');
    }));
    cy.get('[data-cy=appEvaluatorEditDialogSubmit]').should('be.visible').click();
    cy.wait('@patchEvaluator').its('response.statusCode').should('eq', 200);

  });
});
