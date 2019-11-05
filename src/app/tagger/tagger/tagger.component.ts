import {Component, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {Subscription, timer} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {LogService} from '../../core/util/log.service';
import {TaggerService} from '../../core/taggers/tagger.service';
import {ProjectStore} from '../../core/projects/project.store';
import {Tagger} from '../../shared/types/tasks/Tagger';
import {switchMap, startWith } from 'rxjs/operators';
import {CreateTaggerDialogComponent} from './create-tagger-dialog/create-tagger-dialog.component';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Project} from '../../shared/types/Project';
import {EditStopwordsDialogComponent} from './edit-stopwords-dialog/edit-stopwords-dialog.component';
import {TagTextDialogComponent} from './tag-text-dialog/tag-text-dialog.component';
import {TagDocDialogComponent} from './tag-doc-dialog/tag-doc-dialog.component';
import {TagRandomDocDialogComponent} from './tag-random-doc-dialog/tag-random-doc-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {QueryDialogComponent} from 'src/app/shared/components/dialogs/query-dialog/query-dialog.component';
import {ConfirmDialogComponent} from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';

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

  private dialogAfterClosedSubscription: Subscription;
  private currentProjectSubscription: Subscription;
  private updateTaggersSubscription: Subscription;

  expandedElement: Tagger | null;
  public tableData: MatTableDataSource<Tagger> = new MatTableDataSource();
  selectedRows = new SelectionModel<Tagger>(true, []);
  public displayedColumns = ['select', 'description', 'fields_parsed', 'time_started',
    'time_completed', 'f1_score', 'precision', 'recall', 'Task', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  currentProject: Project;
  resultsLength: number;


  constructor(private projectStore: ProjectStore,
              private taggerService: TaggerService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    // Check for updates after 30s every 30s
    this.updateTaggersSubscription = timer(30000, 30000).pipe(switchMap(_ =>
        this.taggerService.getTaggers(this.currentProject.id,
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`)))
    .subscribe((resp: {count: number, results: Tagger[]} | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.refreshTaggers(resp.results);
      }
    });
  }

  ngAfterViewInit() {
    this.currentProjectSubscription = this.projectStore.getCurrentProject().subscribe(
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
    this.paginator.page.pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      return this.taggerService.getTaggers(
        this.currentProject.id,
        // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
        );
    })).subscribe((data: {count: number, results: Tagger[]}) => {
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
        return this.taggerService.retrainTagger(this.currentProject.id, value.id);
      } else {
        return null;
      }
  }

  ngOnDestroy() {
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
    if (this.currentProjectSubscription) {
      this.currentProjectSubscription.unsubscribe();
    }
    if (this.updateTaggersSubscription) {
      this.updateTaggersSubscription.unsubscribe();
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateTaggerDialogComponent, {
      height: '665px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: Tagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  editStopwordsDialog(element) {
    const dialogRef = this.dialog.open(EditStopwordsDialogComponent, {
      maxHeight: '665px',
      width: '700px',
    });
  }

  tagTextDialog(tagger: Tagger) {
    const dialogRef = this.dialog.open(TagTextDialogComponent, {
      data: {taggerId: tagger.id, currentProjectId: this.currentProject.id },
      maxHeight: '665px',
      width: '700px',
    });
  }

  tagDocDialog(tagger: Tagger) {
    const dialogRef = this.dialog.open(TagDocDialogComponent, {
      data: {tagger, currentProjectId: this.currentProject.id },
      maxHeight: '665px',
      width: '700px',
    });
  }


  tagRandomDocDialog(tagger: Tagger) {
    const dialogRef = this.dialog.open(TagRandomDocDialogComponent, {
      data: {tagger, currentProjectId: this.currentProject.id },
      minHeight: '300px',
      maxHeight: '665px',
      width: '1200px',
    });
  }

  onDelete(tagger: Tagger, index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { confirmText: 'Delete', mainText: 'Are you sure you want to delete this Tagger?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.taggerService.deleteTagger(this.currentProject.id, tagger.id).subscribe(() => {
          this.logService.snackBarMessage(`Tagger ${tagger.id}: ${tagger.description} deleted`, 2000);
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
        data: { confirmText: 'Delete',  mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Taggers?` }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if(result) {
          // Delete selected taggers
          const idsToDelede = this.selectedRows.selected.map((tagger: Tagger) => tagger.id);
          const body = { ids: idsToDelede };
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
      data: { query },
      maxHeight: '665px',
      width: '700px',
    });
  }
}
