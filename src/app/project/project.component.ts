import {Component, OnDestroy, OnInit} from '@angular/core';
import {Project} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {Subscription} from 'rxjs';
import {LogService} from '../core/util/log.service';
import {CreateProjectDialogComponent} from './create-project-dialog/create-project-dialog.component';
import {ProjectStore} from '../core/projects/project.store';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  dialogAfterClosedSubscription: Subscription;
  projectSubscription: Subscription;

  constructor(
    private projectStore: ProjectStore,
    public dialog: MatDialog,
    public logService: LogService) {
  }

  ngOnInit() {
    this.projectSubscription = this.projectStore.getProjects().subscribe((projects: Project[]) => {
      if (projects) {
        this.projects = projects;
      }
    });
  }

  ngOnDestroy() {
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      height: '350px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: Project | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectStore.refreshProjects();
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
}
