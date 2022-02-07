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
  time_started: string;
  last_update: string;
  time_completed?: string;
  total: number;
  num_processed: number;
}

export interface RakunExtractor  {
  id: number;
  url: string;
  author_username: string;
  description: string;
  distance_method: string;
  distance_threshold: number;
  num_keywords: number;
  pair_diff_length: number;
  stopwords: string[];
  bigram_count_threshold: number;
  min_tokens: number;
  max_tokens: number;
  max_similar: number;
  max_occurrence: number;
  fasttext_embedding?: Embedding;
  task?: Task;
}
