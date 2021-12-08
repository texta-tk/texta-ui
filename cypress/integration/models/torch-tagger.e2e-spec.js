describe('Torch Taggers should work', function () {
  beforeEach(function () {
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
      });
    });
  });

  function initTorchTagger() {
    cy.intercept('GET', '**user**').as('getUser');
    cy.intercept('GET', '**get_fields**').as('getProjectIndices');
    cy.intercept('GET', '**/torchtaggers/**').as('getTorchTaggers');
    cy.visit('/torch-taggers');
    cy.wait('@getUser')
    cy.wait('@getProjectIndices');
    cy.wait('@getTorchTaggers');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('should be able to create a new tagger', function () {
    cy.intercept('POST', '**/import_model/**').as('importModel');
    cy.importTestEmbedding(this.projectId)
    cy.wait('@importModel', {timeout: 50000})
    initTorchTagger();
    cy.get('[data-cy=appModelsTorchTaggerCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appTorchTaggerCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testTorch');
    }));
    cy.get('[data-cy=appTorchTaggerCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text:nth(1)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appTorchTaggerCreateDialogArchitecture]').click().then((architecture => {
      cy.wrap(architecture).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(architecture, 'required');
      cy.wrap(architecture).click();
      cy.get('.mat-option-text:nth(1)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(architecture).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appTorchTaggerCreateDialogEmbedding]').click().then((embedding => {
      cy.wrap(embedding).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(embedding, 'required');
      cy.wrap(embedding).click();
      cy.get('.mat-option-text:nth(1)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(embedding).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appTorchTaggerCreateDialogMaxSample]').click().then((sample => {
      cy.wrap(sample).should('be.visible').find('input').clear();
      cy.wrap(sample).type('10');
    }));
    cy.intercept('POST', '**/torchtaggers/**').as('postTorchTaggers');
    cy.get('[data-cy=appTorchTaggerCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postTorchTaggers').then(created => {
      expect(created.response.statusCode).to.eq(201);
      assert.equal(created.response.body.task.status, 'created');
    });

  });
  it('extra_actions should work', function () {

    cy.intercept('POST', '**/import_model/**').as('importModel');
    cy.importTestTorchTagger(this.projectId)
    cy.wait('@importModel', {timeout: 50000})
    initTorchTagger();
    cy.intercept('POST', '**/torchtaggers/**').as('postTorchTaggers');
    // tag text
    cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appTorchTaggerMenuTagText]').should('be.visible').click();
    cy.get('app-torch-tag-text-dialog input:first()').should('be.visible').click()
      .clear()
      .type('Kinnipeetavate arvu vähenedes nende ülalpidamiskulud suurenevad. ');
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.wait('@postTorchTaggers').its('response.statusCode').should('eq', 200);
    cy.closeCurrentCdkOverlay();
    // tag random doc
    cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appTorchTaggerMenuTagRandomDoc]').should('be.visible').click();
    cy.get('[data-cy=appTorchTaggerTagRandomDocDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('comment_content').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appTorchTaggerTagRandomDocDialogSubmit]').should('be.visible').click();
    cy.wait('@postTorchTaggers').then(resp => {
      cy.wrap(resp).its('response.statusCode').should('eq', 200);
      cy.get('[data-cy=appTorchTaggerTagRandomDocDialogClose]').click();
    });
    // edit
    cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appTorchTaggerMenuEdit]').should('be.visible').click();
    cy.get('app-edit-torch-tagger-dialog input:first()').should('be.visible').click()
      .clear()
      .type('newName');

    cy.intercept('PATCH', '**/torchtaggers/**').as('patchTorchTaggers');
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.wait('@patchTorchTaggers');
    cy.closeCurrentCdkOverlay();

    cy.intercept('DELETE', '**/torchtaggers/*/').as('deleteTorchTaggers');
    // delete torchtagger
    cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appTorchTaggerMenuDelete]').should('be.visible').click();
    cy.get('[data-cy=appConfirmDialogSubmit]').should('be.visible').click();
    cy.wait('@deleteTorchTaggers');
  });

});
