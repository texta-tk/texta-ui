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
import {ConfirmDialogComponent} from 'src/app/shared/shared-module/components/dialogs/confirm-dialog/confirm-dialog.component';
import {QueryDialogComponent} from 'src/app/shared/shared-module/components/dialogs/query-dialog/query-dialog.component';
import {ReindexerService} from '../../core/tools/reindexer/reindexer.service';
import {CreateReindexerDialogComponent} from './create-reindexer-dialog/create-reindexer-dialog.component';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatSelectChange} from '@angular/material/select';
import {ConfirmBulkDeleteDialogComponent} from '../../shared/shared-module/components/dialogs/confirm-bulk-delete-dialog/confirm-bulk-delete-dialog.component';

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

  private updateTable = new Subject<boolean>();

  constructor(private projectStore: ProjectStore,
              private reindexerService: ReindexerService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.currentProject = resp;
        this.setUpPaginator();
      } else {
        this.isLoadingResults = false;
      }
    });
  }

  setUpPaginator(): void {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.pipe(takeUntil(this.destroyed$)).subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.filteredSubject, this.updateTable)
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

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openCreateDialog(element?: Reindexer): void {
    const dialogRef = this.dialog.open(CreateReindexerDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
      disableClose: true,
      data: {cloneElement: element ? element : undefined},
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.updateTable.next(true);
        this.projectStore.refreshSelectedProjectResourceCounts();
        this.logService.snackBarMessage(`Created re-indexer: ${resp.description}`, 2000);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
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
      this.tableData.data.forEach(row => this.selectedRows.select(row));
  }


  onDelete(reindexer: Reindexer, index: number): void {
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

  onDeleteAllSelected(): void {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmBulkDeleteDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Delete the following Reindexer tasks`,
          items: this.selectedRows.selected.map(x => x.description)
        },
        maxHeight: '90vh'
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

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selectedReindexer: Reindexer) => {
      const index: number = this.tableData.data.findIndex(reindexer => reindexer.id === selectedReindexer.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }


  openQueryDialog(query: string): void {
    this.dialog.open(QueryDialogComponent, {
      data: {query},
      maxHeight: '665px',
      width: '700px',
    });
  }


  applyFilter(filterValue: MatSelectChange | EventTarget | null, field: string): void {
    this.filteringValues[field] = (filterValue as HTMLInputElement).value ? (filterValue as HTMLInputElement).value : '';
    this.filterQueriesToString();
    this.filteredSubject.next();
  }

  filterQueriesToString(): void {
    this.inputFilterQuery = '';
    for (const field in this.filteringValues) {
      if (this.filteringValues.hasOwnProperty(field)) {
        this.inputFilterQuery += `&${field}=${this.filteringValues[field]}`;
      }
    }
  }

}
