import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {Project} from '../../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {SearcherService} from '../../../../core/searcher/searcher.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {switchMap, takeUntil} from 'rxjs/operators';
import {SavedSearch} from '../../../../shared/types/SavedSearch';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../../../core/util/log.service';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {Constraint, ElasticsearchQuery} from '../../build-search/Constraints';
import {Search} from '../../../../shared/types/Search';

@Component({
  selector: 'app-save-search-dialog',
  templateUrl: './save-search-dialog.component.html',
  styleUrls: ['./save-search-dialog.component.scss']
})
export class SaveSearchDialogComponent implements OnInit {

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  savedSearches: SavedSearch[] = [];
  selectedSearch: SavedSearch;
  newDesc = '';
  method: 'existing' | 'new' = 'new';
  elasticSearchQuery: ElasticsearchQuery;
  constraints: Constraint[] = [];
  latestSearch: Search;

  constructor(private dialogRef: MatDialogRef<SaveSearchDialogComponent>, private searcherService: SearcherService,
              private logService: LogService,
              private searcherComponentService: SearcherComponentService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return this.searcherService.getSavedSearches(proj.id);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.savedSearches = resp;
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
    this.searcherComponentService.getElasticQuery().pipe(takeUntil(this.destroyed$)).subscribe(qry => {
      if (qry) {
        this.elasticSearchQuery = qry;
      }
    });
    this.searcherComponentService.getAdvancedSearchConstraints$().pipe(takeUntil(this.destroyed$)).subscribe(constraints => {
      if (constraints) {
        this.constraints = constraints;
      }
    });
    this.searcherComponentService.getSearch().pipe(takeUntil(this.destroyed$)).subscribe(search => {
      if (search) {
        this.latestSearch = search;
      }
    });
  }

  onSubmit(): void {
    if (this.currentProject?.id) {
      // onlyShowMatchingColumns is a simple search option, kinda hacky way to know if it was a simple or advanced search
      const constraints = this.latestSearch.searchOptions.onlyShowMatchingColumns ? [] : this.constraints;
      if (this.method === 'existing' && this.selectedSearch?.id) {
        this.searcherService.patchSavedSearch(this.currentProject.id, this.selectedSearch.id, constraints,
          this.elasticSearchQuery.elasticSearchQuery).subscribe(resp => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            this.logService.snackBarMessage('Updated saved search: ' + this.selectedSearch.description, 5000);
            this.searcherComponentService.nextSavedSearchUpdate();
            this.closeDialog();
          } else if (resp) {
            this.logService.snackBarError(resp);
          }
        });
      } else if (this.method === 'new') {
        this.searcherService.saveSearch(this.currentProject.id, constraints, this.elasticSearchQuery.elasticSearchQuery,
          this.newDesc).subscribe(resp => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            this.searcherComponentService.nextSavedSearchUpdate();
            this.closeDialog();
          } else if (resp) {
            this.logService.snackBarError(resp);
          }
        });
      }
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
