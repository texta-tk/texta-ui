import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EmbeddingsService} from '../../../core/models/embeddings/embeddings.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Embedding} from '../../../shared/types/tasks/Embedding';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {merge, of, Subject, timer} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {CreateEmbeddingDialogComponent} from './create-embedding-dialog/create-embedding-dialog.component';
import {LogService} from '../../../core/util/log.service';
import {PhraseDialogComponent} from './phrase-dialog/phrase-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {QueryDialogComponent} from 'src/app/shared/components/dialogs/query-dialog/query-dialog.component';
import {ConfirmDialogComponent} from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {expandRowAnimation} from '../../../shared/animations';
import {EditEmbeddingDialogComponent} from './edit-embedding-dialog/edit-embedding-dialog.component';

@Component({
  selector: 'app-embedding',
  templateUrl: './embedding.component.html',
  styleUrls: ['./embedding.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class EmbeddingComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: Embedding | null;
  public tableData: MatTableDataSource<Embedding> = new MatTableDataSource();
  public displayedColumns = ['select', 'author__username', 'description',
    'fields', 'task__time_started', 'task__time_completed', 'num_dims', 'min_freq', 'vocab_size', 'task__status', 'Modify'];
  selectedRows = new SelectionModel<Embedding>(true, []);
  public isLoadingResults = true;

  destroyed$: Subject<boolean> = new Subject<boolean>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filteredSubject = new Subject();
  // For custom filtering, such as text search in description
  inputFilterQuery = '';
  filteringValues: { [key: string]: string } = {};


  currentProject: Project;
  resultsLength: number;

  constructor(private projectStore: ProjectStore,
              private embeddingsService: EmbeddingsService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit(): void {
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
              if (indx >= 0) {
                this.tableData.data[indx].task = embedding.task;
              }
            });
          }
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

  ngAfterViewInit(): void {
    this.setUpPaginator();
  }

  setUpPaginator(): void {
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
            return this.embeddingsService.getEmbeddings(
              proj.id,
              // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
              `${this.inputFilterQuery}&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
            );
          } else {
            return of(null);
          }
        })
      ).subscribe(data => {
      // Flip flag to show that loading has finished.
      if (data instanceof HttpErrorResponse) {
        this.logService.snackBarError(data, 2000);
      } else if (data) {
        this.resultsLength = data.count;
        this.tableData.data = data.results;
      }
      this.isLoadingResults = false;
    });
  }

  phrase(embedding: Embedding): void {
    const dialogRef = this.dialog.open(PhraseDialogComponent, {
      data: {embeddingId: embedding.id, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateEmbeddingDialogComponent, {
      maxHeight: '600px',
      width: '700px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((resp: Embedding | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
        this.logService.snackBarMessage(`Created embedding ${resp.description}`, 2000);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  edit(embedding: Embedding): void {
    this.dialog.open(EditEmbeddingDialogComponent, {
      width: '750px',
      data: embedding
    }).afterClosed().subscribe((x: Embedding | HttpErrorResponse) => {
      if (x && !(x instanceof HttpErrorResponse)) {
        embedding.description = x.description;
      } else {
        this.logService.snackBarError(x, 3000);
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


  onDelete(embedding: Embedding, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this Embedding?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.embeddingsService.deleteEmbedding(this.currentProject.id, embedding.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted embedding ${embedding.description}`, 2000);
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
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Embeddings?`
        }
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

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selectedTagger: Embedding) => {
      const index: number = this.tableData.data.findIndex(tagger => tagger.id === selectedTagger.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }


  openQueryDialog(query: string): void {
    const dialogRef = this.dialog.open(QueryDialogComponent, {
      data: {query},
      maxHeight: '665px',
      width: '700px',
    });
  }

  applyFilter(filterValue: EventTarget | null, field: string): void {
    this.filteringValues[field] = (filterValue as HTMLInputElement).value ? (filterValue as HTMLInputElement).value : '';
    this.paginator.pageIndex = 0;
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
