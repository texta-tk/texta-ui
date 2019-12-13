import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EmbeddingsService} from '../../../core/embeddings/embeddings.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Embedding} from '../../../shared/types/tasks/Embedding';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {merge, Subject, timer} from 'rxjs';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {CreateEmbeddingDialogComponent} from './create-embedding-dialog/create-embedding-dialog.component';
import {LogService} from '../../../core/util/log.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {PhraseDialogComponent} from '../phrase-dialog/phrase-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {QueryDialogComponent} from 'src/app/shared/components/dialogs/query-dialog/query-dialog.component';
import {ConfirmDialogComponent} from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-embedding',
  templateUrl: './embedding.component.html',
  styleUrls: ['./embedding.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])]
})
export class EmbeddingComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: Embedding | null;
  public tableData: MatTableDataSource<Embedding> = new MatTableDataSource();
  public displayedColumns = ['select', 'id', 'author__username', 'description',
    'fields', 'task__time_started', 'task__time_completed', 'num_dims', 'min_freq', 'vocab_size', 'task__status', 'Modify'];
  selectedRows = new SelectionModel<Embedding>(true, []);
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
              private embeddingsService: EmbeddingsService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    // check for updates after 30s every 30s
    timer(30000, 30000).pipe(takeUntil(this.destroyed$),
      switchMap(_ => this.embeddingsService.getEmbeddings(
        this.currentProject.id,
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
      )))
      .subscribe((resp: { count: number, results: Embedding[] } | HttpErrorResponse) => {
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
        return this.embeddingsService.getEmbeddings(
          this.currentProject.id,
          // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
          `${this.inputFilterQuery}&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
        );
      })).subscribe((data: { count: number, results: Embedding[] }) => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      this.resultsLength = data.count;
      this.tableData.data = data.results;
    });
  }

  phrase(embedding: Embedding) {
    const dialogRef = this.dialog.open(PhraseDialogComponent, {
      data: {embeddingId: embedding.id, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }


  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateEmbeddingDialogComponent, {
      height: '490px',
      width: '700px',
    });
    dialogRef.afterClosed().subscribe((resp: Embedding | HttpErrorResponse) => {
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


  onDelete(embedding: Embedding, index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this Embedding?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.embeddingsService.deleteEmbedding(this.currentProject.id, embedding.id).subscribe(() => {
          this.logService.snackBarMessage(`Embedding ${embedding.id}: ${embedding.description} deleted`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
      }
    });
  }

  onDeleteAllSelected() {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {confirmText: 'Delete', mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Embeddings?`}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected taggers
          const idsToDelete = this.selectedRows.selected.map((tagger: Embedding) => tagger.id);
          const body = {ids: idsToDelete};
          // Refresh taggers
          this.embeddingsService.bulkDeleteEmbeddings(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} Embeddings deleted`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selectedTagger: Embedding) => {
      const index: number = this.tableData.data.findIndex(tagger => tagger.id === selectedTagger.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }


  openQueryDialog(query: string) {
    const dialogRef = this.dialog.open(QueryDialogComponent, {
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
      this.inputFilterQuery += `&${field}=${this.filteringValues[field]}`
    }
  }
}
