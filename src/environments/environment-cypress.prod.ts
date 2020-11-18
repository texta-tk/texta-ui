export const environment = {
  apiHost: 'http://texta-rest',
  apiBasePath: '/api/v1',
  production: true,
  fileFieldReplace: 'texta_filepath',
  
  // For CF UAA authentication
  useCloudFoundryUAA: true,
  uaaConf: {
    uaaURL: 'http://texta-uaa:8080/uaa/oauth/authorize',
    // Callback URL defined on the UAA server, to which the user will be redirected after logging in on UAA
    redirect_uri: 'http://texta-rest/api/v1/uaa/callback',
    // OAuth 2.0 client application (eg texta_toolkit) id and secret.
    client_id: 'login',
    // OAuth 2.0 scope and response_type
    scope: 'openid',
    response_type: 'code',
  }
};
