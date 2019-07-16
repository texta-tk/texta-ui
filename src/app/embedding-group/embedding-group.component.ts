import {Component, OnDestroy, OnInit} from '@angular/core';
import {LogService} from '../core/util/log.service';
import {MatDialog} from '@angular/material';
import {ProjectStore} from '../core/projects/project.store';
import {HttpErrorResponse} from '@angular/common/http';
import {Embedding} from '../shared/types/Embedding';
import {CreateEmbeddingDialogComponent} from '../embedding/create-embedding-dialog/create-embedding-dialog.component';
import {mergeMap} from 'rxjs/operators';
import {Project} from '../shared/types/Project';
import {of, Subscription} from 'rxjs';

@Component({
  selector: 'app-embedding-group',
  templateUrl: './embedding-group.component.html',
  styleUrls: ['./embedding-group.component.scss']
})
export class EmbeddingGroupComponent implements OnInit, OnDestroy {
  private projectSubscription: Subscription;
  private dialogAfterClosedSubscription: Subscription;

  constructor(public dialog: MatDialog,
              private projectStore: ProjectStore,
              private logService: LogService) {
  }

  ngOnInit() {
    this.projectSubscription = this.projectStore.getCurrentProject().pipe(mergeMap((currentProject: Project) => {
      if (currentProject) {
        // todo
      } else {
        return of(null);
      }
    })).subscribe((resp: Embedding[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        // todo
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
        // todo
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
        // todo
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
}
