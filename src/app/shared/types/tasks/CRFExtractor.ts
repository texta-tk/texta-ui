import {Embedding} from './Embedding';

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
  time_completed?: Date;
  total: number;
  num_processed: number;
}

export interface CRFExtractor {
  c_values: number[];
  id: number;
  url: string;
  // tslint:disable-next-line:no-any
  author: any;
  description: string;
  query: string;
  indices: Index[];
  mlp_field: string;
  window_size: number;
  test_size: number;
  num_iter: number;
  best_c1: number;
  best_c2: number;
  bias: boolean;
  suffix_len: string;
  labels: string;
  feature_fields: string[];
  context_feature_fields: string[];
  feature_extractors: string[];
  embedding?: number;
  recall: number;
  f1_score: number;
  precision: number;
}
