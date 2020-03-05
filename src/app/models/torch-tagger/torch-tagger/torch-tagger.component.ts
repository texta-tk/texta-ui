import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription, Subject, timer, merge, of} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {Project} from 'src/app/shared/types/Project';
import {ProjectStore} from 'src/app/core/projects/project.store';
import {LogService} from 'src/app/core/util/log.service';
import {switchMap, debounceTime, startWith, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {ConfirmDialogComponent} from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {QueryDialogComponent} from 'src/app/shared/components/dialogs/query-dialog/query-dialog.component';
import {TorchTagger} from 'src/app/shared/types/tasks/TorchTagger';
import {CreateTorchTaggerDialogComponent} from '../create-torch-tagger-dialog/create-torch-tagger-dialog.component';
import {TorchTaggerService} from '../../../core/models/taggers/torch-tagger.service';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {TorchTagTextDialogComponent} from '../torch-tag-text-dialog/torch-tag-text-dialog.component';

@Component({
  selector: 'app-torch-tagger',
  templateUrl: './torch-tagger.component.html',
  styleUrls: ['./torch-tagger.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])]
})
export class TorchTaggerComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: TorchTagger | null;
  public tableData: MatTableDataSource<TorchTagger> = new MatTableDataSource();
  selectedRows = new SelectionModel<TorchTagger>(true, []);
  public displayedColumns = ['select', 'id', 'author__username', 'description', 'fields', 'task__time_started',
    'task__time_completed', 'f1_score', 'precision', 'recall', 'task__status', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filteredSubject = new Subject();
  // For custom filtering, such as text search in description
  inputFilterQuery = '';
  filteringValues = {};

  currentProject: Project;
  resultsLength: number;
  destroyed$ = new Subject<boolean>();


  constructor(private projectStore: ProjectStore,
              private torchtaggerService: TorchTaggerService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    // Check for updates after 30s every 30s
    timer(30000, 30000).pipe(takeUntil(this.destroyed$), switchMap(_ =>
      this.torchtaggerService.getTorchTaggers(this.currentProject.id,
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`)))
      .subscribe((resp: { count: number, results: TorchTagger[] } | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.refreshTorchTaggers(resp.results);
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
          this.isLoadingResults = false;
        }
      });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.currentProject = resp;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
      } else {
        this.isLoadingResults = false;
      }
    });
  }

  ngAfterViewInit() {
    this.setUpPaginator();
  }

  setUpPaginator() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.filteredSubject)
      .pipe(debounceTime(250), startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$));
        }))
      .pipe(
        switchMap(proj => {
          if (proj) {
            const sortDirection = this.sort.direction === 'desc' ? '-' : '';
            return this.torchtaggerService.getTorchTaggers(
              this.currentProject.id,
              // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
              `${this.inputFilterQuery}&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`);
          } else {
            return of(null);
          }
        })).subscribe((data: { count: number, results: TorchTagger[] }) => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      if (data) {
        this.resultsLength = data.count;
        this.tableData.data = data.results;
      }
    });
  }


  refreshTorchTaggers(resp: TorchTagger[] | HttpErrorResponse) {
    if (resp && !(resp instanceof HttpErrorResponse)) {
      if (resp.length > 0) {
        resp.map(torchtagger => {
          const indx = this.tableData.data.findIndex(x => x.id === torchtagger.id);
          if (indx >= 0) {
            this.tableData.data[indx].task = torchtagger.task;
          }
        });
      }
    }
  }


  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateTorchTaggerDialogComponent, {
      maxHeight: '795px',
      width: '700px',
    });
    dialogRef.afterClosed().subscribe((resp: TorchTagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
        this.logService.snackBarMessage(`Created TorchTagger ${resp.description}`, 2000);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }


  onDelete(torchtagger: TorchTagger, index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this TorchTagger?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.torchtaggerService.deleteTorchTagger(this.currentProject.id, torchtagger.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted TorchTagger ${torchtagger.description}`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
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


  onDeleteAllSelected() {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} TorchTaggers?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected torchtaggers
          const idsToDelede = this.selectedRows.selected.map((torchtagger: TorchTagger) => torchtagger.id);
          const body = {ids: idsToDelede};
          // Refresh torchtaggers
          this.torchtaggerService.bulkDeleteTorchTaggers(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} TorchTaggers deleted`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selectedTorchTagger: TorchTagger) => {
      const index: number = this.tableData.data.findIndex(torchtagger => torchtagger.id === selectedTorchTagger.id);
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


  applyFilter(filterValue: string, field: string) {
    this.filteringValues[field] = filterValue;
    this.filterQueriesToString();
    this.filteredSubject.next();
  }

  filterQueriesToString() {
    this.inputFilterQuery = '';
    for (const field in this.filteringValues) {
      this.inputFilterQuery += `&${field}=${this.filteringValues[field]}`;
    }
  }


  tagTextDialog(tagger: TorchTagger) {
    this.dialog.open(TorchTagTextDialogComponent, {
      data: {torchTorchTaggerId: tagger.id, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }
}
