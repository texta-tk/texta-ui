describe('Annotator should work', function () {
  beforeEach(function () {
    cy.wait(100);
    cy.fixture('users').then((user) => {
      cy.login(user.username, user.password);
      cy.createTestProject().then(x => {
        assert.isNotNull(x.body.id, 'should have project id');
        cy.wrap(x.body.id).as('projectId');
        cy.intercept('GET', '**user**').as('getUser');
        cy.intercept('GET', '**get_fields**').as('getProjectIndices');
        cy.intercept('GET', '**/annotator_groups/**').as('getAnnotator');
        cy.intercept('DELETE', '**/annotator/**').as('deleteAnnotator');
        cy.intercept('POST', '**/annotator/bulk_delete').as('bulkDeleteAnnotator');
        cy.intercept('POST', '**/annotator/').as('postAnnotator');
        cy.intercept('PATCH', '**/annotator/**').as('patchAnnotator');
      });
    });
  });

  function initPage() {
    cy.visit('/annotator');
    cy.wait('@getProjectIndices');
    cy.get('[data-cy=appNavbarProjectSelect]').click();
    cy.get('mat-option').contains('integration_test_project').click();
    cy.wait('@getAnnotator');
  }

  function createBinaryAnnotatorTask() {
    cy.get('[data-cy=appAnnotatorCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appAnnotatorCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testAnnotator');
    }));

    cy.get('[data-cy=appAnnotatorCreateDialogUsers]').click().then((users => {
      cy.wrap(users).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(users, 'required');
      cy.wrap(users).click();
      cy.get('.mat-option-text').contains('admin').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(users).find('mat-error').should('have.length', 0);
    }));

    cy.get('[data-cy=appAnnotatorCreateDialogType]').click().then((analyzers => {
      cy.wrap(analyzers).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(analyzers, 'required');
      cy.wrap(analyzers).click();
      cy.get('.mat-option-text').contains('binary').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(analyzers).find('mat-error').should('have.length', 0);
    }));

    cy.get('[data-cy=appAnnotatorCreateDialogFieldsMultiple]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('comment_content').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appAnnotatorCreateDialogBinaryFactName]').click().then((analyzers => {
      cy.wrap(analyzers).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(analyzers, 'required');
      cy.wrap(analyzers).click();
      cy.get('.mat-option:first()').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(analyzers).find('mat-error').should('have.length', 0);
    }));
    cy.get('[data-cy=appAnnotatorCreateDialogBinaryPosVal]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('Yes');
    }));
    cy.get('[data-cy=appAnnotatorCreateDialogBinaryNegVal]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('No');
    }));
    cy.get('[data-cy=appAnnotatorCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(201);
    });
    cy.wait('@getAnnotator');
  }



  it('Binary annotator create/edit should work', function () {
    initPage();
    createBinaryAnnotatorTask();

    // edit
    cy.get('.cdk-column-actions:nth(1)').click();
    cy.get('[data-cy=appAnnotatorMenuEdit]').click();
    cy.get('[data-cy=appAnnotatorEditDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test');
    }));
    cy.get('[data-cy=appAnnotatorEditDialogSubmit]').should('be.visible').click();
    cy.wait('@patchAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(200);
    });
    cy.wait('@getAnnotator');

    // delete
/*    createBinaryAnnotatorTask();
    cy.get('.cdk-column-actions:nth(1)').click();
    cy.get('[data-cy=appAnnotatorMenuDelete]').click();
    cy.get('[data-cy=appConfirmDialogSubmit]').click();
    cy.wait('@bulkDeleteAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(200);
    });
    cy.wait('@getAnnotator');*/

    // bulk delete
/*    cy.get('[data-cy=appAnnotatorBulkDeleteSelectAll]').click()
    cy.get('[data-cy=appAnnotatorDeleteBtn]').click();

    cy.get('[data-cy=appConfirmDialogSubmit]').click();
    cy.wait('@bulkDeleteAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(200);
    });
    cy.wait('@getAnnotator');*/
  });

  function createLabelset() {
    cy.get('.mat-tab-label').contains('Labelset').click();
    cy.get('[data-cy=appLabelSetCreateBtn]').click();
    cy.wait(1000);
    cy.get('[data-cy=appLabelSetCreateDialogCategory]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testLabelset');
    }));
    cy.get('[data-cy=appLabelSetCreateDialogValues]').click().then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('textarea').clear().blur();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testLabelset');
    }));
    cy.get('[data-cy=appLabelSetCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postLabelset').then(created => {
      expect(created.response.statusCode).to.eq(201);
    });
    cy.wait('@getLabelset');
    cy.get('.mat-tab-label').contains('Annotator').click();
  }
  function createMultilabelAnnotatorTask() {
    cy.get('[data-cy=appAnnotatorCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appAnnotatorCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testAnnotator');
    }));

    cy.get('[data-cy=appAnnotatorCreateDialogUsers]').click().then((users => {
      cy.wrap(users).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(users, 'required');
      cy.wrap(users).click();
      cy.get('.mat-option-text').contains('admin').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(users).find('mat-error').should('have.length', 0);
    }));

    cy.get('[data-cy=appAnnotatorCreateDialogType]').click().then((analyzers => {
      cy.wrap(analyzers).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(analyzers, 'required');
      cy.wrap(analyzers).click();
      cy.get('.mat-option-text').contains('multilabel').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(analyzers).find('mat-error').should('have.length', 0);
    }));

    cy.get('[data-cy=appAnnotatorCreateDialogFieldsMultiple]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('comment_content').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appAnnotatorCreateDialogMultilabelSets]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('testLabelset').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appAnnotatorCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(201);
    });
    cy.wait('@getAnnotator');
  }
  it('Multilabel annotator create/edit should work with labelset', function () {

    cy.intercept('GET', '**/labelset/**').as('getLabelset');
    cy.intercept('POST', '**/labelset/**').as('postLabelset');
    initPage();
    createLabelset()
    createMultilabelAnnotatorTask();

    // edit
    cy.get('.cdk-column-actions:nth(1)').click();
    cy.get('[data-cy=appAnnotatorMenuEdit]').click();
    cy.get('[data-cy=appAnnotatorEditDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test');
    }));
    cy.get('[data-cy=appAnnotatorEditDialogSubmit]').should('be.visible').click();
    cy.wait('@patchAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(200);
    });
    cy.wait('@getAnnotator');

    // delete
