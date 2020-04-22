import {Field} from '../Project';
import {TaskStatus} from './TaskStatus';
import {Index} from '../Index';

export class Cluster {
  id: number;
  url: string;
  description: string;
  author_username: string;
  query: string;
  indices: Index[];
  num_cluster: number;
  clustering_algorithm: 'kmeans' | 'minibatchkmeans';
  vectorizer: string;
  num_dims: number;
  use_lsi: boolean;
  num_topics: number;
  original_text_field: string;
  stop_words: string[];
  ignored_ids: number[];
  fields: Field[];
  document_limit: number;
  task: TaskStatus;
}

export class ClusterView {
  cluster_count: number;
  clusters: {
    id: number;
    url: string;
    document_count: number;
    average_similarity: number;
    significant_words: { key: string, count: number }[];
    documents: string[];
  }[];
}

export class ClusterDetails {
  id: number;
  intracluster_similarity: number;
  document_count: number;
  significant_words: { key: string, count: number }[];
  documents: ClusterDocument[];
}

export class ClusterDocument {
  id: number;
  index: string;
  content: { [key: string]: string };
}
