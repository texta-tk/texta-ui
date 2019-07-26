import {TaskStatus} from './TaskStatus';

export class Embedding {
  // todo
  url = '';
  id: number;
  description = '';
  query = '';
  fields_parsed: string[];
  num_dimensions = 0;
  min_freq = 0;
  vocab_size = 0;
  location = null;
  task: TaskStatus;

  static isEmbedding(object): object is Embedding | Embedding[] {
    if (Array.isArray(object) && object.length > 0) {
      return ((object[0] as Embedding).vocab_size !== undefined && (object[0] as Embedding).vocab_size !== undefined);
    } else {
      return (object as Embedding).vocab_size !== undefined && (object as Embedding).vocab_size !== undefined;
    }
  }
}
