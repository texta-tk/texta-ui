import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {merge, of, Subject} from 'rxjs';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CreateSearchTaggerDialogComponent} from './create-search-tagger-dialog/create-search-tagger-dialog.component';
import {SearchQueryTagger} from '../../shared/types/tasks/SearchQueryTagger';
import {Project} from '../../shared/types/Project';
import {SearchTaggerService} from '../../core/models/taggers/search-tagger/search-tagger.service';
import {ConfirmDialogComponent} from '../../shared/shared-module/components/dialogs/confirm-dialog/confirm-dialog.component';
import {expandRowAnimation} from '../../shared/animations';
import {ProjectStore} from '../../core/projects/project.store';
import {LogService} from '../../core/util/log.service';
import {QueryDialogComponent} from '../../shared/shared-module/components/dialogs/query-dialog/query-dialog.component';
import {Index} from '../../shared/types/Index';

@Component({
  selector: 'app-search-tagger',
  templateUrl: './search-query-tagger.component.html',
  styleUrls: ['./search-query-tagger.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class SearchQueryTaggerComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: SearchQueryTagger | null;
  public tableData: MatTableDataSource<SearchQueryTagger> = new MatTableDataSource();
  selectedRows = new SelectionModel<SearchQueryTagger>(true, []);
  public displayedColumns = ['select', 'id', 'description', 'author__username', 'fields', 'task__time_started', 'task__time_completed', 'task__status'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength: number;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;
  private updateTable = new Subject<boolean>();
  getIndicesName = (x: Index) => x.name;
  constructor(private projectStore: ProjectStore,
              private searchTaggerService: SearchTaggerService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit(): void {

    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x) {
        this.isLoadingResults = true;
        this.currentProject = x;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
      } else {
        this.isLoadingResults = false;
      }
    });
  }

  openQueryDialog(query: string): void {
    this.dialog.open(QueryDialogComponent, {
      data: {query},
      maxHeight: '665px',
      width: '700px',
    });
  }

  ngAfterViewInit(): void {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.updateTable)
      .pipe(debounceTime(250), startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$));
        }))
      .pipe(
        switchMap(proj => {
          if (proj) {
            const sortDirection = this.sort.direction === 'desc' ? '-' : '';
            return this.searchTaggerService.getSearchQueryTaggerTasks(
              this.currentProject.id,
              // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
              `ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`);
          } else {
            return of(null);
          }
        })).subscribe(data => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      if (data && !(data instanceof HttpErrorResponse)) {
        this.resultsLength = data.count;
        this.tableData.data = data.results;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateSearchTaggerDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.updateTable.next(true);
        this.projectStore.refreshSelectedProjectResourceCounts();
      }
    });
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selectedRows.selected.length;
    const numRows = this.tableData.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selectedRows.clear() :
      (this.tableData.data as SearchQueryTagger[]).forEach(row => this.selectedRows.select(row));
  }


  onDeleteAllSelected(): void {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Tasks?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          const idsToDelete = this.selectedRows.selected.map((searchTagger: SearchQueryTagger) => searchTagger.id);
          const body = {ids: idsToDelete};

          this.searchTaggerService.bulkDeleteSearchQueryTaggerTasks(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} Tasks.`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selected: SearchQueryTagger) => {
      const index: number = (this.tableData.data as SearchQueryTagger[]).findIndex(searchTagger => searchTagger.id === selected.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
