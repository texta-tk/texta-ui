import {browser, by, element, promise} from 'protractor';
import Promise = promise.Promise;

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }
  // todo better design, just do getLogin(); etc
  getLoginButton() {
    return element(by.buttonText('LOG IN'));
  }

  getLogoutButton() {
    return element(by.className('logout'));
  }

  getLoginDialog() {
    return element(by.tagName('app-login'));
  }

  getLoginDialogForm() {
    return this.getLoginDialog().element(by.tagName('form'));
  }

  getLoginDialogUsernameInput() {
    return this.getLoginDialogForm().element(by.css('input[formcontrolname=usernameFormControl'));
  }

  getLoginDialogPasswordInput() {
    return this.getLoginDialogForm().element(by.css('input[formcontrolname=passwordFormControl'));
  }
}
