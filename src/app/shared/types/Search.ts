import {ElasticsearchQuery, FactConstraint} from '../../searcher/searcher-sidebar/build-search/Constraints';

export class Search {
  constructor(public searchContent: { count: number, results: { highlight: any, doc: any }[] },
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
