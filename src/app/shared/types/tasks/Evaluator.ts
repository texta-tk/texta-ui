import {TextaTask} from './TaskStatus';

interface Index {
  id: number;
  is_open: boolean;
  url: string;
  name: string;
}


export interface Evaluator {
  id: number;
  url: string;
  indices: Index[];
  description: string;
  tasks: TextaTask[];
  fields: string[];
  is_favorited: boolean;
  confusion_matrix: string;
  classes: string[];
}

export interface IndividualResults {
  precision: number;
  recall: number;
  f1_score: number;
  accuracy: number;
  confusion_matrix: number[][];
  count: number;
}

export interface EvaluatorIndividualResults {
  [key: string]: IndividualResults;
}

interface Value2 {
  true: string;
  pred: string;
}

interface Value {
  value: Value2;
  count: number;
}

interface Substrings {
  values: Value[];
  total_unique_count: number;
  filtered_unique_count: number;
}

interface Superstrings {
  values: any[];
  total_unique_count: number;
  filtered_unique_count: number;
}

interface Value4 {
  true: string;
  pred: string;
}

interface Value3 {
  value: Value4;
  count: number;
}

interface Partial {
  values: Value3[];
  total_unique_count: number;
  filtered_unique_count: number;
}

interface Value5 {
  value: string;
  count: number;
}

interface FalseNegatives {
  values: Value5[];
  total_unique_count: number;
  filtered_unique_count: number;
}

interface Value6 {
  value: string;
  count: number;
}

interface FalsePositives {
  values: Value6[];
  total_unique_count: number;
  filtered_unique_count: number;
}

export interface EvaluatorMisclassifiedExamplesResults {
  substrings: Substrings;
  superstrings: Superstrings;
  partial: Partial;
  false_negatives: FalseNegatives;
  false_positives: FalsePositives;
}
