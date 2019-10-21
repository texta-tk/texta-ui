// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
const {SpecReporter} = require('jasmine-spec-reporter');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () {
    }
  },
  onPrepare: async () => {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));
    let globals = require('protractor');
    await browser.driver.get('http://localhost:4200/'); // todo, default? env file!
    const login = await browser.driver.findElement(by.id('loginButton'));
    login.click();
    await browser.driver.findElement(by.css('input[formcontrolname=usernameFormControl')).sendKeys('admin'); // todo
    await browser.driver.findElement(by.css('input[formcontrolname=passwordFormControl')).sendKeys('1234');
    await browser.driver.findElement(by.tagName('form')).submit();
    var until = globals.ExpectedConditions;
    const logoutButton = browser.driver.findElement(by.className('logout'));
    await browser.driver.wait(until.presenceOf(logoutButton), 5000, 'timed out');
  }
};
