import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {SavedSearch} from '../../../shared/types/SavedSearch';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-saved-searches',
  templateUrl: './saved-searches.component.html',
  styleUrls: ['./saved-searches.component.scss']
})
export class SavedSearchesComponent implements OnInit, OnDestroy {
  @Output() savedSearchClick = new EventEmitter<number>(); // search object future todo
  displayedColumns: string[] = ['select', 'name', 'url'];
  selection = new SelectionModel<any>(true, []);

  dataSource: MatTableDataSource<SavedSearch>;
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private searcherService: SearcherService, private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap((currentProject: Project) => {
      if (currentProject) {
        return this.searcherService.getSavedSearches(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((response: SavedSearch[] | HttpErrorResponse) => {
      if (response && !(response instanceof HttpErrorResponse)) {
        this.dataSource = new MatTableDataSource(response);
      }
    });

  }

  displaySavedSearch(element) {
    this.savedSearchClick.emit(element);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

}
