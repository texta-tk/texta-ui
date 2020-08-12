import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {ProjectService} from '../../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Field, Project, ProjectIndex} from '../../../shared/types/Project';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, take, takeUntil} from 'rxjs/operators';
import {merge, of, Subject} from 'rxjs';
import {TaggerOptions} from '../../../shared/types/tasks/TaggerOptions';
import {LogService} from '../../../core/util/log.service';
import {Embedding} from '../../../shared/types/tasks/Embedding';
import {EmbeddingsService} from '../../../core/models/embeddings/embeddings.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {ResultsWrapper} from '../../../shared/types/Generic';

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
    indicesFormControl: new FormControl([], [Validators.required]),
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
  projectFields: ProjectIndex[];
  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];

  constructor(private dialogRef: MatDialogRef<CreateTaggerDialogComponent>,
              private taggerService: TaggerService,
              private logService: LogService,
              private projectService: ProjectService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.taggerForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.getFieldsForIndices(currentProjIndices);
      }
    });

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return merge(
          this.taggerService.getTaggerOptions(currentProject.id),
          this.embeddingService.getEmbeddings(currentProject.id));
      } else {
        return of(null);
      }
    })).subscribe((resp: TaggerOptions | ResultsWrapper<Embedding> | HttpErrorResponse | null) => {
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
  }

  getFieldsForIndices(indices: ProjectIndex[]): void {
    this.projectFields = ProjectIndex.cleanProjectIndicesFields(indices, ['text'], []);
    this.fieldsUnique = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(y => y.fields).flat(), (y => y.path));
  }

  public indicesOpenedChange(opened: boolean): void {
    const indicesForm = this.taggerForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (indicesForm?.value && indicesForm.value.length > 0)) {
      this.getFieldsForIndices(indicesForm?.value);
    }
  }

  isTaggerOptions(options: TaggerOptions | ResultsWrapper<Embedding> | HttpErrorResponse): options is TaggerOptions {
    return (options as TaggerOptions).actions !== undefined;
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  // tslint:disable-next-line:no-any
  onSubmit(formData: any): void {
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map((x: ProjectIndex) => [{name: x.index}]).flat(),
      fields: formData.fieldsFormControl,
      embedding: (formData.embeddingFormControl as Embedding) ? (formData.embeddingFormControl as Embedding).id : null,
      vectorizer: formData.vectorizerFormControl.value,
      classifier: formData.classifierFormControl.value,
      maximum_sample_size: formData.sampleSizeFormControl,
      negative_multiplier: formData.negativeMultiplierFormControl,
      ...this.query ? {query: this.query} : {},
    };

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return this.taggerService.createTagger(body, currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
  }

  setDefaultFormValues(options: TaggerOptions): void {
    const vectorizer = this.taggerForm.get('vectorizerFormControl');
    if (vectorizer) {
      vectorizer.setValue(options.actions.POST.vectorizer.choices[0]);
    }
    const classifier = this.taggerForm.get('classifierFormControl');
    if (classifier) {
      classifier.setValue(options.actions.POST.classifier.choices[0]);
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
