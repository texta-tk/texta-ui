import {FactConstraint} from '../../searcher/searcher-sidebar/build-search/Constraints';

export class Search {
  constructor(public searchContent: { count: number, results: { highlight: any, doc: any }[] },
              public searcherOptions: { liveSearch: boolean,  onlyHighlightMatching?: FactConstraint[] }) {

  }

}
