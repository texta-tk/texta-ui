import {TaskStatus} from './TaskStatus';

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
