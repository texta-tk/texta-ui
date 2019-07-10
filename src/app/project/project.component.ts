import {Component, OnDestroy, OnInit} from '@angular/core';
import {Project} from '../../shared/types/Project';
import {ProjectService} from '../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {Subscription} from 'rxjs';
import {LogService} from '../core/util/log.service';
import {CreateProjectDialogComponent} from './create-project-dialog/create-project-dialog.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  dialogAfterClosedSubscription: Subscription;

  constructor(private projectService: ProjectService, public dialog: MatDialog, public logService: LogService) {
  }

  ngOnInit() {
    this.projectService.getProjects().subscribe((resp: Project[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projects = resp;
      }
    });
  }

  ngOnDestroy() {
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      height: '380px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: Project | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projects = [...this.projects, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
}
