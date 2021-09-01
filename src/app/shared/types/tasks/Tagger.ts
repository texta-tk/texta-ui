import {TaskStatus} from './TaskStatus';
import {Index} from '../Index';
import {UserProfile} from '../UserProfile';


// tslint:disable:variable-name
export class Tagger {
  url: string;
  id: number;
  description: string;
  project: number;
  author: UserProfile;
  query: string;
  fields: string[];
  embedding: number;
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
  indices: Index[];
  ignore_numbers: boolean;
  scoring_function: string;
  plot: unknown;
  fact_name: string;
  classifier: string;
  pos_label: string;
  minimum_sample_size: number;
  task: TaskStatus;
  snowball_language: string;
  detect_lang: boolean;
  balance: boolean;
  balance_to_max_limit: boolean;
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
