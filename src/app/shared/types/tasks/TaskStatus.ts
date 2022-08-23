
export interface TextaTask{
  id: number;
  status: string;
  progress: number;
  step: string;
  task_type: string;
  errors: string;
  time_started: Date;
  last_update: Date;
  time_completed: Date;
  total: number;
  num_processed: number;
}
