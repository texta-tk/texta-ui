import {AppPage} from './app.po';
import {browser, logging} from 'protractor';
import {protractor} from 'protractor/built/ptor';

describe('workspace-project App', () => {
  let page: AppPage;
  const EC = protractor.ExpectedConditions;
  beforeEach(() => {
    page = new AppPage();
  });

  it('should be able to navigate to each page', () => {
    page.navigateTo();
    const searcherNavigation = page.getSearcherNavigationButton();
    browser.wait(EC.elementToBeClickable(searcherNavigation));
    searcherNavigation.click();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

});
