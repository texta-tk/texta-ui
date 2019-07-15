import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EmbeddingsService} from '../core/embeddings/embeddings.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Embedding} from '../shared/types/Embedding';
import {ProjectStore} from '../core/projects/project.store';
import {Project} from '../shared/types/Project';
import {mergeMap, take} from 'rxjs/operators';
import {of, Subscription, timer} from 'rxjs';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {CreateEmbeddingDialogComponent} from './create-embedding-dialog/create-embedding-dialog.component';
import {LogService} from '../core/util/log.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

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

  expandedElement: Embedding | null;
  public tableData: MatTableDataSource<Embedding>;
  public displayedColumns = ['Description', 'fields_parsed', 'time_started', 'time_completed', 'Task'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private projectStore: ProjectStore,
              private embeddingsService: EmbeddingsService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit() {
    this.projectSubscription = this.projectStore.getCurrentProject().pipe(mergeMap((currentProject: Project) => {
      if (currentProject) {
        return this.embeddingsService.getEmbeddings(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: Embedding[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData = new MatTableDataSource(resp);
        this.tableData.sort = this.sort;
        this.tableData.paginator = this.paginator;
        this.isLoadingResults = false;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
        this.isLoadingResults = false;
      }
    });

  }

  ngOnDestroy() {
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateEmbeddingDialogComponent, {
      height: '500px',
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
}
