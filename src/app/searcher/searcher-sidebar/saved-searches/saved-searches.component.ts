import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {SavedSearch} from '../../../shared/types/SavedSearch';
import {HttpErrorResponse} from '@angular/common/http';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {MatDialog} from '@angular/material/dialog';
import {EditSavedSearchDialogComponent} from './edit-saved-search-dialog/edit-saved-search-dialog.component';
import {LogService} from '../../../core/util/log.service';

@Component({
  selector: 'app-saved-searches',
  templateUrl: './saved-searches.component.html',
  styleUrls: ['./saved-searches.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavedSearchesComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['select', 'name', 'edit'];
  dataSource: MatTableDataSource<SavedSearch> = new MatTableDataSource();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;
  loadingSavedSearches = true;

  constructor(private searcherService: SearcherService,
              private projectStore: ProjectStore,
              public dialog: MatDialog,
              private changeDetectorRef: ChangeDetectorRef,
              private logService: LogService,
              public searchService: SearcherComponentService) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.loadingSavedSearches = true;
        this.currentProject = currentProject;
        this.changeDetectorRef.markForCheck();
        return this.searcherService.getSavedSearches(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe(response => {
      this.loadingSavedSearches = false;
      if (response && !(response instanceof HttpErrorResponse)) {
        this.dataSource.data = response;
        this.searchService.savedSearchSelection = new SelectionModel<SavedSearch>(true, []);
      }
      this.changeDetectorRef.markForCheck();
    });

    this.searchService.getSavedSearchUpdate().pipe(takeUntil(this.destroyed$), switchMap(val => {
      if (this.currentProject.id && val) {
        this.loadingSavedSearches = true;
        this.changeDetectorRef.markForCheck();
        return this.searcherService.getSavedSearches(this.currentProject.id);
      }
      return of(null);
    })).subscribe(response => {
      this.loadingSavedSearches = false;
      if (response && !(response instanceof HttpErrorResponse)) {
        this.dataSource.data = response;
        this.searchService.savedSearchSelection.clear();
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  displaySavedSearch(element: SavedSearch): void {
    this.searchService.nextSavedSearch(element);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.searchService.savedSearchSelection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.searchService.savedSearchSelection.clear() :
      this.dataSource.data.forEach(row => this.searchService.savedSearchSelection.select(row));
  }

  removeSelectedRows(): void {
    this.searchService.savedSearchSelection.selected.forEach((selectedSearch: SavedSearch) => {
      const index: number = this.dataSource.data.findIndex((search: SavedSearch) => search.id === selectedSearch.id);
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data];
    });
    this.searchService.savedSearchSelection.clear();
    this.changeDetectorRef.markForCheck();
  }

  edit(search: SavedSearch): void {
    const dialogRef = this.dialog.open(EditSavedSearchDialogComponent, {data: search});
    dialogRef.afterClosed().subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        search.description = x.description;
        this.changeDetectorRef.markForCheck();
      } else if (x) {
        this.logService.snackBarError(x, 2000);
      }
    });
  }
}
