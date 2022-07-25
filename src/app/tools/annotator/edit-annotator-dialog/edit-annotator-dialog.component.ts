import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {UserStore} from '../../../core/users/user.store';
import {UserService} from '../../../core/users/user.service';
import {AnnotatorService} from '../../../core/tools/annotator/annotator.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {switchMap, take} from 'rxjs/operators';
import {forkJoin, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {Project, ProjectIndex} from '../../../shared/types/Project';
import {Annotator, AnnotatorUser} from '../../../shared/types/tasks/Annotator';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';

@Component({
  selector: 'app-edit-annotator-dialog',
  templateUrl: './edit-annotator-dialog.component.html',
  styleUrls: ['./edit-annotator-dialog.component.scss']
})
export class EditAnnotatorDialogComponent implements OnInit {
  annotatorForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl(this.data?.description || ''),
  });
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditAnnotatorDialogComponent>,
              private projectService: ProjectService,
              @Inject(MAT_DIALOG_DATA) public data: Annotator,
              private annotatorService: AnnotatorService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(take(1)).subscribe(proj => {
      if (proj) {
        this.currentProject = proj;
      }
    });
  }

  onSubmit(formData: {  descriptionFormControl: string }): void {
    const body = {
      description: formData.descriptionFormControl
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
