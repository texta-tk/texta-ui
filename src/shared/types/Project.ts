import { UserProfile } from './UserProfile';

export class Project {
  url = '';
  id: number;
  title = '';
  // ??? todo
  owner: UserProfile;

  users: UserProfile[];
  indices: string[];
}
