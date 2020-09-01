import {TaskStatus} from './TaskStatus';


// tslint:disable:variable-name
export class Tagger {
  url: string;
  id: number;
  description: string;
  project: number;
  author: number;
  query: string;
  fields: string[];
  embedding: null;
  vectorizer: TaggerVectorizerChoices;
  num_positives: number;
  num_negatives: number;
  feature_selector: string;
  stop_words: string;
  maximum_sample_size: number;
  negative_multiplier: number;
  location: string;
  precision: number;
  recall: number;
  f1_score: number;
  num_features: number;
  tagger_groups: string[];
  indices: string[];
  plot: unknown;
  task: TaskStatus;
}

export enum TaggerVectorizerChoices {
  HASHING = 'Hashing Vectorizer',
  COUNT = 'Count Vectorizer',
  TFIDF = 'Tfidf Vectorizer',
}

export class TaggerGroup {
  url = '';
  id: number;
  indices: string[];
  description = '';
  embedding: number;
  num_dimensions = 0;
  vocab_size = 0;
  location = null;
  task: TaskStatus;
}


// For endpoints such as 'projects/{projectId}/tagger_groups/{taggerGroupId}/models_list/'
export class LightTagger {
    tag = '';
    url = '';
    status: TaskStatus;
    id: number;
}


export class ListFeaturesResponse {
  features: { feature: string, coefficient: number }[];
  total_features: number;
  showing_features: number;
}
