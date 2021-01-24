describe('taggers should work', function () {
  beforeEach(function () {
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**/user/').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('PATCH', '**/taggers/**').as('patchTaggers');
      });
    });
  });

  function initTaggersPage() {
    cy.visit('/taggers');
    cy.wait('@getUser');
    cy.wait('@getProjectIndices');
    cy.wait('@getTaggers');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('extra_actions should work', function () {
    // list features
    cy.importTestTagger(this.projectId).then(x => {
      cy.intercept('GET', '**/taggers/**').as('getTaggers');
      initTaggersPage();
      cy.wait('@getTaggers');
      cy.wait(100);

      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuListFeatures]').should('be.visible').click();
      cy.wait('@getTaggers');
      cy.get('.mat-dialog-content > div').should('have.length', 8);
      cy.closeCurrentCdkOverlay();
      // Stop words
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuStopWords]').should('be.visible').click();
      cy.get('.mat-dialog-container textarea').should('be.visible').click().clear().type('ja');
      cy.intercept('POST', '**/taggers/**').as('postTagger');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@postTagger');
      cy.closeCurrentCdkOverlay();
      // Tag text
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuTagText]').should('be.visible').click();
      cy.get('app-tag-text-dialog input:first()').should('be.visible').click()
        .clear()
        .type('Kinnipeetavate arvu vähenedes nende ülalpidamiskulud suurenevad. ');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@postTagger');
      cy.closeCurrentCdkOverlay();
      // Tag doc
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuTagDoc]').should('be.visible').click();
      cy.fixture('sample_doc').then(sampleDoc => {
        let json = JSON.stringify(sampleDoc);
        cy.get('app-tag-doc-dialog input:first()').should('be.visible').click()
          .clear().invoke('val', json).trigger('change');
      });
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@postTagger');
      cy.closeCurrentCdkOverlay();
      // Tag random doc
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuTagRandomDoc]').should('be.visible').click();
      cy.wait('@getTaggers');
      cy.get('app-tag-random-doc-dialog .mat-dialog-actions span').should('have.length.is.greaterThan', 2);
      cy.closeCurrentCdkOverlay();

      // patch tagger
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuEdit]').should('be.visible').click();
      cy.get('app-edit-tagger-dialog input:first()').should('be.visible').click()
        .clear()
        .type('newName');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@patchTaggers');
      cy.closeCurrentCdkOverlay();
      cy.server(); // intercept doesnt work here?? todo

      cy.route('DELETE', '**/taggers/**').as('deleteTaggers');
      // delete tagger
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuDelete]').should('be.visible').click();
      cy.get('[data-cy=appConfirmDialogSubmit]').should('be.visible').click();
      cy.wait('@deleteTaggers').then(x=>{
        expect(x.status).to.eq(204);
      });
    });
  });
  it('should be able to create a new tagger', function () {
    cy.intercept('GET', '**/taggers/**').as('getTaggers');
    initTaggersPage();
    cy.get('[data-cy=appModelsTaggerCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appTaggerCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testTagger');
    }));
    cy.get('[data-cy=appTaggerCreateDialogIndices]').click().then((indices => {
      cy.wrap(indices).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.wrap(indices).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appTaggerCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text:nth(1)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appTaggerCreateDialogSampleSize]').click().then((sampleSize => {
      cy.wrap(sampleSize).should('be.visible').find('input').clear();
      cy.wrap(sampleSize).type('100');
    }));
    cy.intercept('POST', '**/taggers/**').as('postTaggers');
    cy.get('[data-cy=appTaggerCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postTaggers').then(created => {
      expect(created.response.statusCode).to.eq(201);
      assert.equal(created.response.body.task.status, 'created');
    });

    cy.get('.mat-header-row > .cdk-column-author__username').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0, 0]).each(y => { // hack to wait for task to complete
        cy.wrap(bb).click();
        return cy.wait('@getTaggers').then((x) => {
          if (x?.response?.body?.results[0]?.task?.status === 'completed') {
            assert.equal(x?.response?.body?.results[0]?.task?.status, 'completed');
            return false;
          }
          return cy.wait(2000);
        });
      })
    });
    cy.wait('@getTaggers', {timeout: 50000});
    cy.get('.element-row > .cdk-column-fields').click();
    cy.get('.element-plot').should('be.visible').and(($img) => {
      // "naturalWidth" and "naturalHeight" are set when the image loads
      expect($img[0].naturalWidth).to.be.greaterThan(0)
    });
  });
});
