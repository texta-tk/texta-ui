import {ChangeDetectorRef, Component, DoCheck, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {debounceTime, mergeMap, switchMap, takeUntil} from 'rxjs/operators';
import {AbstractControl, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Project, ProjectFact, ProjectIndex} from '../../../shared/types/Project';
import {ProjectService} from '../../../core/projects/project.service';
import {EvaluatorService} from '../../../core/tools/evaluator/evaluator.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {MatSelectChange} from '@angular/material/select';
import {Choice} from '../../../shared/types/tasks/Embedding';
import {Evaluator} from '../../../shared/types/tasks/Evaluator';
import {CoreService} from '../../../core/core.service';

interface OnSubmitParams {
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  trueFactNameFormControl: string;
  trueFactValueFormControl: string;
  predictedFactNameFormControl: string;
  predictedFactValueFormControl: string;
  averageFunctionFormControl: string;
  addIndividualFormControl: boolean;
  esTimeoutFormControl: number;
  scrollSizeFormControl: number;
  addMisclassifiedFormControl: boolean;
  tokenBasedFormControl: boolean;
  fieldFormControl: string;
}

@Component({
  selector: 'app-create-evaluator-dialog',
  templateUrl: './create-evaluator-dialog.component.html',
  styleUrls: ['./create-evaluator-dialog.component.scss']
})
export class CreateEvaluatorDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  evaluatorForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl('', [Validators.required]),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    trueFactNameFormControl: new UntypedFormControl('', [Validators.required]),
    trueFactValueFormControl: new UntypedFormControl({value: '', disabled: true}),
    predictedFactNameFormControl: new UntypedFormControl([], [Validators.required]),
    predictedFactValueFormControl: new UntypedFormControl({value: '', disabled: true}),
    averageFunctionFormControl: new UntypedFormControl([]),
    addIndividualFormControl: new UntypedFormControl(true),
    addMisclassifiedFormControl: new UntypedFormControl(true),
    tokenBasedFormControl: new UntypedFormControl(true),
    fieldFormControl: new UntypedFormControl(''),
    esTimeoutFormControl: new UntypedFormControl(10),
    scrollSizeFormControl: new UntypedFormControl(500),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  projectFacts: string[] = [];
  isLoadingOptions = false;
  trueFactValueOptions: string[] = [];
  predictedFactValueOptions: string[] = [];
  averageFunctionOptions: Choice[] = [];
  // tslint:disable-next-line:no-any
  evaluatorOptions: any;

  trueFactNameDocPaths: string[] = [];
  predictedFactNameDocPaths: string[] = [];
  entityFieldDocPathOptions: string[] = [];

  constructor(private dialogRef: MatDialogRef<CreateEvaluatorDialogComponent>,
              private projectService: ProjectService,
              private chd: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public data: 'binary' | 'multilabel' | 'entity',
              private evaluatorService: EvaluatorService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    if (this.data === 'binary') {
      this.evaluatorForm.get('trueFactValueFormControl')?.setValidators([Validators.required]);
      this.evaluatorForm.get('predictedFactValueFormControl')?.setValidators([Validators.required]);
    }
    if (this.data === 'entity') {
      this.evaluatorForm.get('trueFactNameFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$), debounceTime(100), switchMap(val => {
        if (this.currentProject && val) {
          return this.projectService.elasticAggregateFacts(this.currentProject.id, {
            key_field: 'fact',
            value_field: 'doc_path',
            filter_by_key: val,
            indices: this.evaluatorForm.get('indicesFormControl')?.value?.map((x: ProjectIndex) => [{name: x.index}]).flat()

          });
        }
        return of(null);
      })).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.trueFactNameDocPaths = resp;
          this.setEntityFieldDocPathOptions();
        }
      });
      this.evaluatorForm.get('predictedFactNameFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$), debounceTime(100), switchMap(val => {
        if (this.currentProject && val && this.projectIndices) {
          return this.projectService.elasticAggregateFacts(this.currentProject.id, {
            key_field: 'fact',
            value_field: 'doc_path',
            filter_by_key: val,
            indices: this.evaluatorForm.get('indicesFormControl')?.value?.map((x: ProjectIndex) => [{name: x.index}]).flat()
          });
        }
        return of(null);
      })).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.predictedFactNameDocPaths = resp;
          this.setEntityFieldDocPathOptions();
        }
      });
    }

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return this.evaluatorService.evaluatorOptions(proj.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.evaluatorOptions = resp;
        this.averageFunctionOptions = resp.actions.POST.average_function.choices;
        this.evaluatorForm.get('averageFunctionFormControl')?.setValue(resp.actions.POST.average_function.default);
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices) {
        const indicesForm = this.evaluatorForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(currentProjIndices, ['text'], []);
        this.projectFacts = ['Loading...'];
        return this.projectService.getProjectFacts(this.currentProject.id, currentProjIndices.map(x => [{name: x.index}]).flat(), false, false);
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

    if (this.data === 'binary') {
      this.evaluatorForm.get('trueFactValueFormControl')?.valueChanges.pipe(
        takeUntil(this.destroyed$),
        debounceTime(100),
        switchMap(value => {
          if (value || value === '' && this.currentProject.id) {
            this.trueFactValueOptions = ['Loading...'];
            this.isLoadingOptions = true;
            return this.projectService.projectFactValueAutoComplete(this.currentProject.id,
              this.evaluatorForm.get('trueFactNameFormControl')?.value, 10, value,
              this.evaluatorForm.get('indicesFormControl')?.value.map((x: ProjectIndex) => x.index));
          }
          return of(null);
        })).subscribe(val => {
        if (val && !(val instanceof HttpErrorResponse)) {
          this.isLoadingOptions = false;
          this.trueFactValueOptions = val;
        }
      });

      this.evaluatorForm.get('predictedFactValueFormControl')?.valueChanges.pipe(
        takeUntil(this.destroyed$),
        debounceTime(100),
        switchMap(value => {
          if (value || value === '' && this.currentProject.id) {
            this.predictedFactValueOptions = ['Loading...'];
            this.isLoadingOptions = true;
            return this.projectService.projectFactValueAutoComplete(this.currentProject.id,
              this.evaluatorForm.get('predictedFactNameFormControl')?.value, 10, value,
              this.evaluatorForm.get('indicesFormControl')?.value.map((x: ProjectIndex) => x.index));
          }
          return of(null);
        })).subscribe(val => {
        if (val && !(val instanceof HttpErrorResponse)) {
          this.isLoadingOptions = false;
          this.predictedFactValueOptions = val;
        }
      });
    }
  }

  onSubmit(formData: OnSubmitParams): void {
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map((x: ProjectIndex) => [{name: x.index}]).flat(),
      ...this.query ? {query: this.query} : {},
      true_fact: formData.trueFactNameFormControl,
      predicted_fact: formData.predictedFactNameFormControl,
      ...this.data === 'binary' ? {true_fact_value: formData.trueFactValueFormControl} : {},
      ...this.data === 'binary' ? {predicted_fact_value: formData.predictedFactValueFormControl} : {},
      ...this.data === 'multilabel' ? {add_individual_results: formData.addIndividualFormControl} : {},
      ...this.data !== 'entity' ? {average_function: formData.averageFunctionFormControl} : {},
      ...this.data === 'entity' ? {add_misclassified_examples: formData.addMisclassifiedFormControl} : {},
      ...this.data === 'entity' ? {token_based: formData.tokenBasedFormControl} : {},
      ...this.data === 'entity' ? formData.fieldFormControl ? {field: formData.fieldFormControl} : {} : {},
      scroll_size: formData.scrollSizeFormControl,
      es_timeout: formData.esTimeoutFormControl,
      evaluation_type: this.data,
    };

    this.evaluatorService.createEvaluatorTask(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new task: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  getFactsForIndices(val: ProjectIndex[]): void {
    this.trueFactValueOptions = [];
    this.predictedFactValueOptions = [];
    this.trueFactNameDocPaths = [];
    this.predictedFactNameDocPaths = [];
    this.entityFieldDocPathOptions = [];
    this.evaluatorForm.get('predictedFactNameFormControl')?.setValue('', { emitEvent: false });
    this.evaluatorForm.get('trueFactNameFormControl')?.setValue('', { emitEvent: false });
    if (this.data === 'binary') {
      this.evaluatorForm.get('trueFactValueFormControl')?.setValue('', { emitEvent: false });
      this.evaluatorForm.get('predictedFactValueFormControl')?.setValue('', { emitEvent: false });
    }
    if (val.length > 0) {
      this.projectFacts = ['Loading...'];
      this.projectService.getProjectFacts(this.currentProject.id, val.map((x: ProjectIndex) => [{name: x.index}]).flat(), false, false).subscribe(resp => {
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

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.evaluatorForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.getFactsForIndices(indicesForm?.value);
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(indicesForm.value, ['text'], []);
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  factNameSelected($event: MatSelectChange, trueFactVal: AbstractControl | null): void {
    if (this.data === 'binary' && trueFactVal && $event) {
      trueFactVal.enable();
      trueFactVal.setValue('');
    }
  }

  setEntityFieldDocPathOptions(): void {
    this.entityFieldDocPathOptions = [];
    const fieldFormControl = this.evaluatorForm.get('fieldFormControl');
    fieldFormControl?.reset();
    fieldFormControl?.markAsTouched();
    this.trueFactNameDocPaths.forEach(x => {
      if (this.predictedFactNameDocPaths.includes(x)) {
        this.entityFieldDocPathOptions.push(x);
      }
    });
    if (this.entityFieldDocPathOptions.length === 1) {
      fieldFormControl?.setValue(this.entityFieldDocPathOptions[0]);
    }
  }
}
