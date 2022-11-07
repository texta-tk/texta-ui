import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Project, ProjectIndex} from '../../../../shared/types/Project';
import {BehaviorSubject, forkJoin, of, Subject} from 'rxjs';
import {MatMenuTrigger} from '@angular/material/menu';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../../core/util/log.service';
import {ProjectService} from '../../../../core/projects/project.service';
import {LexiconService} from '../../../../core/lexicon/lexicon.service';
import {AnnotatorService} from '../../../../core/tools/annotator/annotator.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {switchMap, take, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../../../shared/UtilityFunctions';
import {LabelSet} from '../../../../shared/types/tasks/LabelSet';

interface OnSubmitParams {
  categoryFormControl: string;
  valuesFormControl: string;
  valueLimitFormControl: number;
  indicesFormControl: ProjectIndex[];
  factNameFormControl: string[];
}

@Component({
  selector: 'app-edit-labelset-dialog',
  templateUrl: './edit-labelset-dialog.component.html',
  styleUrls: ['./edit-labelset-dialog.component.scss']
})
export class EditLabelsetDialogComponent implements OnInit, OnDestroy {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  labelSetForm = new FormGroup({
    categoryFormControl: new FormControl(this.data?.category ?? '', [Validators.required]),
    valuesFormControl: new FormControl(this.data?.values?.join('\n') ?? ''),
  });
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject();
  // tslint:disable-next-line:no-any
  labelSetOptions: any;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  requestInProgress = false;

  constructor(private dialogRef: MatDialogRef<EditLabelsetDialogComponent>,
              private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: LabelSet,
              private projectService: ProjectService,
              private lexiconService: LexiconService,
              private annotatorService: AnnotatorService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin({
          options: this.annotatorService.getLabelSetOptions(currentProject.id),
        });
      }
      return of(null);
    })).subscribe(resp => {
      if (resp?.options && !(resp?.options instanceof HttpErrorResponse)) {
        this.labelSetOptions = resp.options;
      }

      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });

  }

  onSubmit(): void {
    this.requestInProgress = true;
    const body = {
      category: this.labelSetForm.value.categoryFormControl,
      values: this.labelSetForm.value.valuesFormControl ? this.labelSetForm.value.valuesFormControl?.split('\n').filter((x: unknown) => x) : [],
    };
    this.annotatorService.patchLabelSet(this.currentProject.id, this.data.id, body).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.dialogRef.close(x);
      } else {
        if (x.error.hasOwnProperty('values')) {
          this.logService.snackBarMessage(x.error.values.join(','), 5000);
        } else {
          this.logService.snackBarError(x);
        }
      }
      this.requestInProgress = false;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
