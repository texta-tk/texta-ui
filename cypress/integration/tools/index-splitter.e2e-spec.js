describe('index-splitter should work', function () {
  beforeEach(function () {
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
      });
    });
  });
  function initImporterPage(){
    cy.visit('/index-splitter');
    cy.wait('@getProjectIndices');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }
  it('should be able to create a new dataset task', function () {
    initImporterPage();
    cy.intercept('POST', '**/index_splitter/**').as('postSplitterTasks');
    cy.get('[data-cy=appIndexSplitterCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appIndexSplitterCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testIndexSplitter');
    }));
    cy.get('[data-cy=appIndexSplitterCreateDialogTrainIndex]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test_index_splitter');
    }));
    cy.get('[data-cy=appIndexSplitterCreateDialogTestIndex]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test_index_splitter2');
    }));
    cy.get('[data-cy=appIndexSplitterCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postSplitterTasks').then(created=>{
      expect(created.response.statusCode).to.eq(201);
      assert.equal(created.response.body.task.status, 'created');
    });
    cy.intercept('GET', '**/index_splitter/**').as('getSplitterTasks');
    cy.get('.mat-header-row > .cdk-column-author_username').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0, 0, 0, 0]).each(y => { // hack to wait for task to complete
        cy.wrap(bb).click();
        return cy.wait('@getSplitterTasks').then((x) => {
          if (x?.response?.body?.results[0]?.task?.status === 'completed') {
            assert.equal(x?.response?.body?.results[0]?.task?.status, 'completed');
            return false;
          }else if (x?.response?.body?.results[0]?.task?.status === 'failed') {
            assert.equal(x?.response?.body?.results[0]?.task?.status, 'completed');
            return false;
          }
          return cy.wait(5000);
        });
      })
    });
  });
});
