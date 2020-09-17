// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  apiHost: 'http://localhost:8000',
  apiBasePath: '/api/v1',
  production: false,

  // For CF UAA authentication
  useCloudFoundryUAA: true,
  uaaConf: {
    uaaURL: 'http://localhost:8080/uaa/oauth/authorize',

    // Callback URL defined on the UAA server, to which the user will be redirected after logging in on UAA
    redirect_uri: 'http://localhost:8000/api/v1/uaa/callback',
    // OAuth 2.0 client application (eg texta_toolkit) id and secret.
    client_id: 'login',
    // OAuth 2.0 scope and response_type
    scope: 'openid',
    response_type: 'code',
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
