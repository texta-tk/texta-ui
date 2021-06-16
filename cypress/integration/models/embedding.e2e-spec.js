describe('embeddings should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('DELETE', '**/embeddings/**').as('deleteEmbeddings');
        cy.intercept('PATCH', '**/embeddings/**').as('patchEmbeddings');
      });
    });
  });
  function initEmbeddingsPage(){
    cy.intercept('GET', '**/embeddings/**').as('getEmbeddings');
    cy.visit('/embeddings');
    cy.wait('@getProjectIndices');
    cy.wait('@getEmbeddings');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }
  it('should be able to create an embedding', function () {
    initEmbeddingsPage();
    cy.get('[data-cy=appModelsEmbeddingCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appEmbeddingCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testEmbedding');
    }));
    cy.get('[data-cy=appEmbeddingCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text:nth(1)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appEmbeddingCreateDialogDimensions]').click().then((dimensions => {
      cy.wrap(dimensions).should('be.visible').find('input').clear();
      cy.wrap(dimensions).type('1');
    }));
    cy.intercept('POST', '**/embeddings/**').as('postEmbeddings');
    cy.get('[data-cy=appEmbeddingCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postEmbeddings').then((interception) => {
      cy.wrap(interception).its('response.statusCode').should('eq', 201);
      cy.wrap(interception).its('response.body.task.status').should('eq', 'created');
    })
  });
  it('extra_actions should work', function () {
    cy.importTestEmbedding(this.projectId).then(x => {
      initEmbeddingsPage();
      // phrase
      cy.wait(500); // fix flakiness
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appEmbeddingMenuPhrase]').should('be.visible').click();
      cy.get('app-phrase-dialog input:first()').should('be.visible').click()
        .clear()
        .type('Kinnipeetavate arvu vähenedes nende ülalpidamiskulud suurenevad. ');
      cy.intercept('POST', '**/embeddings/**').as('postEmbeddings');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@postEmbeddings');
      cy.closeCurrentCdkOverlay();
      // edit
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appEmbeddingMenuEdit]').should('be.visible').click();
      cy.get('app-edit-embedding-dialog input:first()').should('be.visible').click()
        .clear()
        .type('newName');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@patchEmbeddings');
      cy.closeCurrentCdkOverlay();
      // delete embedding
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appEmbeddingMenuDelete]').should('be.visible').click();
      cy.get('[data-cy=appConfirmDialogSubmit]').should('be.visible').click();
      cy.wait('@deleteEmbeddings');
    });
  });
});
