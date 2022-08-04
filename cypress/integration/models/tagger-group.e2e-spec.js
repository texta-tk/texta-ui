describe('tagger groups should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/tagger_groups/**').as('getTaggerGroups');
        cy.intercept('DELETE', '**/tagger_groups/**').as('deleteTaggerGroups');
        cy.intercept('POST', '**/tagger_groups/').as('postTaggerGroups');
        cy.intercept('POST', '**/apply_to_index/').as('postApplyToIndices');
        cy.intercept('PATCH', '**/tagger_groups/**').as('patchTaggerGroups');
      });
    });
  });
  function initTaggerGroupPage() {
    cy.visit('/tagger-groups');
    cy.wait('@getProjectIndices');
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
      expect(created.response.statusCode).to.eq(201);
    });
    // delete
    cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appTaggerGroupMenuDelete]').should('be.visible').click();
    cy.get('[data-cy=appConfirmDialogSubmit]').should('be.visible').click();
    cy.wait('@deleteTaggerGroups');
  });

  it('extra_actions should work', function () {
    cy.importTestTaggerGroup(this.projectId).then(x => {
      initTaggerGroupPage();
      cy.wait(100);

      // list features
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupMenuModelList]').should('be.visible').click();
      cy.wait('@getTaggerGroups').then(x=>{
        expect(x.response.statusCode).to.eq(200);
      });
      cy.get('app-models-list-dialog tr').should('have.length', 4);
      cy.closeCurrentCdkOverlay();

      // apply to indices
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupMenuApplyToIndices]').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupApplyDialogDesc]').then((desc => {
        cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
        cy.matFormFieldShouldHaveError(desc, 'required');
        cy.wrap(desc).type('testApply');
      }));
      cy.get('[data-cy=appTaggerGroupApplyDialogFields]').click().then((fields => {
        cy.wrap(fields).should('have.class', 'mat-focused');
        cy.closeCurrentCdkOverlay();
        cy.matFormFieldShouldHaveError(fields, 'required');
        cy.wrap(fields).click();
        cy.get('.mat-option-text').contains(new RegExp(' comment_content ', '')).click();
        cy.closeCurrentCdkOverlay();
        cy.wrap(fields).find('mat-error').should('have.length', 0)
      }));
      cy.get('textarea').click().then(x=>{
        cy.fixture('sample_query').then(sampleDoc => {
          cy.wrap(x).invoke('val', JSON.stringify(sampleDoc)).trigger('change');
        });
      })
      cy.get('[data-cy=appTaggerGroupApplyDialogFactName]').click().then((fact => {
        cy.wrap(fact).should('have.class', 'mat-focused').type('b').find('input').clear();
        cy.matFormFieldShouldHaveError(fact, 'required');
        cy.wrap(fact).type('XXX');
      }));
      cy.get('[data-cy=appTaggerGroupApplyDialogSubmit]').should('be.visible').click();
      cy.wait('@postApplyToIndices').then(created=>{
        expect(created.response.statusCode).to.eq(201);
      });

      // tag text
      cy.intercept('POST', '**/tag_text/').as('tagText');
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupMenuTagText]').should('be.visible').click();
      cy.get('app-tagger-group-tag-text-dialog input:first()').should('be.visible').click()
        .clear()
        .type('Kinnipeetavate arvu vähenedes nende ülalpidamiskulud suurenevad. ');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      // this can take a long time
      cy.wait('@tagText', {timeout: 60000}).then(x=>{
        expect(x.response.statusCode).to.eq(200);
      });
      cy.closeCurrentCdkOverlay();
      // Tag doc
      cy.intercept('POST', '**/tag_doc/').as('tagDoc');
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupMenuTagDoc]').should('be.visible').click();
      cy.fixture('sample_doc').then(sampleDoc=>{
        let json = JSON.stringify(sampleDoc);
        cy.get('app-tagger-group-tag-doc-dialog input:first()').should('be.visible').click()
          .clear().invoke('val', json).trigger('change');
      });
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@tagDoc', {timeout: 60000}).then(x=>{
        expect(x.response.statusCode).to.eq(200);
      });
      cy.closeCurrentCdkOverlay();
      // Tag random doc
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.intercept('POST', '**/tag_random_doc/**').as('tagRandomDoc');
      cy.get('[data-cy=appTaggerGroupMenuTagRandomDoc]').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupTagRandomDocDialogFields]').click().then((fields => {
        cy.wrap(fields).should('have.class', 'mat-focused');
        cy.closeCurrentCdkOverlay();
        cy.matFormFieldShouldHaveError(fields, 'required');
        cy.wrap(fields).click();
        cy.get('.mat-option-text').contains('comment_content').should('be.visible').click();
        cy.closeCurrentCdkOverlay();
        cy.wrap(fields).find('mat-error').should('have.length', 0)
      }));
      cy.get('[data-cy=appTaggerGroupTagRandomDocDialogSubmit]').should('be.visible').click();
      cy.wait('@tagRandomDoc', {timeout: 120000}).then(resp => {
        cy.wrap(resp).its('response.statusCode').should('eq', 200);
        cy.get('[data-cy=appTaggerGroupTagRandomDocDialogClose]').click();
      });
      cy.closeCurrentCdkOverlay();
      // edit
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerGroupMenuEdit]').should('be.visible').click();
      cy.get('app-edit-tagger-group-dialog input:first()').should('be.visible').click()
        .clear()
        .type('newName');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@patchTaggerGroups').then(x=>{
        expect(x.response.statusCode).to.eq(200);
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
