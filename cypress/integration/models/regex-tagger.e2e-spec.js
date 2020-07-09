describe('regex-tagger should work', function () {
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
        cy.route('GET', '**/regex_taggers/**').as('getRegexTaggers');
        cy.route('POST', '**/regex_taggers/**').as('postRegexTaggers');
      });
    });
  });

  function initPage() {
    cy.visit('/regex-tagger');
    cy.wait('@getRegexTaggers');
    cy.wait('@getProjectIndices');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
    cy.wait('@getRegexTaggers');
  }

  it('should be able to create a new regex-tagger', function () {
    // create clustering
    initPage();
    cy.get('[data-cy=appRegexTaggerCreateBtn]').click();
    cy.get('[data-cy=appRegexTaggerCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test');
    }));
    cy.get('[data-cy=appRegexTaggerCreateDialogLexicon]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('textarea').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test');
    }));
    cy.get('[data-cy=appRegexTaggerCreateDialogOperator]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('?');
    }));
    cy.get('[data-cy=appRegexTaggerCreateDialogMatchType]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('?');
    }));

    cy.get('[data-cy=appRegexTaggerCreateDialogSubmit]').click();
    cy.wait('@postRegexTaggers').then(created => {
      expect(created.status).to.eq(201);
    });
    cy.wait(1000);
    cy.get('[data-cy=appRegexTaggerMultiTagBtn]').click();
    cy.get('[data-cy=appRegexTaggerMultiTagDialogText]').type('test');
    cy.get('[data-cy=appRegexTaggerMultiTagDialogTaggers]').click().then((taggers => {
      cy.wrap(taggers).should('have.class', 'mat-focused');
      cy.get('.mat-option-text:nth(0)').click();
      cy.closeCurrentCdkOverlay();
    }));
    cy.get('[data-cy=appRegexTaggerMultiTagDialogSubmit]').click();
    cy.wait('@postRegexTaggers').then(tag => {
      expect(tag.status).to.eq(200);
    });
    cy.get('.code-wrapper').should('be.visible');
  });
});
