describe('searching and search related activities should be working correctly', function () {
  beforeEach(function () {
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.createTestSavedSearch(x.body.id);
      });
      cy.intercept('GET', '**user**').as('getUser');
      cy.intercept('GET', '**projects**').as('projects');
      cy.intercept('POST', '**export_search**').as('export');
      cy.intercept('GET', '**get_fields**').as('getProjectIndices');
      cy.intercept('POST', 'search_by_query').as('searcherQuery');
      cy.visit('/');
      cy.wait('@getUser');
      cy.wait('@getProjectIndices');
      cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('be.visible');
      cy.get('[data-cy=appNavbarSearcher]').click();
      cy.get('[data-cy=appNavbarProjectSelect]').click();
      cy.get('mat-option').contains('integration_test_project').click();
      cy.wait('@getProjectIndices');
    });

  });
  it('should display search results in a table, export', function () {
    cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted').should('be.visible');
    cy.get('.mat-paginator-navigation-next').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted ').should('be.visible');
    cy.get('.mat-paginator-navigation-last').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted ').should('be.visible');
    cy.get('.mat-paginator-navigation-first').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted ').should('be.visible');
    cy.get('[data-cy=appSearcherTableColumnSelect]').should('be.visible').click();
    // select all
    cy.get('[data-cy=matOptionSelectAll]').should('be.visible').click();
    // deselect all
    cy.get('[data-cy=matOptionSelectAll]').should('be.visible').click();
    cy.get('mat-option').contains('comment_content').click();
    cy.closeCurrentCdkOverlay();
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted ').should('be.visible');
    cy.get('mat-paginator .mat-paginator-page-size .mat-form-field').should('be.visible').click();
    cy.get('mat-option').contains('20').click();
    cy.wait('@searcherQuery');
    cy.get('.cdk-column-comment_content').should('have.length', 21);
    cy.get('.cdk-column-comment_content:first()').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted ').should('be.visible');
    cy.get('.cdk-column-comment_content:first()').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted ').should('be.visible');

    cy.get('[data-cy=appSearcherTableExport]').click();
    cy.wait('@export').then(x => {
      assert(typeof x.response.body === 'string');
    })
    // todo test appSearcherSidebarSavedSearches
  });
  it('should work when building various queries with simple and advanced search', function () {
    // simple
    cy.get('app-simple-search input').click().type('reisija');
    cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > app-highlight span').should('be.visible');
    // change proj, to test projectindices subscribers
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option:nth(2)').contains('integration_test_project').click();
    cy.wait('@getProjectIndices');

    // test searcher options, highlight search matches
    cy.get('[data-cy=appSearcherSidebarSearcherOptionsPanel]').click();
    cy.get('app-simple-search input').click().clear().type('reisija');
    cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > app-highlight span').should('be.visible');
    cy.get('[data-cy=appSearcherSidebarBuildSearchShowShortVersion]').click();

    cy.get('[data-cy=appSearcherSidebarBuildSearchHighlightSearcher]').click();
    cy.get('app-simple-search input').click().clear().type('reisija');
    cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > app-highlight span span').should('not.exist');

    // date
    cy.get('[data-cy=appSearcherSidebarBuildSearchRadio] mat-radio-button:not(:first())').should('be.visible').click();
    cy.get('[data-cy=appSearcherSideBarBuildSearchConstraintSelect]').click();
    cy.get('mat-option').contains('@timestamp').scrollIntoView().click();
    cy.closeCurrentCdkOverlay();
    cy.get('[data-cy=appSearcherSideBarBuildSearchDateConstraintStart]')
      .should('be.visible')
      .click()
      .type('1/3/2016');
    cy.get('[data-cy=appSearcherSideBarBuildSearchDateConstraintEnd]')
      .should('be.visible')
      .click()
      .type('3/24/2020');
    cy.wait(1000); // todo searchoptions debouncetime
    cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted ').should('be.visible');

    // fact-name
    cy.get('[data-cy=appSearcherSideBarBuildSearchConstraintSelect]').click();
    cy.get('mat-option').contains('texta_facts[fact_name]').scrollIntoView().click();
    cy.closeCurrentCdkOverlay();
    cy.wait(1000);
    cy.get('[data-cy=appSearcherSideBarBuildSearchFactNameOperator]').click();
    cy.get('mat-option').contains('not').click();
    cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
    cy.wait('@searcherQuery');
    cy.get('[data-cy=appSearcherSideBarBuildSearchFactNameName]').click();
    cy.get('mat-option').contains('TEEMA').click();
    cy.closeCurrentCdkOverlay();
    cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted ').should('be.visible');

    cy.get('[data-cy=appSearcherTableColumnSelect]').should('be.visible').click();
    cy.get('[data-cy=matOptionSelectAll]').should('be.visible').click();
    cy.get('[data-cy=matOptionSelectAll]').should('be.visible').click();
    cy.get('mat-option').contains('texta_facts').click();
    cy.get('mat-option').contains('comment_content').click();
    cy.closeCurrentCdkOverlay();

    cy.get('.cdk-column-texta_facts > app-texta-facts-chips > span').should('not.exist');

    cy.get('[data-cy=appSearcherSidebarBuildSearchHighlightFacts]').click();
    cy.get(':nth-child(1) > .cdk-column-comment_content > app-highlight span span').should('not.exist');
    cy.get('[data-cy=appSearcherSideBarBuildSearchFactNameOperator]').click();
    cy.get('mat-option').contains('and').click();
    cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
    cy.wait('@searcherQuery');
    cy.get('.cdk-column-texta_facts > app-texta-facts-chips > span').should('exist');

    // fact values
    cy.get(':nth-child(1) > .cdk-column-texta_facts > app-texta-facts-chips > span').contains(/foo|bar/g).first().scrollIntoView().click()
      .then(span => {
        const text = span.text();
        cy.get('[data-cy=appSearcherSideBarBuildSearchFactValueInputGroupOperator]').click();
        cy.get('mat-option').contains('not').click();
        cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
        cy.wait('@searcherQuery');
        cy.get('.cdk-column-texta_facts > app-texta-facts-chips > span').contains(text).should('not.exist');

        cy.get('[data-cy=appSearcherSideBarBuildSearchFactValueInputGroupOperator]').should('be.visible').click();
        cy.get('mat-option').contains('is').click();
        cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
        cy.wait('@searcherQuery');
        cy.wait(1000); // texta facts are async rendered
        cy.get('.cdk-column-texta_facts > app-texta-facts-chips > span').contains(text).should('exist');

        cy.get('[data-cy=appSearcherSideBarBuildSearchFactValueInputGroupAdd]').click();

        cy.get('[data-cy=appSearcherSideBarBuildSearchFactValueInputGroupOperator]:first()').click();
        cy.get('mat-option').contains('not').click();
        cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
        cy.wait('@searcherQuery');
        let foobar = 'foo';
        if(text === 'foo '){
          foobar = 'bar'
        }
        cy.intercept('POST', '**autocomplete_fact_values**', req => {
          if (req.body.hasOwnProperty('startswith') && req.body.startswith === foobar) {
            req.alias = 'autocompleteTest'
          }
        });
        cy.get('[data-cy=appSearcherSideBarBuildSearchFactValueInputGroupName]:last()').click();
        cy.get('mat-option').contains('TEEMA').click();
        cy.get('[data-cy=appSearcherSideBarBuildSearchFactValueInputGroupValue]:last()').type(foobar);
        cy.wait('@autocompleteTest');
        cy.get('.mat-option-text').contains(foobar).click();
        cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
        cy.wait('@searcherQuery');
        cy.get('.cdk-column-texta_facts > app-texta-facts-chips > span').contains(foobar).should('exist');
      });


    cy.get('[data-cy=appSearcherSideBarBuildSearchCloseConstraint]').click({multiple: true});

    // todo test appSearcherSideBarBuildSearchCloseConstraint
  });
  it('saved search should be working', function () {
    cy.wait(500);
    cy.get('[data-cy=appSearcherSidebarSavedSearches] .cdk-column-name:nth(1)').should('be.visible').click('left');
    cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted ').should('be.visible');
    cy.get('[data-cy=appSearcherSideBarBuildSearchTextConstraint] textarea').should('be.visible')
      .click()
      .clear()
      .type('tere');
    cy.get('[data-cy=appSearcherBuildSearchSubmit]').click();
    cy.wait('@searcherQuery');
    cy.get(':nth-child(1) > .cdk-column-comment_content > .ng-star-inserted ').should('be.visible');
    cy.get('[data-cy=appSearcherSidebarSaveSearchButton]').should('be.visible').click();
    cy.get('mat-dialog-container input').click().type('delete_me');
    cy.intercept('GET', '**/searches').as('saveSearch');
    cy.get('[type="submit"]').click();
    cy.wait('@saveSearch');
    cy.get('[data-cy=appSearcherSidebarSavedSearches] .cdk-column-name').contains('delete_me').should('be.visible');
    cy.get('[data-cy=appSearcherSideBarBuildSearchCloseConstraint]').click();
    cy.get('[data-cy=appSearcherSidebarSavedSearches] .cdk-column-select:not(:first,:nth(1))').each(($el, index, $list) => {
      cy.wrap($el).click('left');
    });
    cy.get('[data-cy=appSearcherSidebarDeleteSavedSearches]').should('be.visible').click();
    cy.get('mat-dialog-container [type="submit"]').click();
    cy.get('[data-cy=appSearcherSidebarSavedSearches] .cdk-column-name').should('have.length', 2);
    // todo test appSearcherSideBarBuildSearchCloseConstraint
  });

});
