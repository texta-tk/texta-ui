import {Component, OnDestroy, OnInit} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {LogService} from '../core/util/log.service';
import {TaggerService} from '../core/taggers/tagger.service';
import {ProjectStore} from '../core/projects/project.store';
import {Tagger} from '../shared/types/Tagger';
import {mergeMap} from 'rxjs/operators';
import {CreateTaggerDialogComponent} from './create-tagger-dialog/create-tagger-dialog.component';

@Component({
  selector: 'app-tagger',
  templateUrl: './tagger.component.html',
  styleUrls: ['./tagger.component.scss']
})
export class TaggerComponent implements OnInit, OnDestroy {

  dialogAfterClosedSubscription: Subscription;
  taggers: Tagger[] = [];
  currentProjectSubscription: Subscription;

  constructor(private projectStore: ProjectStore,
              private taggerService: TaggerService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

  ngOnInit() {
    this.currentProjectSubscription = this.projectStore.getCurrentProject().pipe(mergeMap(currentProject => {
      if (currentProject) {
        return this.taggerService.getTaggers(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: Tagger[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.taggers = resp;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  ngOnDestroy() {
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
    if (this.currentProjectSubscription) {
      this.currentProjectSubscription.unsubscribe();
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateTaggerDialogComponent, {
      height: '695px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: Tagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.taggers = [...this.taggers, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
}
