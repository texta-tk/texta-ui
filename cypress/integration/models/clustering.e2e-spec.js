describe('clustering should work', function () {
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
        cy.route('GET', '**/clustering/**').as('getClustering');
        cy.route('DELETE', '**/clustering/**').as('deleteClustering');
        cy.route('POST', '**/clustering/**').as('postClustering');
        cy.route('PATCH', '**/clustering/**').as('patchClustering');
      });
    });
  });

  function initClusteringPage() {
    cy.visit('/clustering');
    cy.wait('@getClustering');
    cy.wait('@getProjectIndices');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('clustering should work', function () {
    // create clustering
    initClusteringPage();
    cy.get('[data-cy=appClusteringCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appClusterCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testClustering');
    }));
    cy.get('[data-cy=appClusterCreateDialogFields]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text:nth(1)').should('be.visible').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appClusterCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postClustering').then(created => {
      expect(created.status).to.eq(201);
      assert.equal(created.response.body.task.status, 'created');
    });
    // wait til clustering is done
/*    for (let x = 0; x <= 5; x++) {
      cy.get('.mat-header-row > .cdk-column-id').should('be.visible').click();
      cy.wait('@getClustering').then(x => {
        console.log(x);
      });
      cy.wait(5000);
    }*/
    // test extra actions

  });
});
