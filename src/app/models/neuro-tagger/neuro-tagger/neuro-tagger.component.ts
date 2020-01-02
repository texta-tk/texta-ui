import {Component, OnInit, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Project} from '../../../shared/types/Project';
import {NeuroTagger} from '../../../shared/types/tasks/NeuroTagger';
import {switchMap, takeUntil, startWith, debounceTime} from 'rxjs/operators';
import {Subject, timer, Subscription, merge} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {NeuroTaggerService} from '../../../core/neuro-tagger/neuro-tagger.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {LogService} from '../../../core/util/log.service';
import {CreateNeuroTaggerDialogComponent} from '../create-neuro-tagger-dialog/create-neuro-tagger-dialog.component';
import {NeurotagTextDialogComponent} from '../neurotag-text-dialog/neurotag-text-dialog.component';
import {NeurotagDocDialogComponent} from '../neurotag-doc-dialog/neurotag-doc-dialog.component';
import {NeurotagRandomDocDialogComponent} from '../neurotag-random-doc-dialog/neurotag-random-doc-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {GenericDialogComponent} from 'src/app/shared/components/dialogs/generic-dialog/generic-dialog.component';
import {ConfirmDialogComponent} from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-neuro-tagger',
  templateUrl: './neuro-tagger.component.html',
  styleUrls: ['./neuro-tagger.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])]
})
export class NeuroTaggerComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: NeuroTagger | null;
  public tableData: MatTableDataSource<NeuroTagger> = new MatTableDataSource();
  public displayedColumns = ['select', 'author__username', 'description', 'fields',
    'task__time_started', 'task__time_completed', 'training_accuracy', 'training_loss', 'validation_accuracy',
    'validation_loss', 'task__status', 'Modify'];
  selectedRows = new SelectionModel<NeuroTagger>(true, []);
  public isLoadingResults = true;

  destroyed$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  filteredSubject = new Subject();
  // For custom filtering, such as text search in description
  inputFilterQuery = '';
  filteringValues = {}

  currentProject: Project;
  updateTaggersSubscription: Subscription;
  resultsLength: number;

  constructor(private projectStore: ProjectStore,
              public dialog: MatDialog,
              private neuroTaggerService: NeuroTaggerService,
              private logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    // check for updates after 30s every 30s
    timer(30000, 30000).pipe(takeUntil(this.destroyed$), switchMap(_ =>
      this.neuroTaggerService.getNeuroTaggers(this.currentProject.id,
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`)))
      .subscribe((resp: { count: number, results: NeuroTagger[] } | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          if (resp.results.length > 0) {
            resp.results.map(tagger => {
              const indx = this.tableData.data.findIndex(x => x.id === tagger.id);
              this.tableData.data[indx].task = tagger.task;
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
        return this.neuroTaggerService.getNeuroTaggers(
          this.currentProject.id,
          // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
          `${this.inputFilterQuery}&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
        );
      })).subscribe((data: { count: number, results: NeuroTagger[] } | HttpErrorResponse) => {
      if (data && !(data instanceof HttpErrorResponse)) {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        this.resultsLength = data.count;
        this.tableData.data = data.results;
      } else if (data instanceof HttpErrorResponse) {
        this.logService.snackBarError(data, 4000);
      }
    });
  }


  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateNeuroTaggerDialogComponent, {
      maxHeight: '765px',
      width: '700px',
    });
    dialogRef.afterClosed().subscribe((resp: NeuroTagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }


  tagTextDialog(tagger: NeuroTagger) {
    const dialogRef = this.dialog.open(NeurotagTextDialogComponent, {
      data: {taggerId: tagger.id, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }

  tagDocDialog(tagger: NeuroTagger) {
    const dialogRef = this.dialog.open(NeurotagDocDialogComponent, {
      data: {tagger, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }


  tagRandomDocDialog(tagger: NeuroTagger) {
    const dialogRef = this.dialog.open(NeurotagRandomDocDialogComponent, {
      data: {neurotagger: tagger, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      maxWidth: '1200px',
    });
  }

  onDelete(neurotagger: NeuroTagger, index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this NeuroTagger?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.neuroTaggerService.deleteNeuroTagger(this.currentProject.id, neurotagger.id).subscribe((resp: any | HttpErrorResponse) => {
          if (resp instanceof HttpErrorResponse) {
            this.logService.snackBarError(resp, 4000);
          }
        }, undefined, () => {
          this.logService.snackBarMessage(`NeuroTagger ${neurotagger.id}: ${neurotagger.description} deleted`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
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
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} NeuroTaggers?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected taggers
          const idsToDelete = this.selectedRows.selected.map((tagger: NeuroTagger) => tagger.id);
          const body = {ids: idsToDelete};
          // Refresh taggers
          this.neuroTaggerService.bulkDeleteNeuroTaggers(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} NeuroTaggers deleted`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selectedTagger: NeuroTagger) => {
      const index: number = this.tableData.data.findIndex(tagger => tagger.id === selectedTagger.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  openGenericDialog(data: string) {
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      data: {data},
      maxHeight: '665px',
      width: '700px',
    });
  }

  applyFilter(filterValue: string, field: string) {
    this.filteringValues[field] = filterValue;
    this.paginator.pageIndex = 0;
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
