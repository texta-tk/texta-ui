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
        cy.intercept('POST', '**/apply_to_index/').as('postApplyToIndices');
      });
    });
  });

  function initTaggersPage() {
    cy.visit('/taggers');
    cy.wait('@getUser');
    cy.wait('@getProjectIndices');
    cy.wait('@getTaggers');
  }

  it('extra_actions should work', function () {
    // list features
    cy.importTestTagger(this.projectId).then(x => {
      cy.intercept('GET', '**/taggers/**').as('getTaggers');
      initTaggersPage();
      cy.wait(100);
      // list features
      cy.intercept('POST', '**/taggers/**').as('postTagger');
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuListFeatures]').should('be.visible').click();
      cy.wait('@postTagger');
      cy.get('.mat-list-item-content').should('have.length', 100);
      cy.closeCurrentCdkOverlay();

      // apply to indices
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuApplyToIndices]').should('be.visible').click();
      cy.get('[data-cy=appTaggerApplyDialogDesc]').then((desc => {
        cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
        cy.matFormFieldShouldHaveError(desc, 'required');
        cy.wrap(desc).type('testApply');
      }));
      cy.get('[data-cy=appTaggerApplyDialogFields]').click().then((fields => {
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
      cy.get('[data-cy=appTaggerApplyDialogFactName]').click().then((fact => {
        cy.wrap(fact).should('have.class', 'mat-focused').type('b').find('input').clear();
        cy.matFormFieldShouldHaveError(fact, 'required');
        cy.wrap(fact).type('XXX');
      }));
      cy.get('[data-cy=appTaggerApplyDialogSubmit]').should('be.visible').click();
      cy.wait('@postApplyToIndices').then(created=>{
        expect(created.response.statusCode).to.eq(201);
      });


      // Stop words
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuStopWords]').should('be.visible').click();
      cy.get('.mat-dialog-container textarea').should('be.visible').click().clear().type('ja');
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
      cy.intercept('POST', '**/tag_random_doc/**').as('tagRandomDoc');
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuTagRandomDoc]').should('be.visible').click();
      cy.get('[data-cy=appTaggerTagRandomDocDialogFields]').click().then((fields => {
        cy.wrap(fields).should('have.class', 'mat-focused');
        cy.closeCurrentCdkOverlay();
        cy.matFormFieldShouldHaveError(fields, 'required');
        cy.wrap(fields).click();
        cy.get('.mat-option-text').contains(new RegExp(' comment_content ', '')).click();
        cy.closeCurrentCdkOverlay();
        cy.wrap(fields).find('mat-error').should('have.length', 0)
      }));
      cy.get('[data-cy=TaggerTagRandomDocDialogSubmit]').should('be.visible').click();
      cy.wait('@tagRandomDoc', {timeout: 120000}).then(resp => {
        cy.wrap(resp).its('response.statusCode').should('eq', 200);
        cy.get('[data-cy=TaggerTagRandomDocDialogClose]').click();
      });
      // multitag text
      cy.get('[data-cy=appModelsTaggerMultiTag]').should('be.visible').click();
      cy.get('.mat-dialog-container textarea').should('be.visible').click().clear().type('ja');
      cy.get('[data-cy=appTaggerMultiTagDialogSubmit]').should('be.visible').click();
      cy.wait('@postTagger').its('response.statusCode').should('eq', 200);
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
      cy.get('.mat-option-text').contains(new RegExp(' comment_content ', '')).click();
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
    cy.wait('@getTaggers');

    cy.get('.mat-header-row > .cdk-column-author__username').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0, 0, 0, 0, 0]).each(y => { // hack to wait for task to complete
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

    // confusion matrix
    cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appTaggerMenuConfusionMatrix]').should('be.visible').click();
    cy.get('.nsewdrag').should('be.visible');
    cy.closeCurrentCdkOverlay();

  });
});
