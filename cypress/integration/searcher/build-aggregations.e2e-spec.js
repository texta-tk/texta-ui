describe('should be able to build non nested aggregations', function () {
  beforeEach(function () {
    cy.visit('/');
    cy.server();
    cy.route('GET', '**user**').as('getUser');
    cy.route('GET', '**projects**').as('projects');
    cy.route('GET', '**get_fields**').as('getProjectFields');
    cy.route('POST', 'search_by_query').as('searcherQuery');
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.wait('@getUser');
      cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('be.visible');
      cy.get('[ng-reflect-router-link="searcher"]').click();
    });
    cy.wait('@getProjectFields');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
  });
  function submitAndCheckTableResult(){
    cy.get('[data-cy=appSearcherSidebarAggregationsSubmit]').should('be.visible').click();
    cy.wait('@searcherQuery');
    cy.get('.cdk-column-key').should('be.visible');
  }
  function submitAndCheckGraphResult(amountOfLines){
    cy.get('[data-cy=appSearcherSidebarAggregationsSubmit]').should('be.visible').click();
    cy.wait('@searcherQuery');
    cy.get('[ngx-charts-line-series]').should('have.length', amountOfLines);
  }
  it('should be able to build text, fact and date aggregation', function () {
    cy.get('[data-cy=appSearcherSidebarAggregationsPanel]').should('be.visible').click();

    // check text aggregations
    cy.get('[data-cy=appSearcherSideBarAggregationsSelectField]').should('be.visible').click();
    cy.get('mat-option').contains('content').scrollIntoView().should('be.visible').click();
    cy.closeCurrentCdkOverlay();
    submitAndCheckTableResult();
    cy.get('[data-cy=appSearcherSidebarAggregationsTextAggregationType]').should('be.visible').click();
    cy.get('mat-option').contains('significant items').should('be.visible').click();
    cy.closeCurrentCdkOverlay();
    submitAndCheckTableResult();
    cy.get('[data-cy=appSearcherSidebarAggregationsTextAggregationType]').click();
    cy.get('mat-option').contains('significant words').should('be.visible').click();
    submitAndCheckTableResult();
    cy.get('[data-cy=appSearcherSidebarSavedSearches] .cdk-column-select:nth(1)').should('be.visible').click('left');
    submitAndCheckTableResult();
    cy.get('app-aggregation-results .mat-tab-label').should('have.length', 2);
    cy.get('[data-cy=appSearcherSidebarSavedSearches] .cdk-column-select:nth(1)').should('be.visible').click('left');

    // check date aggregations
    cy.get('[data-cy=appSearcherSideBarAggregationsSelectField]').should('be.visible').click();
    cy.get('mat-option').contains('post_date').scrollIntoView().should('be.visible').click();
    cy.closeCurrentCdkOverlay();
    submitAndCheckGraphResult(1);
    cy.get('[data-cy=appSearcherSidebarSavedSearches] .cdk-column-select:nth(1)').should('be.visible').click('left');
    submitAndCheckGraphResult(2);
    cy.get('[data-cy=appSearcherSidebarSavedSearches] .cdk-column-select:nth(1)').should('be.visible').click('left');
    cy.get('[data-cy=appSearcherSidebarAggregationsDateAggregationType]').should('be.visible').click();
    cy.get('mat-option').contains('relative frequency').should('be.visible').click();
    cy.closeCurrentCdkOverlay();
    submitAndCheckGraphResult(1);
    cy.get('[data-cy=appSearcherSidebarAggregationsDateInterval]').should('be.visible').click();
    cy.get('mat-option').contains('month').should('be.visible').click();
    cy.closeCurrentCdkOverlay();
    submitAndCheckGraphResult(1);
    // todo test appSearcherSidebarSavedSearches
  });


});
