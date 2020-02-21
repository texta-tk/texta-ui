import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Subject, Subscription, timer} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {LogService} from '../../../core/util/log.service';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {Tagger, TaggerVectorizerChoices} from '../../../shared/types/tasks/Tagger';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {CreateTaggerDialogComponent} from './create-tagger-dialog/create-tagger-dialog.component';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Project} from '../../../shared/types/Project';
import {EditStopwordsDialogComponent} from './edit-stopwords-dialog/edit-stopwords-dialog.component';
import {TagTextDialogComponent} from './tag-text-dialog/tag-text-dialog.component';
import {TagDocDialogComponent} from './tag-doc-dialog/tag-doc-dialog.component';
import {TagRandomDocDialogComponent} from './tag-random-doc-dialog/tag-random-doc-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {QueryDialogComponent} from 'src/app/shared/components/dialogs/query-dialog/query-dialog.component';
import {ConfirmDialogComponent} from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {ListFeaturesDialogComponent} from '../list-features-dialog/list-features-dialog.component';

@Component({
  selector: 'app-tagger',
  templateUrl: './tagger.component.html',
  styleUrls: ['./tagger.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])]
})
export class TaggerComponent implements OnInit, OnDestroy, AfterViewInit {

  expandedElement: Tagger | null;
  public tableData: MatTableDataSource<Tagger> = new MatTableDataSource();
  selectedRows = new SelectionModel<Tagger>(true, []);
  public displayedColumns = ['select', 'author__username', 'description', 'fields', 'task__time_started',
    'task__time_completed', 'f1_score', 'precision', 'recall', 'task__status', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  filteredSubject = new Subject();
  // For custom filtering, such as text search in description
  inputFilterQuery = '';
  filteringValues = {};

  currentProject: Project;
  resultsLength: number;
  destroyed$ = new Subject<boolean>();

  constructor(private projectStore: ProjectStore,
              private taggerService: TaggerService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    // Check for updates after 30s every 30s
    timer(30000, 30000).pipe(takeUntil(this.destroyed$), switchMap(_ =>
      this.taggerService.getTaggers(this.currentProject.id,
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`)))
      .subscribe((resp: { count: number, results: Tagger[] } | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.refreshTaggers(resp.results);
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
          this.isLoadingResults = false;
        }
      });
  }

  ngAfterViewInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.currentProject = resp;
        this.setUpPaginator();
      } else {
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
        // DRF backend asks for '-' or '' to declare ordering direction

        const sortDirection = this.sort.direction === 'desc' ? '-' : '';
        return this.taggerService.getTaggers(
          this.currentProject.id,
          // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
          `${this.inputFilterQuery}&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
        );
      })).subscribe((data: { count: number, results: Tagger[] }) => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      this.resultsLength = data.count;
      this.tableData.data = data.results;
    });
  }


  refreshTaggers(resp: Tagger[] | HttpErrorResponse) {
    if (resp && !(resp instanceof HttpErrorResponse)) {
      if (resp.length > 0) {
        resp.map(tagger => {
          const indx = this.tableData.data.findIndex(x => x.id === tagger.id);
          this.tableData.data[indx].task = tagger.task;
        });
      }
    }
  }

  retrainTagger(value) {
    if (this.currentProject) {
      return this.taggerService.retrainTagger(this.currentProject.id, value.id)
        .subscribe((resp: any | HttpErrorResponse) => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            this.logService.snackBarMessage('Successfully started retraining tagger', 4000);
          } else if (resp instanceof HttpErrorResponse) {
            this.logService.snackBarError(resp, 5000);
          }
        });
    } else {
      return null;
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateTaggerDialogComponent, {
      maxHeight: '700px',
      width: '700px',
    });
    dialogRef.afterClosed().subscribe((resp: Tagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
        this.logService.snackBarMessage(`Created tagger ${resp.description}`, 2000);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  editStopwordsDialog(tagger: Tagger) {
    const dialogRef = this.dialog.open(EditStopwordsDialogComponent, {
      data: {taggerId: tagger.id, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }

  tagTextDialog(tagger: Tagger) {
    const dialogRef = this.dialog.open(TagTextDialogComponent, {
      data: {taggerId: tagger.id, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }

  tagDocDialog(tagger: Tagger) {
    const dialogRef = this.dialog.open(TagDocDialogComponent, {
      data: {tagger, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }


  tagRandomDocDialog(tagger: Tagger) {
    const dialogRef = this.dialog.open(TagRandomDocDialogComponent, {
      data: {tagger, currentProjectId: this.currentProject.id},
      minHeight: '300px',
      maxHeight: '665px',
      width: '1200px',
    });
  }

  onDelete(tagger: Tagger, index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this Tagger?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taggerService.deleteTagger(this.currentProject.id, tagger.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted tagger ${tagger.description}`, 2000);
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
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Taggers?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected taggers
          const idsToDelete = this.selectedRows.selected.map((tagger: Tagger) => tagger.id);
          const body = {ids: idsToDelete};
          // Refresh taggers
          this.taggerService.bulkDeleteTaggers(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} Taggers deleted`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selectedTagger: Tagger) => {
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

  listFeatures(tagger: Tagger) {
    if (tagger.vectorizer === TaggerVectorizerChoices.HASHING) {
      this.logService.snackBarMessage('Hashing Vectorizer is not supported for listing features', 4500);
    } else {
      this.dialog.open(ListFeaturesDialogComponent, {
        data: {taggerId: tagger.id, currentProjectId: this.currentProject.id},
        maxHeight: '665px',
        width: '700px',
      });
    }
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
      this.inputFilterQuery += `&${field}=${this.filteringValues[field]}`;
    }
  }
}
