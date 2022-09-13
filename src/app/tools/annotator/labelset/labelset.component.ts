import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Annotator} from '../../../shared/types/tasks/Annotator';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {merge, of, Subject} from 'rxjs';
import {Project} from '../../../shared/types/Project';
import {ProjectStore} from '../../../core/projects/project.store';
import {AnnotatorService} from '../../../core/tools/annotator/annotator.service';
import {MatDialog} from '@angular/material/dialog';
import {LogService} from '../../../core/util/log.service';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {LabelSet} from '../../../shared/types/tasks/LabelSet';
import {ConfirmDialogComponent} from '../../../shared/shared-module/components/dialogs/confirm-dialog/confirm-dialog.component';
import {CreateAnnotatorDialogComponent} from '../create-annotator-dialog/create-annotator-dialog.component';
import {CreateLabelsetDialogComponent} from './create-labelset-dialog/create-labelset-dialog.component';
import {expandRowAnimation} from '../../../shared/animations';

@Component({
  selector: 'app-labelset',
  templateUrl: './labelset.component.html',
  styleUrls: ['./labelset.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class LabelsetComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: LabelSet | null;
  public tableData: MatTableDataSource<LabelSet> = new MatTableDataSource();
  selectedRows = new SelectionModel<LabelSet>(true, []);
  public displayedColumns = ['select', 'category', 'values'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength: number;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;
  private updateTable = new Subject<boolean>();

  constructor(private projectStore: ProjectStore,
              private annotatorService: AnnotatorService,
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
            return this.annotatorService.getLabelSets(
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
    const dialogRef = this.dialog.open(CreateLabelsetDialogComponent, {
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
      this.tableData.data.forEach(row => this.selectedRows.select(row));
  }


  onDeleteAllSelected(): void {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} label sets?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          const idsToDelete = this.selectedRows.selected.map((labelset) => labelset.id);
          const body = {ids: idsToDelete};
          this.isLoadingResults = true;

          this.annotatorService.bulkDeleteLabelSets(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} label sets.`, 2000);
            this.selectedRows.clear();
            this.updateTable.next(true);
            this.projectStore.refreshSelectedProjectResourceCounts();
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
