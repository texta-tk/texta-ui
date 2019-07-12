import {UserProfile} from './UserProfile';

export class Project {
  url = '';
  id: number;
  title = '';
  owner: number;
  users: UserProfile[];
  indices: string[];
  resources: {
    embeddings: number[];
    embedding_clusters: number[];
    taggers: number[];
  };
}