/*
    createMultilabelAnnotatorTask();
    cy.get('.cdk-column-actions:nth(1)').click();
    cy.get('[data-cy=appAnnotatorMenuDelete]').click();
    cy.get('[data-cy=appConfirmDialogSubmit]').click();
    cy.wait('@bulkDeleteAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(200);
    });
    cy.wait('@getAnnotator');
*/

    // bulk delete
/*    cy.get('[data-cy=appAnnotatorBulkDeleteSelectAll]').click()
    cy.get('[data-cy=appAnnotatorDeleteBtn]').click();

    cy.get('[data-cy=appConfirmDialogSubmit]').click();
    cy.wait('@bulkDeleteAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(200);
    });
    cy.wait('@getAnnotator');*/
  });

  function createEntityAnnotatorTask() {
    cy.get('[data-cy=appAnnotatorCreateBtn]').should('be.visible').click();
    cy.get('[data-cy=appAnnotatorCreateDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('testAnnotator');
    }));

    cy.get('[data-cy=appAnnotatorCreateDialogUsers]').click().then((users => {
      cy.wrap(users).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(users, 'required');
      cy.wrap(users).click();
      cy.get('.mat-option-text').contains('admin').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(users).find('mat-error').should('have.length', 0);
    }));

    cy.get('[data-cy=appAnnotatorCreateDialogType]').click().then((analyzers => {
      cy.wrap(analyzers).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(analyzers, 'required');
      cy.wrap(analyzers).click();
      cy.get('.mat-option-text').contains('entity').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(analyzers).find('mat-error').should('have.length', 0);
    }));

    cy.get('[data-cy=appAnnotatorCreateDialogFieldsSingle]').click().then((fields => {
      cy.wrap(fields).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fields, 'required');
      cy.wrap(fields).click();
      cy.get('.mat-option-text').contains('comment_content').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fields).find('mat-error').should('have.length', 0)
    }));
    cy.get('[data-cy=appAnnotatorCreateDialogEntityFactName]').click().then((fact => {
      cy.wrap(fact).should('have.class', 'mat-focused');
      cy.closeCurrentCdkOverlay();
      cy.matFormFieldShouldHaveError(fact, 'required');
      cy.wrap(fact).click();
      cy.get('.mat-option:first()').click();
      cy.closeCurrentCdkOverlay();
      cy.wrap(fact).find('mat-error').should('have.length', 0);
    }));
    cy.get('[data-cy=appAnnotatorCreateDialogSubmit]').should('be.visible').click();
    cy.wait('@postAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(201);
    });
    cy.wait('@getAnnotator');
  }
  it('Entity annotator create/edit should work', function () {

    initPage();
    createEntityAnnotatorTask();

    // edit
    cy.get('.cdk-column-actions:nth(1)').click();
    cy.get('[data-cy=appAnnotatorMenuEdit]').click();
    cy.get('[data-cy=appAnnotatorEditDialogDesc]').then((desc => {
      cy.wrap(desc).should('have.class', 'mat-focused').type('b').find('input').clear();
      cy.matFormFieldShouldHaveError(desc, 'required');
      cy.wrap(desc).type('test');
    }));
    cy.get('[data-cy=appAnnotatorEditDialogSubmit]').should('be.visible').click();
    cy.wait('@patchAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(200);
    });
    cy.wait('@getAnnotator');

    // delete
/*    createEntityAnnotatorTask();
    cy.get('.cdk-column-actions:nth(1)').click();
    cy.get('[data-cy=appAnnotatorMenuDelete]').click();
    cy.get('[data-cy=appConfirmDialogSubmit]').click();
    cy.wait('@bulkDeleteAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(200);
    });
    cy.wait('@getAnnotator');*/

    // bulk delete
/*    cy.get('[data-cy=appAnnotatorBulkDeleteSelectAll]').click()
    cy.get('[data-cy=appAnnotatorDeleteBtn]').click();

    cy.get('[data-cy=appConfirmDialogSubmit]').click();
    cy.wait('@bulkDeleteAnnotator').then(created => {
      expect(created.response.statusCode).to.eq(200);
    });
    cy.wait('@getAnnotator');*/
  });
});
