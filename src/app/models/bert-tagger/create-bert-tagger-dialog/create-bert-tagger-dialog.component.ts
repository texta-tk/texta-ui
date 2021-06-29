import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {forkJoin, merge, of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../shared/types/Project';
import {ProjectService} from '../../../core/projects/project.service';
import {BertTaggerService} from '../../../core/models/taggers/bert-tagger/bert-tagger.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';

interface OnSubmitParams {
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  fieldsFormControl: Field[];
  factNameFormControl: string;
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
}

@Component({
  selector: 'app-create-bert-tagger-dialog',
  templateUrl: './create-bert-tagger-dialog.component.html',
  styleUrls: ['./create-bert-tagger-dialog.component.scss']
})
export class CreateBertTaggerDialogComponent implements OnInit, OnDestroy {

  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  bertTaggerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
    indicesFormControl: new FormControl([], [Validators.required]),
    fieldsFormControl: new FormControl([], [Validators.required]),
    factNameFormControl: new FormControl(),
    sampleSizeFormControl: new FormControl(10000, [Validators.required]),
    minSampleSizeFormControl: new FormControl(50, [Validators.required]),
    negativeMultiplierFormControl: new FormControl(1.0, [Validators.required]),
    maxLengthFormControl: new FormControl(64, [Validators.required]),
    bertModelFormControl: new FormControl([Validators.required]),

    balanceFormControl: new FormControl({value: false, disabled: true}),
    sentenceShuffleFormControl: new FormControl({value: false, disabled: true}),
    maxBalanceFormControl: new FormControl({value: false, disabled: true}),
    // advanced
    numEpochsFormControl: new FormControl(2, [Validators.required]),
    learningRateFormControl: new FormControl(2e-5, [Validators.required]),
    epsFormControl: new FormControl(1e-8, [Validators.required]),
    batchSizeFormControl: new FormControl(32, [Validators.required]),
    splitRatioFormControl: new FormControl(0.8, [Validators.required]),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  projectFacts: string[];
  bertModels: string[] = [];

  constructor(private dialogRef: MatDialogRef<CreateBertTaggerDialogComponent>,
              private projectService: ProjectService,
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
  }

  ngOnInit(): void {
    this.initFormControlListeners();

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin({
          options: this.bertTaggerService.getBertTaggerOptions(currentProject.id),
          models: this.bertTaggerService.getAvailableBertModels(currentProject.id)
        });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp?.options) {
        console.log(resp.options);
      }
      if (resp?.models && !(resp.models instanceof HttpErrorResponse)) {
        this.bertModels = resp.models;
        if (this.bertModels.includes('bert-base-multilingual-cased')) {
          this.bertTaggerForm.get('bertModelFormControl')?.setValue('bert-base-multilingual-cased');
        }
      }
    });

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices) {
        const indicesForm = this.bertTaggerForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(currentProjIndices, ['text'], []);
        this.projectFacts = ['Loading...'];
        return this.projectService.getProjectFacts(this.currentProject.id, currentProjIndices.map(x => [{name: x.index}]).flat());
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectFacts = resp;
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
      ...formData.factNameFormControl ? {fact_name: formData.factNameFormControl} : {},
      indices: formData.indicesFormControl.map((x: ProjectIndex) => [{name: x.index}]).flat(),
      bert_model: formData.bertModelFormControl,
      learning_rate: formData.learningRateFormControl,
      eps: formData.epsFormControl,
      max_length: formData.maxLengthFormControl,
      batch_size: formData.batchSizeFormControl,
      split_ratio: formData.splitRatioFormControl,
      negative_multiplier: formData.negativeMultiplierFormControl,
      ...formData.sentenceShuffleFormControl ? {use_sentence_shuffle: formData.sentenceShuffleFormControl} : {},
      ...formData.balanceFormControl ? {balance: formData.balanceFormControl} : {},
      ...formData.maxBalanceFormControl ? {balance_to_max_limit: formData.maxBalanceFormControl} : {},
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
      this.projectFacts = ['Loading...'];
      this.projectService.getProjectFacts(this.currentProject.id, val.map((x: ProjectIndex) => [{name: x.index}]).flat()).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.projectFacts = resp;
        } else {
          this.logService.snackBarError(resp);
        }
      });
    } else {
      this.projectFacts = [];
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
