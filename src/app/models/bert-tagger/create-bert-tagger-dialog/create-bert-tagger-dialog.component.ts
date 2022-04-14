import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {forkJoin, merge, of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {filter, mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../shared/types/Project';
import {ProjectService} from '../../../core/projects/project.service';
import {BertTaggerService} from '../../../core/models/taggers/bert-tagger/bert-tagger.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {BertTagger} from '../../../shared/types/tasks/BertTagger';

interface OnSubmitParams {
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  fieldsFormControl: Field[];
  factNameFormControl: { name: string, values: string[] };
  sampleSizeFormControl: number;
  minSampleSizeFormControl: number;
  negativeMultiplierFormControl: number;
  maxLengthFormControl: number;
  bertModelFormControl: string;
  numEpochsFormControl: number;
  learningRateFormControl: number;
  epsFormControl: number;
  batchSizeFormControl: number;
  splitRatioFormControl: number;
  balanceFormControl: boolean;
  sentenceShuffleFormControl: boolean;
  maxBalanceFormControl: boolean;
  posLabelFormControl: string;
  useGpuFormControl: boolean;
  checkPointModelFormControl: BertTagger;
}

@Component({
  selector: 'app-create-bert-tagger-dialog',
  templateUrl: './create-bert-tagger-dialog.component.html',
  styleUrls: ['./create-bert-tagger-dialog.component.scss']
})
export class CreateBertTaggerDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.data?.cloneElement?.query || this.defaultQuery;

  bertTaggerForm = new FormGroup({
    descriptionFormControl: new FormControl(this.data?.cloneElement?.description || '', [
      Validators.required,
    ]),
    indicesFormControl: new FormControl([], [Validators.required]),
    fieldsFormControl: new FormControl([], [Validators.required]),
    factNameFormControl: new FormControl(),
    sampleSizeFormControl: new FormControl(this.data?.cloneElement?.maximum_sample_size || 10000, [Validators.required]),
    minSampleSizeFormControl: new FormControl(this.data?.cloneElement?.minimum_sample_size || 50, [Validators.required]),
    negativeMultiplierFormControl: new FormControl(this.data?.cloneElement?.negative_multiplier || 1.0, [Validators.required]),
    maxLengthFormControl: new FormControl(this.data?.cloneElement?.max_length || 64, [Validators.required]),
    bertModelFormControl: new FormControl([Validators.required]),


    balanceFormControl: new FormControl({
      value: this.data?.cloneElement?.balance !== undefined ? this.data?.cloneElement?.balance : false,
      disabled: true
    }),
    sentenceShuffleFormControl: new FormControl({
      value: this.data?.cloneElement?.use_sentence_shuffle !== undefined ? this.data?.cloneElement?.use_sentence_shuffle : false,
      disabled: true
    }),
    maxBalanceFormControl: new FormControl({
      value: this.data?.cloneElement?.balance_to_max_limit !== undefined ? this.data?.cloneElement?.balance_to_max_limit : false,
      disabled: true
    }),
    useGpuFormControl: new FormControl(this.data?.cloneElement?.use_gpu !== undefined ? this.data?.cloneElement?.use_gpu : true),
    // advanced
    numEpochsFormControl: new FormControl(this.data?.cloneElement?.num_epochs || 2, [Validators.required]),
    posLabelFormControl: new FormControl(this.data?.cloneElement?.pos_label || ''),
    learningRateFormControl: new FormControl(this.data?.cloneElement?.learning_rate || 2e-5, [Validators.required]),
    epsFormControl: new FormControl(this.data?.cloneElement?.eps || 1e-8, [Validators.required]),
    batchSizeFormControl: new FormControl(this.data?.cloneElement?.batch_size || 32, [Validators.required]),
    splitRatioFormControl: new FormControl(this.data?.cloneElement?.split_ratio || 0.8, [Validators.required]),
    checkPointModelFormControl: new FormControl(),

  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  projectFacts: Subject<{ name: string, values: string[] }[]> = new Subject();
  bertModels: string[] = [];
  trainedModels: BertTagger[] = [];
  // tslint:disable-next-line:no-any
  bertOptions: any;

  constructor(private dialogRef: MatDialogRef<CreateBertTaggerDialogComponent>,
              private projectService: ProjectService,
              @Inject(MAT_DIALOG_DATA) public data: { cloneElement: BertTagger },
              private bertTaggerService: BertTaggerService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  initFormControlListeners(): void {

    this.bertTaggerForm.get('balanceFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.bertTaggerForm.get('maxBalanceFormControl')?.enable({emitEvent: false});
        this.bertTaggerForm.get('sentenceShuffleFormControl')?.enable({emitEvent: false});
      } else {
        this.bertTaggerForm.get('maxBalanceFormControl')?.disable({emitEvent: false});
        this.bertTaggerForm.get('sentenceShuffleFormControl')?.disable({emitEvent: false});
        this.bertTaggerForm.get('maxBalanceFormControl')?.setValue(false, {emitEvent: false});
        this.bertTaggerForm.get('sentenceShuffleFormControl')?.setValue(false, {emitEvent: false});
      }
    });
    this.bertTaggerForm.get('factNameFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        if (this.bertTaggerForm.get('balanceFormControl')?.value) {
          this.bertTaggerForm.get('maxBalanceFormControl')?.enable({emitEvent: false});
          this.bertTaggerForm.get('sentenceShuffleFormControl')?.enable({emitEvent: false});
        }
        this.bertTaggerForm.get('balanceFormControl')?.enable({emitEvent: false});
      } else {
        this.bertTaggerForm.get('maxBalanceFormControl')?.disable({emitEvent: false});
        this.bertTaggerForm.get('balanceFormControl')?.disable({emitEvent: false});
        this.bertTaggerForm.get('sentenceShuffleFormControl')?.disable({emitEvent: false});
      }
    });

    this.bertTaggerForm.get('checkPointModelFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((val: BertTagger) => {
      const ctrl = this.bertTaggerForm.get('bertModelFormControl');
      if (val) {
        ctrl?.setValue(val.bert_model);
        ctrl?.disable();
      } else {
        ctrl?.enable();
      }
    });
  }

  ngOnInit(): void {
    this.initFormControlListeners();
    this.projectFacts.pipe(filter(x => x[0]?.name !== 'Loading...'), take(1)).subscribe(facts => {
      if (facts && this.data?.cloneElement) {
        const factNameForm = this.bertTaggerForm.get('factNameFormControl');
        factNameForm?.setValue(facts.find(x => x.name === this.data.cloneElement.fact_name));
      }
    });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin({
          options: this.bertTaggerService.getBertTaggerOptions(currentProject.id),
          models: this.bertTaggerService.getAvailableBertModels(currentProject.id),
          trainedModels: this.bertTaggerService.getBertTaggerTasks(currentProject.id),
          projectIndices: this.projectStore.getProjectIndices().pipe(take(1)),
        });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp?.options && !(resp.options instanceof HttpErrorResponse)) {
        this.bertOptions = resp.options;
      }
      if (resp?.models && !(resp.models instanceof HttpErrorResponse)) {
        this.bertModels = resp.models;

        const bertModelForm = this.bertTaggerForm.get('bertModelFormControl');
        if (bertModelForm && this.data?.cloneElement) {
          if (this.data?.cloneElement?.checkpoint_model && !(resp.trainedModels instanceof HttpErrorResponse)) {
            // @ts-ignore
            const bertModel = resp.trainedModels.results.find(x => x.id === this.data.cloneElement.checkpoint_model);
            this.bertTaggerForm.get('checkPointModelFormControl')?.setValue(bertModel);
          } else if (this.data?.cloneElement?.bert_model) {
            // @ts-ignore
            const bertModel = resp.models.find(x => x === this.data.cloneElement.bert_model);
            bertModelForm.setValue(bertModel);
          }
        } else if (this.bertModels.includes('bert-base-multilingual-cased')) {
          this.bertTaggerForm.get('bertModelFormControl')?.setValue('bert-base-multilingual-cased');
        }
      }
      if (resp?.trainedModels && !(resp.trainedModels instanceof HttpErrorResponse)) {
        this.trainedModels = resp.trainedModels.results;
      }

      if (resp?.projectIndices && !(resp.projectIndices instanceof HttpErrorResponse)) {
        this.projectIndices = resp.projectIndices;
        if (this.data.cloneElement) {
          const indexInstances = resp.projectIndices.filter(x => this.data.cloneElement.indices.some(y => y.name === x.index));
          const indicesForm = this.bertTaggerForm.get('indicesFormControl');
          indicesForm?.setValue(indexInstances);
          this.indicesOpenedChange(false); // refreshes the field and fact selection data
          const fieldsForm = this.bertTaggerForm.get('fieldsFormControl');
          fieldsForm?.setValue(this.data.cloneElement.fields);
        }
      }
      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices && !this.data.cloneElement) {
        const indicesForm = this.bertTaggerForm.get('indicesFormControl');
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

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  onSubmit(formData: OnSubmitParams): void {
    const body = {
      description: formData.descriptionFormControl,
      fields: formData.fieldsFormControl,
      maximum_sample_size: formData.sampleSizeFormControl,
      minimum_sample_size: formData.minSampleSizeFormControl,
      num_epochs: formData.numEpochsFormControl,
      ...formData.factNameFormControl ? {fact_name: formData.factNameFormControl.name} : {},
      indices: formData.indicesFormControl.map((x: ProjectIndex) => [{name: x.index}]).flat(),
      ...(formData.bertModelFormControl && !formData.checkPointModelFormControl) ? {bert_model: formData.bertModelFormControl} : {},
      learning_rate: formData.learningRateFormControl,
      eps: formData.epsFormControl,
      max_length: formData.maxLengthFormControl,
      batch_size: formData.batchSizeFormControl,
      split_ratio: formData.splitRatioFormControl,
      negative_multiplier: formData.negativeMultiplierFormControl,
      use_gpu: formData.useGpuFormControl,
      ...formData.sentenceShuffleFormControl ? {use_sentence_shuffle: formData.sentenceShuffleFormControl} : {},
      ...formData.balanceFormControl ? {balance: formData.balanceFormControl} : {},
      ...formData.maxBalanceFormControl ? {balance_to_max_limit: formData.maxBalanceFormControl} : {},
      ...(formData.posLabelFormControl && formData.factNameFormControl.values.length === 2) ?
        {pos_label: formData.posLabelFormControl} : {},
      ...formData.checkPointModelFormControl ? {
        checkpoint_model: formData.checkPointModelFormControl.id,
        bert_model: formData.checkPointModelFormControl.bert_model
      } : {},
      ...this.query ? {query: this.query} : {},
    };
    this.bertTaggerService.createBertTaggerTask(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new task: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }


  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.bertTaggerForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(indicesForm.value, ['text'], []);
      this.getFactsForIndices(indicesForm?.value);
    }
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

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
