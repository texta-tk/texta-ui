import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {ProjectService} from '../../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../shared/types/Project';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {filter, mergeMap, switchMap, take, takeUntil, takeWhile} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, merge, of, Subject} from 'rxjs';
import {Choice3, TaggerOptions} from '../../../shared/types/tasks/TaggerOptions';
import {LogService} from '../../../core/util/log.service';
import {Choice, Embedding} from '../../../shared/types/tasks/Embedding';
import {EmbeddingsService} from '../../../core/models/embeddings/embeddings.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {CoreService} from '../../../core/core.service';
import {Tagger} from '../../../shared/types/tasks/Tagger';

interface OnSubmitParams {
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  fieldsFormControl: string[];
  embeddingFormControl: Embedding;
  analyzerFormControl: Choice;
  vectorizerFormControl: Choice;
  classifierFormControl: Choice;
  stopWordsFormControl: string;
  sampleSizeFormControl: number;
  snowballFormControl: string;
  scoringFormControl: Choice;
  factNameFormControl: { name: string; values: string[] };
  ignoreNumbersFormControl: boolean;
  negativeMultiplierFormControl: number;
  detectLangFormControl: boolean;
  balanceFormControl: boolean;
  maxBalanceFormControl: boolean;
  posLabelFormControl: string;
  minSampleSizeFormControl: number;
}

