import {Component, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomErrorStateMatcher} from '../../../shared/CustomErrorStateMatcher';
import {ProjectService} from '../../core/projects/project.service';
import {Field} from '../../../shared/types/ProjectField';
import {UserService} from '../../core/users/user.service';
import {UserProfile} from '../../../shared/types/UserProfile';
import {Project} from '../../../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-create-embedding-dialog',
  templateUrl: './create-project-dialog.component.html',
  styleUrls: ['./create-project-dialog.component.scss']
})
export class CreateProjectDialogComponent implements OnInit {

  projectForm = new FormGroup({
    titleFormControl: new FormControl('', [
      Validators.required,
    ]),
    usersFormControl: new FormControl([], [Validators.required]),
    indicesFormControl: new FormControl([], [Validators.required]),
  });

  matcher: ErrorStateMatcher = new CustomErrorStateMatcher();
  users: UserProfile[];
  indices = [];

  constructor(private dialogRef: MatDialogRef<CreateProjectDialogComponent>,
              private projectService: ProjectService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.userService.getAllUsers().subscribe(resp => {
      this.users = resp;
    });
    this.projectService.getProjectOptions().subscribe(resp => {
      this.indices = resp.actions.POST.indices.choices;
    });

  }

  onSubmit(formData) {
    const body = {
      indices: formData.indicesFormControl,
      users: formData.usersFormControl,
      title: formData.titleFormControl
    };
    this.projectService.createProject(body).subscribe((resp: Project | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
