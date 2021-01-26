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
  /*  cy.importTestEmbedding(this.projectId).then(x => {

      cy.intercept('GET', '**user**').as('getUser');
      cy.intercept('GET', '**get_fields**').as('getProjectIndices');
      cy.intercept('GET', '**!/lexicons/!**').as('getLexicons');
      cy.intercept('DELETE', '**!/lexicons/!**').as('deleteLexicons');
      cy.intercept('POST', '**!/lexicons/!**').as('postLexicons');
      cy.intercept('PATCH', '**!/lexicons/!**').as('patchLexicons');
      cy.visit('/lexicons');

      cy.wait('@getProjectIndices');
      cy.get('[data-cy=appNavbarProjectSelect]').click();
      cy.get('mat-option').contains('integration_test_project').click();
      cy.get('[data-cy=appLexiconNewListItem]:first() input').should('be.visible').click().type('testLex');
      cy.get('[data-cy=appLexiconNewListItem]:first() button').should('be.visible').click();
      cy.wait('@postLexicons').then(created => {
        expect(created.response.statusCode).to.eq(201);
      });
      cy.get('[data-cy=appLexiconListItem]:first()').should('be.visible').click();
      cy.get('[data-cy=appLexiconEmbedding]').should('be.visible').click();
      cy.get('mat-option:first()').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.get('[data-cy=appLexiconWords]').should('be.visible').click().type('pede');
      cy.intercept('POST', '**!/predict_similar/').as('predictSimilar');
      cy.get('[data-cy=appLexiconNewSuggestionsBtn]').should('be.visible').click();
      cy.wait('@predictSimilar').then(resp=>{
        expect(resp.response.statusCode).to.eq(200);
      });
      cy.get('[data-cy=appLexiconPredictions]:first()').should('be.visible').click();
      cy.get('[data-cy=appLexiconNewSuggestionsBtn]').should('be.visible').click();
      cy.wait('@predictSimilar').then(resp=>{
        expect(resp.response.statusCode).to.eq(200);
      });
      cy.get('[data-cy=appLexiconNegatives]').should('not.have.length',0);
      cy.get('[data-cy=appLexiconSaveBtn]').should('be.visible').click();
      cy.wait('@patchLexicons').then(resp=>{
        expect(resp.response.statusCode).to.eq(200);
      });
      cy.get('[data-cy=appLexiconNewListItem]:first() input').should('be.visible').click().type('newLex');
      cy.get('[data-cy=appLexiconNewListItem]:first() button').should('be.visible').click();
      cy.wait('@postLexicons').then(created => {
        expect(created.response.statusCode).to.eq(201);
      });
      cy.get('[data-cy=appLexiconListItem]').contains('newLex').should('be.visible').click();
      cy.get('[data-cy=appLexiconListItem]').contains('testLex').should('be.visible').click();
      cy.get('[data-cy=appLexiconNegatives]').should('not.have.length',0);
    });*/
  });
});
