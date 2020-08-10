import {TaskStatus} from './TaskStatus';

// tslint:disable:variable-name
export class NeuroTagger {
  url: string;
  id: number;
  description: string;
  project: string;
  author: string;
  queries: string;
  validation_split: number;
  score_threshold: number;
  fields: string[];
  model_architecture: string;
  seq_len: number;
  maximum_sample_size: number;
  negative_multiplier: number;
  location: string;
  num_epochs: number;
  vocab_size: number;
  plot: unknown;
  task: TaskStatus;
  validation_accuracy: number;
  training_accuracy: number;
  fact_values: string[];
  training_loss: number;
  validation_loss: number;
  model_plot: unknown;
  result_json: string;
  fact_name: string;
  min_fact_doc_count: number;
  max_fact_doc_count: number;
}
