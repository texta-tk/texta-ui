import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {ProjectStore} from '../../core/projects/project.store';
import {Project} from '../../shared/types/Project';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {merge, Subject, timer} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../core/util/log.service';
import {DatasetImporter} from '../../shared/types/tools/Elastic';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {CreateDatasetDialogComponent} from './create-dataset-dialog/create-dataset-dialog.component';
import {DatasetImporterService} from '../../core/tools/dataset-importer/dataset-importer.service';
import {expandRowAnimation} from '../../shared/animations';

@Component({
  selector: 'app-dataset-importer',
  templateUrl: './dataset-importer.component.html',
  styleUrls: ['./dataset-importer.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class DatasetImporterComponent implements OnInit, OnDestroy {
  expandedElement: DatasetImporter | null;
  public tableData: MatTableDataSource<DatasetImporter> = new MatTableDataSource();
  public displayedColumns = ['select', 'id', 'author__username', 'description', 'index', 'num_documents',
    'num_documents_sucess', 'task__time_started', 'task__time_completed', 'task__status', 'Modify'];
  selectedRows = new SelectionModel<DatasetImporter>(true, []);
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
              private importerService: DatasetImporterService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    // check for updates after 30s every 30s
    timer(30000, 30000).pipe(takeUntil(this.destroyed$),
      switchMap(_ => this.importerService.getDatasetImports(
        this.currentProject.id,
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
      )))
      .subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          if (resp.results.length > 0) {
            resp.results.map(dataset => {
              const indx = this.tableData.data.findIndex(x => x.id === dataset.id);
              this.tableData.data[indx].task = dataset.task;
            });
          }
        }
      });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(
      (resp: Project | null) => {
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
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.filteredSubject)
      .pipe(debounceTime(250), startWith({}), switchMap(() => {
        this.isLoadingResults = true;
        const sortDirection = this.sort.direction === 'desc' ? '-' : '';

        return this.importerService.getDatasetImports(
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
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateDatasetDialogComponent, {
      maxHeight: '650px',
      width: '700px',
    });
    dialogRef.afterClosed().subscribe((resp: DatasetImporter | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
        this.logService.snackBarMessage(`Created importer ${resp.description}`, 2000);
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


  onDelete(dataset: DatasetImporter, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this Dataset?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.importerService.deleteIndex(dataset.id, this.currentProject.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted dataset ${dataset.description}`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
      }
    });
  }

  onDeleteAllSelected(): void {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Datasets?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected elements
          const idsToDelete = this.selectedRows.selected.map((dataset: DatasetImporter) => dataset.id);
          const body = {ids: idsToDelete};
          // Refresh elements
          this.importerService.bulkDeleteIndices(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} Datasets deleted`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selectedDataset: DatasetImporter) => {
      const index: number = this.tableData.data.findIndex(x => x.id === selectedDataset.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }


  applyFilter(filterValue: EventTarget | null, field: string): void {
    this.filteringValues[field] = (filterValue as HTMLInputElement).value ? (filterValue as HTMLInputElement).value : '';
    this.filterQueriesToString();
    this.filteredSubject.next();
  }

  filterQueriesToString(): void {
    this.inputFilterQuery = '';
    for (const field in this.filteringValues) {
      this.inputFilterQuery += `&${field}=${this.filteringValues[field]}`;
    }
  }
}
