import {TextaTask} from './TaskStatus';

interface Index {
  id: number;
  is_open: boolean;
  url: string;
  name: string;
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
  context_feature_extractors: string[];
  embedding?: number;
  recall: number;
  f1_score: number;
  precision: number;
  tasks: TextaTask[];
  is_favorited: boolean;
}


export interface CRFFeature {
  feature: string;
  coefficient: number;
  label: string;
}

interface CRFFeatures {
  positive: CRFFeature[];
  negative: CRFFeature[];
}

export interface CRFListFeatures {
  features: CRFFeatures;
  total_features: number;
  showing_features: number;
}


