import {ElasticsearchQuery, FactConstraint} from '../../searcher/searcher-sidebar/build-search/Constraints';

export class Search {
  // tslint:disable-next-line:no-any
  constructor(public searchContent: SearchByQueryResponse,
              public elasticsearchQuery: ElasticsearchQuery,
              public searchOptions: SearchOptions) {
    this.elasticsearchQuery = JSON.parse(JSON.stringify(elasticsearchQuery));

  }
}

export interface SearchByQueryResponse {
  results: { highlight: unknown, doc: unknown }[];
  count: { value: number; relation: string } | number;
  aggs?: any;
}

export interface ConstraintHighlightedFact {
  fact: string;
  factValue?: string;
}

export interface ShowShortVersionData {
  wordContextDistance: number;
  highlightedFacts: ConstraintHighlightedFact[];
}

export class SearchOptions {
  onlyHighlightMatching?: FactConstraint[];
  onlyShowMatchingColumns?: boolean;
  highlightTextaFacts: boolean;
  highlightSearcherMatches: boolean;
  showShortVersion?: ShowShortVersionData;
}

export interface TextaFact {
  doc_path: string;
  fact: string;
  spans: string | number[];
  str_val: string;
}
