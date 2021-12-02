import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {merge, of, Subject} from 'rxjs';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CreateRakunExtractorDialogComponent} from './create-rakun-extractor-dialog/create-rakun-extractor-dialog.component';
import {RakunExtractor} from '../../shared/types/tasks/RakunExtractor';
import {expandRowAnimation} from '../../shared/animations';
import {Project} from '../../shared/types/Project';
import {ConfirmDialogComponent} from '../../shared/shared-module/components/dialogs/confirm-dialog/confirm-dialog.component';
import {ProjectStore} from '../../core/projects/project.store';
import {RakunExtractorService} from '../../core/models/rakun-extractor/rakun-extractor.service';
import {LogService} from '../../core/util/log.service';
import {ApplyToIndexDialogComponent} from './apply-to-index-dialog/apply-to-index-dialog.component';
import {ExtractFromTextDialogComponent} from './extract-from-text-dialog/extract-from-text-dialog.component';
import {ExtractFromRandomDocDialogComponent} from './extract-from-random-doc-dialog/extract-from-random-doc-dialog.component';
import {EditStopwordsDialogComponent} from './edit-stopwords-dialog/edit-stopwords-dialog.component';
import {EditRakunExtractorDialogComponent} from "./edit-rakun-extractor-dialog/edit-rakun-extractor-dialog.component";

@Component({
  selector: 'app-rakun-extractor',
  templateUrl: './rakun-extractor.component.html',
  styleUrls: ['./rakun-extractor.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class RakunExtractorComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: RakunExtractor | null;
  public tableData: MatTableDataSource<RakunExtractor> = new MatTableDataSource();
  selectedRows = new SelectionModel<RakunExtractor>(true, []);
  public displayedColumns = ['select', 'id', 'description', 'distance_method', 'num_keywords', 'min_tokens', 'max_tokens', 'task__time_started', 'task__time_completed', 'task__status', 'actions'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength: number;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;
  private updateTable = new Subject<boolean>();

  constructor(private projectStore: ProjectStore,
              private rakunExtractorService: RakunExtractorService,
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
            return this.rakunExtractorService.getRakunExtractorTasks(
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
    const dialogRef = this.dialog.open(CreateRakunExtractorDialogComponent, {
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
      (this.tableData.data as RakunExtractor[]).forEach(row => this.selectedRows.select(row));
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

          const idsToDelete = this.selectedRows.selected.map((rakunExtractor: RakunExtractor) => rakunExtractor.id);
          const body = {ids: idsToDelete};

          this.rakunExtractorService.bulkDeleteRakunExtractorTasks(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} Tasks.`, 2000);
            this.removeSelectedRows();
          });
          this.projectStore.refreshSelectedProjectResourceCounts();
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selected: RakunExtractor) => {
      const index: number = (this.tableData.data as RakunExtractor[]).findIndex(rakunExtractor => rakunExtractor.id === selected.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  applyToIndexDialog(element: RakunExtractor): void {
    this.dialog.open(ApplyToIndexDialogComponent, {
      data: element,
      maxHeight: '90vh',
      width: '700px',
    }).afterClosed().subscribe(x => {
      if (x?.message) {
        this.updateTable.next(true);
      }
    });
  }

  tagTextDialog(element: RakunExtractor): void {
    this.dialog.open(ExtractFromTextDialogComponent, {
      data: {rakun: element, currentProjectId: this.currentProject.id},
      maxHeight: '90vh',
      width: '700px',
    });
  }

  tagRandomDocDialog(element: RakunExtractor): void {
    this.dialog.open(ExtractFromRandomDocDialogComponent, {
      data: {rakun: element, currentProjectId: this.currentProject.id},
      maxHeight: '90vh',
      width: '700px',
    });
  }

  editStopwordsDialog(element: RakunExtractor): void {
    const dialogRef = this.dialog.open(EditStopwordsDialogComponent, {
      data: {rakunId: element.id, currentProjectId: this.currentProject.id},
      maxHeight: '90vh',
      width: '700px',
    });
  }

  duplicateRakun(element: RakunExtractor): void {
    this.rakunExtractorService.duplicateRakun(this.currentProject.id, element.id, element).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(x.message, 4000);
        this.updateTable.next(true);
      } else if (x) {
        this.logService.snackBarError(x);
      }
    });
  }

  onDelete(element: RakunExtractor, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: `Are you sure you want to delete: ${element.description}?`}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rakunExtractorService.deleteRakunExtractor(this.currentProject.id, element.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted: ${element.description}`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
          this.projectStore.refreshSelectedProjectResourceCounts();
        });
      }
    });
  }

  editRakun(element: RakunExtractor): void {
    this.dialog.open(EditRakunExtractorDialogComponent, {
      data: {element, currentProjectId: this.currentProject.id},
      maxHeight: '90vh',
      width: '700px',
    }).afterClosed().subscribe(resp => {
      if (resp) {
        this.updateTable.next();
      }
    });
  }
}
