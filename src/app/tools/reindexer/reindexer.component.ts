import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Reindexer} from 'src/app/shared/types/tools/Elastic';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {merge, Subject, timer} from 'rxjs';
import {Project} from 'src/app/shared/types/Project';
import {ProjectStore} from 'src/app/core/projects/project.store';
import {LogService} from 'src/app/core/util/log.service';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {ConfirmDialogComponent} from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {QueryDialogComponent} from 'src/app/shared/components/dialogs/query-dialog/query-dialog.component';
import {ReindexerService} from '../../core/tools/reindexer/reindexer.service';
import {CreateReindexerDialogComponent} from './create-reindexer-dialog/create-reindexer-dialog.component';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-reindexer',
  templateUrl: './reindexer.component.html',
  styleUrls: ['./reindexer.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])]
})
export class ReindexerComponent implements OnInit, OnDestroy {
  expandedElement: Reindexer | null;
  public tableData: MatTableDataSource<Reindexer> = new MatTableDataSource();
  public displayedColumns = ['select', 'id', 'author__username', 'description', 'new_index', 'fields', 'random_size',
    'show_query', 'task__time_started', 'task__time_completed', 'task__status', 'Modify'];
  selectedRows = new SelectionModel<Reindexer>(true, []);
  public isLoadingResults = true;

  destroyed$: Subject<boolean> = new Subject<boolean>();

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  filteredSubject = new Subject();
  // For custom filtering, such as text search in description
  inputFilterQuery = '';
  filteringValues: { [key: string]: string } = {};

  currentProject: Project;
  resultsLength: number;

  constructor(private projectStore: ProjectStore,
              private reindexerService: ReindexerService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    // check for updates after 30s every 30s
    timer(30000, 30000).pipe(takeUntil(this.destroyed$),
      switchMap(_ => this.reindexerService.getReindexers(
        this.currentProject.id,
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
      )))
      .subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          if (resp.results.length > 0) {
            resp.results.map(reindexer => {
              const indx = this.tableData.data.findIndex(x => x.id === reindexer.id);
              this.tableData.data[indx].task = reindexer.task;
            });
          }
        }
      });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.currentProject = resp;
        this.setUpPaginator();
      } else {
        this.isLoadingResults = false;
      }
    });
  }

  setUpPaginator() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.pipe(takeUntil(this.destroyed$)).subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.filteredSubject)
      .pipe(debounceTime(250), startWith({}), switchMap(() => {
        this.isLoadingResults = true;
        const sortDirection = this.sort.direction === 'desc' ? '-' : '';

        return this.reindexerService.getReindexers(
          this.currentProject.id,
          // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
          `${this.inputFilterQuery}&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
        );
      })).subscribe(data => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      if (data && !(data instanceof HttpErrorResponse)) {
        this.resultsLength = data.count;
        this.tableData.data = data.results;
      } else if (data) {
        this.logService.snackBarError(data, 2000);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateReindexerDialogComponent, {
      maxHeight: '650px',
      width: '700px',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
        this.logService.snackBarMessage(`Created re-indexer: ${resp.description}`, 2000);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selectedRows.selected.length;
    const numRows = this.tableData.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selectedRows.clear() :
      this.tableData.data.forEach(row => this.selectedRows.select(row));
  }


  onDelete(reindexer: Reindexer, index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this Reindexer?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reindexerService.deleteReindex(reindexer.id, this.currentProject.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted re-indexer ${reindexer.description}`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
      }
    });
  }

  onDeleteAllSelected() {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} re-indexers?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected elements
          const idsToDelete = this.selectedRows.selected.map((reindexer: Reindexer) => reindexer.id);
          const body = {ids: idsToDelete};
          // Refresh elements
          this.reindexerService.bulkDeleteReindexers(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} re-indexers deleted`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selectedReindexer: Reindexer) => {
      const index: number = this.tableData.data.findIndex(reindexer => reindexer.id === selectedReindexer.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }


  openQueryDialog(query: string) {
    this.dialog.open(QueryDialogComponent, {
      data: {query},
      maxHeight: '665px',
      width: '700px',
    });
  }


  applyFilter(filterValue: EventTarget | null, field: string) {
    this.filteringValues[field] = (filterValue as HTMLInputElement).value ? (filterValue as HTMLInputElement).value : '';
    this.filterQueriesToString();
    this.filteredSubject.next();
  }

  filterQueriesToString() {
    this.inputFilterQuery = '';
    for (const field in this.filteringValues) {
      if (this.filteringValues.hasOwnProperty(field)) {
        this.inputFilterQuery += `&${field}=${this.filteringValues[field]}`;
      }
    }
  }

}
