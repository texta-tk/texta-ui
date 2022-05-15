describe('/oauth and uaa auth tests', function () {
    beforeEach(function () {
        // Skip test if test_uaa is False
        if (!Cypress.env('test_uaa')) {
            cy.log(`SKIPPING UAA TEST AS test_uaa IS ${Cypress.env('test_uaa')}`)
            this.skip();
        } else {
            // Clear the cookies to prevent sessions taking over
            cy.clearCookies({domain: null});
            // Make the access_token invalid
            cy.clearLocalStorage('access_token');
            cy.clearLocalStorage('refresh_token');

            cy.visit('/');

            // Navigate to the UAA login
            cy.get('[data-cy=appSharedLoginDialogUaaLogin]').should('exist').click();
            cy.url().should("include", "uaa/login");

            // Get the uaa users fixture
            cy.fixture("uaa-user").then(uaaUser => {
                // Get the "email" (actually username) form field
                cy.get('[name="username"]').should('exist').type(uaaUser.username);
                cy.get('[name="password"]').should('exist').type(uaaUser.password);
                // Click the login button
                cy.get('.island-button').should('exist').click();
            });
            cy.wait(5000);
        }
    });


    it('should be able to log in and out with uaa', function () {
        // Verify logged in
        cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('be.visible').click();
        // Logout
        cy.intercept('POST', 'logout').as('logout');
        cy.get('[data-cy=appNavbarlogOutMenuItem]').should('be.visible').click();
        cy.wait('@logout');

        // Verify logged out
        cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('not.exist');
    });


    it('should refresh the uaa access_token with the refresh token', function () {
        // Verify logged in
        cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('be.visible');

        cy.intercept('POST', '**/uaa/refresh-token/').as('refreshToken');
        cy.intercept('GET', '**/rest-auth/user/').as('userInfo');

        // Clear the cookies to prevent sessions taking over
        cy.clearCookies({domain: null});
        // Make the access_token invalid
        cy.clearLocalStorage('access_token');

        // Reload the window
        cy.reload();
        // Wait for the refreshToken request
        cy.wait('@refreshToken');
        // Wait for the user info request
        cy.wait('@userInfo');
        // Check if the user is still logged in after refreshing the token
        cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('be.visible');
    });


    it('should log out when the uaa access_token and refresh_token are both invalid', function () {
        // Verify logged in
        cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('be.visible');

        cy.intercept('GET', '**/rest-auth/user/').as('userInfo');

        // Clear the cookies to prevent sessions taking over
        cy.clearCookies({domain: null});
        // Make the access_token invalid
        cy.clearLocalStorage('access_token');
        cy.clearLocalStorage('refresh_token');

        // Reload the window
        cy.reload();
        // Wait for the user info request
        cy.wait('@userInfo');
        // Check if the user is still logged in after refreshing the token
        cy.get('[data-cy=appNavbarLoggedInUserMenu]').should('not.exist');
    });
});
