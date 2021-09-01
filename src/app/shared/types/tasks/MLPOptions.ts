interface Id {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Url {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface AuthorUsername {
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

interface IsOpen {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Url2 {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Name {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  max_length: number;
}

interface Children {
  id: Id2;
  is_open: IsOpen;
  url: Url2;
  name: Name;
}

interface Child {
  type: string;
  required: boolean;
  read_only: boolean;
  children: Children;
}

interface Indices {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  child: Child;
}

interface Description {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Id3 {
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

interface Errors {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface TimeStarted {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface LastUpdate {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface TimeCompleted {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Total {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  min_value: number;
  max_value: number;
}

interface NumProcessed {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  min_value: number;
  max_value: number;
}

interface Children2 {
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

interface Task {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  children: Children2;
}

interface Query {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

interface Child2 {
  type: string;
  required: boolean;
  read_only: boolean;
}

interface Fields {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  child: Child2;
}

export interface Choice {
  value: string;
  display_name: string;
}

interface Analyzers {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  choices: Choice[];
}

interface POST {
  id: Id;
  url: Url;
  author: AuthorUsername;
  indices: Indices;
  description: Description;
  task: Task;
  query: Query;
  fields: Fields;
  analyzers: Analyzers;
}

interface Actions {
  POST: POST;
}

export interface MLPOptions {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  actions: Actions;
}
