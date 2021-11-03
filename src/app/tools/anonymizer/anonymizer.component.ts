import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {merge, of, Subject} from 'rxjs';
import {Project} from '../../shared/types/Project';
import {ProjectStore} from '../../core/projects/project.store';
import {MatDialog} from '@angular/material/dialog';
import {LogService} from '../../core/util/log.service';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {AnonymizerService} from './anonymizer.service';
import {Index} from '../../shared/types/Index';
import {Anonymizer} from './types/Anonymizer';
import {CreateAnonymizerDialogComponent} from './create-anonymizer-dialog/create-anonymizer-dialog.component';
import {AnonymizeTextDialogComponent} from './anonymize-text-dialog/anonymize-text-dialog.component';
import {EditAnonymizerDialogComponent} from './edit-anonymizer-dialog/edit-anonymizer-dialog.component';

@Component({
  selector: 'app-anonymizer',
  templateUrl: './anonymizer.component.html',
  styleUrls: ['./anonymizer.component.scss']
})
export class AnonymizerComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: Anonymizer | null;
  public tableData: MatTableDataSource<Anonymizer> = new MatTableDataSource();
  selectedRows = new SelectionModel<Anonymizer>(true, []);
  //  'mimic_casing',
  public displayedColumns = ['select', 'id', 'description', 'misspelling_threshold',
    'replace_misspelled_names', 'replace_single_last_names', 'replace_single_first_names', 'auto_adjust_threshold', 'actions'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength: number;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;
  patchRowQueue: Subject<Anonymizer> = new Subject();
  private updateTable = new Subject<boolean>();

  constructor(private projectStore: ProjectStore,
              private anonymizerService: AnonymizerService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  setRowValueByProperty = <U extends keyof T, T extends object>(key: U, obj: T, row: T) => row[key] = obj[key];

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

    this.patchRowQueue.pipe(takeUntil(this.destroyed$), debounceTime(50)).subscribe(row => {
      if (this.currentProject) {
        this.anonymizerService.patchAnonymizer(this.currentProject.id, row.id, row).subscribe();
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
            return this.anonymizerService.getAnonymizers(
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

  openAnonymizeTextDialog(element: Anonymizer): void {
    this.dialog.open(AnonymizeTextDialogComponent, {
      maxHeight: '650px',
      width: '50vw',
      data: element
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateAnonymizerDialogComponent, {
      maxHeight: '650px',
      width: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        this.updateTable.next(true);
        this.projectStore.refreshSelectedProjectResourceCounts();
      }
    });
  }

  openEditDialog(element: Anonymizer): void {
    const dialogRef = this.dialog.open(EditAnonymizerDialogComponent, {
      maxHeight: '90vh',
      width: '800px',
      disableClose: true,
      data: element,
    });
    dialogRef.afterClosed().subscribe((resp: Anonymizer) => {
      if (resp) {
        for (const property in resp) {
          if (resp.hasOwnProperty(property)) {
            this.setRowValueByProperty<keyof Anonymizer, Anonymizer>((property as keyof Anonymizer), resp, element);
          }
        }
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
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} anonymizers?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          const idsToDelete = this.selectedRows.selected.map((anonymizer: Anonymizer) => anonymizer.id);
          const body = {ids: idsToDelete};

          this.anonymizerService.bulkDeleteAnonymizers(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} anonymizers.`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selectedAnonymizer: Anonymizer) => {
      const index: number = this.tableData.data.findIndex(anonymizer => anonymizer.id === selectedAnonymizer.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  updateAnonymizerRow(row: Anonymizer): void {
    this.patchRowQueue.next(row);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
