import {TextaTask} from './TaskStatus';

interface Index {
  id: number;
  is_open: boolean;
  url: string;
  name: string;
}


export interface SearchFieldsTagger {
  id: number;
  url: string;
  indices: Index[];
  description: string;
  tasks: TextaTask[];
  fields: string[];
  fact_name: string;
  bulk_size: number;
  es_timeout: number;
}
