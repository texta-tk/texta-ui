import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {RakunExtractorService} from '../../../core/models/rakun-extractor/rakun-extractor.service';
import {EmbeddingsService} from '../../../core/models/embeddings/embeddings.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {RakunExtractor} from '../../../shared/types/tasks/RakunExtractor';
import {skip, switchMap, takeUntil} from 'rxjs/operators';
import {Project, ProjectIndex} from '../../../shared/types/Project';
import {forkJoin, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Choice, Embedding} from '../../../shared/types/tasks/Embedding';

interface OnSubmitParams {
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
  selector: 'app-edit-rakun-extractor-dialog',
  templateUrl: './edit-rakun-extractor-dialog.component.html',
  styleUrls: ['./edit-rakun-extractor-dialog.component.scss']
})
export class EditRakunExtractorDialogComponent implements OnInit, OnDestroy {
  rakunExtractorForm!: FormGroup;

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

  constructor(private dialogRef: MatDialogRef<EditRakunExtractorDialogComponent>,
              private projectService: ProjectService,
              private rakunExtractorService: RakunExtractorService,
              private embeddingService: EmbeddingsService,
              private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, element: RakunExtractor; },
              private projectStore: ProjectStore) {
    if (this.data) {
      this.rakunExtractorForm = new FormGroup({
        descriptionFormControl: new FormControl(this.data.element?.description || '', [Validators.required]),
        distanceMethodFormControl: new FormControl(''),
        distanceThresholdFormControl: new FormControl(this.data.element?.distance_threshold || 2, [Validators.min(0)]),
        numberOfKeywordsFormControl: new FormControl(this.data.element?.num_keywords || 25, [Validators.min(0)]),
        pairDiffLengthFormControl: new FormControl(this.data.element?.pair_diff_length || 2, [Validators.min(0)]),
        bigramCountThresholdFormControl: new FormControl(this.data.element?.bigram_count_threshold || 2, [Validators.min(0)]),
        minTokensFormControl: new FormControl(this.data.element?.min_tokens || 1, [Validators.min(1), Validators.max(3)]),
        maxTokensFormControl: new FormControl(this.data.element?.max_tokens || 1, [Validators.min(1), Validators.max(3)]),
        maxSimilarFormControl: new FormControl(this.data.element?.max_similar || 3, [Validators.min(0)]),
        maxOccurrenceFormControl: new FormControl(this.data.element?.max_occurrence || 3, [Validators.min(0)]),
        embeddingFormControl: new FormControl(),
      });
    }
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
        const elementDistanceMethod = this.distanceMethods.find(x => x.value === this.data.element.distance_method);
        if (elementDistanceMethod) {
          this.rakunExtractorForm.get('distanceMethodFormControl')?.setValue(elementDistanceMethod);
        }

      }
      if (resp?.embeddings && !(resp.embeddings instanceof HttpErrorResponse)) {
        this.fastTextEmbeddings = resp.embeddings.results.filter(x => x.embedding_type === 'FastTextEmbedding');
        const selectedFastText = this.fastTextEmbeddings.find(y => y.id === this.data.element?.fasttext_embedding?.id);
        if (selectedFastText) {
          this.rakunExtractorForm.get('embeddingFormControl')?.setValue(selectedFastText);
        } else {
          this.rakunExtractorForm.get('embeddingFormControl')?.setValue(this.fastTextEmbeddings[0]);
        }
      }
      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }


  onSubmit(formData: OnSubmitParams): void {
    if (this.data.element.id) {
      const body = {
        description: formData.descriptionFormControl,
        distance_method: formData.distanceMethodFormControl.value,
        distance_threshold: formData.distanceThresholdFormControl,
        num_keywords: formData.numberOfKeywordsFormControl,
        pair_diff_length: formData.pairDiffLengthFormControl,
        bigram_count_threshold: formData.bigramCountThresholdFormControl,
        min_tokens: formData.minTokensFormControl,
        max_tokens: formData.maxTokensFormControl,
        max_similar: formData.maxSimilarFormControl,
        max_occurrence: formData.maxOccurrenceFormControl,
        ...formData.distanceMethodFormControl.value === 'fasttext' ? {fasttext_embedding: formData.embeddingFormControl.id} : {},
      };

      this.rakunExtractorService.patchRakunExtractor(this.currentProject.id, this.data.element.id, body).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.logService.snackBarMessage(`Successfully edited task: ${this.data.element.description}`, 2000);
          this.dialogRef.close(resp);
        } else {
          this.logService.snackBarError(resp, 5000);
        }
      });
    }
  }
}
