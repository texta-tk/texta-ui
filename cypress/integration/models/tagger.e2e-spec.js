describe('tagger extra actions should work', function () {
  beforeEach(function () {
    cy.fixture('users').then((user) => {
      cy.server();
      cy.login(user.username, user.password);
      cy.createTestProject();
      cy.route('GET', '**user**').as('getUser');
      cy.route('GET', '**get_fields**').as('getProjectFields');
      cy.route('GET', '**/taggers/**').as('getTaggers');
      cy.visit('/taggers');
      cy.wait('@getProjectFields');
      cy.get('[data-cy=appNavbarProjectSelect]').click();
      cy.get('mat-option').contains('integration_test_project').click();
    });
  });
  /*  it('extra_actions should work', function () {
      // list features
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuListFeatures]').should('be.visible').click();
      cy.wait('@getTaggers');
      cy.get('.mat-dialog-content > div').should('have.length', 100);
      cy.closeCurrentCdkOverlay();
      // Stop words
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuStopWords]').should('be.visible').click();
      cy.get('.mat-dialog-container textarea').should('be.visible').click().clear().type('ja');
      cy.route('POST', '**!/taggers/!**').as('postTagger');
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
      cy.get('app-tag-doc-dialog input:first()').should('be.visible').click()
        .clear()
        .type('{\n' +
          '   "post_date": "2013-12-16",\n' +
          '   "forum": "Seks ja suhted",\n' +
          '   "topic": "Rinna muutmine.",\n' +
          '   "content": "Sinu jutu põhjal tundud olevat ikka veel väga noor. Kas nainegi sul täisealine on?",\n' +
          '   "user": "oravaluukere",\n' +
          '   "content_mlp-lite.stats.relative_punct": "0_0",\n' +
          '   "content_mlp-lite.stats.urls": "",\n' +
          '   "content_mlp-lite.stats.trigger_words": "",\n' +
          '   "content_mlp-lite.stats.shit_tokens": "",\n' +
          '   "content_mlp-lite.stats.relative_caps": "0_0",\n' +
          '   "content_mlp-lite.stats.lang": "et",\n' +
          '   "content_mlp-lite.stats.text_length": "2",\n' +
          '   "content_mlp-lite.stats.obfuscated": "",\n' +
          '   "content_mlp-lite.text": "jutt põhjal tunduma noor . naine täisealine ?"\n' +
          '}');
      cy.get('.mat-dialog-container [type="submit"]').should('be.visible').click();
      cy.wait('@postTagger');
      cy.closeCurrentCdkOverlay();
      // Tag random doc
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appTaggerMenuTagRandomDoc]').should('be.visible').click();
      cy.wait('@getTaggers');
      cy.get('app-tag-random-doc-dialog .code-wrapper pre').should('be.visible');
      cy.closeCurrentCdkOverlay();
    });*/
});
