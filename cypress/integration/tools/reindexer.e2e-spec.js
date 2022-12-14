describe('reindexer should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
      });
    });
  });

  function initReindexerPage() {
    cy.intercept('GET', '**/reindexer/**').as('getIndices');
    cy.visit('/reindexer');
    cy.wait('@getIndices');
  }

  it('should be able to create a new reindexer task', function () {
    initReindexerPage();
    cy.get('[data-cy=appToolsReindexerCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appReindexerCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testReindexer');
    }));
    cy.get('[data-cy=appReindexerCreateDialogIndexName]').click().then((name => {
      cy.wrap(name).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(name, 'required');
      cy.wrap(name).type('new_index');
    }));
    cy.get('[data-cy=appReindexerCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('comment_content').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.intercept('POST', '**/reindexer/**').as('postIndices');
    cy.get('[data-cy=appReindexerCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postIndices').then(created => {
      expect(created.response.statusCode).to.eq(201);
      assert.equal(created.response.body.tasks[0].status, 'created');
    });
  });
  it('extra_actions should work', function () {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('api_host')}${Cypress.env('api_basePath')}/projects/${this.projectId}/elastic/reindexer/`,
      body: {
        "description": "test",
        "new_index": "asdasdasasdasadada",
        "fields": [
          "texta_facts",
          "@timestamp",
          "@version",
          "channel_id",
          "client_cookie",
          "client_ip",
          "comment_content",
          "comment_content_clean.stats.lang",
          "comment_content_clean.stats.obfuscated",
          "comment_content_clean.stats.relative_caps",
          "comment_content_clean.stats.relative_punct",
          "comment_content_clean.stats.shit_tokens",
          "comment_content_clean.stats.text_length",
          "comment_content_clean.stats.trigger_words",
          "comment_content_clean.stats.urls",
          "comment_content_clean.text",
          "comment_content_lemmas",
          "comment_count_by_submitter",
          "comment_subject",
          "content_entity_anonymous_sort_nr",
          "content_entity_id",
          "content_entity_main_anon_sort_nr",
          "content_entity_main_reg_sort_nr",
          "content_entity_registered_sort_nr",
          "content_entity_sort_nr",
          "country_code_id",
          "created_time",
          "id",
          "is_anonymous",
          "is_enabled",
          "publisher_id",
          "quote_count",
          "quote_reg_count",
          "replyto_sort_nr"
        ],
        "field_type": [],
        "indices": [
          "texta_test_index"
        ],
        "query": "{\"query\": {\"match_all\": {}}}"
      },
      headers: {'Authorization': 'Token ' + JSON.parse(localStorage.getItem('user')).key}
    }).then(x => {
      initReindexerPage();
      // delete reindex task
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.intercept('DELETE', '**/reindexer/**').as('deleteIndices');
      cy.get('[data-cy=appReindexerMenuDelete]').should('be.visible').click();
      cy.get('[data-cy=appConfirmDialogSubmit]').should('be.visible').click();
      cy.wait('@deleteIndices');
    });
  });
});
