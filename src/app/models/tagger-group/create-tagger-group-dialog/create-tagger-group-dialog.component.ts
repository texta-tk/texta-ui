import {AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../shared/types/Project';
import {filter, mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {LogService} from '../../../core/util/log.service';
import {TaggerOptions} from '../../../shared/types/tasks/TaggerOptions';
import {ErrorStateMatcher} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {EmbeddingsService} from '../../../core/models/embeddings/embeddings.service';
import {Embedding} from '../../../shared/types/tasks/Embedding';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import {BehaviorSubject, forkJoin, of, Subject} from 'rxjs';
import {TaggerGroupService} from '../../../core/models/taggers/tagger-group.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {MatSelect} from '@angular/material/select';
import {CoreService} from '../../../core/core.service';
import {Tagger, TaggerGroup} from '../../../shared/types/tasks/Tagger';

@Component({
  selector: 'app-create-tagger-group-dialog',
  templateUrl: './create-tagger-group-dialog.component.html',
  styleUrls: ['./create-tagger-group-dialog.component.scss']
})
export class CreateTaggerGroupDialogComponent implements OnInit, OnDestroy {


  taggerGroupForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl(this.data?.cloneTagger?.description || '', [
      Validators.required,
    ]),
    factNameFormControl: new UntypedFormControl(),
    taggerGroupMinSampleSizeFormControl: new UntypedFormControl(this.data?.cloneTagger?.minimum_sample_size || 50, [Validators.required]),
    taggerForm: new UntypedFormGroup({
      fieldsFormControl: new UntypedFormControl([], [Validators.required]),
      indicesFormControl: new UntypedFormControl([], [Validators.required]),
      stopWordsFormControl: new UntypedFormControl(''),
      embeddingFormControl: new UntypedFormControl(),
      snowballFormControl: new UntypedFormControl(),
      scoringFormControl: new UntypedFormControl(),
      analyzerFormControl: new UntypedFormControl([Validators.required]),
      vectorizerFormControl: new UntypedFormControl([Validators.required]),
      classifierFormControl: new UntypedFormControl([Validators.required]),
      sampleSizeFormControl: new UntypedFormControl(this.data?.cloneTagger?.tagger_params?.maximum_sample_size || 10000, [Validators.required]),
      negativeMultiplierFormControl: new UntypedFormControl(this.data?.cloneTagger?.tagger_params?.negative_multiplier || 1.0, [Validators.required]),
      ignoreNumbersFormControl: new UntypedFormControl(
        this.data?.cloneTagger?.tagger_params?.ignore_numbers !== undefined ? this.data.cloneTagger.tagger_params.ignore_numbers : true),
      detectLangFormControl: new UntypedFormControl(
        this.data?.cloneTagger?.tagger_params?.detect_lang !== undefined ? this.data?.cloneTagger?.tagger_params?.detect_lang : false),
      balanceFormControl: new UntypedFormControl({
        value: this.data?.cloneTagger?.tagger_params?.balance !== undefined ? this.data?.cloneTagger?.tagger_params?.balance : false,
        disabled: true
      }),
      maxBalanceFormControl: new UntypedFormControl({
        value: this.data?.cloneTagger?.tagger_params?.balance_to_max_limit !== undefined ? this.data?.cloneTagger?.tagger_params?.balance_to_max_limit : false,
        disabled: true
      }),
    })
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  // tslint:disable-next-line:no-any
  taggerGroupOptions: any;
  embeddings: Embedding[];
  projectFields: ProjectIndex[];
  projectFacts: BehaviorSubject<{ name: string, values: string[] }[]> = new BehaviorSubject<{ name: string, values: string[] }[]>([{name: 'Loading...', values: []}]);
  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];
  snowballLanguages: string[] = [];
  @ViewChild('indicesSelect') indicesSelect: MatSelect;

  constructor(private dialogRef: MatDialogRef<CreateTaggerGroupDialogComponent>,
              private taggerGroupService: TaggerGroupService,
              private logService: LogService,
              private projectService: ProjectService,
              private coreService: CoreService,
              @Inject(MAT_DIALOG_DATA) public data: { cloneTagger: TaggerGroup },
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  initFormControlListeners(): void {

    this.taggerGroupForm.get('taggerForm')?.get('balanceFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.taggerGroupForm.get('taggerForm')?.get('maxBalanceFormControl')?.enable({emitEvent: false});
      } else {
        this.taggerGroupForm.get('taggerForm')?.get('maxBalanceFormControl')?.disable({emitEvent: false});
        this.taggerGroupForm.get('taggerForm')?.get('maxBalanceFormControl')?.setValue(false, {emitEvent: false});
      }
    });

    this.taggerGroupForm.get('taggerForm')?.get('detectLangFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.taggerGroupForm.get('taggerForm')?.get('snowballFormControl')?.disable({emitEvent: false});
      } else {
        this.taggerGroupForm.get('taggerForm')?.get('snowballFormControl')?.enable({emitEvent: false});
      }
    });

    this.taggerGroupForm.get('taggerForm')?.get('snowballFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.taggerGroupForm.get('taggerForm')?.get('detectLangFormControl')?.disable({emitEvent: false});
      } else {
        this.taggerGroupForm.get('taggerForm')?.get('detectLangFormControl')?.enable({emitEvent: false});
      }
    });
    this.taggerGroupForm.get('factNameFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        if (this.taggerGroupForm.get('taggerForm')?.get('balanceFormControl')?.value) {
          this.taggerGroupForm.get('taggerForm')?.get('maxBalanceFormControl')?.enable({emitEvent: false});
        }
        this.taggerGroupForm.get('taggerForm')?.get('balanceFormControl')?.enable({emitEvent: false});
      } else {
        this.taggerGroupForm.get('taggerForm')?.get('maxBalanceFormControl')?.disable({emitEvent: false});
        this.taggerGroupForm.get('taggerForm')?.get('balanceFormControl')?.disable({emitEvent: false});
      }
    });
  }

  ngOnInit(): void {
    this.initFormControlListeners();
    this.projectFacts.pipe(filter(x => x[0]?.name !== 'Loading...'), take(1)).subscribe(facts => {
      if (facts && this.data?.cloneTagger?.fact_name) {
        const factNameForm = this.taggerGroupForm.get('factNameFormControl');
        factNameForm?.setValue(facts.find(x => x.name === this.data.cloneTagger.fact_name));
      }
    });

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin(
          {
            snowBallLanguages: this.coreService.getSnowballLanguages(),
            taggerOptions: this.taggerGroupService.getTaggerGroupOptions(currentProject.id),
            embeddings: this.embeddingService.getEmbeddings(currentProject.id),
            projectIndices: this.projectStore.getProjectIndices().pipe(take(1)), // take 1 to complete observable
          });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp) {
        if (!(resp.taggerOptions instanceof HttpErrorResponse)) {
          this.taggerGroupOptions = resp.taggerOptions;
          this.setDefaultFormValues(this.taggerGroupOptions);
        }
        if (!(resp.embeddings instanceof HttpErrorResponse)) {
          this.embeddings = resp.embeddings.results;
          if (this.data?.cloneTagger?.tagger_params?.embedding) {
            const foundEmbedding = this.embeddings.find(x => x.id === this.data.cloneTagger?.tagger_params?.embedding?.id);
            if (foundEmbedding) {
              this.taggerGroupForm.get('taggerForm')?.get('embeddingFormControl')?.setValue(foundEmbedding);
            }
          }
        }
        if (!(resp.snowBallLanguages instanceof HttpErrorResponse)) {
            this.snowballLanguages = resp.snowBallLanguages;
            if (this.data?.cloneTagger?.tagger_params?.snowball_language) {
              this.taggerGroupForm.get('taggerForm')?.get('snowballFormControl')?.setValue(this.data?.cloneTagger?.tagger_params?.snowball_language);
            }
          }

        if (resp?.projectIndices && !(resp.projectIndices instanceof HttpErrorResponse)) {
          this.projectIndices = resp.projectIndices;
          if (this.data.cloneTagger?.tagger_params?.fields && this.data.cloneTagger?.tagger_params?.indices) {
            const taggerForm = this.taggerGroupForm.get('taggerForm');
            const indexInstances = resp.projectIndices.filter(x => this.data.cloneTagger.tagger_params.indices?.some(y => y === x.index));
            const indicesForm = taggerForm?.get('indicesFormControl');
            indicesForm?.setValue(indexInstances);
            this.indicesOpenedChange(false); // refreshes the field and fact selection data
            const fieldsForm = taggerForm?.get('fieldsFormControl');
            fieldsForm?.setValue(this.data.cloneTagger.tagger_params.fields);
          }
        }
      }
    });
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices && !this.data.cloneTagger) {
        const indicesForm = this.taggerGroupForm.get('taggerForm')?.get('indicesFormControl');
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


  public indicesOpenedChange(opened: boolean): void {
    const indicesForm = this.taggerGroupForm.get('taggerForm')?.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(indicesForm.value, ['text'], []);
      this.getFactsForIndices(indicesForm?.value);
    }
  }

  getFactsForIndices(val: ProjectIndex[]): void {
    if (val.length > 0) {
      this.projectFacts.next([{name: 'Loading...', values: []}]);
      this.projectService.getProjectFacts(this.currentProject.id, val.map((x: ProjectIndex) => [{name: x.index}]).flat(), true, false).pipe(takeUntil(this.projectFacts)).subscribe(resp => {
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


  onSubmit(): void {
    const formData = this.taggerGroupForm.value;
    const taggerBody = {
      fields: formData.taggerForm.fieldsFormControl,
      indices: formData.taggerForm.indicesFormControl.map((x: ProjectIndex) => [{name: x.index}]).flat(),
      ...formData?.taggerForm?.snowballFormControl ? {snowball_language: formData.taggerForm.snowballFormControl} : {},
      scoring_function: formData.taggerForm.scoringFormControl.value,
      analyzer: formData.taggerForm.analyzerFormControl.value,
      vectorizer: formData.taggerForm.vectorizerFormControl.value,
      classifier: formData.taggerForm.classifierFormControl.value,
      maximum_sample_size: formData.taggerForm.sampleSizeFormControl,
      negative_multiplier: formData.taggerForm.negativeMultiplierFormControl,
      ignore_numbers: formData?.taggerForm?.ignoreNumbersFormControl,
      ...formData?.taggerForm?.embeddingFormControl?.id ? {embedding: formData.taggerForm.embeddingFormControl.id} : {},
      ...formData?.taggerForm?.detectLangFormControl ? {detect_lang: formData.taggerForm.detectLangFormControl} : {},
      ...formData?.taggerForm?.balanceFormControl ? {balance: formData.taggerForm.balanceFormControl} : {},
      ...formData?.taggerForm?.maxBalanceFormControl ? {balance_to_max_limit: formData.taggerForm.maxBalanceFormControl} : {},
      stop_words: formData?.taggerForm?.stopWordsFormControl.split('\n').filter((x: string) => !!x),
    };

    const body = {
      description: formData.descriptionFormControl,
      ...formData.factNameFormControl ? {fact_name: formData.factNameFormControl.name} : {},
      minimum_sample_size: formData.taggerGroupMinSampleSizeFormControl,
      tagger: taggerBody
    };
    if (this.currentProject) {
      this.taggerGroupService.createTaggerGroup(body, this.currentProject.id).subscribe(resp => {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 4000);
        } else if (resp) {
          this.dialogRef.close(resp);
        }
      });
    }
  }

  // tslint:disable-next-line:no-any
  setDefaultFormValues(options: any): void {
    const taggerForm = this.taggerGroupForm.get('taggerForm');

    if (taggerForm) {
      const analyzer = taggerForm.get('analyzerFormControl');
      if (this.data?.cloneTagger?.tagger_params?.analyzer && analyzer) {
        const analyzerVal = options.actions.POST.tagger.children.analyzer.choices.find(
          (x: { display_name: string | undefined; }) => x.display_name === this.data.cloneTagger.tagger_params.analyzer);
        analyzer.setValue(analyzerVal);
      } else if (analyzer) {
        analyzer.setValue(options.actions.POST.tagger.children.analyzer.choices[0]);
      }

      const vectorizer = taggerForm.get('vectorizerFormControl');
      if (vectorizer && this.data?.cloneTagger?.tagger_params?.vectorizer) {
        const vectorizerVal = options.actions.POST.tagger.children.vectorizer.choices.find(
          (x: { display_name: string; }) => x.display_name === this.data.cloneTagger.tagger_params.vectorizer);
        vectorizer.setValue(vectorizerVal);
      } else if (vectorizer) {
        vectorizer.setValue(options.actions.POST.tagger.children.vectorizer.choices[0]);
      }

      const classifier = taggerForm.get('classifierFormControl');
      if (classifier && this.data?.cloneTagger?.tagger_params?.classifier) {
        const classifierVal = options.actions.POST.tagger.children.classifier.choices.find(
          (x: { display_name: string; }) => x.display_name === this.data.cloneTagger.tagger_params.classifier);
        classifier.setValue(classifierVal);
      } else if (classifier) {
        classifier.setValue(options.actions.POST.tagger.children.classifier.choices[0]);
      }

      const scoringFunction = taggerForm.get('scoringFormControl');
      if (scoringFunction && this.data?.cloneTagger?.tagger_params?.scoring_function) {
        const scoringFunctionVal = options.actions.POST.tagger.children.scoring_function.choices.find(
          (x: { display_name: string | undefined; }) => x.display_name === this.data.cloneTagger.tagger_params.scoring_function);
        scoringFunction.setValue(scoringFunctionVal);
      } else if (scoringFunction) {
        scoringFunction.setValue(options.actions.POST.tagger.children.scoring_function.choices[0]);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
