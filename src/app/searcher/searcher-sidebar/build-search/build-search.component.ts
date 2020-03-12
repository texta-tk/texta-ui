import {ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild,} from '@angular/core';
import {Search} from '../../../shared/types/Search';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SavedSearch} from '../../../shared/types/SavedSearch';
import {AdvancedSearchComponent} from './advanced-search/advanced-search.component';
import {SimpleSearchComponent} from './simple-search/simple-search.component';
import {ProjectStore} from '../../../core/projects/project.store';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {LocalStorageService} from '../../../core/util/local-storage.service';
import {Project} from '../../../shared/types/Project';

@Component({
  selector: 'app-build-search',
  templateUrl: './build-search.component.html',
  styleUrls: ['./build-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuildSearchComponent implements OnInit, OnDestroy {
  @Output() searchButtonClick = new EventEmitter<Search>();
  onlyHighlightMatching = false;
  searcherType;
  @ViewChild(AdvancedSearchComponent)
  private advancedSearchComponent: AdvancedSearchComponent;
  @ViewChild(SimpleSearchComponent)
  private simpleSearchComponent: SimpleSearchComponent;
  private destroyed$: Subject<boolean> = new Subject<boolean>();
  private currentProject: Project;

  constructor(
    public searchService: SearcherComponentService,
    private localStorageService: LocalStorageService,
    private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(proj => {
      if (proj) {
        this.currentProject = proj;
        const state = this.localStorageService.getProjectState(proj);
        if (state?.searcher?.searcherType) {
          this.searcherType = state.searcher.searcherType;
        } else {
          this.searcherType = 1;
        }
      }
    });
  }

  // THIS IS TEMPORARY todo, think of a way to save simple searches and advanced searches with a clear cut difference
  buildSavedSearch(savedSearch: SavedSearch) {
    const constraints = JSON.parse(savedSearch.query_constraints as string);
    if (constraints.length === 0) {
      this.simpleSearchComponent.buildSavedSearch(savedSearch);
      this.searcherType = 1;
      this.saveTypeSelection(1);
    } else {
      this.advancedSearchComponent.buildSavedSearch(savedSearch);
      this.searcherType = 2;
      this.saveTypeSelection(2);
    }
  }

  saveSearch(description: string) {
    if (this.searcherType === 2) {
      this.advancedSearchComponent.saveSearch(description);
    } else {
      this.simpleSearchComponent.saveSearch(description);
    }
  }

  queryNewSearch() {
    if (this.searcherType === 2) {
      this.advancedSearchComponent.searchQueue$.next();
    } else {
      this.simpleSearchComponent.searchQueue$.next();
    }
  }

  saveTypeSelection(saveType: 1 | 2) {
    const state = this.localStorageService.getProjectState(this.currentProject);
    if (state?.searcher?.searcherType) {
      state.searcher.searcherType = saveType;
      this.localStorageService.updateProjectState(this.currentProject, state);
    }
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
