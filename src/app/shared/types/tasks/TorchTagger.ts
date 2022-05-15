import {TaskStatus} from './TaskStatus';
import {UserProfile} from '../UserProfile';
import {Index} from '../Index';

// tslint:disable:variable-name
export class TorchTagger {
  url: string;
  author: UserProfile;
  id: number;
  description: string;
  query: string;
  fields: string[];
  embedding: number;
  f1_score: number;
  precision: number;
  recall: number;
  confusion_matrix: string;
  indices: Index[];
  accuracy: number;
  model_architecture: string;
  maximum_sample_size: number;
  minimum_sample_size: number;
  num_epochs: number;
  location: string;
  pos_label: string;
  plot: string;
  task: TaskStatus;
  // tslint:disable-next-line:no-any
  fact_name?: any;
  balance: boolean;
  balance_to_max_limit: boolean;
  use_sentence_shuffle: boolean;
}

export interface TorchTaggerEpoch {
  accuracy: number;
  area_under_curve: number;
  f1_score: number;
  precision: number;
  recall: number;
  training_loss: number;
  val_loss: number;
}
