import {UserProfile} from '../UserProfile';

export interface Task {
  id: number;
  status: string;
  progress: number;
  step: string;
  errors: string;
  time_started: Date;
  last_update?: Date;
  time_completed: Date;
  total: number;
  num_processed: number;
}

export interface Index {
  id: number;
  is_open: boolean;
  url: string;
  name: string;
}

export interface BertTagger {
  url: string;
  author: UserProfile;
  id: number;
  description: string;
  query: string;
  checkpoint_model: number;
  fields: string[];
  f1_score: number;
  precision: number;
  recall: number;
  accuracy: number;
  validation_loss: number;
  training_loss: number;
  maximum_sample_size: number;
  minimum_sample_size: number;
  num_epochs: number;
  pos_label: string;
  plot: string;
  task: Task;
  fact_name?: string;
  indices: Index[];
  bert_model: string;
  learning_rate: number;
  eps: number;
  max_length: number;
  batch_size: number;
  adjusted_batch_size: number;
  split_ratio: number;
  negative_multiplier: number;
  use_gpu: boolean;
  num_examples: string;
  confusion_matrix: string;
  balance: boolean;
  balance_to_max_limit: boolean;
  use_sentence_shuffle: boolean;
}
