import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {merge, of, Subject} from 'rxjs';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CreateCRFExtractorDialogComponent} from './create-crf-extractor-dialog/create-crf-extractor-dialog.component';
import {expandRowAnimation} from '../../shared/animations';
import {Project} from '../../shared/types/Project';
import {CRFExtractorService} from '../../core/models/crf-extractor/crf-extractor.service';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {CRFExtractor} from '../../shared/types/tasks/CRFExtractor';
import {ProjectStore} from '../../core/projects/project.store';
import {LogService} from '../../core/util/log.service';
import {QueryDialogComponent} from '../../shared/components/dialogs/query-dialog/query-dialog.component';
import {ApplyToIndexDialogComponent} from './apply-to-index-dialog/apply-to-index-dialog.component';
import {TagTextDialogComponent} from './tag-text-dialog/tag-text-dialog.component';

@Component({
  selector: 'app-crf-extractor',
  templateUrl: './crf-extractor.component.html',
  styleUrls: ['./crf-extractor.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class CRFExtractorComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: CRFExtractor | null;
  public tableData: MatTableDataSource<CRFExtractor> = new MatTableDataSource();
  selectedRows = new SelectionModel<CRFExtractor>(true, []);
  public displayedColumns = ['select', 'author__username', 'description', 'mlp_field', 'task__time_started', 'task__time_completed', 'f1_score', 'precision', 'recall', 'task__status', 'actions'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength: number;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;
  private updateTable = new Subject<boolean>();

  constructor(private projectStore: ProjectStore,
              private cRFExtractorService: CRFExtractorService,
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
            return this.cRFExtractorService.getCRFExtractorTasks(
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

  openCreateDialog(cloneElement?: CRFExtractor): void {
    const dialogRef = this.dialog.open(CreateCRFExtractorDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
      data: {cloneElement: cloneElement ? cloneElement : undefined},
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.updateTable.next(true);
        this.projectStore.refreshSelectedProjectResourceCounts();
      }
    });
  }

  onDelete(element: CRFExtractor, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this task?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cRFExtractorService.deleteCRFExtractor(this.currentProject.id, element.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted task ${element.description}`, 2000);
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
      (this.tableData.data as CRFExtractor[]).forEach(row => this.selectedRows.select(row));
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

          const idsToDelete = this.selectedRows.selected.map((cRFExtractor: CRFExtractor) => cRFExtractor.id);
          const body = {ids: idsToDelete};

          this.cRFExtractorService.bulkDeleteCRFExtractorTasks(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} Tasks.`, 2000);
            this.removeSelectedRows();
          });
          this.projectStore.refreshSelectedProjectResourceCounts();
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selected: CRFExtractor) => {
      const index: number = (this.tableData.data as CRFExtractor[]).findIndex(cRFExtractor => cRFExtractor.id === selected.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  openQueryDialog(query: string): void {
    this.dialog.open(QueryDialogComponent, {
      data: {query},
      maxHeight: '90vh',
      width: '700px',
    });
  }

  applyToIndexDialog(element: CRFExtractor): void {
    this.dialog.open(ApplyToIndexDialogComponent, {
      data: element,
      maxHeight: '90vh',
      width: '700px',
    });
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  tagTextDialog(element: CRFExtractor): void {
    this.dialog.open(TagTextDialogComponent, {
      data: {crfExtractor: element, currentProjectId: this.currentProject.id},
      maxHeight: '90vh',
      width: '700px',
    });
  }

  retrainCRF(element: CRFExtractor): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        confirmText: 'Retrain',
        mainText: `Are you sure you want to retrain: ${element.description}`
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cRFExtractorService.retrainCRF(this.currentProject.id, element.id).subscribe(resp => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            this.logService.snackBarMessage('Successfully started retraining', 4000);
            this.updateTable.next(true);
          } else if (resp instanceof HttpErrorResponse) {
            this.logService.snackBarError(resp, 5000);
          }
        });
      }
    });
  }
}
