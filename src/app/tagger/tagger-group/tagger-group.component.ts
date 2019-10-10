import {Component, OnDestroy, OnInit} from '@angular/core';
import {mergeMap} from 'rxjs/operators';
import {LogService} from '../../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Project} from '../../shared/types/Project';
import {of, Subscription} from 'rxjs';
import {ProjectStore} from '../../core/projects/project.store';
import {MatDialog} from '@angular/material';
import {TaggerGroup} from '../../shared/types/tasks/Tagger';
import {CreateTaggerGroupDialogComponent} from './create-tagger-group-dialog/create-tagger-group-dialog.component';
import {TaggerGroupService} from '../../core/taggers/tagger-group.service';

@Component({
  selector: 'app-tagger-group',
  templateUrl: './tagger-group.component.html',
  styleUrls: ['./tagger-group.component.scss']
})
export class TaggerGroupComponent implements OnInit, OnDestroy {
  private projectSubscription: Subscription;
  private dialogAfterClosedSubscription: Subscription;
  public tableData: TaggerGroup[] = [];


  constructor(public dialog: MatDialog,
              private projectStore: ProjectStore,
              private taggerGroupService: TaggerGroupService,
              private logService: LogService) {
  }

  ngOnInit() {
    this.projectSubscription = this.projectStore.getCurrentProject().pipe(mergeMap((currentProject: Project) => {
      if (currentProject) {
        return this.taggerGroupService.getTaggerGroups(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: {count: number, results: TaggerGroup[]} | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData = resp.results;
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
      height: '860px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: TaggerGroup | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData = [...this.tableData, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
}
