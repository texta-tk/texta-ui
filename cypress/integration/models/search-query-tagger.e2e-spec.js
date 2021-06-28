describe('Search query tagger should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/search_query_tagger/**').as('getSearchQueryTaggers');
        cy.intercept('POST', '**/search_query_tagger/').as('postSearchQueryTaggers');
      });
    });
  });

  function initPage() {
    cy.visit('/search-query-taggers');
    cy.wait('@getSearchQueryTaggers');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('Search query tagger create', function () {
    initPage();
    cy.get('[data-cy=appSearchTaggerCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appSearchTaggerCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test');
    }));

    cy.get('[data-cy=appSearchTaggerCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('comment_content').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appSearchTaggerCreateDialogFactName]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test2');
    }));
    cy.get('[data-cy=appSearchTaggerCreateDialogFactVal]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test2');
    }));
    cy.get('[data-cy=appSearchTaggerCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postSearchQueryTaggers').then(created => {
      expect(created.response.statusCode).to.eq(201);
    });
  });
});
