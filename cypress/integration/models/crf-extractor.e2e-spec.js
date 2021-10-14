describe('Crf-extractor should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject(["texta_crf_test_index"]).then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/crf_extractors/**').as('getCrfExtractors');
        cy.intercept('POST', '**/crf_extractors/**').as('postCrfExtractor');
      });
    });
  });

  function initPage() {
    cy.visit('/crf-extractors');
    cy.wait('@getProjectIndices');
    cy.wait('@getCrfExtractors');
  }



  function extractText() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appCRFExtractorMenuTagText]').should('be.visible').click();
    cy.get('[data-cy=appCRFExtractorTextDialogText] input:first()').should('be.visible').click()
      .clear().invoke('val', 'Russia, one of Europe\'s biggest natural gas providers, has been accused of intentionally withholding supplies.').trigger('change');
    cy.get('[data-cy=appCRFExtractorTextDialogText]').click().type(' ');

    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();


    cy.wait('@postCrfExtractor').then(intercepted => {
      cy.wrap(intercepted).its('response.statusCode').should('eq', 200);
    })
    cy.get('[data-cy=appCRFExtractorTextDialogClose]').click();
  }

  function applyToIndex() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appCRFExtractorMenuApplyToIndices]').should('be.visible').click();

    cy.get('[data-cy=appCRFExtractorApplyDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('mlp').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));

    cy.get('[data-cy=appCRFExtractorApplyDialogSubmit]').click();
    cy.wait(['@postCrfExtractor',]).then(resp => {
      expect(resp.response.statusCode).to.eq(201);
    });

  }

  it('should be able to create a new Crf extractor', function () {
    initPage();
    cy.get('[data-cy=appCRFExtractorCreateBtn]').click();
    cy.get('[data-cy=appCRFExtractorCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test');
    }));
    cy.get('[data-cy=appCRFExtractorCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('mlp').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appCRFExtractorCreateDialogSubmit]').click();
    cy.wait('@postCrfExtractor').its('response.statusCode').should('eq', 201);
    cy.wait(1000);
    cy.get('.mat-header-row > .cdk-column-author__username').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0]).each(xy => { // hack to wait for task to complete
        cy.wrap(bb).click();
        cy.wait('@getCrfExtractors').then((intercepted) => {
          console.log(intercepted)
          if (intercepted?.response?.body?.results[0]?.task?.status === 'completed') {
            assert.equal(intercepted?.response?.body?.results[0]?.task?.status, 'completed');
            return true;
          }else {
            return cy.wait(25000);
          }
        });
      })
    });
    cy.wait(5000);
    extractText();
    applyToIndex();

    cy.get('.cdk-column-actions:nth(1)').click();
    cy.get('[data-cy=appCRFExtractorMenuDelete]').click();
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.get('.cdk-column-actions').should('have.length', 1);

  });
});
