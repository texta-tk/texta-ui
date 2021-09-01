import {TaskStatus} from './TaskStatus';

// tslint:disable:variable-name
export class Embedding {
  url = '';
  id: number;
  description = '';
  query = '';
  indices: string[];
  embedding_type = '';
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
  url = '';
  id: number;
  description = '';
  embedding: number;
  num_dimensions = 0;
  vocab_size = 0;
  location = null;
  task: TaskStatus;
}

// embedding options request type
// -------------------------------
export interface Id {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Url {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface AuthorUsername {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Description {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

export interface Id2 {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface IsOpen {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Url2 {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Name {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  max_length: number;
}

export interface Children {
  id: Id2;
  is_open: IsOpen;
  url: Url2;
  name: Name;
}

export interface Child {
  type: string;
  required: boolean;
  read_only: boolean;
  children: Children;
}

export interface Indices {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  child: Child;
}

export interface Child2 {
  type: string;
  required: boolean;
  read_only: boolean;
}

export interface Fields {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  child: Child2;
}

export interface UsePhraser {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface Choice {
  value: string;
  display_name: string;
}

export interface EmbeddingType {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  choices: Choice[];
}

export interface Query {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface NumDimensions {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface MaxDocuments {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface MinFreq {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface VocabSize {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Id3 {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Status {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Progress {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Step {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Errors {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface TimeStarted {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface LastUpdate {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface TimeCompleted {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Total {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  min_value: number;
  max_value: number;
}

export interface NumProcessed {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  min_value: number;
  max_value: number;
}

export interface Children2 {
  id: Id3;
  status: Status;
  progress: Progress;
  step: Step;
  errors: Errors;
  time_started: TimeStarted;
  last_update: LastUpdate;
  time_completed: TimeCompleted;
  total: Total;
  num_processed: NumProcessed;
}

export interface Task {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  children: Children2;
}

export interface POST {
  id: Id;
  url: Url;
  author: AuthorUsername;
  description: Description;
  indices: Indices;
  fields: Fields;
  use_phraser: UsePhraser;
  embedding_type: EmbeddingType;
  query: Query;
  num_dimensions: NumDimensions;
  max_documents: MaxDocuments;
  min_freq: MinFreq;
  vocab_size: VocabSize;
  task: Task;
}

export interface Actions {
  POST: POST;
}

export interface EmbeddingOptions {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  actions: Actions;
}
