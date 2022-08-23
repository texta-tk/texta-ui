import {UserProfile} from '../UserProfile';
import {TextaTask} from '../tasks/TaskStatus';

export interface Reindexer {
  id: number;
  url: string;
  description: string;
  query: string;
  new_index: string;
  random_size: number;
  indices: string[];
  fields: string[];
  tasks: TextaTask[];
  add_facts_mapping: boolean;
  field_type: { path: string, new_path_name: string, field_type: string }[];
}

export interface DatasetImporter {
  author: UserProfile;
  description: string;
  id: number;
  index: string;
  num_documents: number;
  num_documents_success: number;
  separator: string;
  tasks: TextaTask[];
  url: string;
}
