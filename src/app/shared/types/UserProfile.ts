export class UserProfile {
  url = '';
  email = '';
  firstName = '';
  lastName = '';
  pk: number;
  id: number;
  username = '';
  is_superuser = false;
  // only sometimes?? nullable
  active_project?: '';
}
