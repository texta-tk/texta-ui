import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {SavedSearch} from '../../../shared/types/SavedSearch';
import {HttpErrorResponse} from '@angular/common/http';
import {SearcherComponentService} from '../../services/searcher-component.service';

@Component({
  selector: 'app-saved-searches',
  templateUrl: './saved-searches.component.html',
  styleUrls: ['./saved-searches.component.scss']
})
export class SavedSearchesComponent implements OnInit, OnDestroy {
  @Output() savedSearchClick = new EventEmitter<number>(); // search object future todo
  displayedColumns: string[] = ['select', 'name'];
  dataSource: MatTableDataSource<SavedSearch>;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;

  constructor(private searcherService: SearcherService, private projectStore: ProjectStore, public searchService: SearcherComponentService) {
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
        this.dataSource = new MatTableDataSource(response);
        this.searchService.savedSearchSelection = new SelectionModel<SavedSearch>(true, []);
      }
    });

    this.searchService.getSavedSearchUpdate().pipe(takeUntil(this.destroyed$), switchMap(val => {
      if (this.currentProject.id && val) {
        return this.searcherService.getSavedSearches(this.currentProject.id);
      }
      return of(null);
    })).subscribe((response: SavedSearch[] | HttpErrorResponse) => {
      if (response && !(response instanceof HttpErrorResponse)) {
        this.dataSource = new MatTableDataSource(response);
      }
    });
  }

  copy(url) {
    navigator.clipboard.writeText(url);
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
    const numSelected = this.searchService.savedSearchSelection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.searchService.savedSearchSelection.clear() :
      this.dataSource.data.forEach(row => this.searchService.savedSearchSelection.select(row));
  }

  removeSelectedRows() {
    this.searchService.savedSearchSelection.selected.forEach((selectedSearch: SavedSearch) => {
      const index: number = this.dataSource.data.findIndex((search: SavedSearch) => search.id === selectedSearch.id);
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data];
    });
    this.searchService.savedSearchSelection.clear();
  }
}
