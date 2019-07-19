import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {LiveErrorStateMatcher} from '../../shared/CustomerErrorStateMatchers';
import {ProjectService} from '../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectField} from '../../shared/types/ProjectField';
import {TaggerService} from '../../core/taggers/tagger.service';
import {ProjectStore} from '../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {merge, of} from 'rxjs';
import {TaggerOptions} from '../../shared/types/TaggerOptions';
import {LogService} from '../../core/util/log.service';
import {Embedding} from '../../shared/types/Embedding';
import {EmbeddingsService} from '../../core/embeddings/embeddings.service';
import {Tagger} from '../../shared/types/Tagger';

@Component({
  selector: 'app-create-tagger-dialog',
  templateUrl: './create-tagger-dialog.component.html',
  styleUrls: ['./create-tagger-dialog.component.scss']
})
export class CreateTaggerDialogComponent implements OnInit {

  taggerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
    fieldsFormControl: new FormControl([], [Validators.required]),
    embeddingFormControl: new FormControl(),
    vectorizerFormControl: new FormControl([Validators.required]),
    classifierFormControl: new FormControl([Validators.required]),
    featureSelectorFormControl: new FormControl([Validators.required]),
    sampleSizeFormControl: new FormControl(10000, [Validators.required]),
    negativeMultiplierFormControl: new FormControl(1.0, [Validators.required]),

  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  taggerOptions: TaggerOptions = TaggerOptions.createEmpty();
  embeddings: Embedding[];
  projectFields: ProjectField[];

  constructor(private dialogRef: MatDialogRef<CreateTaggerDialogComponent>,
              private taggerService: TaggerService,
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


  onSubmit(formData) {
    const body = {
      description: formData.descriptionFormControl,
      fields: formData.fieldsFormControl,
      embedding: (formData.embeddingFormControl as Embedding) ? (formData.embeddingFormControl as Embedding).id : null,
      vectorizer: formData.vectorizerFormControl.value,
      classifier: formData.classifierFormControl.value,
      feature_selector: formData.featureSelectorFormControl.value,
      maximum_sample_size: formData.sampleSizeFormControl,
      negative_multiplier: formData.negativeMultiplierFormControl

    };
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return this.taggerService.createTagger(body, currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: Tagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
  }

  setDefaultFormValues(options: TaggerOptions) {
    this.taggerForm.get('vectorizerFormControl').setValue(options.actions.POST.vectorizer.choices[0]);
    this.taggerForm.get('classifierFormControl').setValue(options.actions.POST.classifier.choices[0]);
    this.taggerForm.get('featureSelectorFormControl').setValue(options.actions.POST.feature_selector.choices[0]);
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}
