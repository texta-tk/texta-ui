import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {SearcherService} from 'src/app/core/searcher/searcher.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {Project} from '../../types/Project';
import {of, Subject} from 'rxjs';
import {SavedSearch} from '../../types/SavedSearch';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectStore} from 'src/app/core/projects/project.store';

@Component({
  selector: 'app-saved-search-autocomplete',
  templateUrl: './saved-search-autocomplete.component.html',
  styleUrls: ['./saved-search-autocomplete.component.scss']
})
export class SavedSearchAutocompleteComponent implements OnInit, OnDestroy {
  @Input() appearance: 'legacy' | 'standard' | 'fill' | 'outline' | undefined = undefined;
  @Output() queryChanged = new EventEmitter<string>();

  defaultQuery = '{"query": {"match_all": {}}}';
  currentProject: Project;
  savedSearches: SavedSearch[];

  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private searcherService: SearcherService, private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap((currentProject: Project) => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.searcherService.getSavedSearches(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((response: SavedSearch[] | HttpErrorResponse) => {
      if (response && !(response instanceof HttpErrorResponse)) {
        this.savedSearches = response;
      }
    });
  }

  onQueryChanged(query: string) {
    this.queryChanged.emit(query);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
