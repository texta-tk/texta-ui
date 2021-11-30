import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SearcherService} from 'src/app/core/searcher/searcher.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {Project} from '../../../types/Project';
import {of, Subject} from 'rxjs';
import {SavedSearch} from '../../../types/SavedSearch';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectStore} from 'src/app/core/projects/project.store';
import {MatFormFieldAppearance} from '@angular/material/form-field';
import {FormControl} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';

@Component({
  selector: 'app-saved-search-autocomplete',
  templateUrl: './saved-search-autocomplete.component.html',
  styleUrls: ['./saved-search-autocomplete.component.scss']
})
export class SavedSearchAutocompleteComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() appearance: MatFormFieldAppearance = 'standard';
  @Output() queryChanged = new EventEmitter<string>();

  @Input() startingQuery: string;

  defaultQuery = '{"query": {"match_all": {}}}';
  currentProject: Project;
  savedSearches: SavedSearch[];
  @ViewChild(MatAutocompleteTrigger) matAutoComplete: MatAutocompleteTrigger;

  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private searcherService: SearcherService, private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.searcherService.getSavedSearches(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe(response => {
      if (response && !(response instanceof HttpErrorResponse)) {
        response.forEach(x => {
          x.query = JSON.stringify({query: JSON.parse(x.query).query}); // only want query not highlight and from, size params
        });
        this.savedSearches = response;
      }
    });
  }

  onQueryChanged(elasticObject: string): void {
    this.queryChanged.emit(elasticObject);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit(): void {
    if (this.startingQuery !== this.defaultQuery) {
      this.matAutoComplete.writeValue(this.startingQuery);
    }
  }
}
