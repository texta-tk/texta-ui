import {Component, OnDestroy, OnInit} from '@angular/core';
import {mergeMap} from 'rxjs/operators';
import {LogService} from '../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Project} from '../shared/types/Project';
import {of, Subscription} from 'rxjs';
import {ProjectStore} from '../core/projects/project.store';
import {CreateEmbeddingDialogComponent} from '../embedding/create-embedding-dialog/create-embedding-dialog.component';
import {MatDialog} from '@angular/material';
import {Tagger} from '../shared/types/Tagger';
import {CreateTaggerGroupDialogComponent} from './create-tagger-group-dialog/create-tagger-group-dialog.component';

@Component({
  selector: 'app-tagger-group',
  templateUrl: './tagger-group.component.html',
  styleUrls: ['./tagger-group.component.scss']
})
export class TaggerGroupComponent implements OnInit, OnDestroy {
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
        return of(null);
      } else {
        return of(null);
      }
    })).subscribe((resp: Tagger[] | HttpErrorResponse) => {
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
    const dialogRef = this.dialog.open(CreateTaggerGroupDialogComponent, {
      height: '890px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: Tagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        // todo
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
}
