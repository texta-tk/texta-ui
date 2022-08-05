describe('rakun-extractor should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/rakun_extractors/**').as('getRakunExtractors');
        cy.intercept('POST', '**/rakun_extractors/**').as('postRakunExtractor');
      });
    });
  });

  function initPage() {
    cy.visit('/rakun-extractors');
    cy.wait('@getProjectIndices');
    cy.wait('@getRakunExtractors');
  }

  function extractRandomDoc() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click('left');
    cy.get('[data-cy=appRakunExtractorMenuExtractRandomDoc]').should('be.visible').click();
    cy.get('[data-cy=appRakunExtractorRandomDocDialogFields]').click().then((fields => {
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
      cy.wait('@postRakunExtractor').then(resp => {
        cy.wrap(resp).its('response.statusCode').should('eq', 200);
        if (resp?.response?.body?.result) {
          cy.get('app-fact-chip').should('be.visible');
        } else {
          cy.get('[data-cy=appRakunExtractorRandomDocDialogIndices]').should('be.visible');
        }
      });
    })
    cy.get('[data-cy=appRakunExtractorRandomDocDialogClose]').click();

  }


  function extractText() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click('left');
    cy.get('[data-cy=appRakunExtractorMenuExtractText]').should('be.visible').click();
    cy.get('[data-cy=appRakunExtractorTextDialogText] input:first()').should('be.visible').click()
      .clear().invoke('val', 'tere Ooot, misasi see võõrast aiast maasikate võtmine on, kui ta vargus pole???').trigger('change');
    cy.get('[data-cy=appRakunExtractorTextDialogText]').click().type(' ');

    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();


    cy.wait('@postRakunExtractor').then(intercepted => {
      cy.wrap(intercepted).its('response.statusCode').should('eq', 200);
      if (intercepted?.response?.body?.result) {
        cy.get('app-fact-chip').should('be.visible');
      }
    })
    cy.get('[data-cy=appRakunExtractorTextDialogClose]').click();
  }

  function applyToIndex() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click('left');
    cy.get('[data-cy=appRakunExtractorMenuApplyToIndices]').click();
    cy.get('[data-cy=appRakunExtractorApplyDialogDesc]').type('tere');

    cy.get('[data-cy=appRakunExtractorApplyDialogFields]').click().then((fields => {
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
    cy.get('[data-cy=appRakunExtractorApplyDialogSubmit]').click();
    cy.wait(['@postRakunExtractor',]).then(resp => {
      expect(resp.response.statusCode).to.eq(201);
    });
    cy.wait('@getRakunExtractors');

  }

  function editStopWord(){
    // Stop words
    cy.get('.cdk-column-actions:nth(1)').click('left');
    cy.get('[data-cy=appRakunExtractorMenuStopWords]').should('be.visible').click();
    cy.wait('@getRakunExtractors')
    cy.get('.mat-dialog-container textarea').should('be.visible').click().clear().type('ja');
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.wait('@postRakunExtractor');
    cy.closeCurrentCdkOverlay();
  }
  it('should be able to create a new rakun extractor', function () {
    // create clustering
    initPage();
    cy.get('[data-cy=appRakunExtractorCreateBtn]').click();
    cy.get('[data-cy=appRakunExtractorCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test');
    }));

    cy.get('[data-cy=appRakunExtractorCreateDialogSubmit]').click();
    cy.wait('@postRakunExtractor').its('response.statusCode').should('eq', 201);
    cy.wait('@getRakunExtractors')
    cy.wait(1000);
    editStopWord();
    extractRandomDoc();
    extractText();
    applyToIndex();

    cy.get('.cdk-column-actions:nth(1)').click('left');
    cy.get('[data-cy=appRakunExtractorMenuDuplicate]').click();
    cy.wait('@postRakunExtractor').its('response.statusCode').should('eq', 200);
    cy.wait('@getRakunExtractors').its('response.body.count').should('eq', 2);

    cy.wait(1000);
    cy.get('.cdk-column-actions:nth(1)').click('left');
    cy.get('[data-cy=appRakunExtractorMenuDelete]').click();
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.get('.cdk-column-actions').should('have.length', 2);

  });
});
