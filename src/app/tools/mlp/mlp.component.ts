import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProjectStore} from '../../core/projects/project.store';
import {MatDialog} from '@angular/material/dialog';
import {LogService} from '../../core/util/log.service';
import {MLPService} from '../../core/tools/mlp/mlp.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MLPCreateIndexDialogComponent} from './mlp-create-index-dialog/mlp-create-index-dialog.component';
import {merge, of, Subject} from 'rxjs';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {Project} from '../../shared/types/Project';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MLP} from '../../shared/types/tasks/MLP';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {QueryDialogComponent} from '../../shared/components/dialogs/query-dialog/query-dialog.component';
import {expandRowAnimation} from '../../shared/animations';
import {MLPApplyTextDialogComponent} from './mlp-apply-text-dialog/mlp-apply-text-dialog.component';
import {Index} from '../../shared/types/Index';

@Component({
  selector: 'app-mlp',
  templateUrl: './mlp.component.html',
  styleUrls: ['./mlp.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class MLPComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: MLP | null;
  public tableData: MatTableDataSource<MLP> = new MatTableDataSource();
  selectedRows = new SelectionModel<MLP>(true, []);
  public displayedColumns = ['select', 'id', 'description', 'analyzers', 'query', 'task__time_started',
    'task__time_completed', 'task__status'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength: number;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;

  constructor(private projectStore: ProjectStore,
              private mlpService: MLPService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  public indicesAccessor = (x: Index) => x.name;

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

  ngAfterViewInit(): void {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(debounceTime(250), startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$));
        }))
      .pipe(
        switchMap(proj => {
          if (proj) {
            const sortDirection = this.sort.direction === 'desc' ? '-' : '';
            return this.mlpService.getMLPTasks(
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


  openQueryDialog(query: unknown): void {
    query = JSON.stringify(query);
    const dialogRef = this.dialog.open(QueryDialogComponent, {
      data: {query},
      maxHeight: '965px',
      width: '700px',
    });
  }

  openApplyTextDialog(): void {
    this.dialog.open(MLPApplyTextDialogComponent, {
      maxHeight: '80vh',
      width: '700px',
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MLPCreateIndexDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
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

          const idsToDelete = this.selectedRows.selected.map((mlp: MLP) => mlp.id);
          const body = {ids: idsToDelete};

          this.mlpService.bulkDeleteMLPTasks(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} Tasks.`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selectedMLP: MLP) => {
      const index: number = this.tableData.data.findIndex(mlp => mlp.id === selectedMLP.id);
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
