describe('bert-taggers should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/bert_taggers/**').as('getBertTaggers');
        cy.intercept('POST', '**/bert_taggers/**').as('postBertTaggers');
        cy.intercept('DELETE', '**/bert_taggers/**').as('deleteBertTaggers');
      });
    });
  });

  function initPage() {
    cy.visit('/bert-taggers');
    cy.wait('@getProjectIndices');
    cy.wait('@getBertTaggers');
  }

  function tagRandomDoc() {
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appBertTaggerMenuTagRandomDoc]').should('be.visible').click();

    cy.get('[data-cy=appBertTaggerTagRandomDocDialogSubmit]').should('be.visible').click();
    cy.wait('@postBertTaggers').then(resp => {
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


    cy.wait('@postBertTaggers').then(intercepted => {
      cy.wrap(intercepted).its('response.statusCode').should('eq', 200);

    })
    cy.get('[data-cy=appBertTaggerTagTextDialogClose]').click();
  }

  function confusionMatrix(){
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appBertTaggerMenuConfusionMatrix]').should('be.visible').click();
    cy.get('.nsewdrag').should('be.visible');
    cy.closeCurrentCdkOverlay();
  }

  function applyToIndices(){
    cy.get('.cdk-column-actions:nth(1)').should('be.visible').click();
    cy.get('[data-cy=appBertTaggerMenuApplyToIndices]').should('be.visible').click();
    cy.get('[data-cy=appBertTaggerApplyDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testApply');
    }));
    cy.get('[data-cy=appBertTaggerApplyDialogFields]').click().then((fields => {
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
    cy.get('[data-cy=appBertTaggerApplyDialogFactName]').click().then((fact => {
      cy.wrap(fact).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(fact, 'required');
      cy.wrap(fact).type('XXX');
    }));
    cy.get('[data-cy=appBertTaggerApplyDialogSubmit]').should('be.visible').click();
    cy.wait('@postBertTaggers').then(created=>{
      expect(created.response.statusCode).to.eq(201);
    });
    cy.wait('@getBertTaggers');
  }

  it('should be able to create a new bert-tagger', function () {
    // create clustering
    initPage();
    cy.get('[data-cy=appBertTaggerCreateBtn]').click();
    cy.wait('@getBertTaggers');
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
    cy.wait('@postBertTaggers').its('response.statusCode').should('eq', 201);
    cy.wait('@getBertTaggers');
    cy.wait(1000);
    cy.get('.mat-header-row > .cdk-column-author__username').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0, 0, 0]).each(xy => { // hack to wait for task to complete
        cy.wrap(bb).click();
         cy.wait('@getBertTaggers').then((intercepted) => {
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

    applyToIndices();
    tagRandomDoc();
    tagText();
    confusionMatrix();

    cy.get('.cdk-column-actions:nth(1)').click();
    cy.get('[data-cy=appBertTaggerMenuDelete]').click();
    cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
    cy.wait('@deleteBertTaggers');
    cy.get('.cdk-column-actions').should('have.length', 1);

  });
});
