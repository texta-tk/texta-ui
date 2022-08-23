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
        cy.intercept('GET', '**/topic_analyzer/?ordering?**').as('getClustering');
        cy.intercept('POST', '**/topic_analyzer/').as('postClustering');
        cy.intercept('POST', '**/more_like_cluster/').as('postMoreLikeCluster');
        cy.intercept('DELETE', '**/topic_analyzer/**').as('deleteClustering');
        cy.intercept('PATCH', '**/topic_analyzer/**').as('patchClustering');
        cy.intercept('GET', '**/clusters/**').as('getClusters');
        cy.intercept('GET', '**/view_clusters/').as('getClusteringClusters');
        cy.intercept('POST', '**/expand_cluster/').as('postExpandCluster');
        cy.intercept('POST', '**/tag_cluster/').as('postTagCluster');
        cy.intercept('POST', '**/remove_documents/').as('postRemoveDocuments');
        cy.intercept('POST', '**/bulk_delete_clusters/').as('postBulkDeleteClusters');
        cy.intercept('POST', '**/topic_analyzer/bulk_delete/').as('postBulkDeleteTopicAnalyzers');
      });
    });
  });

  function initClusteringPage() {
    cy.visit('/topic-analyzer');
    cy.wait('@getUser');
    cy.wait('@getProjectIndices');
    cy.wait('@getClustering');
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
      cy.get('.mat-option-text').contains(new RegExp(' comment_content ', '')).click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appClusterCreateDialogSubmit]').click();
    cy.wait('@postClustering').then(created => {
      expect(created.response.statusCode).to.eq(201);
      assert.equal(created.response.body.tasks[0].status, 'created');
    });
    // wait til clustering is done
    cy.get('.mat-header-row > .cdk-column-id').should('be.visible').then(bb => {
      cy.wrap([0, 0, 0, 0, 0]).each(y => { // hack to wait for task to complete
        cy.wrap(bb).click();
        return cy.wait('@getClustering').then((x) => {
          if (x?.response?.body?.results[0]?.tasks[0]?.status === 'completed') {
            assert.equal(x?.response?.body?.results[0]?.tasks[0]?.status, 'completed');
            return false;
          }
          return cy.wait(5000);
        });
      })
    });

    cy.get('[data-cy=appClusteringViewClustersButton]').click();
    cy.wait('@getClusteringClusters');
    cy.get('.cdk-column-significant_words:nth(1)').click();
    cy.wait('@getClusters');
    cy.get('.cdk-column-comment_content').should('be.visible');
    cy.wait(500);
    cy.get('[data-cy=appClusterDocumentsMLTBtn]').click();

    cy.wait('@postMoreLikeCluster').its('response.body').should('have.length.gte', 1);
    cy.get('app-similar-cluster-dialog .mat-header-cell.mat-column-select').should('be.visible').click();
    cy.get('[data-cy=appClusterSimilarTableAddToCluster]').should('be.visible').click();
    cy.get('[type="submit"]').click();
    cy.wait('@postExpandCluster').its('response.body')
      .should('have.property', 'message');
    cy.closeCurrentCdkOverlay();
    cy.closeCurrentCdkOverlay();
    cy.wait('@getClusters');
    cy.get('[data-cy=appClusterDocumentsTagBtn]').click();
    cy.wait(1000);
    cy.get('[data-cy=appTagClusterFactName]').type('test');
    cy.closeCurrentCdkOverlay();
    cy.get('[data-cy=appTagClusterStrVal]').type('test');
    cy.closeCurrentCdkOverlay();
    cy.get('[data-cy=appTagClusterDocPath]').click().then((docPaths => {
      cy.wrap(docPaths).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(docPaths, 'required');
      cy.wrap(docPaths).click();
      cy.get('.mat-option-text').contains('comment_content').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(docPaths).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appTagClusterSubmit]').click();
    cy.wait('@postTagCluster').its('response.body').should('deep.equal', {
      message: 'Successfully started adding fact test to the documents! This might take a bit depending on the clusters size'
    });
    cy.get('.mat-header-cell.mat-column-select').click();
    cy.get('[data-cy=appClusterDocumentsDeleteBtn]').click();
    cy.get('[type="submit"]').click();
    cy.wait('@postRemoveDocuments').its('response.body').should('deep.equal', {
      message: 'Documents successfully removed from the cluster!'
    });

    cy.get('.breadcrumb > :nth-child(2) .action-text').click();
    cy.wait('@getClusteringClusters');
    cy.wait(500);
    cy.get('.mat-header-cell.mat-column-select > mat-checkbox').click();
    cy.get('[data-cy=appClustersDeleteBtn]').click();
    cy.get('[type="submit"]').click();
    cy.wait('@postBulkDeleteClusters').its('response.body')
      .should('have.property', 'message');
    cy.get('.breadcrumb > :nth-child(1) .action-text').click();
    cy.wait('@getClustering');
    cy.wait(500);
    cy.get('.mat-header-cell.mat-column-select > mat-checkbox').click();
    cy.get('[data-cy=appClusteringDeleteBtn]').click();
    cy.get('[type="submit"]').click();
    cy.wait('@postBulkDeleteTopicAnalyzers').its('response.body')
      .should('have.property', 'num_deleted');
    // appClusterDocumentsTagBtn
    // test extra actions

  });
});
