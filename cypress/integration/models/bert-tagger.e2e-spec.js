describe('bert-taggers should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/bert_taggers/**').as('getbertTaggers');
        cy.intercept('POST', '**/bert_taggers/**').as('postbertTaggers');
        cy.intercept('DELETE', '**/bert_taggers/**').as('deletebertTaggers');
      });
    });
  });

  function initPage() {
    cy.visit('/bert-taggers');
    cy.wait('@getProjectIndices');
    cy.wait('@getbertTaggers');
  }

  function tagRandomDoc() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appBertTaggerMenuTagRandomDoc]').should('be.visible').click();

    cy.get('[data-cy=appBertTaggerTagRandomDocDialogSubmit]').should('be.visible').click();
    cy.wait('@postbertTaggers').then(resp => {
      cy.wrap(resp).its('response.statusCode').should('eq', 200);
      cy.get('[data-cy=appBertTaggerTagRandomDocDialogClose]').click();
    });

  }


  function tagText() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appBertTaggerMenuTagText]').should('be.visible').click();
    cy.get('[data-cy=appBertTaggerTagTextDialogText] input:first()').should('be.visible').click()
      .clear().invoke('val', 'tere Ooot, misasi see võõrast aiast maasikate võtmine on, kui ta vargus pole???').trigger('change');
    cy.get('[data-cy=appBertTaggerTagTextDialogText]').click().type(' ');

    cy.get(' [type="submit"]').should('be.visible').click();


    cy.wait('@postbertTaggers').then(intercepted => {
      cy.wrap(intercepted).its('response.statusCode').should('eq', 200);

    })
    cy.get('[data-cy=appBertTaggerTagTextDialogClose]').click();
  }

  it('should be able to create a new bert-tagger', function () {
    // create clustering
    initPage();
    cy.get('[data-cy=appBertTaggerCreateBtn]').click();
    cy.wait('@getbertTaggers');
    cy.get('[data-cy=appBertTaggerCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test');
    }));
    cy.get('[data-cy=appBertTaggerCreateDialogIndices]').click().then((indices => {
      cy.wrap(indices).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.wrap(indices).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appBertTaggerCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('comment_content').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appBertTaggerCreateDialogQuery]').type('{"query":{"bool":{"must":[],"filter":[],"must_not":[],"should":[{"bool":{"must":[{"bool":{"should":[{"multi_match":{"query":"tere","type":"phrase_prefix","slop":"0","fields":["comment_content"]}}],"minimum_should_match":1}}]}}],"minimum_should_match":1}}}',{ parseSpecialCharSequences: false })
    cy.get('[data-cy=appBertTaggerCreateDialogSubmit]').click();
    cy.wait('@postbertTaggers').its('response.statusCode').should('eq', 201);
    cy.wait(1000);
    cy.get('.mat-header-row > .cdk-column-author__username').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0]).each(xy => { // hack to wait for task to complete
        cy.wrap(bb).click();
         cy.wait('@getbertTaggers').then((intercepted) => {
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
    tagRandomDoc();
    tagText();

    cy.get('.cdk-column-actions:nth(1)').click();
    cy.get('[data-cy=appBertTaggerMenuDelete]').click();
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.wait('@deletebertTaggers');
    cy.get('.cdk-column-actions').should('have.length', 1);

  });
});
