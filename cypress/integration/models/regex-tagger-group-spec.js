describe('regex-tagger-group should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/regex_tagger_groups/**').as('getRegexTaggers');
        cy.intercept('POST', '**/regex_tagger_groups/**').as('postRegexTaggers');
      });
    });
  });

  function initPage() {
    cy.visit('/regex-tagger-groups');
    cy.wait('@getRegexTaggers');
    cy.wait('@getProjectIndices');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
    cy.wait('@getRegexTaggers');
  }

  function multiTagTest() {
    cy.get('[data-cy=appRegexTaggerGroupMultiTagBtn]').click();
    cy.wait('@getRegexTaggers');
    cy.get('[data-cy=appRegexTaggerGroupMultiTagDialogText]').type('tere');
    cy.get('[data-cy=appRegexTaggerGroupMultiTagDialogTaggers]').click().then((taggers => {
      cy.wrap(taggers).should('have.class', 'mat-focused');
      cy.get('.mat-option-text:nth(0)').click();
      cy.closeCurrentCdkOverlay();
    }));
    cy.get('[data-cy=appRegexTaggerGroupMultiTagDialogSubmit]').click();
    cy.wait('@postRegexTaggers').then(resp => {
      expect(resp.response.statusCode).to.eq(200);
      expect(resp.response.body.length).to.eq(1);
    });
    cy.get('.code-wrapper').should('be.visible');
    cy.get('[data-cy=appRegexTaggerGroupMultiTagDialogClose]').click();
  }

  function applyTaggerGroup() {
    cy.get('[data-cy=appRegexTaggerGroupApplyTaggerGroupBtn]').click();
    cy.wait('@getRegexTaggers');
    cy.get('[data-cy=appRegexTaggerGroupApplyTaggerDialogDesc]').type('tere');
    cy.get('[data-cy=appRegexTaggerGroupApplyTaggerDialogIndices]').click().then((indices => {
      cy.wrap(indices).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(indices, 'required');
      cy.wrap(indices).click();
      cy.get('.mat-option-text:nth(0)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(indices).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appRegexTaggerGroupApplyTaggerDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text:nth(1)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));

    cy.get('[data-cy=appRegexTaggerGroupApplyTaggerDialogTaggers]').click().then((grp => {
      cy.wrap(grp).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(grp, 'required');
      cy.wrap(grp).click();
      cy.get('.mat-option-text:first()').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(grp).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appRegexTaggerGroupApplyTaggerDialogSubmit]').click();
    cy.wait(['@postRegexTaggers',]).then(resp => {
      expect(resp.response.statusCode).to.eq(200);
    });
    cy.wait('@getRegexTaggers');

  }

  function tagRandomDoc() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click('left');
    cy.get('[data-cy=appRegexTaggerGroupMenuTagRandomDoc]').should('be.visible').click();
    cy.get('[data-cy=appRegexTaggerGroupTagRandomDocDialogIndices]').click().then((indices => {
      cy.wrap(indices).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(indices, 'required');
      cy.wrap(indices).click();
      cy.get('.mat-option-text:nth(0)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(indices).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appRegexTaggerGroupTagRandomDocDialogfields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('comment_content').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));

    cy.wrap([0, 0, 0, 0, 0]).each(y => { // hack to wait for task to complete
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@postRegexTaggers').then(resp => {
        expect(resp.response.statusCode).to.eq(201);
        if (resp?.response?.body?.result) {
          cy.get('app-fact-chip').should('be.visible');
        }else{
          cy.get('[data-cy=appRegexTaggerGroupTagRandomDocDialogIndices]').should('be.visible');
        }
      });
    })
    cy.get('[data-cy=appRegexTaggerGroupTagRandomDocDialogClose]').click();

  }


  function tagText() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click('left');
    cy.get('[data-cy=appRegexTaggerGroupMenuTagText]').should('be.visible').click();
    cy.get('[data-cy=appRegexTaggerGroupTagTextDialogText] input:first()').should('be.visible').click()
      .clear().invoke('val', 'tere Ooot, misasi see võõrast aiast maasikate võtmine on, kui ta vargus pole???').trigger('change');
    cy.get('[data-cy=appRegexTaggerGroupTagTextDialogText]').click().type(' ');

    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();

    cy.wait('@postRegexTaggers').then(resp => {
      expect(resp.response.statusCode).to.eq(200);
      if (resp?.response?.body?.result) {
        cy.get('app-fact-chip').should('be.visible');
      }
    });
    cy.get('[data-cy=appRegexTaggerGroupTagTextDialogClose]').click();
  }

  it('should be able to create a new regex-tagger-group', function () {
    // create clustering
    initPage();
    cy.createTestRegexTagger(this.projectId);
    cy.get('[data-cy=appRegexTaggerGroupCreateBtn]').click();
    cy.get('[data-cy=appRegexTaggerGroupCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test');
    }));

    cy.get('[data-cy=appRegexTaggerGroupCreateDialogRegexTaggerGroups]').click().then((grp => {
      cy.wrap(grp).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(grp, 'required');
      cy.wrap(grp).click();
      cy.get('.mat-option-text:first()').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(grp).find('mat-error').should('have.length', 0)
    }));

    cy.get('[data-cy=appRegexTaggerGroupCreateDialogSubmit]').click();
    cy.wait('@postRegexTaggers').then(created => {
      expect(created.response.statusCode).to.eq(201);
    });
    cy.wait('@getRegexTaggers');
    cy.wait(1000);

    multiTagTest();
    applyTaggerGroup();
    tagRandomDoc();
    tagText();


    cy.get('.cdk-column-actions:nth(1)').click('left');
    cy.get('[data-cy=appRegexTaggerGroupMenuDelete]').click();
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.get('.cdk-column-actions').should('have.length', 1);

  });
});
