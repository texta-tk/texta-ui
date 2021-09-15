import {Injectable} from '@angular/core';
import {HttpBackend, HttpClient} from '@angular/common/http';

export interface UaaConf {
  uaaURL: string;
  // Callback URL defined on the UAA server, to which the user will be redirected after logging in on UAA
  redirect_uri: string;
  oauth_uri: string;
  authorize_uri: string;
  logout_uri: string;
  // OAuth 2.0 client application (eg texta_toolkit) id and secret.
  client_id: string;
  // OAuth 2.0 scope and response_type
  scope: string;
  admin_scope: string;
  response_type: string;
}

interface AppConf {
  apiHost: string;
  apiBasePath: string;
  apiBasePath2: string;
  logging: boolean;
  fileFieldReplace: string;
  // For CF UAA authentication
  useCloudFoundryUAA: boolean;
  uaaConf: UaaConf;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  static settings: AppConf = {
    apiHost: '',
    apiBasePath: '/api/v1',
    apiBasePath2: '/api/v2',
    logging: true,
    fileFieldReplace: 'texta_filepath',
    useCloudFoundryUAA: true,
    uaaConf: {
      uaaURL: '',
      admin_scope: 'texta.project_admin',
      redirect_uri: '',
      client_id: 'login',
      scope: 'openid',
      response_type: 'code'
    }
  };


  // we use httpBackend instead of HttpClient here instead because we cant trigger auth interceptor
  constructor(private handler: HttpBackend) {
  }

  // tslint:disable-next-line:typedef
  load(): Promise<void> {
    const jsonFile = `assets/config/config.json`;
    return new Promise<void>((resolve, reject) => {
      new HttpClient(this.handler).get(jsonFile).toPromise().then(response => {
        AppConfigService.settings = response as AppConf;
        console.log('Config Loaded');
        console.log(AppConfigService.settings);
        resolve();

      }).catch(response => {
        console.log(response);
        reject(`Could not load the config file`);
      });
    });
  }
}
