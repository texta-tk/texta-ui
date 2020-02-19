import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Project} from '../../shared/types/Project';
import {ProjectStore} from '../../core/projects/project.store';
import {ProjectService} from '../../core/projects/project.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../core/util/log.service';
import {UserService} from '../../core/users/user.service';
import {UserProfile} from '../../shared/types/UserProfile';
import {mergeMap, switchMap, takeUntil} from 'rxjs/operators';
import {from, of, Subject} from 'rxjs';

@Component({
  selector: 'app-edit-project-dialog',
  templateUrl: './edit-project-dialog.component.html',
  styleUrls: ['./edit-project-dialog.component.scss']
})
export class EditProjectDialogComponent implements OnInit {

  indices: string[] = [];
  users: UserProfile[] = [];
  selectedUsers: string[] = [];
  projectForm = new FormGroup({
    indicesFormControl: new FormControl([], Validators.required),
    usersFormControl: new FormControl(this.selectedUsers, Validators.required),
  });
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(public dialogRef: MatDialogRef<EditProjectDialogComponent>,
              private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: Project,
              private userService: UserService,
              private projectStore: ProjectStore,
              private projectService: ProjectService) {
    this.projectForm.get('indicesFormControl').setValue(this.data.indices);
    if (this.data.users) {
      from(this.data.users).pipe(mergeMap(url => {
        return this.userService.getUserByUrl(url);
      })).subscribe(x => {
        this.selectedUsers.push(x.url);
        this.projectForm.get('usersFormControl').setValue(this.selectedUsers);
      });
    }
  }

  ngOnInit() {
    this.projectService.getIndices().subscribe((resp: string[] | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else {
        this.indices = resp;
      }
    });
    this.userService.getAllUsers().subscribe((resp: UserProfile[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.users = resp;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 4000);
      }
    });
  }

  onSubmit(formData) {
    this.data.indices = formData.indicesFormControl;
    this.data.users = formData.usersFormControl;
    this.projectService.editProject(this.data, this.data.id).subscribe((resp: Project | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else if (resp) {
        this.projectStore.refreshProjects();
        this.dialogRef.close();
      }
    });
  }

}
