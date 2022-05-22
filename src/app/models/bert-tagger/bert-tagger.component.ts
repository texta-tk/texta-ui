import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {merge, of, Subject} from 'rxjs';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CreateBertTaggerDialogComponent} from './create-bert-tagger-dialog/create-bert-tagger-dialog.component';
import {expandRowAnimation} from '../../shared/animations';
import {BertTagger, Index} from '../../shared/types/tasks/BertTagger';
import {Project} from '../../shared/types/Project';
import {ProjectStore} from '../../core/projects/project.store';
import {BertTaggerService} from '../../core/models/taggers/bert-tagger/bert-tagger.service';
import {LogService} from '../../core/util/log.service';
import {ConfirmDialogComponent} from '../../shared/shared-module/components/dialogs/confirm-dialog/confirm-dialog.component';
import {AddBertModelDialogComponent} from './add-bert-model-dialog/add-bert-model-dialog.component';
import {TagTextDialogComponent} from './tag-text-dialog/tag-text-dialog.component';
import {TagRandomDocDialogComponent} from './tag-random-doc-dialog/tag-random-doc-dialog.component';
import {EditBertTaggerDialogComponent} from './edit-bert-tagger-dialog/edit-bert-tagger-dialog.component';
import {EpochReportsDialogComponent} from './epoch-reports-dialog/epoch-reports-dialog.component';
import {QueryDialogComponent} from '../../shared/shared-module/components/dialogs/query-dialog/query-dialog.component';
import {ApplyToIndexDialogComponent} from './apply-to-index-dialog/apply-to-index-dialog.component';
import {Tagger} from '../../shared/types/tasks/Tagger';
import {ConfusionMatrixDialogComponent} from '../../shared/plotly-module/confusion-matrix-dialog/confusion-matrix-dialog.component';

@Component({
  selector: 'app-bert-tagger',
  templateUrl: './bert-tagger.component.html',
  styleUrls: ['./bert-tagger.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class BertTaggerComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: BertTagger | null;
  public tableData: MatTableDataSource<BertTagger> = new MatTableDataSource();
  selectedRows = new SelectionModel<BertTagger>(true, []);
  public displayedColumns = ['select', 'id', 'author__username', 'description', 'fields', 'task__time_started',
    'task__time_completed', 'f1_score', 'precision', 'recall', 'task__status', 'actions'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength: number;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;
  private updateTable = new Subject<boolean>();

  constructor(private projectStore: ProjectStore,
              private bertTaggerService: BertTaggerService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  getIndicesName = (x: Index) => x.name;

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
            return this.bertTaggerService.getBertTaggerTasks(
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

  openQueryDialog(query: string): void {
    this.dialog.open(QueryDialogComponent, {
      data: {query},
      maxHeight: '665px',
      width: '700px',
    });
  }

  downloadModelDialog(): void {
    const dialogRef = this.dialog.open(AddBertModelDialogComponent, {
      maxHeight: '90vh',
      width: '370px',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
      }
    });
  }

  openCreateDialog(cloneElement?: BertTagger): void {
    const dialogRef = this.dialog.open(CreateBertTaggerDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
      data: {cloneElement: cloneElement ? cloneElement : undefined},
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.updateTable.next();
        this.projectStore.refreshSelectedProjectResourceCounts();
      }
    });
  }

  tagTextDialog(bertTagger: BertTagger): void {
    this.dialog.open(TagTextDialogComponent, {
      data: {tagger: bertTagger, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }

  epochReportDialog(tagger: BertTagger): void {
    this.dialog.open(EpochReportsDialogComponent, {
      data: {taggerId: tagger.id, currentProjectId: this.currentProject.id},
      height: '465px',
      width: '700px',
    });
  }

  tagRandomDocDialog(tagger: BertTagger): void {
    this.dialog.open(TagRandomDocDialogComponent, {
      data: {tagger, currentProjectId: this.currentProject.id},
      maxHeight: '90vh',
      width: '1200px',
    });
  }

  onDelete(tagger: BertTagger, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this task?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bertTaggerService.deleteTagger(this.currentProject.id, tagger.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted tagger ${tagger.description}`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
          this.projectStore.refreshSelectedProjectResourceCounts();
        });
      }
    });
  }

  edit(tagger: BertTagger): void {
    this.dialog.open(EditBertTaggerDialogComponent, {
      width: '700px',
      data: tagger
    }).afterClosed().subscribe((x: BertTagger | HttpErrorResponse | undefined) => {
      if (x && !(x instanceof HttpErrorResponse)) {
        tagger.description = x.description;
      } else if (x instanceof HttpErrorResponse) {
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
      (this.tableData.data as BertTagger[]).forEach(row => this.selectedRows.select(row));
  }


  onDeleteAllSelected(): void {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Tasks?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          const idsToDelete = this.selectedRows.selected.map((bertTagger: BertTagger) => bertTagger.id);
          const body = {ids: idsToDelete};

          this.bertTaggerService.bulkDeleteBertTaggerTasks(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} Tasks.`, 2000);
            this.removeSelectedRows();
          });

          this.projectStore.refreshSelectedProjectResourceCounts();
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selected: BertTagger) => {
      const index: number = (this.tableData.data as BertTagger[]).findIndex(bertTagger => bertTagger.id === selected.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }


  retrainTagger(value: BertTagger): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        confirmText: 'Retrain',
        mainText: `Are you sure you want to retrain: ${value.description}`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bertTaggerService.retrainTagger(this.currentProject.id, value.id)
          .subscribe(resp => {
            if (resp && !(resp instanceof HttpErrorResponse)) {
              this.logService.snackBarMessage('Successfully started retraining', 4000);
            } else if (resp instanceof HttpErrorResponse) {
              this.logService.snackBarError(resp, 5000);
            }
            this.updateTable.next();
          });
      }
    });

  }

  applyToIndexDialog(tagger: BertTagger): void {
    this.dialog.open(ApplyToIndexDialogComponent, {
      data: tagger,
      maxHeight: '90vh',
      width: '700px',
    }).afterClosed().subscribe(resp => {
      if (resp) {
        this.updateTable.next();
      }
    });
  }

  openConfusionMatrix(element: BertTagger): void {
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

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
