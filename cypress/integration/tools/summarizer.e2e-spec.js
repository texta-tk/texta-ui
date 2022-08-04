describe('Summarizer should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('POST', '**/summarizer_index/bulk_delete/').as('bulkDeleteSummarizers');
        cy.intercept('GET', '**/summarizer_index/**').as('getSummarizers');
        cy.intercept('OPTIONS', '**/summarizer_index/**').as('getSummarizerOptions');
        cy.intercept('POST', '**/summarizer_index/').as('postSummarizer');
        cy.intercept('POST', '**/summarizer/summarize').as('postSummarizeText');
      });
    });
  });

  function initSummarizerPage() {
    cy.visit('/summarizers');
    cy.wait('@getSummarizers');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('Create Summarizer', function () {
    initSummarizerPage();
    cy.get('[data-cy=appSummarizerCreateBtn]').should('be.visible').click();
    cy.wait('@getSummarizerOptions');
    cy.get('[data-cy=appSummarizerCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testSummarizer');
    }));
    cy.get('[data-cy=appSummarizerCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains(new RegExp(' comment_content ', '')).click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appSummarizerCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postSummarizer').then(created => {
      expect(created.response.statusCode).to.eq(201);
    });
    cy.wait('@getSummarizers');

    cy.get('[data-cy=appToolsSummarizerApplyTextBtn]').click();
    cy.wait('@getSummarizerOptions');
    cy.get('[data-cy=appSummarizerApplyDialogText]').then((text => {
      cy.wrap(text).should('have.class', 'mat-focused').type('b').find('textarea').clear();
      cy.matFormFieldShouldHaveError(text, 'required');
      cy.wrap(text).find('textarea').invoke('val', 'A Russian court has sentenced US basketball star Brittney Griner to nine years in prison on drug charges.\n' +
        '\n' +
        'As Griner, 31, was being led out of the courtroom in handcuffs, she was heard saying: "I love my family."\n' +
        '\n' +
        'The double Olympic winner has admitted possessing cannabis oil, but told the court she had made an "honest mistake".\n' +
        '\n' +
        'The court near Moscow convicted her of smuggling and possessing narcotics. The prosecution had sought a nine-and-a-half year jail term.\n' +
        '\n' +
        'Reading the verdict on Thursday, the presiding judge said she had taken into account the fact that the American had already spent a considerable time in detention.\n' +
        '\n' +
        'Griner\'s defence lawyer Maria Blagovolina said her client was "very upset, very stressed".\n' +
        '\n' +
        '"She can hardly talk. It\'s a difficult time for her. When we saw Brittney on Tuesday, we told her, \'See you on Thursday\'. She said, \'See you on doomsday\'. So it looks like she was right."').trigger('change').type('.');
    }));
    cy.get('[data-cy=appSummarizerApplyDialogSubmit]').click()
    cy.wait('@postSummarizeText');
    cy.get('.mat-expansion-panel-body').should('be.visible');
    cy.closeCurrentCdkOverlay();

    cy.get('.mat-header-row > .cdk-column-select >').click();
    cy.get('[data-cy=appSummarizerDeleteBtn]').click();
    cy.get('[data-cy=appConfirmDialogSubmit]').click();
    cy.wait('@bulkDeleteSummarizers').its('response.statusCode').should('eq', 200);
    cy.wait('@getSummarizers');
    cy.get('.cdk-column-id').should('have.length', 1);
  });
});
