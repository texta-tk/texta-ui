
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
  last_login: Date;
  // only sometimes?? nullable
  active_project?: '';
}
