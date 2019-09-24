import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {LogService} from '../../core/util/log.service';
import {ProjectService} from '../../core/projects/project.service';
import {ProjectStore} from '../../core/projects/project.store';
import {NeuroTaggerService} from '../../core/neuro-tagger/neuro-tagger.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TaggerOptions} from '../../shared/types/tasks/TaggerOptions';
import {mergeMap, switchMap, take} from "rxjs/operators";
import {forkJoin, merge, of} from "rxjs";
import {ProjectFact, ProjectField} from "../../shared/types/Project";
import {Embedding} from "../../shared/types/tasks/Embedding";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-create-neuro-tagger-dialog',
  templateUrl: './create-neuro-tagger-dialog.component.html',
  styleUrls: ['./create-neuro-tagger-dialog.component.scss']
})
export class CreateNeuroTaggerDialogComponent implements OnInit {
  taggerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),

    validationSplitFormControl: new FormControl(0.2, [Validators.required]),
    scoreThresholdFormControl: new FormControl(0.0, [Validators.required]),
    fieldsFormControl: new FormControl([], [Validators.required]),
    modelArchitectureFormControl: new FormControl([Validators.required]),
    seqLenFormControl: new FormControl(150, [Validators.required]),
    sampleSizeFormControl: new FormControl(10000, [Validators.required]),
    negativeMultiplierFormControl: new FormControl(1.0, [Validators.required]),
    epochNumberFormControl: new FormControl(5, [Validators.required]),
    vocabSizeFormControl: new FormControl(30000, [Validators.required]),
    factNameFormControl: new FormControl([Validators.required]),
    minFactDocCountFormControl: new FormControl(50, [Validators.required]),
    maxFactDocCountFormControl: new FormControl(),
  });
  projectFields: ProjectField[] = [];
  projectFacts: ProjectFact[] = [];
  neuroTaggerOptions: { actions: { POST: { model_architecture: { choices: [''] } } } } = {actions: {POST: {model_architecture: {choices: ['']}}}};

  constructor(private dialogRef: MatDialogRef<CreateNeuroTaggerDialogComponent>,
              private neuroTaggerService: NeuroTaggerService,
              private logService: LogService,
              private projectService: ProjectService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return forkJoin(
          {
            neuroTaggerOptions: this.neuroTaggerService.getNeuroTaggerOptions(currentProject.id),
            projectFields: this.projectService.getProjectFields(currentProject.id),
            projectFacts: this.projectService.getProjectFacts(currentProject.id)
          });
      } else {
        return of(null);
      }
    })).subscribe((resp: {
      neuroTaggerOptions: any | HttpErrorResponse,
      projectFields: ProjectField[] | HttpErrorResponse,
      projectFacts: ProjectFact[] | HttpErrorResponse
    }) => {
      if (resp) {
        if (!(resp.projectFields instanceof HttpErrorResponse)) {
          this.projectFields = resp.projectFields;
        }
        if (!(resp.projectFacts instanceof HttpErrorResponse)) {
          this.projectFacts = resp.projectFacts;
        }
        if (!(resp.neuroTaggerOptions instanceof HttpErrorResponse)) {
          this.neuroTaggerOptions = resp.neuroTaggerOptions;
        }
      }
    });
  }

  setDefaultFormValues(options: TaggerOptions) {
    this.taggerForm.get('vectorizerFormControl').setValue(options.actions.POST.vectorizer.choices[0]);
    this.taggerForm.get('classifierFormControl').setValue(options.actions.POST.classifier.choices[0]);
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}
