import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LogService} from '../core/util/log.service';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ProjectStore} from '../core/projects/project.store';
import {HttpErrorResponse} from '@angular/common/http';
import {Embedding} from '../shared/types/Embedding';
import {mergeMap} from 'rxjs/operators';
import {Project} from '../shared/types/Project';
import {of, Subscription} from 'rxjs';
import {CreateEmbeddingGroupDialogComponent} from './create-embedding-group-dialog/create-embedding-group-dialog.component';
import {EmbeddingsGroupService} from '../core/embeddings/embeddings-group.service';
import {EmbeddingCluster} from '../shared/types/EmbeddingCluster';

@Component({
  selector: 'app-embedding-group',
  templateUrl: './embedding-group.component.html',
  styleUrls: ['./embedding-group.component.scss']
})
export class EmbeddingGroupComponent implements OnInit, OnDestroy {
  private projectSubscription: Subscription;
  private dialogAfterClosedSubscription: Subscription;

  public tableData: EmbeddingCluster[] = [];


  constructor(public dialog: MatDialog,
              private projectStore: ProjectStore,
              private embeddingGroupService: EmbeddingsGroupService,
              private logService: LogService) {
  }

  ngOnInit() {
    this.projectSubscription = this.projectStore.getCurrentProject().pipe(mergeMap((currentProject: Project) => {
      if (currentProject) {
        return this.embeddingGroupService.getEmbeddingGroups(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: EmbeddingCluster[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData = resp;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);

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
    const dialogRef = this.dialog.open(CreateEmbeddingGroupDialogComponent, {
      height: '350px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: EmbeddingCluster | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData = [...this.tableData, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
}
