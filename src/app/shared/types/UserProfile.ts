export class UserProfile {
  url = '';
  email = '';
  firstName = '';
  lastName = '';
  pk: number;
  id: number;
  username = '';
  date_joined: string;
  is_superuser = false;
  // only sometimes?? nullable
  active_project?: '';
}
