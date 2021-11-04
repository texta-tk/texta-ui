// tslint:disable:variable-name
export class UserProfile {
  url = '';
  email = '';
  firstName = '';
  lastName = '';
  id: number;
  username = '';
  date_joined: string;
  is_superuser = false;
  display_name = '';
  last_login: Date;
  // only sometimes?? nullable
  active_project?: '';
  profile: {
    application: string;
    scopes: string[];
    is_uaa_account: boolean;
    first_name: string;
    last_name: string;
  };
}
