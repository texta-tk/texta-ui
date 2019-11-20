import { Component, OnInit, ViewChild } from '@angular/core';
import { Reindexer } from 'src/app/shared/types/tools/Elastic';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, timer, merge } from 'rxjs';
import { Project } from 'src/app/shared/types/Project';
import { ProjectStore } from 'src/app/core/projects/project.store';
import { LogService } from 'src/app/core/util/log.service';
import { takeUntil, switchMap, startWith, debounceTime } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogComponent } from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { QueryDialogComponent } from 'src/app/shared/components/dialogs/query-dialog/query-dialog.component';
import { ReindexerService } from './reindexer.service';
import { CreateReindexerDialogComponent } from './create-reindexer-dialog/create-reindexer-dialog.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-reindexer',
  templateUrl: './reindexer.component.html',
  styleUrls: ['./reindexer.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])]
})
export class ReindexerComponent implements OnInit {
  expandedElement: Reindexer | null;
  public tableData: MatTableDataSource<Reindexer> = new MatTableDataSource();
  public displayedColumns = ['select', 'id', 'author__username', 'description', 'new_index', 'fields', 'random_size',
   'show_query', 'task__time_started', 'task__time_completed',  'task__status', 'Modify'];
  selectedRows = new SelectionModel<Reindexer>(true, []);
  public isLoadingResults = true;

  destroyed$: Subject<boolean> = new Subject<boolean>();

    @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  filteredSubject = new Subject();
  // For custom filtering, such as text search in description
  inputFilterQuery = '';
filteringValues = {}

  currentProject: Project;
  resultsLength: number;

  constructor(private projectStore: ProjectStore,
    private reindexerService: ReindexerService,
    public dialog: MatDialog,
    private logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    // check for updates after 30s every 30s
    timer(30000, 30000).pipe(takeUntil(this.destroyed$),
      switchMap(_ => this.reindexerService.getReindexers(
        this.currentProject.id,
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
      )))
      .subscribe((resp: { count: number, results: Reindexer[] } | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          if (resp.results.length > 0) {
            resp.results.map(embedding => {
              const indx = this.tableData.data.findIndex(x => x.id === embedding.id);
              this.tableData.data[indx].task = embedding.task;
            });
          }
        }
      });

  }

  ngAfterViewInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(
      (resp: HttpErrorResponse | Project) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.currentProject = resp;
          this.setUpPaginator();
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
          this.isLoadingResults = false;
        }
      });
  }

  setUpPaginator() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.filteredSubject)
    .pipe(debounceTime(250), startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      const sortDirection = this.sort.direction === 'desc' ? '-' : ''

      return this.reindexerService.getReindexers(
        this.currentProject.id,
        // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
        `${this.inputFilterQuery}&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
      );
    })).subscribe((data: { count: number, results: Reindexer[] }) => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      this.resultsLength = data.count;
      this.tableData.data = data.results;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateReindexerDialogComponent, {
      height: '620px',
      width: '700px',
    });
    dialogRef.afterClosed().subscribe((resp: Reindexer | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
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

  
  onDelete(embedding: Reindexer, index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { confirmText: 'Delete', mainText: 'Are you sure you want to delete this Reindexer?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.reindexerService.deleteReindex(this.currentProject.id, embedding.id).subscribe(() => {
          this.logService.snackBarMessage(`Reindexer ${embedding.id}: ${embedding.description} deleted`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
      }
    });
  }

  onDeleteAllSelected() {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { confirmText: 'Delete', mainText: `Are you sure you want to delete ${this.selectedRows.select.length} Reindexers?` }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected elements
          const idsToDelete = this.selectedRows.selected.map((tagger: Reindexer) => tagger.id);
          const body = { ids: idsToDelete };
          // Refresh elements
          this.reindexerService.bulkDeleteReindexers(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} Reindexers deleted`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selectedTagger: Reindexer) => {
      const index: number = this.tableData.data.findIndex(tagger => tagger.id === selectedTagger.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }


  openQueryDialog(query: string) {
    const dialogRef = this.dialog.open(QueryDialogComponent, {
      data: { query },
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
      this.inputFilterQuery += `&${field}=${this.filteringValues[field]}`
    }
  }
}
