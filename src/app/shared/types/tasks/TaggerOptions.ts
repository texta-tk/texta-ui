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

interface Description {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
}

interface Query {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: string;
}

interface FactName {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
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

interface Description2 {
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
    description: Description2;
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
    help_text: string;
    default: string;
    children: Children;
}

interface Indices {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: string;
    child: Child;
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

interface DetectLang {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: boolean;
}

interface Embedding {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
}

interface Choice2 {
    value: string;
    display_name: string;
}

interface Vectorizer {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: string;
    choices: Choice2[];
}

interface Choice3 {
    value: string;
    display_name: string;
}

interface Classifier {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: string;
    choices: Choice3[];
}

interface Child3 {
    type: string;
    required: boolean;
    read_only: boolean;
}

interface StopWords {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: string;
    child: Child3;
}

interface MaximumSampleSize {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: number;
}

interface MinimumSampleSize {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: number;
}

interface ScoreThreshold {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: number;
}

interface NegativeMultiplier {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: number;
}

interface Precision {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
}

interface Recall {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
}

interface F1Score {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
}

interface Choice4 {
    value: string;
    display_name: string;
}

interface SnowballLanguage {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    choices: Choice4[];
}

interface Choice5 {
    value: string;
    display_name: string;
}

interface ScoringFunction {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: string;
    choices: Choice5[];
}

interface NumFeatures {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
}

interface NumExamples {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
}

interface ConfusionMatrix {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
}

interface Plot {
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

interface TaggerGroups {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
}

interface IgnoreNumbers {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: boolean;
}

interface Balance {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: boolean;
}

interface BalanceToMaxLimit {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
    default: boolean;
}

interface PosLabel {
    type: string;
    required: boolean;
    read_only: boolean;
    label: string;
    help_text: string;
}

interface POST {
    id: Id;
    url: Url;
    author: AuthorUsername;
    description: Description;
    query: Query;
    fact_name: FactName;
    indices: Indices;
    fields: Fields;
    detect_lang: DetectLang;
    embedding: Embedding;
    vectorizer: Vectorizer;
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

interface Actions {
    POST: POST;
}

export interface TaggerOptions {
    name: string;
    description: string;
    renders: string[];
    parses: string[];
    actions: Actions;
}