@Component({
  selector: 'app-create-tagger-dialog',
  templateUrl: './create-tagger-dialog.component.html',
  styleUrls: ['./create-tagger-dialog.component.scss']
})
export class CreateTaggerDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.data?.cloneTagger?.query || this.defaultQuery;

  taggerForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl(this.data?.cloneTagger?.description || '', [
      Validators.required,
    ]),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    factNameFormControl: new UntypedFormControl(),
    fieldsFormControl: new UntypedFormControl([], [Validators.required]),
    embeddingFormControl: new UntypedFormControl(),
    snowballFormControl: new UntypedFormControl(),
    stopWordsFormControl: new UntypedFormControl(''),
    scoringFormControl: new UntypedFormControl(),
    analyzerFormControl: new UntypedFormControl([Validators.required]),
    vectorizerFormControl: new UntypedFormControl([Validators.required]),
    classifierFormControl: new UntypedFormControl([Validators.required]),
    sampleSizeFormControl: new UntypedFormControl(this.data?.cloneTagger?.maximum_sample_size || 10000, [Validators.required]),
    negativeMultiplierFormControl: new UntypedFormControl(this.data?.cloneTagger?.negative_multiplier || 1.0, [Validators.required]),
    minSampleSizeFormControl: new UntypedFormControl(this.data?.cloneTagger?.minimum_sample_size || 50),
    ignoreNumbersFormControl: new UntypedFormControl(this.data?.cloneTagger?.ignore_numbers !== undefined ? this.data?.cloneTagger?.ignore_numbers : true),
    detectLangFormControl: new UntypedFormControl(this.data?.cloneTagger?.detect_lang !== undefined ? this.data?.cloneTagger?.detect_lang : false),
    balanceFormControl: new UntypedFormControl({
      value: this.data?.cloneTagger?.balance !== undefined ? this.data?.cloneTagger?.balance : false,
      disabled: true
    }),
    maxBalanceFormControl: new UntypedFormControl({
      value: this.data?.cloneTagger?.balance_to_max_limit !== undefined ? this.data?.cloneTagger?.balance_to_max_limit : false,
      disabled: true
    }),
    posLabelFormControl: new UntypedFormControl(this.data?.cloneTagger?.pos_label || ''),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  taggerOptions: TaggerOptions | undefined;
  embeddings: Embedding[];
  projectFields: ProjectIndex[];
  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  projectIndices: ProjectIndex[] = [];
  projectFacts: BehaviorSubject<{ name: string, values: string[] }[]> = new BehaviorSubject<{ name: string, values: string[] }[]>([{name: 'Loading...', values: []}]);
  snowballLanguages: string[] = [];

  constructor(private dialogRef: MatDialogRef<CreateTaggerDialogComponent>,
              private taggerService: TaggerService,
              private logService: LogService,
              private projectService: ProjectService,
              private coreService: CoreService,
              @Inject(MAT_DIALOG_DATA) public data: { cloneTagger: Tagger },
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  initFormControlListeners(): void {

    this.taggerForm.get('balanceFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.taggerForm.get('maxBalanceFormControl')?.enable({emitEvent: false});
      } else {
        this.taggerForm.get('maxBalanceFormControl')?.disable({emitEvent: false});
        this.taggerForm.get('maxBalanceFormControl')?.setValue(false, {emitEvent: false});
      }
    });

    this.taggerForm.get('detectLangFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.taggerForm.get('snowballFormControl')?.disable({emitEvent: false});
      } else {
        this.taggerForm.get('snowballFormControl')?.enable({emitEvent: false});
      }
    });

    this.taggerForm.get('snowballFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.taggerForm.get('detectLangFormControl')?.disable({emitEvent: false});
      } else {
        this.taggerForm.get('detectLangFormControl')?.enable({emitEvent: false});
      }
    });
    this.taggerForm.get('factNameFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        if (this.taggerForm.get('balanceFormControl')?.value) {
          this.taggerForm.get('maxBalanceFormControl')?.enable({emitEvent: false});
        }
        this.taggerForm.get('balanceFormControl')?.enable({emitEvent: false});
      } else {
        this.taggerForm.get('maxBalanceFormControl')?.disable({emitEvent: false});
        this.taggerForm.get('balanceFormControl')?.disable({emitEvent: false});
      }
    });
  }

  ngOnInit(): void {
    this.initFormControlListeners();
    this.projectFacts.pipe(filter(x => x[0]?.name !== 'Loading...'), take(1)).subscribe(facts => {
      if (facts && this.data?.cloneTagger) {
        const factNameForm = this.taggerForm.get('factNameFormControl');
        factNameForm?.setValue(facts.find(x => x.name === this.data.cloneTagger.fact_name));
      }
    });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin({
          snowBallLanguages: this.coreService.getSnowballLanguages(),
          taggerOptions: this.taggerService.getTaggerOptions(currentProject.id),
          embeddings: this.embeddingService.getEmbeddings(currentProject.id),
          stopwords: this.data?.cloneTagger ? this.taggerService.getStopWords(currentProject.id, this.data.cloneTagger.id) : of(null),
          projectIndices: this.projectStore.getProjectIndices().pipe(take(1)), // take 1 to complete observable
        });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp?.taggerOptions && !(resp.taggerOptions instanceof HttpErrorResponse)) {
        this.taggerOptions = resp.taggerOptions;
        this.setDefaultFormValues(this.taggerOptions);
      }
      if (resp?.embeddings && !(resp.embeddings instanceof HttpErrorResponse)) {
        this.embeddings = resp.embeddings.results;
        if (this.data?.cloneTagger?.embedding) {
          const foundEmbedding = this.embeddings.find(x => x.id === this.data.cloneTagger.embedding);
          if (foundEmbedding) {
            this.taggerForm.get('embeddingFormControl')?.setValue(foundEmbedding);
          }
        }
      }
      if (resp?.snowBallLanguages && !(resp.snowBallLanguages instanceof HttpErrorResponse)) {
        this.snowballLanguages = resp.snowBallLanguages.sort();
        if (this.data?.cloneTagger?.snowball_language) {
          this.taggerForm.get('snowballFormControl')?.setValue(this.data?.cloneTagger?.snowball_language);
        }
      }
      if (resp?.projectIndices && !(resp.projectIndices instanceof HttpErrorResponse)) {
        this.projectIndices = resp.projectIndices;
        if (this.data.cloneTagger) {
          const indexInstances = resp.projectIndices.filter(x => this.data.cloneTagger.indices.some(y => y.name === x.index));
          const indicesForm = this.taggerForm.get('indicesFormControl');
          indicesForm?.setValue(indexInstances);
          this.indicesOpenedChange(false); // refreshes the field and fact selection data
          const fieldsForm = this.taggerForm.get('fieldsFormControl');
          fieldsForm?.setValue(this.data.cloneTagger.fields);

        }
      }
      if (resp?.stopwords && !(resp.stopwords instanceof HttpErrorResponse)) {
        this.taggerForm.get('stopWordsFormControl')?.setValue(resp.stopwords.stop_words.join('\n'));
      }

      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices && !this.data.cloneTagger) {// in case of cloning we set it already
        const indicesForm = this.taggerForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(currentProjIndices, ['text'], []);
        this.projectFacts.next([{name: 'Loading...', values: []}]);
        return this.projectService.getProjectFacts(this.currentProject.id, currentProjIndices.map(x => [{name: x.index}]).flat(), true, false);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectFacts.next(resp);
      } else if (resp) {
        this.logService.snackBarError(resp, 4000);
      }
    });
  }

  getFactsForIndices(val: ProjectIndex[]): void {
    if (val.length > 0) {
      this.projectFacts.next([{name: 'Loading...', values: []}]);
      this.projectService.getProjectFacts(this.currentProject.id, val.map((x: ProjectIndex) => [{name: x.index}]).flat(), true, false).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.projectFacts.next(resp);
        } else {
          this.logService.snackBarError(resp);
        }
      });
    } else {
      this.projectFacts.next([]);
    }
  }


  public indicesOpenedChange(opened: boolean): void {
    const indicesForm = this.taggerForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(indicesForm.value, ['text'], []);
      this.getFactsForIndices(indicesForm?.value);
    }
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  onSubmit(formData: OnSubmitParams): void {
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      fields: formData.fieldsFormControl,
      embedding: formData.embeddingFormControl ? formData.embeddingFormControl.id : null,
      ...formData.vectorizerFormControl ? {vectorizer: formData.vectorizerFormControl.value} : {},
      ...formData.classifierFormControl ? {classifier: formData.classifierFormControl.value} : {},
      stop_words: formData.stopWordsFormControl.split('\n').filter((x: string) => !!x),
      maximum_sample_size: formData.sampleSizeFormControl,
      ...formData.snowballFormControl ? {snowball_language: formData.snowballFormControl} : {},
      ...formData.scoringFormControl ? {scoring_function: formData.scoringFormControl.value} : {},
      ...formData.factNameFormControl ? {fact_name: formData.factNameFormControl.name} : {},
      ignore_numbers: formData.ignoreNumbersFormControl,
      analyzer: formData.analyzerFormControl.value,
      minimum_sample_size: formData.minSampleSizeFormControl,
      negative_multiplier: formData.negativeMultiplierFormControl,
      ...formData.detectLangFormControl ? {detect_lang: formData.detectLangFormControl} : {},
      ...formData.balanceFormControl ? {balance: formData.balanceFormControl} : {},
      ...formData.maxBalanceFormControl ? {balance_to_max_limit: formData.maxBalanceFormControl} : {},
      ...(formData.posLabelFormControl && formData.factNameFormControl.values.length === 2) ?
        {pos_label: formData.posLabelFormControl} : {},
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
        this.logService.snackBarError(resp);
      }
    });
  }

  setDefaultFormValues(options: TaggerOptions): void {
    const analyzer = this.taggerForm.get('analyzerFormControl');
    if (analyzer) {
      if (this.data?.cloneTagger?.analyzer) {
        const analyzerVal = options.actions.POST.analyzer.choices.find(x => x.display_name === this.data.cloneTagger.analyzer);
        analyzer.setValue(analyzerVal);
      } else {
        analyzer.setValue(options.actions.POST.analyzer.choices[0]);
      }
    }

    const vectorizer = this.taggerForm.get('vectorizerFormControl');
    if (vectorizer) {
      if (this.data?.cloneTagger?.vectorizer) {
        const vectorizerVal = options.actions.POST.vectorizer.choices.find(x => x.display_name === this.data.cloneTagger.vectorizer);
        vectorizer.setValue(vectorizerVal);
      } else {
        vectorizer.setValue(options.actions.POST.vectorizer.choices[0]);
      }
    }

    const classifier = this.taggerForm.get('classifierFormControl');
    if (classifier) {
      if (this.data?.cloneTagger?.classifier) {
        const classifierVal = options.actions.POST.classifier.choices.find(x => x.display_name === this.data.cloneTagger.classifier);
        classifier.setValue(classifierVal);
      } else {
        classifier.setValue(options.actions.POST.classifier.choices[0]);
      }
    }
    const scoringFunction = this.taggerForm.get('scoringFormControl');
    if (scoringFunction) {
      if (this.data?.cloneTagger?.scoring_function) {
        const scoringVal = options.actions.POST.scoring_function.choices.find(x => x.display_name === this.data.cloneTagger.scoring_function);
        scoringFunction.setValue(scoringVal);
      } else {
        scoringFunction.setValue(options.actions.POST.scoring_function.choices[0]);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
