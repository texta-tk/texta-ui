interface Url {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Id {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Description {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  max_length: number;
}

interface Project {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Author {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Query {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Choice {
  value: string;
  display_name: string;
}

interface Fields {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  choices: Choice[];
}

interface NumDimensions {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

interface MinFreq {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

interface VocabSize {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Location {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Id2 {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Status {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Progress {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Step {
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

export interface Children {
  id: Id2;
  status: Status;
  progress: Progress;
  step: Step;
  errors: Errors;
  time_started: TimeStarted;
  last_update: LastUpdate;
  time_completed: TimeCompleted;
}

export interface Task {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  children: Children;
}

export interface EmbeddingOptions {
  url: Url;
  id: Id;
  description: Description;
  project: Project;
  author: Author;
  query: Query;
  fields: Fields;
  num_dimensions: NumDimensions;
  min_freq: MinFreq;
  vocab_size: VocabSize;
  location: Location;
  task: Task;
}
// refactor everything