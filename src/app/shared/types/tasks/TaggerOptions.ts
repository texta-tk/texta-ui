
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

export interface Url2 {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Id2 {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Username {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface Email {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface DisplayName {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface DateJoined {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface LastLogin {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface IsSuperuser {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface FirstName {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface LastName {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface IsUaaAccount {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Scopes {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Application {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Children2 {
  first_name: FirstName;
  last_name: LastName;
  is_uaa_account: IsUaaAccount;
  scopes: Scopes;
  application: Application;
}

export interface Profile {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  children: Children2;
}

export interface Children {
  url: Url2;
  id: Id2;
  username: Username;
  email: Email;
  display_name: DisplayName;
  date_joined: DateJoined;
  last_login: LastLogin;
  is_superuser: IsSuperuser;
  profile: Profile;
}

export interface Author {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  children: Children;
}

export interface Description {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface Query {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: string;
}

export interface FactName {
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

export interface IsOpen {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  default: boolean;
}

export interface Url3 {
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

export interface Description2 {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

export interface AddedBy {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

export interface Test {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: boolean;
}

export interface Source {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

export interface Client {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  max_length: number;
}

export interface Choice {
  value: string;
  display_name: string;
}

export interface Domain {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  choices: Choice[];
}

export interface CreatedAt {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Children3 {
  id: Id3;
  is_open: IsOpen;
  url: Url3;
  name: Name;
  description: Description2;
  added_by: AddedBy;
  test: Test;
  source: Source;
  client: Client;
  domain: Domain;
  created_at: CreatedAt;
}

export interface Child {
  type: string;
  required: boolean;
  read_only: boolean;
  help_text: string;
  default: string;
  children: Children3;
}

export interface Indices {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: string;
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

export interface DetectLang {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: boolean;
}

export interface Embedding {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
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
  help_text: string;
  default: string;
  choices: Choice2[];
}

export interface Choice3 {
  value: string;
  display_name: string;
}

export interface Analyzer {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: string;
  choices: Choice3[];
}

export interface Choice4 {
  value: string;
  display_name: string;
}

export interface Classifier {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: string;
  choices: Choice4[];
}

export interface Child3 {
  type: string;
  required: boolean;
  read_only: boolean;
}

export interface StopWords {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: string;
  child: Child3;
}

export interface MaximumSampleSize {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: number;
}

export interface MinimumSampleSize {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: number;
}

export interface ScoreThreshold {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: number;
}

export interface NegativeMultiplier {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: number;
}

export interface Precision {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Recall {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface F1Score {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Choice5 {
  value: string;
  display_name: string;
}

export interface SnowballLanguage {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  choices: Choice5[];
}

export interface Choice6 {
  value: string;
  display_name: string;
}

export interface ScoringFunction {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: string;
  choices: Choice6[];
}

export interface NumFeatures {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface NumExamples {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface ConfusionMatrix {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Plot {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Id4 {
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
}

export interface NumProcessed {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface Children4 {
  id: Id4;
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
  children: Children4;
}

export interface TaggerGroups {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

export interface IgnoreNumbers {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: boolean;
}

export interface Balance {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: boolean;
}

export interface BalanceToMaxLimit {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: boolean;
}

export interface PosLabel {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

export interface POST {
  id: Id;
  url: Url;
  author: Author;
  description: Description;
  query: Query;
  fact_name: FactName;
  indices: Indices;
  fields: Fields;
  detect_lang: DetectLang;
  embedding: Embedding;
  vectorizer: Vectorizer;
  analyzer: Analyzer;
  classifier: Classifier;
  stop_words: StopWords;
  maximum_sample_size: MaximumSampleSize;
  minimum_sample_size: MinimumSampleSize;
  score_threshold: ScoreThreshold;
  negative_multiplier: NegativeMultiplier;
  precision: Precision;
  recall: Recall;
  f1_score: F1Score;
  snowball_language: SnowballLanguage;
  scoring_function: ScoringFunction;
  num_features: NumFeatures;
  num_examples: NumExamples;
  confusion_matrix: ConfusionMatrix;
  plot: Plot;
  task: Task;
  tagger_groups: TaggerGroups;
  ignore_numbers: IgnoreNumbers;
  balance: Balance;
  balance_to_max_limit: BalanceToMaxLimit;
  pos_label: PosLabel;
}

export interface Actions {
  POST: POST;
}

export interface TaggerOptions {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  actions: Actions;
}
