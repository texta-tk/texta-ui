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

export interface Evaluator {
  id: number;
  url: string;
  indices: Index[];
  description: string;
  task: Task;
  fields: string[];
}
export interface IndividualResults{
  precision: number;
  recall: number;
  f1_score: number;
  accuracy: number;
  confusion_matrix: number[][];
  count: number;
}
export interface EvaluatorIndividualResults {
  [key: string]: IndividualResults;
}
