export const environment = {
  apiHost: 'REST_API_URL_REPLACE',
  apiBasePath: '/api/v1',
  production: true,
  
  // For CF UAA authentication
  useCloudFoundryUAA: false,
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
