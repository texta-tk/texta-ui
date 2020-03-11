import {ChangeDetectionStrategy, Component, EventEmitter, Output, ViewChild,} from '@angular/core';
import {Search} from '../../../shared/types/Search';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SavedSearch} from '../../../shared/types/SavedSearch';
import {AdvancedSearchComponent} from './advanced-search/advanced-search.component';
import {SimpleSearchComponent} from './simple-search/simple-search.component';

@Component({
  selector: 'app-build-search',
  templateUrl: './build-search.component.html',
  styleUrls: ['./build-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuildSearchComponent {
  @Output() searchButtonClick = new EventEmitter<Search>();
  onlyHighlightMatching = false;
  searcherType = 1;
  @ViewChild(AdvancedSearchComponent)
  private advancedSearchComponent: AdvancedSearchComponent;
  @ViewChild(SimpleSearchComponent)
  private simpleSearchComponent: SimpleSearchComponent;

  constructor(
    public searchService: SearcherComponentService) {
  }

  // todo, what happens when we save simple search? do we care?
  buildSavedSearch(savedSearch: SavedSearch) {
    this.advancedSearchComponent.buildSavedSearch(savedSearch);
  }

  saveSearch(description: string) {
    this.advancedSearchComponent.saveSearch(description);
  }

  queryNewSearch() {
    if (this.searcherType === 2) {
      this.advancedSearchComponent.searchQueue$.next();
    } else {
      this.simpleSearchComponent.searchQueue$.next();
    }
  }
}
