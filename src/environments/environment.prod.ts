export const environment = {
  apiHost: 'TEXTA_API_URL_REPLACE',
  apiBasePath: '/api/v1',
  production: true,
  
  // For CF UAA authentication
  useCloudFoundryUAA: JSON.parse('TEXTA_USE_UAA_REPLACE'.toLowerCase()),
  uaaConf: {
    uaaURL: 'TEXTA_UAA_AUTH_URL_REPLACE',
    // Callback URL defined on the UAA server, to which the user will be redirected after logging in on UAA
    redirect_uri: 'TEXTA_UAA_REDIRECT_URI_REPLACE',
    // OAuth 2.0 client application (eg texta_toolkit) id and secret.
    client_id: 'TEXTA_UAA_CLIENT_ID_REPLACE',
    // OAuth 2.0 scope and response_type
    scope: 'openid',
    response_type: 'code',
  }
};
