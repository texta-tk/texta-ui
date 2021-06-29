import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {debounceTime, mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../shared/types/Project';
import {ProjectService} from '../../../core/projects/project.service';
import {IndexSplitterService} from '../../../core/tools/index-splitter/index-splitter.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {IndexSplitterOptions} from '../../../shared/types/tasks/IndexSplitter';
import {MatSelectChange} from "@angular/material/select";

interface OnSubmitParams {
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  fieldsFormControl: Field[];
  scrollSizeFormControl: number;
  trainIndexFormControl: string;
  testIndexFormControl: string;
  testSizeIndexFormControl: number;
  factFormControl: string;
  strValFormControl: string;
  distributionFormControl: { value: string, display_name: string };
  customDistributionFormControl: string;
}

@Component({
  selector: 'app-create-index-splitter-dialog',
  templateUrl: './create-index-splitter-dialog.component.html',
  styleUrls: ['./create-index-splitter-dialog.component.scss']
})
export class CreateIndexSplitterDialogComponent implements OnInit, OnDestroy {

  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  indexSplitterForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    indicesFormControl: new FormControl([], [Validators.required]),
    fieldsFormControl: new FormControl([]),
    scrollSizeFormControl: new FormControl(500, [Validators.required]),
    trainIndexFormControl: new FormControl('', [Validators.required]),
    testIndexFormControl: new FormControl('', [Validators.required]),
    testSizeIndexFormControl: new FormControl(20, [Validators.required]),
    factFormControl: new FormControl(''),
    strValFormControl: new FormControl({value: '', disabled: true}),
    distributionFormControl: new FormControl(''),
    customDistributionFormControl: new FormControl(''),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  projectFacts: string[] = [];
  indexSplitterOptions: IndexSplitterOptions;
  isLoadingOptions = false;
  factValOptions: string[] = [];

  constructor(private dialogRef: MatDialogRef<CreateIndexSplitterDialogComponent>,
              private projectService: ProjectService,
              private indexSplitterService: IndexSplitterService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return this.indexSplitterService.getIndexSplitterOptions(proj.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.indexSplitterOptions = resp;
        const distributionType = this.indexSplitterForm.get('distributionFormControl');
        if (distributionType) {
          distributionType.setValue(resp.actions.POST.distribution.choices[0]);
        }
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });


    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices) {
        this.projectFacts = ['Loading...'];
        const indicesForm = this.indexSplitterForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(currentProjIndices, ['text'], []);
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

    this.indexSplitterForm.get('strValFormControl')?.valueChanges.pipe(
      takeUntil(this.destroyed$),
      debounceTime(100),
      switchMap(value => {
        if (value || value === '' && this.currentProject.id) {
          this.factValOptions = ['Loading...'];
          this.isLoadingOptions = true;
          return this.projectService.projectFactValueAutoComplete(this.currentProject.id,
            this.indexSplitterForm.get('factFormControl')?.value, 10, value,
            this.indexSplitterForm.get('indicesFormControl')?.value.map((x: ProjectIndex) => x.index));
        }
        return of(null);
      })).subscribe(val => {
      if (val && !(val instanceof HttpErrorResponse)) {
        this.isLoadingOptions = false;
        this.factValOptions = val;
      }
    });

  }

  onSubmit(formData: OnSubmitParams): void {
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      fields: formData.fieldsFormControl,
      scroll_size: formData.scrollSizeFormControl,
      train_index: formData.trainIndexFormControl,
      test_index: formData.testIndexFormControl,
      test_size: formData.testSizeIndexFormControl,
      ...formData.factFormControl ? {fact: formData.factFormControl} : {},
      ...formData.strValFormControl ? {str_val: formData.strValFormControl} : {},
      distribution: formData.distributionFormControl.value,
      custom_distribution: formData.customDistributionFormControl,
      ...this.query ? {query: this.query} : {},
    };

    this.indexSplitterService.createIndexSplitterTask(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new task: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else {
        if (resp.error.test_index) {
          this.logService.snackBarMessage('This Test index name already exists!', 5000);
        } else if (resp.error.train_index) {
          this.logService.snackBarMessage('This Train index name already exists!', 5000);
        } else {
          this.logService.snackBarError(resp);
        }
      }
    });
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }


  getFactsForIndices(val: ProjectIndex[]): void {
    this.factValOptions = [];
    if (val.length > 0 && this.currentProject.id) {
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

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.indexSplitterForm.get('indicesFormControl');
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
    if (trueFactVal && $event) {
      trueFactVal.enable();
      trueFactVal.setValue('');
    }
  }
}
