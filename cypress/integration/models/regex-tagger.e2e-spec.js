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
  }


  function tagDoc() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click('left');
    cy.get('[data-cy=appRegexTaggerMenuTagDoc]').should('be.visible').click();
    cy.fixture('sample_doc').then(sampleDoc => {
      let json = JSON.stringify(sampleDoc);
      cy.get('[data-cy=appRegexTaggerTagDocDialogDocument] input:first()').should('be.visible').click()
        .clear().invoke('val', json).trigger('change');
      cy.get('[data-cy=appRegexTaggerTagDocDialogDocument]').click().type(' ');
    });
    cy.wait(300);
    cy.get('[data-cy=appRegexTaggerTagDocDialogFields]').click().then((field => {
      cy.wrap(field).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(field, 'required');
      cy.wrap(field).click();
      cy.get('.mat-option-text').contains('comment_content').scrollIntoView().should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(field).find('mat-error').should('have.length', 0)
    }));
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.wait('@postRegexTaggers').then(resp => {
      expect(resp.status).to.eq(200);
      expect(resp.response.body.matches.length).to.eq(1, 'should have found a match');
    });
    cy.get('.code-wrapper').should('be.visible');
    cy.get('[data-cy=appRegexTaggerTagDocDialogClose]').click();
  }

  function tagRandomDoc() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click('left');
    cy.get('[data-cy=appRegexTaggerMenuTagRandomDoc]').should('be.visible').click();
    cy.get('[data-cy=appRegexTaggerTagRandomDocDialogIndices]').click().then((indices => {
      cy.wrap(indices).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(indices, 'required');
      cy.wrap(indices).click();
      cy.get('.mat-option-text:nth(0)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(indices).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appRegexTaggerTagRandomDocDialogfields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text:nth(1)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));

    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.wait('@postRegexTaggers').then(resp => {
      expect(resp.status).to.eq(200);
    });
    cy.get('.code-wrapper').should('be.visible');
    cy.get('[data-cy=appRegexTaggerTagRandomDocDialogClose]').click();

  }


  function tagText() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click('left');
    cy.get('[data-cy=appRegexTaggerMenuTagText]').should('be.visible').click();
    cy.get('[data-cy=appRegexTaggerTagTextDialogText] input:first()').should('be.visible').click()
      .clear().invoke('val', 'tere Ooot, misasi see võõrast aiast maasikate võtmine on, kui ta vargus pole???').trigger('change');
    cy.get('[data-cy=appRegexTaggerTagTextDialogText]').click().type(' ');

    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();

    cy.wait('@postRegexTaggers').then(resp => {
      expect(resp.status).to.eq(200);
    });
    cy.get('.code-wrapper').should('be.visible');
    cy.get('[data-cy=appRegexTaggerTagTextDialogClose]').click();
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
      cy.wrap(desc).type('tere');
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
    cy.get('[data-cy=appRegexTaggerMultiTagDialogClose]').click();


    tagDoc();
    tagRandomDoc();
    tagText();

    cy.get('.cdk-column-actions:nth(1)').click('left');
    cy.get('[data-cy=appRegexTaggerMenuDelete]').click();
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.get('.cdk-column-actions').should('have.length', 1);

  });
});
