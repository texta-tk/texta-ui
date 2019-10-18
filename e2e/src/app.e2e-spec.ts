import {AppPage} from './app.po';
import {browser} from 'protractor';
import {protractor} from 'protractor/built/ptor';

describe('workspace-project App', () => {
  let page: AppPage;
  const EC = protractor.ExpectedConditions;
  beforeEach(() => {
    page = new AppPage();
  });

  it('should be able to log in', () => {
    page.navigateTo();

    const logoutButton = page.getLogoutButton();
    const logoutClickable = EC.elementToBeClickable(logoutButton);
    browser.wait(logoutClickable);
    expect(logoutButton).toBeTruthy('Log in button should not be visible, we logged in');
  });
});
