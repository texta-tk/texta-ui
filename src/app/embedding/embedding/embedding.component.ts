import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EmbeddingsService} from '../../core/embeddings/embeddings.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Embedding} from '../../shared/types/tasks/Embedding';
import {ProjectStore} from '../../core/projects/project.store';
import {Project} from '../../shared/types/Project';
import {switchMap} from 'rxjs/operators';
import {of, Subscription, timer} from 'rxjs';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {CreateEmbeddingDialogComponent} from './create-embedding-dialog/create-embedding-dialog.component';
import {LogService} from '../../core/util/log.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { PhraseDialogComponent } from '../phrase-dialog/phrase-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';

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
export class EmbeddingComponent implements OnInit, OnDestroy {

  private projectSubscription: Subscription;
  private dialogAfterClosedSubscription: Subscription;
  private updateEmbeddingsSubscription: Subscription;
  expandedElement: Embedding | null;
  public tableData: MatTableDataSource<Embedding> = new MatTableDataSource();
  public displayedColumns = ['select', 'description', 'fields_parsed', 'time_started', 'time_completed', 'Task', 'Modify'];
  selectedRows = new SelectionModel<Embedding>(true, []);
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  currentProject: Project;

  constructor(private projectStore: ProjectStore,
              private embeddingsService: EmbeddingsService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    this.projectSubscription = this.projectStore.getCurrentProject().pipe(switchMap((currentProject: Project) => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.embeddingsService.getEmbeddings(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: Embedding[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = resp;
        this.isLoadingResults = false;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
        this.isLoadingResults = false;
      }
    });
    // check for updates after 30s every 30s
    this.updateEmbeddingsSubscription = timer(30000, 30000).pipe(switchMap(_ => this.embeddingsService.getEmbeddings(this.currentProject.id)))
    .subscribe((resp: Embedding[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        if (resp.length > 0) {
          resp.map(embedding => {
            const indx = this.tableData.data.findIndex(x => x.id === embedding.id);
            this.tableData.data[indx].task = embedding.task;
          });
        }
      }
    });

  }

  phrase(embedding: Embedding) {
    const dialogRef = this.dialog.open(PhraseDialogComponent, {
      data: {embeddingId: embedding.id, currentProjectId: this.currentProject.id },
      maxHeight: '665px',
      width: '700px',
    });
  }


  ngOnDestroy() {
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
    if (this.updateEmbeddingsSubscription) {
      this.updateEmbeddingsSubscription.unsubscribe();
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateEmbeddingDialogComponent, {
      height: '490px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: Embedding | HttpErrorResponse) => {
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


  onDelteAllSelected() {
    if (this.selectedRows.selected.length > 0) {
      // Delete selected taggers
      const ids_to_delete = this.selectedRows.selected.map((tagger: Embedding) => { return tagger.id });
      const body = {"ids": ids_to_delete}
      // Refresh taggers
      this.embeddingsService.bulkDeleteEmbeddings(this.currentProject.id, body).subscribe(() => {
        this.logService.snackBarMessage(`${this.selectedRows.selected.length} Embeddings deleted`, 2000);
        this.removeSelectedRows();
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selected_tagger: Embedding) => {
       const index: number = this.tableData.data.findIndex(tagger => tagger.id === selected_tagger.id);
        this.tableData.data.splice(index, 1);
        this.tableData.data = [...this.tableData.data];
     });
     this.selectedRows.clear();
  }
}
