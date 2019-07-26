import {Component, OnInit} from '@angular/core';
import {ProjectField} from '../../shared/types/ProjectField';
import {mergeMap, take} from 'rxjs/operators';
import {LogService} from '../../core/util/log.service';
import {TaggerOptions} from '../../shared/types/TaggerOptions';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ProjectService} from '../../core/projects/project.service';
import {ProjectStore} from '../../core/projects/project.store';
import {LiveErrorStateMatcher} from '../../shared/CustomerErrorStateMatchers';
import {EmbeddingsService} from '../../core/embeddings/embeddings.service';
import {Embedding} from '../../shared/types/Embedding';
import {TaggerService} from '../../core/taggers/tagger.service';
import {merge, of} from 'rxjs';
import {TaggerGroupService} from '../../core/taggers/tagger-group.service';

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
    factNameFormControl: new FormControl('TEEMA', Validators.required),
    taggerGroupSampleSizeFormControl: new FormControl(10000, [Validators.required]),
    taggerForm: new FormGroup({

      fieldsFormControl: new FormControl([], [Validators.required]),
      embeddingFormControl: new FormControl(),
      vectorizerFormControl: new FormControl([Validators.required]),
      classifierFormControl: new FormControl([Validators.required]),
      featureSelectorFormControl: new FormControl([Validators.required]),
      sampleSizeFormControl: new FormControl(10000, [Validators.required]),
      negativeMultiplierFormControl: new FormControl(1.0, [Validators.required]),

    })
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  taggerOptions: TaggerOptions = TaggerOptions.createEmpty();
  embeddings: Embedding[];
  projectFields: ProjectField[];

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
        return merge(
          this.taggerService.getTaggerOptions(currentProject.id),
          this.projectService.getProjectFields(currentProject.id),
          this.embeddingService.getEmbeddings(currentProject.id));
      } else {
        return of(null);
      }
    })).subscribe((resp: TaggerOptions | ProjectField[] | Embedding[] | HttpErrorResponse) => {
      if (resp) {
        if ((resp as TaggerOptions).actions !== undefined) {
          this.taggerOptions = resp as TaggerOptions;
          this.setDefaultFormValues(this.taggerOptions);
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else if (Embedding.isEmbedding(resp)) {
          this.embeddings = resp;
        } else if (ProjectField.isProjectFields(resp)) {
          this.projectFields = ProjectField.cleanProjectFields(resp);
        }
      }
    });

  }


  onSubmit() {
    console.log(this.taggerGroupForm.value);
    const formData = this.taggerGroupForm.value;
    const body = {
      description: formData.descriptionFormControl,
      fact_name: formData.factNameFormControl,
      minimum_sample_size: formData.taggerGroupSampleSizeFormControl,
      tagger: {
        embedding: formData.taggerForm.embeddingFormControl.id,
        fields: formData.taggerForm.fieldsFormControl,
        vectorizer: formData.taggerForm.vectorizerFormControl.value,
        classifier: formData.taggerForm.classifierFormControl.value,
        feature_selector: formData.taggerForm.featureSelectorFormControl.value,
        maximum_sample_size: formData.taggerForm.sampleSizeFormControl,
        negative_multiplier: formData.taggerForm.negativeMultiplierFormControl,
      }
    };
    console.log(body);
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return this.taggerGroupService.createTaggerGroup(body, currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: any | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
  }

  setDefaultFormValues(options: TaggerOptions) {
    this.taggerGroupForm.get('taggerForm').get('vectorizerFormControl').setValue(options.actions.POST.vectorizer.choices[0]);
    this.taggerGroupForm.get('taggerForm').get('classifierFormControl').setValue(options.actions.POST.classifier.choices[0]);
    this.taggerGroupForm.get('taggerForm').get('featureSelectorFormControl').setValue(options.actions.POST.feature_selector.choices[0]);
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}
