import {UserProfile} from '../UserProfile';

interface Index {
  id: number;
  is_open: boolean;
  url: string;
  name: string;
}

// tslint:disable:variable-name
interface Task {
  id: number;
  status: string;
  progress: number;
  step: string;
  errors: string;
  time_started: string;
  last_update: string;
  // tslint:disable-next-line:no-any
  time_completed?: any;
  total: number;
  num_processed: number;
}

export interface MLP {
  id: number;
  url: string;
  author: UserProfile;
  indices: Index[];
  description: string;
  task: Task;
  query: string;
  fields: string[];
  analyzers: string[];
}
