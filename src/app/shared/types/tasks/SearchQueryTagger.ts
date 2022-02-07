import {Moment} from 'moment';

interface Index {
  id: number;
  is_open: boolean;
  url: string;
  name: string;
}

interface Task {
  id: number;
  status: string;
  progress: number;
  step: string;
  errors: string;
  time_started: string;
  last_update: string;
  time_completed?: string;
  total: number;
  num_processed: number;
}

export interface SearchQueryTagger {
  id: number;
  url: string;
  indices: Index[];
  description: string;
  task: Task;
  fields: string[];
  fact_name: string;
  fact_value: string;
  bulk_size: number;
  es_timeout: number;
}
