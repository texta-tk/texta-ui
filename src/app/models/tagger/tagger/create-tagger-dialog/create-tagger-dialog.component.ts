import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {ProjectService} from '../../../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Field, Project, ProjectField} from '../../../../shared/types/Project';
import {TaggerService} from '../../../../core/models/taggers/tagger.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {mergeMap, take, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, merge, of, Subject} from 'rxjs';
import {TaggerOptions} from '../../../../shared/types/tasks/TaggerOptions';
import {LogService} from '../../../../core/util/log.service';
import {Embedding} from '../../../../shared/types/tasks/Embedding';
import {EmbeddingsService} from '../../../../core/models/embeddings/embeddings.service';
import {Tagger} from '../../../../shared/types/tasks/Tagger';
import {UtilityFunctions} from '../../../../shared/UtilityFunctions';

@Component({
  selector: 'app-create-tagger-dialog',
  templateUrl: './create-tagger-dialog.component.html',
  styleUrls: ['./create-tagger-dialog.component.scss']
})
export class CreateTaggerDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  taggerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
    fieldsFormControl: new FormControl([], [Validators.required]),
    embeddingFormControl: new FormControl(),
    vectorizerFormControl: new FormControl([Validators.required]),
    classifierFormControl: new FormControl([Validators.required]),
    sampleSizeFormControl: new FormControl(10000, [Validators.required]),
    negativeMultiplierFormControl: new FormControl(1.0, [Validators.required]),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  taggerOptions: TaggerOptions = TaggerOptions.createEmpty();
  embeddings: Embedding[];
  projectFields: ProjectField[];
  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  fieldsUnique: Field[] = [];

  constructor(private dialogRef: MatDialogRef<CreateTaggerDialogComponent>,
              private taggerService: TaggerService,
              private logService: LogService,
              private projectService: ProjectService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return merge(
          this.taggerService.getTaggerOptions(currentProject.id),
          this.embeddingService.getEmbeddings(currentProject.id));
      } else {
        return of(null);
      }
    })).subscribe((resp: TaggerOptions | { count: number, results: Embedding[] } | HttpErrorResponse | null) => {
      if (resp) {
        if (this.isTaggerOptions(resp)) {
          this.taggerOptions = resp as TaggerOptions;
          this.setDefaultFormValues(this.taggerOptions);
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else if (resp.results && Embedding.isEmbedding(resp.results)) {
          this.embeddings = resp.results;
        }
      }
    });
    this.projectStore.getCurrentProjectFields().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x) {
        this.projectFields = ProjectField.cleanProjectFields(x, ['text'], []);
        this.fieldsUnique = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(y => y.fields).flat(), (y => y.path));
      }
    });

  }

  isTaggerOptions(options): options is TaggerOptions {
    return (options as TaggerOptions).actions !== undefined;
  }

  onQueryChanged(query: string) {
    this.query = query ? query : this.defaultQuery;
  }

  onSubmit(formData) {
    const body: any = {
      description: formData.descriptionFormControl,
      fields: formData.fieldsFormControl,
      embedding: (formData.embeddingFormControl as Embedding) ? (formData.embeddingFormControl as Embedding).id : null,
      vectorizer: formData.vectorizerFormControl.value,
      classifier: formData.classifierFormControl.value,
      maximum_sample_size: formData.sampleSizeFormControl,
      negative_multiplier: formData.negativeMultiplierFormControl,
    };

    if (this.query) {
      body['query'] = this.query;
    }

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
    const vectorizer = this.taggerForm.get('vectorizerFormControl');
    if (vectorizer) {
      vectorizer.setValue(options.actions.POST.vectorizer.choices[0]);
    }
    const classifier = this.taggerForm.get('classifierFormControl');
    if (classifier) {
      classifier.setValue(options.actions.POST.classifier.choices[0]);
    }
  }


  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
