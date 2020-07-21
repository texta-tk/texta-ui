import {ElasticsearchQuery, FactConstraint} from '../../searcher/searcher-sidebar/build-search/Constraints';

export class Search {
  // tslint:disable-next-line:no-any
  constructor(public searchContent: { count: number, aggs?: any, results: { highlight: unknown, doc: unknown }[] },
              public elasticsearchQuery: ElasticsearchQuery,
              public searchOptions: SearchOptions) {
    this.elasticsearchQuery = JSON.parse(JSON.stringify(elasticsearchQuery));

  }
}

export class SearchOptions {
  liveSearch: boolean;
  onlyHighlightMatching?: FactConstraint[];
  onlyShowMatchingColumns?: boolean;
  showShortVersion?: number;
}
