import {UserProfile} from './UserProfile';

export class Project {
  url = '';
  id: number;
  title = '';
  owner = '';
  users: UserProfile[];
  indices: string[];
}
