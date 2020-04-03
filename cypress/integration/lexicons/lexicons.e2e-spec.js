describe('lexicons should work', function () {
  beforeEach(function () {
    cy.fixture('users').then((user) => {
      cy.server();
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.route('GET', '**user**').as('getUser');
        cy.route('GET', '**get_fields**').as('getProjectFields');
        cy.route('GET', '**/lexicons/**').as('getLexicons');
        cy.route('DELETE', '**/lexicons/**').as('deleteLexicons');
        cy.route('POST', '**/lexicons/**').as('postLexicons');
        cy.route('POST', '**/embeddings/**').as('postEmbeddings');
        cy.route('PATCH', '**/lexicons/**').as('patchLexicons');
      });
    });
  });
  it('should be able to create a new lexcion, save words, get new suggestions', function () {
    cy.importTestEmbedding(this.projectId).then(x => {
      cy.visit('/lexicon-miner');
      cy.wait('@getProjectFields');
      cy.get('[data-cy=appNavbarProjectSelect]').click();
      cy.get('mat-option').contains('integration_test_project').click();
      cy.get('[data-cy=appLexiconNewListItem]:first() input').should('be.visible').click().type('testLex');
      cy.get('[data-cy=appLexiconNewListItem]:first() button').should('be.visible').click();
      cy.wait('@postLexicons').then(created => {
        expect(created.status).to.eq(201);
      });
      cy.get('[data-cy=appLexiconListItem]:first()').should('be.visible').click();
      cy.get('[data-cy=appLexiconEmbedding]').should('be.visible').click();
      cy.get('mat-option:first()').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.get('[data-cy=appLexiconWords]').should('be.visible').click().type('pede');
      cy.get('[data-cy=appLexiconNewSuggestionsBtn]').should('be.visible').click();
      cy.wait('@postEmbeddings').then(resp=>{
        expect(resp.status).to.eq(200);
      });
      cy.get('[data-cy=appLexiconPredictions]:first()').should('be.visible').click();
      cy.get('[data-cy=appLexiconNewSuggestionsBtn]').should('be.visible').click();
      cy.wait('@postEmbeddings').then(resp=>{
        expect(resp.status).to.eq(200);
      });
      cy.get('[data-cy=appLexiconNegatives]').should('not.have.length',0);
      cy.get('[data-cy=appLexiconSaveBtn]').should('be.visible').click();
      cy.wait('@patchLexicons').then(resp=>{
        expect(resp.status).to.eq(200);
      });
      cy.get('[data-cy=appLexiconNewListItem]:first() input').should('be.visible').click().type('newLex');
      cy.get('[data-cy=appLexiconNewListItem]:first() button').should('be.visible').click();
      cy.wait('@postLexicons').then(created => {
        expect(created.status).to.eq(201);
      });
      cy.get('[data-cy=appLexiconListItem]').contains('newLex').should('be.visible').click();
      cy.get('[data-cy=appLexiconListItem]').contains('testLex').should('be.visible').click();
      cy.get('[data-cy=appLexiconNegatives]').should('not.have.length',0);
    });
  });
});
