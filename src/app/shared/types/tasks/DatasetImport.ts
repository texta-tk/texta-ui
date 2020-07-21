import {TaskStatus} from './TaskStatus';

export interface DatasetImport{
  id: number;
  url: string;
  author_username: string;
  description: string;
  index: string;
  separator: string;
  num_documents: number;
  num_documents_success: number;
  task: TaskStatus;
}
