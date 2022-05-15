describe('lexicons should work', function () {
  beforeEach(function () {
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
      });
    });
  });
  it('should be able to create a new lexcion, save words, get new suggestions', function () {
    cy.importTestEmbedding(this.projectId).then(x => {

      cy.intercept('GET', '**user**').as('getUser');
      cy.intercept('GET', '**get_fields**').as('getProjectIndices');
      cy.intercept('GET', '**/lexicons/**').as('getLexicons');
      cy.intercept('DELETE', '**/lexicons/**').as('deleteLexicons');
      cy.intercept('POST', '**/lexicons/**').as('postLexicons');
      cy.intercept('PATCH', '**/lexicons/**').as('patchLexicons');
      cy.intercept('GET', '**/embeddings/**').as('getEmbeddings');
      cy.visit('/lexicons');

      cy.wait('@getProjectIndices');
      cy.wait('@getLexicons')
      cy.get('[data-cy=appNavbarProjectSelect]').click();
      cy.get('mat-option').contains('integration_test_project').click();

      cy.get('[data-cy=appLexiconCreateBtn]').click();

      cy.get('[data-cy=appLexiconCreateDialogDesc]').should('be.visible').click().type('testLex');
      cy.get('[type="submit"]').click();
      cy.wait('@postLexicons').then(created => {
        expect(created.response.statusCode).to.eq(201);
      });

      cy.get('[data-cy=appLexiconCreateBtn]').click();

      cy.get('[data-cy=appLexiconCreateDialogDesc]').should('be.visible').click().type('testLex2');
      cy.get('[type="submit"]').click();
      cy.wait('@postLexicons').then(created => {
        expect(created.response.statusCode).to.eq(201);
      });
      cy.get('.element-row:first()').click();
      cy.wait('@getEmbeddings');
      cy.get('[data-cy=appLexiconEmbedding]').click();
      cy.get('.mat-option:first()').click();
      cy.get('[data-cy=appLexiconPositiveUsedWords]').type('pede');
      cy.intercept('POST', '**/embeddings/**').as('postEmbeddings');
      cy.get('[data-cy=appLexiconNewSuggestionsBtn]').click();
      cy.wait('@postEmbeddings').then(intercepted => {
        cy.wrap(intercepted).its('response.statusCode').should('eq', 200);
        cy.get('.suggestions > .flex-col > :nth-child(1)').click();
      });
      cy.get('[data-cy=appLexiconSaveBtn]').click();
      cy.wait('@patchLexicons').then(intercepted => {
        cy.wrap(intercepted).its('response.statusCode').should('eq', 200);
      });
      cy.get('.breadcrumb > :nth-child(1)').click();
      cy.wait('@getLexicons');

      cy.get('[data-cy=appLexiconMergeBtn]').click();
      cy.wait('@getLexicons');
      cy.wait(200);

      cy.get('[data-cy=appMergeLexiconDialogTarget]').click();
      cy.get('mat-option:nth(1)').click()

      cy.get('[data-cy=appMergeLexiconDialogSource]').click();
      cy.get('mat-option:last()').click()
      cy.closeCurrentCdkOverlay();

      cy.get('[type="submit"]').click();
      cy.wait('@patchLexicons').then(intercepted => {
        cy.wrap(intercepted).its('response.statusCode').should('eq', 200);
      });
      cy.get('[data-cy=appMergeLexiconDialogClose]').click();

      cy.get('[data-cy=appLexiconMenuDelete]:first()').click();
      cy.get('[type="submit"]').click();
      cy.wait('@deleteLexicons').then(intercepted => {
        cy.wrap(intercepted).its('response.statusCode').should('eq', 204);
      });
    });
  });
});
