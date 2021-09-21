import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {forkJoin, of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {mergeMap, skip, switchMap, take, takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Project, ProjectIndex} from '../../../shared/types/Project';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {RakunExtractorService} from '../../../core/models/rakun-extractor/rakun-extractor.service';
import {LogService} from '../../../core/util/log.service';
import {EmbeddingsService} from '../../../core/models/embeddings/embeddings.service';
import {Choice, Embedding} from '../../../shared/types/tasks/Embedding';
interface OnSubmitParams{
  descriptionFormControl: string;
  distanceMethodFormControl: Choice;
  distanceThresholdFormControl: number;
  numberOfKeywordsFormControl: number;
  pairDiffLengthFormControl: number;
  stopWordsFormControl: string;
  bigramCountThresholdFormControl: number;
  minTokensFormControl: number;
  maxTokensFormControl: number;
  maxSimilarFormControl: number;
  maxOccurrenceFormControl: number;
  embeddingFormControl: Embedding;
}
@Component({
  selector: 'app-create-rakun-extractor-dialog',
  templateUrl: './create-rakun-extractor-dialog.component.html',
  styleUrls: ['./create-rakun-extractor-dialog.component.scss']
})
export class CreateRakunExtractorDialogComponent implements OnInit, OnDestroy {

  rakunExtractorForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    distanceMethodFormControl: new FormControl(''),
    distanceThresholdFormControl: new FormControl(2, [Validators.min(0)]),
    numberOfKeywordsFormControl: new FormControl(25, [Validators.min(0)]),
    pairDiffLengthFormControl: new FormControl(2, [Validators.min(0)]),
    stopWordsFormControl: new FormControl(''),
    bigramCountThresholdFormControl: new FormControl(2, [Validators.min(0)]),
    minTokensFormControl: new FormControl(1, [Validators.min(1), Validators.max(3)]),
    maxTokensFormControl: new FormControl(1, [Validators.min(1), Validators.max(3)]),
    maxSimilarFormControl: new FormControl(3, [Validators.min(0)]),
    maxOccurrenceFormControl: new FormControl(3, [Validators.min(0)]),
    embeddingFormControl: new FormControl(),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  // tslint:disable-next-line:no-any
  rakunOptions: any;
  fastTextEmbeddings: Embedding[] = [];
  embeddings: Embedding[];
  distanceMethods: Choice[] = [];

  constructor(private dialogRef: MatDialogRef<CreateRakunExtractorDialogComponent>,
              private projectService: ProjectService,
              private rakunExtractorService: RakunExtractorService,
              private embeddingService: EmbeddingsService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.rakunExtractorForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(currentProjIndices, ['text'], []);
      }
    });
    this.rakunExtractorForm.get('distanceMethodFormControl')?.valueChanges.pipe(skip(1), takeUntil(this.destroyed$)).subscribe(val => {
      if (val.value === 'fasttext') {
        // fastText ranges 0-1
        this.rakunExtractorForm.get('distanceThresholdFormControl')?.setValue(1);

        if (this.fastTextEmbeddings.length === 0) {
          this.rakunExtractorForm.get('distanceMethodFormControl')?.setErrors({noEmbeddings: true});
        }
      } else {
        // editdistance threshold is integer
        this.rakunExtractorForm.get('distanceThresholdFormControl')?.setValue(2);

        this.rakunExtractorForm.get('distanceMethodFormControl')?.setErrors(null);
      }
    });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin({
          rakunOptions: this.rakunExtractorService.getRakunExtractorOptions(currentProject.id),
          embeddings: this.embeddingService.getEmbeddings(currentProject.id),
        });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp?.rakunOptions && !(resp.rakunOptions instanceof HttpErrorResponse)) {
        this.rakunOptions = resp.rakunOptions;
        this.distanceMethods = this.rakunOptions?.actions?.POST?.distance_method?.choices || [];
        this.setDefaultFormValues(this.rakunOptions);
      }
      if (resp?.embeddings && !(resp.embeddings instanceof HttpErrorResponse)) {
        this.fastTextEmbeddings = resp.embeddings.results.filter(x => x.embedding_type === 'FastTextEmbedding');
        this.rakunExtractorForm.get('embeddingFormControl')?.setValue(this.fastTextEmbeddings[0]);
      }
      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError);
    });
  }

  onSubmit(formData: OnSubmitParams): void {
    const body = {
      description: formData.descriptionFormControl,
      distance_method: formData.distanceMethodFormControl.value,
      distance_threshold: formData.distanceThresholdFormControl,
      num_keywords: formData.numberOfKeywordsFormControl,
      pair_diff_length: formData.pairDiffLengthFormControl,
      stopwords: formData.stopWordsFormControl.split('\n').filter((x: string) => !!x),
      bigram_count_threshold: formData.bigramCountThresholdFormControl,
      min_tokens: formData.minTokensFormControl,
      max_tokens: formData.maxTokensFormControl,
      max_similar: formData.maxSimilarFormControl,
      max_occurrence: formData.maxOccurrenceFormControl,
      ...formData.distanceMethodFormControl.value === 'fasttext' ? {fasttext_embedding: formData.embeddingFormControl.id} : {},
    };

    this.rakunExtractorService.createRakunExtractorTask(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new task: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  // tslint:disable-next-line:no-any
  private setDefaultFormValues(rakunOptions: any): void {
    const distanceMethod = this.rakunExtractorForm.get('distanceMethodFormControl');
    if (distanceMethod) {
      distanceMethod.setValue(rakunOptions.actions.POST.distance_method.choices[0]);
    }
  }
}
