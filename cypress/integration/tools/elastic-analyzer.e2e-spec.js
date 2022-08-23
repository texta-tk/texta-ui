describe('Elastic Analyzer should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/elastic/snowball/').as('getSnowballLanguages');
        cy.intercept('POST', '**/elastic/snowball/').as('postSnowballLanguages');
        cy.intercept('POST', '**/apply_analyzers/bulk_delete/').as('postBulkDeleteElasticAnalyzers');
        cy.intercept('GET', '**/apply_analyzers/**').as('getElasticAnalyzerTasks');
        cy.intercept('OPTIONS', '**/apply_analyzers/**').as('optionsElasticAnalyzerTasks');
        cy.intercept('DELETE', '**/apply_analyzers/**').as('bulkDeleteElasticAnalyzerTasks');
        cy.intercept('POST', '**/apply_analyzers/**').as('createElasticAnalyzerTask');
      });
    });
  });

  function initElasticAnalyzerPage() {
    cy.visit('/elastic-analyzer');
    cy.wait('@getElasticAnalyzerTasks');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('should be able to create a new ElasticAnalyzer task', function () {
    initElasticAnalyzerPage();
    cy.get('[data-cy=appElasticAnalyzerCreateBtn]').should('be.visible').click();
    cy.wait('@optionsElasticAnalyzerTasks');
    cy.get('[data-cy=appElasticAnalyzerCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testElasticAnalyzer');
    }));

    cy.get('[data-cy=appElasticAnalyzerCreateDialogAnalyzers]').click().then((analyzers => {
      cy.wrap(analyzers).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(analyzers, 'required');
      cy.wrap(analyzers).click();
      cy.get('.mat-option-text').contains('tokenizer').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(analyzers).find('mat-error').should('have.length', 0);
    }));
    cy.get('[data-cy=appElasticAnalyzerCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('comment_content').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appElasticAnalyzerCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@createElasticAnalyzerTask').then(created => {
      expect(created.response.statusCode).to.eq(201);
      assert.equal(created.response.body.tasks[0].status, 'created');
    });
    cy.get('.mat-header-row > .cdk-column-id').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0]).each(y => { // hack to wait for task to complete
        cy.wrap(bb).click();
        return cy.wait('@getElasticAnalyzerTasks').then((x) => {
          if (x?.response?.body?.results[0]?.tasks[0]?.status === 'completed') {
            assert.equal(x?.response?.body?.results[0]?.tasks[0]?.status, 'completed');
            return false;
          }
          return cy.wait(5000);
        });
      })
    });

    cy.get('[data-cy=appToolsElasticApplyStemmerToTextBtn]').click()
    cy.wait('@getSnowballLanguages');
    cy.get('[data-cy=appElasticStemmerApplyDialogText]').then((text => {
      cy.wrap(text).should('have.class', 'mat-focused').type('b').find('textarea').clear();
      cy.matFormFieldShouldHaveError(text, 'required');
      cy.wrap(text).type('arvati Silver Semiskarile mõistetud 9 aasta ja 6 kuu pikkusest vangistusest maha eelmise kohtuotsusega mõistetud karistuse ärakantud osa ja lõplikuks karistuseks mõisteti Silver Semiskarile 4 aastat 2 kuud ja 15 päeva vangistust, kandmise algusega 20. septembrist 2018;', {delay: 0});
    }));
    cy.get('[data-cy=appElasticStemmerApplyDialogLanguage]').click().then((langs => {
      cy.wrap(langs).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(langs, 'required');
      cy.wrap(langs).click();
      cy.get('.mat-option-text').contains(new RegExp(' estonian ', '')).click();
      cy.wrap(langs).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appElasticStemmerApplyDialogSubmit]').click()
    cy.wait('@postSnowballLanguages').its('response.statusCode').should('eq', 200);
    cy.get('.mat-expansion-panel-body').should('be.visible');
    cy.closeCurrentCdkOverlay();

    cy.get('.mat-header-row > .cdk-column-select >').click();
    cy.get('[data-cy=appElasticAnalyzerDeleteBtn]').click();
    cy.get('[data-cy=appConfirmDialogSubmit]').click();
    cy.wait('@postBulkDeleteElasticAnalyzers').its('response.statusCode').should('eq', 200);
    cy.get('.cdk-column-id').should('have.length', 1);
  });
});
