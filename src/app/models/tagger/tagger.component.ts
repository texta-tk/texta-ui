import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, of, Subject, timer} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {LogService} from '../../core/util/log.service';
import {TaggerService} from '../../core/models/taggers/tagger.service';
import {ProjectStore} from '../../core/projects/project.store';
import {Tagger, TaggerVectorizerChoices} from '../../shared/types/tasks/Tagger';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {CreateTaggerDialogComponent} from './create-tagger-dialog/create-tagger-dialog.component';
import {Project} from '../../shared/types/Project';
import {EditStopwordsDialogComponent} from './edit-stopwords-dialog/edit-stopwords-dialog.component';
import {TagTextDialogComponent} from './tag-text-dialog/tag-text-dialog.component';
import {TagDocDialogComponent} from './tag-doc-dialog/tag-doc-dialog.component';
import {TagRandomDocDialogComponent} from './tag-random-doc-dialog/tag-random-doc-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {QueryDialogComponent} from 'src/app/shared/shared-module/components/dialogs/query-dialog/query-dialog.component';
import {ConfirmDialogComponent} from 'src/app/shared/shared-module/components/dialogs/confirm-dialog/confirm-dialog.component';
import {ListFeaturesDialogComponent} from './list-features-dialog/list-features-dialog.component';
import {expandRowAnimation} from '../../shared/animations';
import {EditTaggerDialogComponent} from './edit-tagger-dialog/edit-tagger-dialog.component';
import {Index} from '../../shared/types/Index';
import {ApplyToIndexDialogComponent} from './apply-to-index-dialog/apply-to-index-dialog.component';
import {MatSelectChange} from '@angular/material/select';
import {MultiTagTextDialogComponent} from './multi-tag-text-dialog/multi-tag-text-dialog.component';
import {
  ConfusionMatrixDialogComponent
} from '../../shared/plotly-module/confusion-matrix-dialog/confusion-matrix-dialog.component';

