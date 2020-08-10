
// tslint:disable:variable-name
class Id {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Url {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Description {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

class Query {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Child {
  type: string;
  required: boolean;
  read_only: boolean;
}

class Fields {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  child: Child;
}

class EmbeddingTaggerOptions {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Choice {
  value: string;
  display_name: string;
}

class Vectorizer {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  choices: Choice[];
}

class Choice2 {
  value: string;
  display_name: string;
}

class Classifier {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  choices: Choice2[];
}

class Choice3 {
  value: string;
  display_name: string;
}

class FeatureSelector {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  choices: Choice3[];
}

class StopWords {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class MaximumSampleSize {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

class NegativeMultiplier {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
}

class Location {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Precision {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Recall {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class F1Score {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class NumFeatures {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Plot {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Id2 {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Status {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Progress {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Step {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Errors {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class TimeStarted {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class LastUpdate {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class TimeCompleted {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
}

class Children {
  id: Id2;
  status: Status;
  progress: Progress;
  step: Step;
  errors: Errors;
  time_started: TimeStarted;
  last_update: LastUpdate;
  time_completed: TimeCompleted;
}

class Task {
  type: string;
  required: boolean;
  read_only: boolean;
  label: string;
  children: Children;
}

class POST {
  id: Id;
  url: Url;
  description: Description;
  query: Query;
  fields: Fields;
  embedding: EmbeddingTaggerOptions;
  vectorizer: Vectorizer;
  classifier: Classifier;
  feature_selector: FeatureSelector;
  stop_words: StopWords;
  maximum_sample_size: MaximumSampleSize;
  negative_multiplier: NegativeMultiplier;
  location: Location;
  precision: Precision;
  recall: Recall;
  f1_score: F1Score;
  num_features: NumFeatures;
  plot: Plot;
  task: Task;
}

export class Actions {
  POST: POST;
}

export class TaggerOptions {
  name: string;
  description: string;
  renders: string[];
  parses: string[];
  actions: Actions;

  static createEmpty(): TaggerOptions {
    const out = new TaggerOptions();
    out.actions = new Actions();
    out.actions.POST = new POST();
    out.actions.POST.vectorizer = new Vectorizer();
    out.actions.POST.classifier = new Classifier();
    out.actions.POST.feature_selector = new FeatureSelector();
    out.actions.POST.description = new Description();
    out.actions.POST.embedding = new EmbeddingTaggerOptions();
    out.actions.POST.f1_score = new F1Score();
    out.actions.POST.fields = new Fields();
    out.actions.POST.id = new Id();
    out.actions.POST.location = new Location();
    out.actions.POST.maximum_sample_size = new MaximumSampleSize();
    out.actions.POST.negative_multiplier = new NegativeMultiplier();
    out.actions.POST.num_features = new NumFeatures();
    out.actions.POST.plot = new Plot();
    out.actions.POST.precision = new Precision();
    out.actions.POST.query = new Query();
    out.actions.POST.recall = new Recall();
    out.actions.POST.stop_words = new StopWords();
    out.actions.POST.task = new Task();
    out.actions.POST.url = new Url();
    return out;
  }
}
