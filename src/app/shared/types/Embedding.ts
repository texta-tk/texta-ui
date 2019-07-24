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
  task: { id: 0; status: string; progress: 0.0; step: ''; errors: ''; time_started: ''; last_update: null; time_completed: null; };

  static isEmbedding(object): object is Embedding | Embedding[] {
    if (Array.isArray(object) && object.length > 0) {
      return ((object[0] as Embedding).vocab_size !== undefined && (object[0] as Embedding).vocab_size !== undefined);
    } else {
      return (object as Embedding).vocab_size !== undefined && (object as Embedding).vocab_size !== undefined;
    }
  }
}
