describe('Anonymizer should work', function () {
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
        cy.route('GET', '**/anonymizers/**').as('getAnonymizers');
        cy.route('POST', '**/anonymizers/**').as('postAnonymizer');
        cy.route('POST', '**/anonymize_text/**').as('AnonymizeText');
      });
    });
  });

  function initAnonymizerPage() {
    cy.visit('/anonymizers');
    cy.wait('@getAnonymizers');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('Anonymizers should work', function () {
    initAnonymizerPage();
    cy.get('[data-cy=appToolsAnonymizerCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appAnonymizerCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testAnonymizer');
    }));
    cy.get('[data-cy=appAnonymizerCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postAnonymizer').then(created => {
      expect(created.status).to.eq(201);
    });

    cy.get('.cdk-column-actions:nth(1)').click('left');
    cy.get('[data-cy=appAnonymizerTextAction]').click();
    cy.get('[data-cy=appAnonymizerAnonymizeText]').then((text => {
      cy.wrap(text).should('have.class', 'mat-focused').type('b').find('textarea').clear();
      cy.matFormFieldShouldHaveError(text, 'required');
      cy.wrap(text).type('arvati Silver Semiskarile mõistetud 9 aasta ja 6 kuu pikkusest vangistusest maha eelmise kohtuotsusega mõistetud karistuse ärakantud osa ja lõplikuks karistuseks mõisteti Silver Semiskarile 4 aastat 2 kuud ja 15 päeva vangistust, kandmise algusega 20. septembrist 2018;', {delay: 0});
    }));
    cy.get('[data-cy=appAnonymizerAnonymizeNames]').click().then((names => {
      cy.wrap(names).type('Silver, Semiskar');
      cy.wrap(names).find('mat-error').should('have.length', 0);
    }));

    cy.get('[data-cy=appAnonymizeTextSubmit]').should('be.visible').click();
    cy.wait('@AnonymizeText').then(x => {
      cy.get('pre').should('be.visible');
      cy.closeCurrentCdkOverlay();
      cy.wait(100);
      cy.get('.mat-header-row > .cdk-column-select').click(24,24);
      cy.get('[data-cy=appAnonymizerDeleteBtn]').click();
      cy.get('[type="submit"]').click();
      cy.wait('@postAnonymizer').its('responseBody')
        .should('have.property', 'num_deleted');
    });
  });
});
