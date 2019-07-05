export class Embedding {
  // todo
  url = '';
  id: number;
  description = '';
  project = '';
  author = '';
  query = '';
  fields: string[];
  num_dimensions = 0;
  min_freq = 5;
  vocab_size = 0;
  location = null;
  task: { id: 0; status: ''; progress: 0.0; step: ''; errors: ''; time_started: ''; last_update: null; time_completed: null; };
}
