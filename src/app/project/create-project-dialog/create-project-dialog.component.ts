import {Component, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LiveErrorStateMatcher} from '../../shared/CustomerErrorStateMatchers';
import {ProjectService} from '../../core/projects/project.service';
import {UserService} from '../../core/users/user.service';
import {UserProfile} from '../../shared/types/UserProfile';
import {Project} from '../../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from 'src/app/core/util/log.service';
import {UserStore} from '../../core/users/user.store';
import {of, Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-create-embedding-dialog',
  templateUrl: './create-project-dialog.component.html',
  styleUrls: ['./create-project-dialog.component.scss']
})
export class CreateProjectDialogComponent implements OnInit, OnDestroy {

  projectForm = new FormGroup({
    titleFormControl: new FormControl('', [
      Validators.required,
    ]),
    usersFormControl: new FormControl([], [Validators.required]),
    indicesFormControl: new FormControl([], [Validators.required]),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  users: UserProfile[];
  indices: unknown[] = [];
  currentUser = new UserProfile();

  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private dialogRef: MatDialogRef<CreateProjectDialogComponent>,
              private projectService: ProjectService,
              private userService: UserService,
              private userStore: UserStore,
              private logService: LogService) {
  }

  ngOnInit() {
    this.userService.getAllUsers().subscribe(resp => {
      this.users = resp;
    });
    this.projectService.getIndices().subscribe((resp: string[] | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else {
        this.indices = resp;
      }
    });
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$), switchMap(user => {
      if (user) {
        return this.userService.getUserByUrl(user.pk);
      }
      return of(null);
    })).subscribe((resp: UserProfile | HttpErrorResponse) => {
      if (!(resp instanceof HttpErrorResponse)) {
        this.currentUser = resp;
        if (!this.projectForm.contains('ownerFormControl')) {
          this.projectForm.addControl('ownerFormControl', new FormControl());
        }
      }

    });
  }

  onSubmit(formData) {
    const body = {
      indices: formData.indicesFormControl,
      users: formData.usersFormControl,
      owner: formData.ownerFormControl ? formData.ownerFormControl : this.currentUser.id,
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

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
