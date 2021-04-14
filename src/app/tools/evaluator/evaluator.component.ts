import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {merge, of, Subject} from 'rxjs';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CreateEvaluatorDialogComponent} from './create-evaluator-dialog/create-evaluator-dialog.component';
import {expandRowAnimation} from '../../shared/animations';
import {Evaluator} from '../../shared/types/tasks/Evaluator';
import {Project} from '../../shared/types/Project';
import {ProjectStore} from '../../core/projects/project.store';
import {EvaluatorService} from '../../core/tools/evaluator/evaluator.service';
import {LogService} from '../../core/util/log.service';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {QueryDialogComponent} from '../../shared/components/dialogs/query-dialog/query-dialog.component';
import {Index} from '../../shared/types/Index';
import {IndividualResultsDialogComponent} from './individual-results-dialog/individual-results-dialog.component';
import {FilteredAverageDialogComponent} from './filtered-average-dialog/filtered-average-dialog.component';
import {EditEvaluatorDialogComponent} from './edit-evaluator-dialog/edit-evaluator-dialog.component';
import {Embedding} from "../../shared/types/tasks/Embedding";

@Component({
  selector: 'app-evaluator',
  templateUrl: './evaluator.component.html',
  styleUrls: ['./evaluator.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class EvaluatorComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElements: boolean[] = [];
  public tableData: MatTableDataSource<Evaluator> = new MatTableDataSource();
  selectedRows = new SelectionModel<Evaluator>(true, []);
  public displayedColumns = ['select', 'author__username', 'description', 'eval_type', 'avg_func', 'task__time_started',
    'task__time_completed', 'f1_score', 'precision', 'recall', 'task__status', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength: number;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;

  constructor(private projectStore: ProjectStore,
              private evaluatorService: EvaluatorService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  getIndicesName = (x: Index) => x.name;

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
            return this.evaluatorService.getEvaluatorTasks(
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
    const dialogRef = this.dialog.open(CreateEvaluatorDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
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

  onDelete(evaluator: Evaluator, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this Task?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.evaluatorService.deleteEvaluator(this.currentProject.id, evaluator.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted evaluator ${evaluator.description}`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
          this.projectStore.refreshSelectedProjectResourceCounts();
        });
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
      (this.tableData.data as Evaluator[]).forEach(row => this.selectedRows.select(row));
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
          const idsToDelete = this.selectedRows.selected.map((evaluator: Evaluator) => evaluator.id);
          const body = {ids: idsToDelete};
          this.evaluatorService.bulkDeleteEvaluatorTasks(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} Tasks.`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selected: Evaluator) => {
      const index: number = (this.tableData.data as Evaluator[]).findIndex(evaluator => evaluator.id === selected.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openIndividualResults(element: Evaluator): void {
    this.dialog.open(IndividualResultsDialogComponent, {
      data: {currentProjectId: this.currentProject.id, evaluatorId: element.id},
      maxHeight: '90vh',
      width: '700px',
    });
  }

  openFilteredAverage(element: Evaluator): void {
    this.dialog.open(FilteredAverageDialogComponent, {
      data: {currentProjectId: this.currentProject.id, evaluatorId: element.id},
      maxHeight: '90vh',
      maxWidth: '700px',
    });
  }

  onEdit(element: Evaluator): void {
    this.dialog.open(EditEvaluatorDialogComponent, {
      data: element,
      maxHeight: '90vh',
      width: '500px',
    }).afterClosed().subscribe((x: Evaluator | HttpErrorResponse) => {
      if (x && !(x instanceof HttpErrorResponse)) {
        element.description = x.description;
      } else if (x) {
        this.logService.snackBarError(x, 3000);
      }
    });
  }
}
