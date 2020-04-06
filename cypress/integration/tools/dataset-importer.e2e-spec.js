describe('dataset-importer should work', function () {
  beforeEach(function () {
    cy.fixture('users').then((user) => {
      cy.server();
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.route('GET', '**user**').as('getUser');
        cy.route('GET', '**get_fields**').as('getProjectFields');
        cy.route('GET', '**/dataset_imports/**').as('getDatasets');
        cy.route('DELETE', '**/dataset_imports/**').as('deleteDatasets');
        cy.route('POST', '**/dataset_imports/**').as('postDatasets');
      });
    });
  });
  function initImporterPage(){
    cy.visit('/dataset-importer');
    cy.wait('@getProjectFields');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }
  it('should be able to create a new dataset task', function () {
    initImporterPage();
    cy.get('[data-cy=appToolsDatasetImporterCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appDatasetImporterCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testImporter');
    }));
    cy.get('[data-cy=appDatasetImporterCreateDialogName]').click().then((name => {
      cy.wrap(name).should('have.class', 'mat-focused').type('asd').find('input').clear();
      cy.matFormFieldShouldHaveError(name, 'required');
      cy.wrap(name).type('newIndex');
    }));
    cy.get('input[type=file]').attachFile({
      filePath: "testSample.csv",
    });
    cy.get('[data-cy=appDatasetImporterCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postDatasets').then(created=>{
      expect(created.status).to.eq(201);
      assert.equal(created.response.body.task.status, 'created');
      // delete dataset task
      cy.get('.cdk-column-Modify:nth(1)').should('be.visible').click();
      cy.get('[data-cy=appDatasetImportMenuDelete]').should('be.visible').click();
      cy.get('[data-cy=appConfirmDialogSubmit]').should('be.visible').click();
      cy.wait('@deleteDatasets');
    });
  });
});
