import {TaskStatus} from './TaskStatus';

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
  num_epochs: number;
  location: string;
  plot: string;
  task: TaskStatus;
  fact_name?: any;
}
