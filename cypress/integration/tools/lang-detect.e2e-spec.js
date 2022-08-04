describe('LangDetect should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('POST', '**/lang_index/bulk_delete/').as('bulkDeleteLangDetects');
        cy.intercept('GET', '**/lang_index/**').as('getLangDetects');
        cy.intercept('OPTIONS', '**/lang_index/**').as('getLangDetectOptions');
        cy.intercept('POST', '**/lang_index/').as('postLangDetect');
        cy.intercept('POST', '**/mlp/detect_lang/').as('postDetectLang');
      });
    });
  });

  function initLangDetectPage() {
    cy.visit('/lang-detect');
    cy.wait('@getLangDetects');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('Create LangDetect', function () {
    initLangDetectPage();
    cy.get('[data-cy=appLangDetectCreateBtn]').should('be.visible').click();
    cy.wait('@getLangDetectOptions');
    cy.get('[data-cy=appLangDetectCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testLangDetect');
    }));
    cy.get('[data-cy=appLangDetectCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains(new RegExp(' comment_content ', '')).click();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appLangDetectCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postLangDetect').then(created => {
      expect(created.response.statusCode).to.eq(201);
    });
    cy.wait('@getLangDetects');

    cy.get('[data-cy=appToolsLangDetectApplyToTextBtn]').click();
    cy.get('[data-cy=appLangDetectApplyDialogText]').then((text => {
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
    cy.get('[data-cy=appLangDetectApplyDialogSubmit]').click()
    cy.wait('@postDetectLang');
    cy.get('.mat-expansion-panel-body').should('be.visible');
    cy.closeCurrentCdkOverlay();

    cy.get('.mat-header-row > .cdk-column-select >').click();
    cy.get('[data-cy=appLangDetectDeleteBtn]').click();
    cy.get('[data-cy=appConfirmDialogSubmit]').click();
    cy.wait('@bulkDeleteLangDetects').its('response.statusCode').should('eq', 200);
    cy.get('.cdk-column-id').should('have.length', 1);
  });
});
