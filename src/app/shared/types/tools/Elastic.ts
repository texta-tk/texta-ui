import {TaskStatus} from '../tasks/TaskStatus';
import {UserProfile} from '../UserProfile';

export interface Reindexer {
  id: number;
  url: string;
  description: string;
  query: string;
  new_index: string;
  random_size: number;
  task: TaskStatus;
  field_type_parsed: string[];
}

export interface DatasetImporter {
  author: UserProfile;
  description: string;
  id: number;
  index: string;
  num_documents: number;
  num_documents_success: number;
  separator: string;
  task: TaskStatus;
  url: string;
}
