interface Index {
  id: number;
  is_open: boolean;
  url: string;
  name: string;
}

interface Task {
  id: number;
  status: string;
  progress: number;
  step: string;
  errors: string;
  time_started: Date;
  last_update: Date;
  time_completed?: any;
  total: number;
  num_processed: number;
}

export interface Summarizer {
  id: number;
  url: string;
  indices: Index[];
  description: string;
  task: Task;
  fields: string[];
}


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
  default: boolean;
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
  default: string;
  children: Children;
}

interface Indices {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  default: string;
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

interface OptionsTask {
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

interface Choice {
  value: string;
  display_name: string;
}

interface Algorithm {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  default: string;
  choices: Choice[];
}

interface Ratio {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  default: number;
}

interface POST {
  id: Id;
  url: Url;
  author_username: AuthorUsername;
  indices: Indices;
  description: Description;
  task: OptionsTask;
  query: Query;
  fields: Fields;
  algorithm: Algorithm;
  ratio: Ratio;
}

interface Actions {
  POST: POST;
}

export interface SummarizerOptions {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  actions: Actions;
}

