import {TaskStatus} from './TaskStatus';
import {UserProfile} from '../UserProfile';

export interface DatasetImport{
  id: number;
  url: string;
  author: UserProfile;
  description: string;
  index: string;
  separator: string;
  num_documents: number;
  num_documents_success: number;
  task: TaskStatus;
}
