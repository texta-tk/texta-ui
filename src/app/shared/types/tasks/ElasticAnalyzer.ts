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

export interface ElasticAnalyzer {
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

interface StripHtml {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: boolean;
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

interface Description {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

interface AddedBy {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

interface Test {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: boolean;
}

interface Source {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

interface Client {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

interface Choice {
  value: string;
  display_name: string;
}

interface Domain {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  choices: Choice[];
}

interface CreatedAt {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

interface Children {
  id: Id2;
  is_open: IsOpen;
  url: Url2;
  name: Name;
  description: Description;
  added_by: AddedBy;
  test: Test;
  source: Source;
  client: Client;
  domain: Domain;
  created_at: CreatedAt;
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

interface Choice2 {
  value: string;
  display_name: string;
}

interface Analyzers {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  choices: Choice2[];
}

interface Choice3 {
  value: string;
  display_name: string;
}

interface StemmerLang {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  choices: Choice3[];
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
  help_text: string;
  child: Child2;
}

interface Choice4 {
  value: string;
  display_name: string;
}

interface Tokenizer {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: string;
  choices: Choice4[];
}

interface EsTimeout {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  min_value: number;
  max_value: number;
  default: number;
}

interface BulkSize {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  min_value: number;
  max_value: number;
  default: number;
}

interface DetectLang {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: boolean;
}

interface Description2 {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  max_length: number;
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
  default: string;
}

interface POST {
  id: Id;
  url: Url;
  author_username: AuthorUsername;
  strip_html: StripHtml;
  indices: Indices;
  analyzers: Analyzers;
  stemmer_lang: StemmerLang;
  fields: Fields;
  tokenizer: Tokenizer;
  es_timeout: EsTimeout;
  bulk_size: BulkSize;
  detect_lang: DetectLang;
  description: Description2;
  task: Task;
  query: Query;
}

interface Actions {
  POST: POST;
}

export interface ElasticAnalyzerOptions {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  actions: Actions;
}
