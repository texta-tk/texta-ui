export interface ResultsWrapper<T> {
  count: number;
  results: T[];
}
export interface ElasticSearchSourceResponse {
  _id: string;
  _index: string;
  _source: unknown;
  _type: string;
}
export interface ROCData {
  false_positive_rate: number[];
  true_positive_rate: number[];
  epoch: number;
}
