import {UserProfile} from '../UserProfile';
import {TextaTask} from './TaskStatus';

interface Index {
  id: number;
  is_open: boolean;
  url: string;
  name: string;
}

export interface MLP {
  id: number;
  url: string;
  author: UserProfile;
  indices: Index[];
  description: string;
  tasks: TextaTask[];
  query: string;
  fields: string[];
  analyzers: string[];
}
