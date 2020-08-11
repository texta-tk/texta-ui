import {TaskStatus} from './TaskStatus';

// tslint:disable:variable-name
export class TorchTagger {
  url: string;
  author_username: string;
  id: number;
  description: string;
  query: string;
  fields: string[];
  embedding: number;
  f1_score: number;
  precision: number;
  recall: number;
  accuracy: number;
  model_architecture: string;
  maximum_sample_size: number;
  minimum_sample_size: number;
  num_epochs: number;
  location: string;
  plot: string;
  task: TaskStatus;
  // tslint:disable-next-line:no-any
  fact_name?: any;
}
