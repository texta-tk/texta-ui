import {browser, by, element, promise} from 'protractor';
import Promise = promise.Promise;

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getSearcherNavigationButton() {
    return browser.element(by.css('a[ng-reflect-router-link="searcher"]')); //ng-reflect-router-link="searcher"
  }

}
