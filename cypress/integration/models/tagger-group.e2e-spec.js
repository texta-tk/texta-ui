describe('tagger groups should work', function () {
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
        cy.route('GET', '**/tagger_groups/**').as('getTaggerGroups');
        cy.route('DELETE', '**/tagger_groups/**').as('deleteTaggerGroups');
        cy.route('POST', '**/tagger_groups/**').as('postTaggerGroups');
        cy.route('PATCH', '**/tagger_groups/**').as('patchTaggerGroups');
      });
    });
  });
  function initTaggerGroupPage() {
    cy.visit('/tagger-groups');
    cy.wait('@getProjectIndices');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
    cy.wait('@getTaggerGroups');
  }

  it('should be able to create a new tagger group', function () {
    initTaggerGroupPage();
    cy.get('[data-cy=appModelsTaggerGroupCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appTaggerGroupCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testTaggerGroup');
    }));
    cy.get('[data-cy=appTaggerGroupCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text:nth(1)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appTaggerGroupCreateDialogSample]').click().then((sampleSize => {
      cy.wrap(sampleSize).should('be.visible').find('input').clear();
      cy.wrap(sampleSize).type('10');
    }));
    cy.get('[data-cy=appTaggerGroupCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postTaggerGroups').then(created=>{
      expect(created.status).to.eq(201);
    });
  });

  it('extra_actions should work', function () {
    cy.importTestTaggerGroup(this.projectId).then(x => {
      initTaggerGroupPage();
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupMenuModelList]').should('be.visible').click();
      cy.wait('@getTaggerGroups').then(x=>{
        expect(x.status).to.eq(200);
      });
      cy.get('app-models-list-dialog tr').should('have.length', 4);
      cy.closeCurrentCdkOverlay();
      // tag text
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupMenuTagText]').should('be.visible').click();
      cy.get('app-tagger-group-tag-text-dialog input:first()').should('be.visible').click()
        .clear()
        .type('Kinnipeetavate arvu vähenedes nende ülalpidamiskulud suurenevad. ');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      // this can take a long time
      cy.wait('@postTaggerGroups', {timeout: 60000}).then(x=>{
        expect(x.status).to.eq(200);
      });
      cy.closeCurrentCdkOverlay();
      // Tag doc
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupMenuTagDoc]').should('be.visible').click();
      cy.fixture('sample_doc').then(sampleDoc=>{
        let json = JSON.stringify(sampleDoc);
        cy.get('app-tagger-group-tag-doc-dialog input:first()').should('be.visible').click()
          .clear().invoke('val', json).trigger('change');
      });
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@postTaggerGroups', {timeout: 60000}).then(x=>{
        expect(x.status).to.eq(200);
      });
      cy.closeCurrentCdkOverlay();
      // Tag random doc
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.route('POST', '**/tag_random_doc/**').as('tagRandomDoc');
      cy.get('[data-cy=appTaggerGroupMenuTagRandomDoc]').should('be.visible').click();
      cy.wait('@tagRandomDoc', {timeout: 60000});
      cy.get('app-tagger-group-tag-random-doc-dialog button').should('be.visible').click();
      cy.wait('@tagRandomDoc', {timeout: 60000});
      cy.closeCurrentCdkOverlay();
      // edit
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupMenuEdit]').should('be.visible').click();
      cy.get('app-edit-tagger-group-dialog input:first()').should('be.visible').click()
        .clear()
        .type('newName');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@patchTaggerGroups').then(x=>{
        expect(x.status).to.eq(200);
      });
      cy.closeCurrentCdkOverlay();
      // delete
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupMenuDelete]').should('be.visible').click();
      cy.get('[data-cy=appConfirmDialogSubmit]').should('be.visible').click();
      cy.wait('@deleteTaggerGroups');
    });
  });
});
