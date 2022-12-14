import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {merge, of, Subject} from 'rxjs';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CreateAnnotatorDialogComponent} from './create-annotator-dialog/create-annotator-dialog.component';
import {expandRowAnimation} from '../../shared/animations';
import {Annotator} from '../../shared/types/tasks/Annotator';
import {Project} from '../../shared/types/Project';
import {ProjectStore} from '../../core/projects/project.store';
import {AnnotatorService} from '../../core/tools/annotator/annotator.service';
import {LogService} from '../../core/util/log.service';
import {ConfirmDialogComponent} from '../../shared/shared-module/components/dialogs/confirm-dialog/confirm-dialog.component';
import {Index} from '../../shared/types/Index';
import {EditAnnotatorDialogComponent} from './edit-annotator-dialog/edit-annotator-dialog.component';
import {QueryDialogComponent} from '../../shared/shared-module/components/dialogs/query-dialog/query-dialog.component';
import {AppConfigService} from '../../core/util/app-config.service';

@Component({
  selector: 'app-annotator',
  templateUrl: './annotator.component.html',
  styleUrls: ['./annotator.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class AnnotatorComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: { parent: Annotator, children: Annotator[] } | null;
  public tableData: MatTableDataSource<{ parent: Annotator, children: Annotator[] }> = new MatTableDataSource();
  selectedRows = new SelectionModel<{ parent: Annotator, children: Annotator[] }>(true, []);
  public displayedColumns = ['select', 'id', 'description', 'author__username', 'users_count', 'index', 'annotation_type', 'type_info', 'total', 'fields', 'query', 'created_at', 'task__status', 'actions'];
  public isLoadingResults = true;
  public annotatorUrl = AppConfigService.settings.annotatorUrl;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength: number;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;
  private updateTable = new Subject<boolean>();
  getIndicesName = (x: Index) => x.name;

  constructor(private projectStore: ProjectStore,
              private annotatorService: AnnotatorService,
              public dialog: MatDialog,
              private configService: AppConfigService,
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
            return this.annotatorService.getAnnotatorGroups(
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
    const dialogRef = this.dialog.open(CreateAnnotatorDialogComponent, {
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
      // tslint:disable-next-line:no-any
      (this.tableData.data).forEach((row: any) => {
        if (row?.parent?.task?.status !== 'running') {
          this.selectedRows.select(row);
        }
      });
  }


  onDeleteAllSelected(): void {
    if (this.selectedRows.selected.length > 0) {
      const selectedChildCount = this.selectedRows.selected.map(x => x.children.length).reduce((a, b) => a + b, 0);
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} parent tasks and ${selectedChildCount} child tasks?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          const idsToDelete = this.selectedRows.selected.map((annotator: { parent: Annotator, children: Annotator[] }) => [annotator.parent.id, ...annotator.children.map(x => x.id)]);
          const body = {ids: idsToDelete.flat()};
          this.isLoadingResults = true;

          this.annotatorService.bulkDeleteAnnotatorTasks(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length + selectedChildCount} Tasks.`, 2000);
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

  onDelete(element: Annotator): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this annotator task?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.annotatorService.deleteAnnotator(this.currentProject.id, element.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted annotator task: ${element.description}`, 2000);
          this.updateTable.next(true);
          this.projectStore.refreshSelectedProjectResourceCounts();
        });
      }
    });
  }

  edit(element: Annotator): void {
    this.dialog.open(EditAnnotatorDialogComponent, {
      width: '750px',
      data: element
    }).afterClosed().subscribe((x: Annotator | HttpErrorResponse) => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.updateTable.next(true);
      } else if (x) {
        this.logService.snackBarError(x, 3000);
      }
    });
  }

  openQueryDialog(query: string): void {
    this.dialog.open(QueryDialogComponent, {
      data: {query},
      maxHeight: '965px',
      width: '700px',
    });
  }

  openAnnotatorView(): void {
    window.open(`${this.annotatorUrl}`, '_blank');
  }

  onDeleteParent(annotator: { parent: Annotator, children: Annotator[] }): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Delete this annotator task and all of its child tasks?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.annotatorService.bulkDeleteAnnotatorTasks(this.currentProject.id, {ids: [annotator.parent.id, ...annotator.children.map(x => x.id)].flat()}).subscribe(() => {
          this.logService.snackBarMessage(`Deleted annotator task: ${annotator.parent.description}`, 2000);
          this.updateTable.next(true);
          this.projectStore.refreshSelectedProjectResourceCounts();
        });
      }
    });
  }
}
