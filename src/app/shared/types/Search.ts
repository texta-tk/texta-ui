import {FactConstraint} from '../../searcher/searcher-sidebar/build-search/Constraints';

export class Search {
  constructor(public searchContent: { count: number, results: { highlight: any, doc: any }[] },
              public searchOptions: SearchOptions) {

  }
}

export class SearchOptions {
  liveSearch: boolean;
  onlyHighlightMatching?: FactConstraint[];
  selectedIndexes: string[];
}
