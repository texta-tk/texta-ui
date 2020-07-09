describe('torchTaggers should work', function () {
  beforeEach(function () {
    cy.fixture('users').then((user) => {
      cy.server();
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.route('GET', '**user**').as('getUser');
        cy.route('GET', '**get_fields**').as('getProjectIndices');
        cy.route('GET', '**/torchtaggers/**').as('getTorchTaggers');
        cy.route('DELETE', '**/torchtaggers/**').as('deleteTorchTaggers');
        cy.route('POST', '**/torchtaggers/**').as('postTorchTaggers');
        cy.route('PATCH', '**/torchtaggers/**').as('patchTorchTaggers');
      });
    });
  });
  function initTorchTagger() {
    cy.visit('/torchtaggers');
    cy.wait('@getProjectIndices');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
    cy.wait('@getTorchTaggers');
  }
  it('should be able to create a new tagger', function () {
    cy.importTestEmbedding(this.projectId).then(x => {
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
        cy.get('.mat-option-text:first()').should('be.visible').click();
        cy.closeCurrentCdkOverlay();
        cy.wrap(embedding).find('mat-error').should('have.length', 0)
      }));
      cy.get('[data-cy=appTorchTaggerCreateDialogMaxSample]').click().then((sample => {
        cy.wrap(sample).should('be.visible').find('input').clear();
        cy.wrap(sample).type('10');
      }));
      cy.get('[data-cy=appTorchTaggerCreateDialogSubmit]').should('be.visible').click();
      cy.wait('@postTorchTaggers').then(created=>{
        expect(created.status).to.eq(201);
        assert.equal(created.response.body.task.status, 'created');
      });

    });
  });
  it('extra_actions should work', function () {
    cy.importTestTorchTagger(this.projectId).then(x => {
      initTorchTagger();
      // tag text
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTorchTaggerMenuTagText]').should('be.visible').click();
      cy.get('app-torch-tag-text-dialog input:first()').should('be.visible').click()
        .clear()
        .type('Kinnipeetavate arvu vähenedes nende ülalpidamiskulud suurenevad. ');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@postTorchTaggers');
      cy.closeCurrentCdkOverlay();
      // edit
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTorchTaggerMenuEdit]').should('be.visible').click();
      cy.get('app-edit-torch-tagger-dialog input:first()').should('be.visible').click()
        .clear()
        .type('newName');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@patchTorchTaggers');
      cy.closeCurrentCdkOverlay();
      // delete torchtagger
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTorchTaggerMenuDelete]').should('be.visible').click();
      cy.get('[data-cy=appConfirmDialogSubmit]').should('be.visible').click();
      cy.wait('@deleteTorchTaggers');
    });
  });
});
