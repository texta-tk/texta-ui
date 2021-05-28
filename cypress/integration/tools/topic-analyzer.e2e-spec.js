describe('Topic Analyzer should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/clustering/?ordering?**').as('getClustering');
        cy.intercept('DELETE', '**/clustering/**').as('deleteClustering');
        cy.intercept('POST', '**/clustering/**').as('postClustering');
        cy.intercept('PATCH', '**/clustering/**').as('patchClustering');
      });
    });
  });

  function initClusteringPage() {
    cy.visit('/topic-analyzer');
    cy.wait('@getClustering');
    cy.wait('@getProjectIndices');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  }

  it('Topic Analyzer should work', function () {
    // create clustering
    initClusteringPage();
    cy.get('[data-cy=appClusteringCreateBtn]').click();
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
      cy.get('.mat-option-text').contains('comment_content').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appClusterCreateDialogSubmit]').click();
    cy.wait('@postClustering').then(created => {
      expect(created.response.statusCode).to.eq(201);
      assert.equal(created.response.body.task.status, 'created');
    });
    // wait til clustering is done
    cy.get('.mat-header-row > .cdk-column-id').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0, 0]).each(y => { // hack to wait for task to complete
        cy.wrap(bb).click();
        return cy.wait('@getClustering').then((x) => {
          if (x?.response?.body?.results[0]?.task?.status === 'completed') {
            assert.equal(x?.response?.body?.results[0]?.task?.status, 'completed');
            return false;
          }
          return cy.wait(5000);
        });
      })
    });
    cy.wait(500);
    cy.get('.cdk-column-Modify:nth(1)').click();
    cy.get('[data-cy=appClusteringMenuViewClusters]').click();
    cy.get('.cdk-column-significant_words:nth(1)').click();
    cy.get('.cdk-column-comment_content').should('be.visible');
    cy.get('[data-cy=appClusterDocumentsMLTBtn]').click();
    cy.wait('@postClustering').its('response.body')
      .should('have.length.greaterThan', 1);
    cy.get('app-similar-cluster-dialog .mat-header-cell.mat-column-select').should('be.visible').click();
    cy.get('[data-cy=appClusterSimilarTableAddToCluster]').should('be.visible').click();
    cy.get('[type="submit"]').click();
    cy.wait('@postClustering').its('response.body')
      .should('have.property', 'message');
    cy.intercept('GET', '**/clusters/**').as('getClusters');
    cy.closeCurrentCdkOverlay();
    cy.wait('@getClusters');
    cy.get('[data-cy=appClusterDocumentsTagBtn]').click();
    cy.get('[data-cy=appTagClusterFactName]').type('test');
    cy.get('[data-cy=appTagClusterStrVal]').type('test');
    cy.get('[data-cy=appTagClusterDocPath]').type('comment_content');
    cy.get('[data-cy=appTagClusterSubmit]').click();
    cy.wait('@postClustering').its('response.body').should('deep.equal', {
      message: 'Successfully started adding fact test to the documents! This might take a bit depending on the clusters size'
    });
    cy.get('.mat-header-cell.mat-column-select').click();
    cy.get('[data-cy=appClusterDocumentsDeleteBtn]').click();
    cy.get('[type="submit"]').click();
    cy.wait('@postClustering').its('response.body').should('deep.equal', {
      message: 'Documents successfully removed from the cluster!'
    });

    cy.intercept('GET', '**/view_clusters/').as('getClusteringClusters');
    cy.get('.breadcrumb > :nth-child(2) .action-text').click();
    cy.wait('@getClusteringClusters');
    cy.get('.mat-header-cell.mat-column-select > mat-checkbox').click();
    cy.get('[data-cy=appClustersDeleteBtn]').click();
    cy.get('[type="submit"]').click();
    cy.wait('@postClustering').its('response.body')
      .should('have.property', 'message');
    cy.get('.breadcrumb > :nth-child(1) .action-text').click();
    cy.wait('@getClustering');
    cy.get('.mat-header-cell.mat-column-select > mat-checkbox').click();
    cy.get('[data-cy=appClusteringDeleteBtn]').click();
    cy.get('[type="submit"]').click();
    cy.wait('@postClustering').its('response.body')
      .should('have.property', 'num_deleted');
    // appClusterDocumentsTagBtn
    // test extra actions

  });
});
