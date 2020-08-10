import {TaskStatus} from './TaskStatus';

// tslint:disable:variable-name
export class Embedding {
  // todo
  url = '';
  id: number;
  description = '';
  query = '';
  indices: string[];
  fields: string[];
  num_dimensions = 0;
  min_freq = 0;
  vocab_size = 0;
  location = null;
  task: TaskStatus;

  static isEmbedding(object: string | unknown[] | Embedding): object is Embedding | Embedding[] {
    if (Array.isArray(object) && object.length > 0) {
      return ((object[0] as Embedding).vocab_size !== undefined && (object[0] as Embedding).vocab_size !== undefined);
    } else {
      return (object as Embedding).vocab_size !== undefined && (object as Embedding).vocab_size !== undefined;
    }
  }
}

export class EmbeddingPrediction {
  phrase: string;
  score: number;
  model: string;
}

export class EmbeddingCluster {
  // todo
  url = '';
  id: number;
  description = '';
  embedding: number;
  num_dimensions = 0;
  vocab_size = 0;
  location = null;
  task: TaskStatus;
}