@Component({
  selector: 'app-tagger',
  templateUrl: './tagger.component.html',
  styleUrls: ['./tagger.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class TaggerComponent implements OnInit, OnDestroy, AfterViewInit {

  expandedElement: Tagger | null;
  public tableData: MatTableDataSource<Tagger> = new MatTableDataSource();
  selectedRows = new SelectionModel<Tagger>(true, []);
  public displayedColumns = ['select', 'is_favorited', 'id', 'author__username', 'description', 'tg__description', 'fields', 'tasks__time_started',
    'tasks__time_completed', 'f1_score', 'precision', 'recall', 'tasks__status', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filteredSubject: Subject<void> = new Subject();
  // For custom filtering, such as text search in description
  inputFilterQuery = '';
  filteringValues: { [key: string]: string } = {};
  resultsLength: number;

  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  private updateTable: Subject<void> = new Subject();
  patchFavoriteRowQueue: Subject<Tagger> = new Subject();

  constructor(private projectStore: ProjectStore,
              private taggerService: TaggerService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

  getIndicesName = (x: Index) => x.name;
  getTaggerGroupDesc = (x: { description: string }) => x.description;

  ngOnInit(): void {
    this.patchFavoriteRowQueue.pipe(takeUntil(this.destroyed$), debounceTime(50)).subscribe(row => {
      if (this.currentProject) {
        this.taggerService.addFavoriteTagger(this.currentProject.id, row.id).subscribe();
      }
    });

    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

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

    merge(this.sort.sortChange, this.paginator.page, this.filteredSubject, this.updateTable)
      .pipe(debounceTime(250), startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$));
        }))
      .pipe(
        switchMap(proj => {
          if (proj) {
            const sortDirection = this.sort.direction === 'desc' ? '-' : '';
            return this.taggerService.getTaggers(
              this.currentProject.id,
              // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
              `${this.inputFilterQuery}&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`);
          } else {
            return of(null);
          }
        })).subscribe(data => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      if (data && !(data instanceof HttpErrorResponse)) {
        this.resultsLength = data.count;
        this.tableData.data = data.results;
      } else if (data) {
        this.logService.snackBarError(data, 2000);
      }
    });
  }

  retrainTagger(value: Tagger): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        confirmText: 'Retrain',
        mainText: `Are you sure you want to retrain: ${value.description}`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taggerService.retrainTagger(this.currentProject.id, value.id)
          .subscribe(resp => {
            if (resp && !(resp instanceof HttpErrorResponse)) {
              this.updateTable.next();
              this.logService.snackBarMessage('Successfully started retraining', 4000);
            } else if (resp instanceof HttpErrorResponse) {
              this.logService.snackBarError(resp, 5000);
            }
          });
      }
    });

  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openCreateDialog(cloneTagger?: Tagger): void {
    const dialogRef = this.dialog.open(CreateTaggerDialogComponent, {
      maxHeight: '90%',
      width: '700px',
      data: {cloneTagger: cloneTagger ? cloneTagger : undefined},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.updateTable.next();
        this.logService.snackBarMessage(`Created Tagger ${resp.description}`, 2000);
        this.projectStore.refreshSelectedProjectResourceCounts();
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  edit(tagger: Tagger): void {
    this.dialog.open(EditTaggerDialogComponent, {
      width: '700px',
      data: tagger
    }).afterClosed().subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        tagger.description = x.description;
      } else if (x && x instanceof HttpErrorResponse) {
        this.logService.snackBarError(x, 3000);
      }
    });
  }

  editStopwordsDialog(tagger: Tagger): void {
    this.dialog.open(EditStopwordsDialogComponent, {
      data: {taggerId: tagger.id, currentProjectId: this.currentProject.id, ignore_numbers: tagger.ignore_numbers},
      maxHeight: '90vh',
      width: '700px',
    });
  }

  tagTextDialog(element: Tagger): void {
    this.dialog.open(TagTextDialogComponent, {
      data: {tagger: element, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }

  tagDocDialog(tagger: Tagger): void {
    this.dialog.open(TagDocDialogComponent, {
      data: {tagger, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }


  tagRandomDocDialog(tagger: Tagger): void {
    this.dialog.open(TagRandomDocDialogComponent, {
      data: {tagger, currentProjectId: this.currentProject.id},
      maxHeight: '90vh',
      width: '700px',
      disableClose: true,
    });
  }

  onDelete(tagger: Tagger, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this Tagger?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taggerService.deleteTagger(this.currentProject.id, tagger.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted tagger ${tagger.description}`, 2000);
          this.updateTable.next();
          this.projectStore.refreshSelectedProjectResourceCounts();
        });
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

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selectedTagger: Tagger) => {
      const index: number = this.tableData.data.findIndex(tagger => tagger.id === selectedTagger.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
    this.projectStore.refreshSelectedProjectResourceCounts();
  }


  openQueryDialog(query: string): void {
    const dialogRef = this.dialog.open(QueryDialogComponent, {
      data: {query},
      maxHeight: '665px',
      width: '700px',
    });
  }

  listFeatures(tagger: Tagger): void {
    if (tagger.vectorizer === TaggerVectorizerChoices.HASHING) {
      this.logService.snackBarMessage('Hashing Vectorizer is not supported for listing features', 4500);
    } else {
      this.dialog.open(ListFeaturesDialogComponent, {
        data: {taggerId: tagger.id, currentProjectId: this.currentProject.id},
        maxHeight: '665px',
        width: '700px',
        autoFocus: false
      });
    }
  }

  applyFilter(filterValue: MatSelectChange | null | EventTarget, field: string): void {
    // @ts-ignore
    this.filteringValues[field] = filterValue?.value ? filterValue.value : '';
    this.paginator.pageIndex = 0;
    this.filterQueriesToString();
    this.filteredSubject.next();
  }

  filterQueriesToString(): void {
    this.inputFilterQuery = '';
    for (const field in this.filteringValues) {
      if (this.filteringValues.hasOwnProperty(field)) {
        this.inputFilterQuery += `&${field}=${this.filteringValues[field]}`;
      }
    }
  }

  applyToIndexDialog(tagger: Tagger): void {
    this.dialog.open(ApplyToIndexDialogComponent, {
      data: tagger,
      maxHeight: '90vh',
      width: '700px',
    });
  }

  openMultiTagDialog(): void {
    this.dialog.open(MultiTagTextDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
    });
  }

  openConfusionMatrix(element: Tagger): void {
    const parsed = JSON.parse(element.confusion_matrix);
    if (parsed && parsed.length > 0) {
      this.dialog.open(ConfusionMatrixDialogComponent, {
        height: parsed[0].length > 2 ? '90vh' : '800px',
        width: parsed[0].length > 2 ? '90vw' : '800px',
        data: element,
      });
    } else {
      this.logService.snackBarMessage('Confusion matrix is empty!', 2000);
    }
  }

  toggleRowFavorite(element: Tagger): void {
    element.is_favorited = !element.is_favorited;
    this.patchFavoriteRowQueue.next(element);
  }
}
