import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject, forkJoin, of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {debounceTime, filter, mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {AbstractControl, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../shared/types/Project';
import {ProjectService} from '../../../core/projects/project.service';
import {IndexSplitterService} from '../../../core/tools/index-splitter/index-splitter.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {IndexSplitter, IndexSplitterOptions} from '../../../shared/types/tasks/IndexSplitter';
import {MatSelectChange} from '@angular/material/select';

interface OnSubmitParams {
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  fieldsFormControl: Field[];
  scrollSizeFormControl: number;
  trainIndexFormControl: string;
  testIndexFormControl: string;
  testSizeIndexFormControl: number;
  factFormControl: { name: string; values: string[] };
  strValFormControl: string;
  distributionFormControl: { value: string, display_name: string };
}

@Component({
  selector: 'app-create-index-splitter-dialog',
  templateUrl: './create-index-splitter-dialog.component.html',
  styleUrls: ['./create-index-splitter-dialog.component.scss']
})
export class CreateIndexSplitterDialogComponent implements OnInit, OnDestroy {
  @ViewChild('content') content: ElementRef;
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.data?.cloneIndexSplitter?.query || this.defaultQuery;

  indexSplitterForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl(this.data?.cloneIndexSplitter?.description || '', [Validators.required]),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    fieldsFormControl: new UntypedFormControl([]),
    scrollSizeFormControl: new UntypedFormControl(this.data?.cloneIndexSplitter?.scroll_size || 500, [Validators.required]),
    trainIndexFormControl: new UntypedFormControl(this.data?.cloneIndexSplitter?.train_index || '', [Validators.required]),
    testIndexFormControl: new UntypedFormControl(this.data?.cloneIndexSplitter?.test_index || '', [Validators.required]),
    testSizeIndexFormControl: new UntypedFormControl(this.data?.cloneIndexSplitter?.test_size || 20, [Validators.required]),
    factFormControl: new UntypedFormControl(''),
    strValFormControl: new UntypedFormControl({value: '', disabled: true}),
    distributionFormControl: new UntypedFormControl(''),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  projectFacts: BehaviorSubject<{ name: string, values: string[] }[]> = new BehaviorSubject<{ name: string, values: string[] }[]>([{
    name: 'Loading...',
    values: []
  }]);
  indexSplitterOptions: IndexSplitterOptions | undefined;
  isLoadingOptions = false;
  factValOptions: string[] = [];
  createRequestInProgress = false;

  customDistributionList: { key: string, value: number | string }[] = this.initCustomDistribution(this.data.cloneIndexSplitter);

  private initCustomDistribution(data: IndexSplitter): { key: string, value: number | string }[] {
    if (data) {
      return Object.keys(data.custom_distribution).map(x => ({key: x, value: data.custom_distribution[x]}));
    }
    return [{key: 'Label1', value: 5}];
  }

  constructor(private dialogRef: MatDialogRef<CreateIndexSplitterDialogComponent>,
              private projectService: ProjectService,
              private indexSplitterService: IndexSplitterService,
              private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { cloneIndexSplitter: IndexSplitter },
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectFacts.pipe(filter(x => x[0]?.name !== 'Loading...'), take(1)).subscribe(facts => {
      if (facts && this.data?.cloneIndexSplitter?.fact) {
        const factNameForm = this.indexSplitterForm.get('factFormControl');
        factNameForm?.setValue(facts.find(x => x.name === this.data.cloneIndexSplitter.fact));
        const factValForm = this.indexSplitterForm.get('strValFormControl');
        if (factValForm) {
          factValForm.enable();
          factValForm.setValue(this.data.cloneIndexSplitter.str_val);
        }
      }
    });

    this.projectStore.getCurrentProject().pipe(take(1), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return forkJoin({
          indexSplitterOptions: this.indexSplitterService.getIndexSplitterOptions(proj.id),
          projectIndices: this.projectStore.getProjectIndices().pipe(take(1)), // take 1 to complete observable
        });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp?.indexSplitterOptions && !(resp?.indexSplitterOptions instanceof HttpErrorResponse)) {
        this.indexSplitterOptions = resp?.indexSplitterOptions;
        const distributionType = this.indexSplitterForm.get('distributionFormControl');
        if (distributionType) {
          if (this.data?.cloneIndexSplitter?.distribution) {
            const distributionVal = resp?.indexSplitterOptions.actions.POST.distribution.choices.find(x => x.display_name === this.data.cloneIndexSplitter.distribution);
            distributionType.setValue(distributionVal);
          } else {
            distributionType.setValue(resp?.indexSplitterOptions.actions.POST.distribution.choices[0]);
          }
        }
      }
      if (resp?.projectIndices && !(resp.projectIndices instanceof HttpErrorResponse)) {
        this.projectIndices = resp.projectIndices;
        if (this.data.cloneIndexSplitter) {
          const indexInstances = resp.projectIndices.filter(x => this.data.cloneIndexSplitter.indices.some(y => y.name === x.index));
          const indicesForm = this.indexSplitterForm.get('indicesFormControl');
          indicesForm?.setValue(indexInstances);
          this.indicesOpenedChange(false); // refreshes the field and fact selection data
          const fieldsForm = this.indexSplitterForm.get('fieldsFormControl');
          fieldsForm?.setValue(this.data.cloneIndexSplitter.fields);
        }
      }
      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices && !this.data.cloneIndexSplitter) {// in case of cloning we set it already
        const indicesForm = this.indexSplitterForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = currentProjIndices;
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

    this.indexSplitterForm.get('strValFormControl')?.valueChanges.pipe(
      takeUntil(this.destroyed$),
      debounceTime(100),
      switchMap(value => {
        if (value || value === '' && this.currentProject.id) {
          this.factValOptions = ['Loading...'];
          this.isLoadingOptions = true;
          return this.projectService.projectFactValueAutoComplete(this.currentProject.id,
            this.indexSplitterForm.get('factFormControl')?.value?.name, 10, value,
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
    this.createRequestInProgress = true;
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      fields: formData.fieldsFormControl,
      scroll_size: formData.scrollSizeFormControl,
      train_index: formData.trainIndexFormControl,
      test_index: formData.testIndexFormControl,
      test_size: formData.testSizeIndexFormControl,
      ...formData.factFormControl ? {fact: formData.factFormControl.name} : {},
      ...formData.strValFormControl ? {str_val: formData.strValFormControl} : {},
      distribution: formData.distributionFormControl.value,
      ...formData.distributionFormControl.value === 'custom' ? {
        // tslint:disable-next-line:no-any
        custom_distribution: JSON.stringify(this.customDistributionList.reduce((r: any, {
          key,
          value
        }) => {
          if (key) {
            return (r[key] = value, r);
          }
          return r;
        }, {}))
      } : {},
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
      this.createRequestInProgress = false;
    });
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
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

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.indexSplitterForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.getFactsForIndices(indicesForm?.value);
      this.projectFields = indicesForm?.value;
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

  addItemToCustomDistribution(): void {
    this.customDistributionList.push({key: '', value: ''});
    setTimeout(() => {
      if (this.content?.nativeElement) {
        this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
      }
    }, 0);

  }
}
