import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {UserStore} from '../../../core/users/user.store';
import {UserService} from '../../../core/users/user.service';
import {AnnotatorService} from '../../../core/tools/annotator/annotator.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {switchMap, take} from 'rxjs/operators';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {ScrollableDataSource} from '../../../shared/ScrollableDataSource';
import {forkJoin, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {Project, ProjectIndex} from '../../../shared/types/Project';
import {UserProfile} from '../../../shared/types/UserProfile';
import {Embedding} from '../../../shared/types/tasks/Embedding';
import {Annotator, AnnotatorUser} from '../../../shared/types/tasks/Annotator';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';

@Component({
  selector: 'app-edit-annotator-dialog',
  templateUrl: './edit-annotator-dialog.component.html',
  styleUrls: ['./edit-annotator-dialog.component.scss']
})
export class EditAnnotatorDialogComponent implements OnInit {
  annotatorForm = new FormGroup({
    descriptionFormControl: new FormControl(this.data?.description || ''),
    usersFormControl: new FormControl( []),
  });
  users: UserProfile[];
  currentUser: UserProfile;
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditAnnotatorDialogComponent>,
              private projectService: ProjectService,
              private userStore: UserStore,
              @Inject(MAT_DIALOG_DATA) public data: Annotator,
              private userService: UserService,
              private annotatorService: AnnotatorService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(take(1)).subscribe(proj => {
      if (proj) {
        this.currentProject = proj;
        this.users = UtilityFunctions.sortByStringProperty(proj.users, (x => x.username));
      }
    });

    this.userStore.getCurrentUser().pipe(take(1)).subscribe(resp => {
      if (resp) {
        this.currentUser = resp;
      }
    });
    const users = this.annotatorForm.get('usersFormControl');
    if (users && this.data.annotator_users) {
      if (this.currentUser?.is_superuser) {
        users.setValue(this.data?.annotator_users.map(x => x.username));
      } else {
        users.setValue(this.data?.annotator_users.map(x => x.username).join('\n'));
      }
    }
  }

  newLineStringToList(stringWithNewLines: string): string[] {
    if (stringWithNewLines && stringWithNewLines.length !== 0) {
      const stringList = stringWithNewLines.split('\n');
      // filter out empty values
      return stringList.filter(x => x !== '');
    } else {
      return [];
    }
  }

  onSubmit(formData: { usersFormControl: string[] | string }): void {
    const body = {
      annotating_users: this.currentUser.is_superuser ? formData.usersFormControl || [] : this.newLineStringToList(formData.usersFormControl as string),
    };
    this.annotatorService.patchAnnotator(body, this.currentProject.id, this.data.id).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Edited annotator task: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
}
