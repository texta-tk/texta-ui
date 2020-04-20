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

export interface Description {
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

export interface Query {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
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
  child: Child;
}

export interface NumCluster {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  min_value: number;
  max_value: number;
}

export interface Choice {
  value: string;
  display_name: string;
}

export interface ClusteringAlgorithm {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  choices: Choice[];
}

export interface Choice2 {
  value: string;
  display_name: string;
}

export interface Vectorizer {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  choices: Choice2[];
}

export interface NumDims {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  min_value: number;
  max_value: number;
}

export interface UseLsi {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface NumTopics {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  min_value: number;
  max_value: number;
}

export interface OriginalTextField {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Child2 {
  type: string;
  required: boolean;
  read_only: boolean;
}

export interface StopWords {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  child: Child2;
}

export interface Child3 {
  type: string;
  required: boolean;
  read_only: boolean;
}

export interface IgnoredIds {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  child: Child3;
}

export interface Child4 {
  type: string;
  required: boolean;
  read_only: boolean;
}

export interface Fields {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  child: Child4;
}

export interface DocumentLimit {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  min_value: number;
  max_value: number;
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
  description: Description;
  author_username: AuthorUsername;
  query: Query;
  indices: Indices;
  num_cluster: NumCluster;
  clustering_algorithm: ClusteringAlgorithm;
  vectorizer: Vectorizer;
  num_dims: NumDims;
  use_lsi: UseLsi;
  num_topics: NumTopics;
  original_text_field: OriginalTextField;
  stop_words: StopWords;
  ignored_ids: IgnoredIds;
  fields: Fields;
  document_limit: DocumentLimit;
  task: Task;
}

export interface Actions {
  POST: POST;
}

export interface RootObject {
  actions: Actions;
}
export class ClusterOptions {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  actions: Actions;
}
