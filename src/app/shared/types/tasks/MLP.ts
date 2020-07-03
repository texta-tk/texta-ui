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
  time_started: Date;
  last_update: Date;
  time_completed?: any;
  total: number;
  num_processed: number;
}

export interface MLP {
  id: number;
  url: string;
  author_username: string;
  indices: Index[];
  description: string;
  task: Task;
  query: string;
  fields: string[];
  analyzers: string[];
}
