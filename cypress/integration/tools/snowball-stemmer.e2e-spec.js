describe('SnowballStemmer should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/apply_snowball/**').as('getSnowballStemmerTasks');
        cy.intercept('OPTIONS', '**/apply_snowball/**').as('optionsSnowballStemmerTasks');
        cy.intercept('DELETE', '**/apply_snowball/**').as('bulkDeleteSnowballStemmerTasks');
        cy.intercept('POST', '**/apply_snowball/**').as('createSnowballStemmerTask');
      });
    });
  });

  function initSnowballStemmerPage() {
    cy.visit('/snowball-stemmer');
    cy.wait('@getSnowballStemmerTasks');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('should be able to create a new SnowballStemmer task', function () {
    initSnowballStemmerPage();
    cy.get('[data-cy=appSnowballStemmerCreateBtn]').should('be.visible').click();
    cy.wait('@optionsSnowballStemmerTasks');
    cy.get('[data-cy=appSnowballStemmerCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testSnowballStemmer');
    }));
    cy.get('[data-cy=appSnowballStemmerCreateDialogLanguages]').click().then((analyzers => {
      cy.wrap(analyzers).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.wrap(analyzers).find('mat-error').should('be.visible');
      cy.wrap(analyzers).click();
      cy.get('.mat-option-text:nth(2)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(analyzers).find('mat-error').should('have.length', 0);
    }));
    cy.get('[data-cy=appSnowballStemmerCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('comment_content').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appSnowballStemmerCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@createSnowballStemmerTask').then(created => {
      expect(created.response.statusCode).to.eq(201);
      assert.equal(created.response.body.task.status, 'created');
    });
    cy.get('.mat-header-row > .cdk-column-id').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0]).each(y => { // hack to wait for task to complete
        cy.wrap(bb).click();
        return cy.wait('@getSnowballStemmerTasks').then((x) => {
          if (x?.response?.body?.results[0]?.task?.status === 'completed') {
            assert.equal(x?.response?.body?.results[0]?.task?.status, 'completed');
            return false;
          }
          return cy.wait(5000);
        });
      })
    });
  });
});