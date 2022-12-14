# TEXTA

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.8.

## Configuration

### Configuration properties
| Name | Description |
| ------ | ------ |
| apiHost | texta-rest API Host (ex: `http://localhost:8000`) |
| apiBasePath |  Base URL to which the endpoint paths are appended (ex: `/api/v2`)|
| annotatorUrl | URL for the annotator-client, when set, a button linking to the URL is displayed under Annotator|
| logging |  Whether the API requests should be logged into the browser console (ex: `true`)|
| fileFieldReplace | Used in the Searcher table view: Elasticsearch field name, where the contents are displayed as a file link: apiHost/field_content|
| useCloudFoundryUAA | If enabled allows logging in via UAA|
| uaaConf | Variables for the uaa deploy, more info [here](https://docs.texta.ee/authentication.html#third-party-authentication)|

### Configuration in Production
Frontend makes a get request to /assets/config/config.json to retrieve the configuration file.

### Configuration in Development
Configuration template files are located under /src/configurations/

Currently there are 3 different types of configuration templates:
1. Cypress - Only used in gitlab ci
2. Dev - Used when you run the development server locally (`ng serve`)
3. Prod - Example configuration file to copy into the /dist/assets/config/ directory upon building the project (`ng build`) **This file is named config.json.example to avoid overwriting an already existing configuration file in a production environment so you need to make the config.json file yourself**

The Configuration template file is chosen based on the build flags and then copied over to the /dist/assets/config/ folder. This allows for changing the configuration variables even after we've built our project.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npm run cypress:open` to execute the end-to-end tests via [Cypress](https://www.cypress.io/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# Tutorial on creating a new Model app

In this example, functionality for TorchTagger is created.
## In order to start the new app, you first need need to create a Module.

- Run `ng g m torch-tagger/torch-tagger --routing=true` to create torch-tagger.module.ts and torch-tagger-routing.module.ts
- Within torch-tagger.module.ts, in the array of `imports`, import `SharedModule`, and remove the default `CommonModule` import.

- Make sure `TorchTaggerModule` is included in the `imports` array in app.module.ts

## Now a component that will be declared in TorchTaggerModule can be created
- Run `ng g c torch-tagger/torch-tagger --module torch-tagger/torch-tagger` to create a component, that will be automatically declared in the TorchTaggerModule.

In order for us to navigate to that component, we need to set up routing for it.

## Set up the Routing module
- In torch-tagger-routing.module.ts routes array, add a new object: `{ path: 'torchtaggers', canActivate: [AuthGuard], component: TorchTaggerComponent }`

* `path` is the url segment you will route to.
* `canActivate` is for the Route Guard, to prevent users navigating on the given route in certain conditions. Here, the `AuthGuard` Route Guard is added, to make the route only accessible to logged in users.
* `component` is the component that gets activated when the user is on that route.

## Add a way to navigate to the component 
- In `navbar.component.html` find the mat-menu with the `#models` template reference variable and add a new element, with `[routerLink]="['torchtaggers']"`

Now when we open the Models menu, the new item should show up there. When clicked, it should navigate us to the torchtagger component, which should say something like "torch-tagger-component works!"

## Create a data model if necessary
The TorchTagger will have a data model/interface, to predefine its fields and their types
(Its recommended to check other tasks types such as Tagger)
- Create /shared/types/tasks/TorchTagger.ts
- There export a class containing the fields and their types

## Adding functionality to the component
This component will include a mat table, which means it will include some specific variables that you're better off copy pasting some other component's code, such as tagger.components.ts. It might need changing based on the data you will have in the table.

- Check over the `displayedColumns` variable. Its an array of strings that should describe the field values that will be displayed in the table. In order to sort the data, the strings should be django-filter based, eg `author__username` and `task__status` will be later used in query parameters for ordering, such as `&ordering=author__username`
- In case of copy pasting, make sure to replace the Types with the Type you create, if necessary

## Adding template code to the component
Its probably better to copy paste this from something else, such as Tagger as well, and change it to your needs
- Make sure the `ng-container` elements that have a `matColumnDef` directive on them match with your `displayedColumns`


## Adding a dialog component to the component
In case there is a need for a dialog component, it has a few differences with regular components.

- Create a new component `torch-tagger/create-torch-tagger-dialog --module torch-tagger/torch-tagger`
- Add the component to the `entryComponents` array in `@NgModule` decorator. If that array is missing, just create it.  Eg, put `entryComponents: [CreateTorchTaggerDialogComponent]` after the `imports: [...],` array

## Working with the dialog componenet
Although compared to regular components there isn't much of a difference, its still better to check other dialog components to see how they work.

Mainly:
- In create-torch-tagger-dialog.component.ts, put `private dialogRef: MatDialogRef<CreateTorchTaggerDialogComponent>,` into the constructor parameters, to get a reference variable to the dialog you're in.
- Now you can control the dialog programmatically, such as closing it with `this.dialogRef.close();`
- In order to open the dialog, in `torch-tagger.component.ts`, you need to import `public dialog: MatDialog,` in the constructor, and call `this.dialog.open(CreateTorchTaggerDialogComponent)` to open the dialog.
- In case your dialog needs data, in the dialog component, inject the data into the constructor, with `@Inject(MAT_DIALOG_DATA) public data: { exampleNumber: number; }`
- Pass data to the component by passing additional data to the `this.dialog.open` call, eg  `this.dialog.open(CreateTorchTaggerDialogComponent, {data: {exampleNumber: 5}})`

## Making HTTP calls/requests
In order to make requests, the call logic should be isolated in a service file.
Its recommended to just follow the pattern that other service files have

- Run `ng g s torch-tagger/torch-tagger` to create `torch-tagger.service.ts`
- Create a method for each request method you'll make.
- To call requests in the torch-tagger.component.ts file, import the service in the constructor with `private torchTaggerService: TorchTaggerService`
- Then subscribe to the method you created in the service, eg `this.torchTaggerService.getTorchTaggers(currentProjectId).subscribe((torchTaggers: Torchtagger) => { console.log(torchTaggers) })`
- Its recommended to take a look at the [rxjs docs](https://www.learnrxjs.io/)

## Making the default tests work
Tests are in `.component.spec.ts` files, and you can call tests with `ng test`. Note: you might need to have Google Chrome installed.
By default, tests are missing certain imports that you may need.

### For regular component tests:
- In torch-tagger.service.spec.ts, add `{imports: [...]}` to the `TestBed.configureTestingModule()` arguments
- The imports array should (probably) include `RouterTestingModule, SharedModule, HttpClientTestingModule, BrowserAnimationsModule`, depending on what functionality your component has
- Check over the tests for the service file as well

You can always use tests of other components as examples

### For dialog tests:
Dialog tests require some additional configuration

- Add `let fixture: ComponentFixture<CreateTorchTaggerDialogComponent>;`
- and  `const mockDialogRef = { close: jasmine.createSpy('close') };` as class variables 
- Import the necessary files, and add a `providers` array to `configureTestingModule`, which includes `{ providers: [ { provide: MatDialogRef, useValue: mockDialogRef }]}`
- In case your dialog has data, also create some mock data as a class variable, eg `const data = {currentProjectId: 1, taggerId: 2};`
- Use provide that data by adding an additional provider to the providers list `{ provide: MAT_DIALOG_DATA, useValue: data }]`
