import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {LogService} from '../../core/util/log.service';
import {ProjectService} from '../../core/projects/project.service';
import {ProjectStore} from '../../core/projects/project.store';
import {NeuroTaggerService} from '../../core/neuro-tagger/neuro-tagger.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {mergeMap, take} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';
import {ProjectFact, ProjectField} from '../../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import { NeuroTagger } from 'src/app/shared/types/tasks/NeuroTagger';

interface NeuroTaggerOptions {
  actions: { POST: { model_architecture: { choices: [''] } } };
}

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
  neuroTaggerOptions: NeuroTaggerOptions = {actions: {POST: {model_architecture: {choices: ['']}}}};

  constructor(private dialogRef: MatDialogRef<CreateNeuroTaggerDialogComponent>,
              private neuroTaggerService: NeuroTaggerService,
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
          this.setDefaultFormValues(this.neuroTaggerOptions);
        }
      }
    });
  }

  setDefaultFormValues(options) {
    console.log(options);
    this.taggerForm.get('modelArchitectureFormControl').setValue(options.actions.POST.model_architecture.choices[0].value);
  }

  onSubmit(formData) {
    console.log(formData);
    console.log(formData.modelArchitectureFormControl);
    const body = {
      description: formData.descriptionFormControl,
      fields: formData.fieldsFormControl,
      max_fact_doc_count: formData.maxFactDocCountFormControl,
      negative_multiplier: formData.negativeMultiplierFormControl,
      score_threshold: formData.scoreThresholdFormControl,
      model_architecture: formData.modelArchitectureFormControl,
      seq_len: formData.seqLenFormControl,
      maximum_sample_size: formData.sampleSizeFormControl,
      num_epochs: formData.epochNumberFormControl,
      validation_split: formData.validationSplitFormControl,
      vocab_size: formData.vocabSizeFormControl,
      fact_name: formData.factNameFormControl,
      min_fact_doc_count: formData.minFactDocCountFormControl,
    };

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return this.neuroTaggerService.createNeuroTagger(body, currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: NeuroTagger | HttpErrorResponse) => {
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
