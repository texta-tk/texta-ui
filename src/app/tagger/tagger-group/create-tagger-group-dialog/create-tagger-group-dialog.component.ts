import {Component, OnInit} from '@angular/core';
import {ProjectField, ProjectFact} from '../../../shared/types/Project';
import {mergeMap, take} from 'rxjs/operators';
import {LogService} from '../../../core/util/log.service';
import {TaggerOptions} from '../../../shared/types/tasks/TaggerOptions';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {EmbeddingsService} from '../../../core/embeddings/embeddings.service';
import {Embedding} from '../../../shared/types/tasks/Embedding';
import {TaggerService} from '../../../core/taggers/tagger.service';
import {merge, of, forkJoin} from 'rxjs';
import {TaggerGroupService} from '../../../core/taggers/tagger-group.service';
import {TaggerGroup} from '../../../shared/types/tasks/Tagger';

@Component({
  selector: 'app-create-tagger-group-dialog',
  templateUrl: './create-tagger-group-dialog.component.html',
  styleUrls: ['./create-tagger-group-dialog.component.scss']
})
export class CreateTaggerGroupDialogComponent implements OnInit {

  taggerGroupForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
    factNameFormControl: new FormControl(Validators.required),
    taggerGroupSampleSizeFormControl: new FormControl(50, [Validators.required]),
    taggerForm: new FormGroup({
      fieldsFormControl: new FormControl([], [Validators.required]),
      embeddingFormControl: new FormControl(),
      vectorizerFormControl: new FormControl([Validators.required]),
      classifierFormControl: new FormControl([Validators.required]),
      sampleSizeFormControl: new FormControl(10000, [Validators.required]),
      negativeMultiplierFormControl: new FormControl(1.0, [Validators.required]),

    })
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  taggerOptions: TaggerOptions = TaggerOptions.createEmpty();
  embeddings: Embedding[];
  projectFields: ProjectField[];
  projectFacts: ProjectFact[];

  constructor(private dialogRef: MatDialogRef<CreateTaggerGroupDialogComponent>,
              private taggerService: TaggerService,
              private taggerGroupService: TaggerGroupService,
              private logService: LogService,
              private projectService: ProjectService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return forkJoin(
          {
            taggerOptions: this.taggerService.getTaggerOptions(currentProject.id),
            projectFields: this.projectService.getProjectFields(currentProject.id),
            embeddings: this.embeddingService.getEmbeddings(currentProject.id),
            projectFacts: this.projectService.getProjectFacts(currentProject.id)
          }); 
      } else {
        return of(null);
      }
    })).subscribe((resp: {
      taggerOptions: TaggerOptions | HttpErrorResponse,
      projectFields: ProjectField[] | HttpErrorResponse,
      embeddings: Embedding[] |  HttpErrorResponse,
      projectFacts: ProjectFact[] | HttpErrorResponse,
    }) => {
      if (resp) {
        if (!(resp.taggerOptions instanceof HttpErrorResponse)) {
          this.taggerOptions = resp.taggerOptions;
          this.setDefaultFormValues(this.taggerOptions);
        }
        if (!(resp.projectFacts instanceof HttpErrorResponse)) {
          this.projectFacts = resp.projectFacts;
        }
        if (!(resp.embeddings instanceof HttpErrorResponse)) {
          this.embeddings = resp.embeddings;
        }
        if (!(resp.projectFields instanceof HttpErrorResponse)) {
          this.projectFields = ProjectField.cleanProjectFields(resp.projectFields);
        }
      }
    });

  }


  onSubmit() {
    const formData = this.taggerGroupForm.value;
    const tagger_body = {
      fields: formData.taggerForm.fieldsFormControl,
      vectorizer: formData.taggerForm.vectorizerFormControl.value,
      classifier: formData.taggerForm.classifierFormControl.value,
      maximum_sample_size: formData.taggerForm.sampleSizeFormControl,
      negative_multiplier: formData.taggerForm.negativeMultiplierFormControl,
    }

    if (formData.taggerForm.embeddingFormControl) {
      tagger_body['embedding'] = formData.taggerForm.embeddingFormControl.id
    }

    const body = {
      description: formData.descriptionFormControl,
      fact_name: formData.factNameFormControl,
      minimum_sample_size: formData.taggerGroupSampleSizeFormControl,
      tagger: tagger_body
    };

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return this.taggerGroupService.createTaggerGroup(body, currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: TaggerGroup | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
        this.logService.snackBarError(resp, 4000);
      }
    });
  }

  setDefaultFormValues(options: TaggerOptions) {
    this.taggerGroupForm.get('taggerForm').get('vectorizerFormControl').setValue(options.actions.POST.vectorizer.choices[0]);
    this.taggerGroupForm.get('taggerForm').get('classifierFormControl').setValue(options.actions.POST.classifier.choices[0]);
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}
