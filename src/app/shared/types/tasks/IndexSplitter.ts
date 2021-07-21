
export interface Task {
  id: number;
  status: string;
  progress: number;
  step: string;
  errors: string;
  time_started: Date;
  last_update?: Date;
  time_completed: Date;
  total: number;
  num_processed: number;
}

export interface IndexSplitter {
  id: number;
  url: string;
  author_username: string;
  description: string;
  scroll_size: number;
  fields: string[];
  query: string;
  train_index: string;
  test_index: string;
  test_size: number;
  fact: string;
  str_val: string;
  distribution: string;
  custom_distribution: string;
  task: Task;
}


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
  help_text: string;
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

export interface ScrollSize {
  type: string;
  required: boolean;
  read_only: boolean;
  help_text: string;
  label: string;
  min_value: number;
  max_value: number;
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

export interface Query {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface TrainIndex {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface TestIndex {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface TestSize {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  min_value: number;
  max_value: number;
}

export interface Fact {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface StrVal {
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

export interface Distribution {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  choices: Choice[];
}

export interface CustomDistribution {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
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


export interface POST {
  id: Id;
  url: Url;
  author_username: AuthorUsername;
  description: Description;
  indices: Indices;
  scroll_size: ScrollSize;
  fields: Fields;
  query: Query;
  train_index: TrainIndex;
  test_index: TestIndex;
  test_size: TestSize;
  fact: Fact;
  str_val: StrVal;
  distribution: Distribution;
  custom_distribution: CustomDistribution;
}

export interface Actions {
  POST: POST;
}

export interface IndexSplitterOptions {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  actions: Actions;
}
