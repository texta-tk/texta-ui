export class Tagger {
  url: string;
  id: number;
  description: string;
  project: number;
  author: number;
  query: string;
  fields: string[];
  embedding: null;
  vectorizer: string;
  feature_selector: string;
  stop_words: string;
  maximum_sample_size: number;
  negative_multiplier: number;
  location: string;
  precision: number;
  recall: number;
  f1_score: number;
  num_features: number;
  plot: unknown;
  task: { id: 0; status: string; progress: 0.0; step: ''; errors: ''; time_started: ''; last_update: null; time_completed: null; };
}
