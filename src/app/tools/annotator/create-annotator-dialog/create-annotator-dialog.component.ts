import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {forkJoin, merge, Observable, of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {filter, map, mergeMap, startWith, switchMap, take, takeUntil} from 'rxjs/operators';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Project, ProjectIndex} from '../../../shared/types/Project';
import {ProjectService} from '../../../core/projects/project.service';
import {AnnotatorService} from '../../../core/tools/annotator/annotator.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {Choice} from '../../../shared/types/tasks/Embedding';
import {LabelSet} from '../../../shared/types/tasks/LabelSet';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {ScrollableDataSource} from '../../../shared/ScrollableDataSource';
import {UserStore} from '../../../core/users/user.store';
import {UserProfile} from '../../../shared/types/UserProfile';
import {UserService} from '../../../core/users/user.service';

interface OnSubmitParams {
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  fieldsFormControl: string[];
  fieldsEntityFormControl: string;
  annotationTypeFormControl: 'binary' | 'multilabel' | 'entity';
  usersFormControl: string[] | string;
  binaryFormGroup: {
    factNameFormControl: string;
    posValFormControl: string;
    negValFormControl: string;
  };
  multiLabelFormGroup: {
    labelSetFormControl: LabelSet;
  };
  entityFormGroup: {
    factNameFormControl: string;
  };
  esTimeoutFormControl: number;
  bulkSizeFormControl: number;
}

@Component({
  selector: 'app-create-annotator-dialog',
  templateUrl: './create-annotator-dialog.component.html',
  styleUrls: ['./create-annotator-dialog.component.scss']
})
export class CreateAnnotatorDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query: unknown = this.defaultQuery;

  annotatorForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl('', [Validators.required]),
    usersFormControl: new UntypedFormControl([], [Validators.required]),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    fieldsFormControl: new UntypedFormControl([], [Validators.required]),
    // entity single field only
    fieldsEntityFormControl: new UntypedFormControl('', [Validators.required]),
    annotationTypeFormControl: new UntypedFormControl('', [Validators.required]),
    binaryFormGroup: new UntypedFormGroup({
      factNameFormControl: new UntypedFormControl('', [Validators.required]),
      posValFormControl: new UntypedFormControl('', [Validators.required]),
      negValFormControl: new UntypedFormControl('', [Validators.required])
    }),
    multiLabelFormGroup: new UntypedFormGroup({
      labelSetFormControl: new UntypedFormControl('', [Validators.required]),
    }),
    entityFormGroup: new UntypedFormGroup({
      factNameFormControl: new UntypedFormControl('', [Validators.required])
    }),

    esTimeoutFormControl: new UntypedFormControl(100),
    bulkSizeFormControl: new UntypedFormControl(10),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  // tslint:disable-next-line:no-any
  annotatorOptions: any;
  annotatorTypes: Choice[];
  projectFacts: string[] = [];
  filteredProjectFacts: Observable<string[]>;
  projectLabelSets: ScrollableDataSource<LabelSet>;
  users: UserProfile[];
  currentUser: UserProfile;
  updateFacts$ = new Subject<''>();
  createRequestInProgress = false;

  constructor(private dialogRef: MatDialogRef<CreateAnnotatorDialogComponent>,
              private projectService: ProjectService,
              private userStore: UserStore,
              private userService: UserService,
              private annotatorService: AnnotatorService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        this.users = UtilityFunctions.sortByStringProperty(proj.users, (x => x.username));
        this.projectLabelSets = new ScrollableDataSource(this.fetchFn, this);
        return forkJoin({
          annotatorOptions: this.annotatorService.getAnnotatorOptions(proj.id),
          selectedIndices: this.projectStore.getSelectedProjectIndices().pipe(filter(x => !!x), take(1)),
        });
      }
      return of(null);
    })).subscribe(resp => {
      if (resp?.annotatorOptions && !(resp.annotatorOptions instanceof HttpErrorResponse)) {
        this.annotatorOptions = resp.annotatorOptions;
        this.annotatorTypes = resp.annotatorOptions.actions.POST.annotation_type.choices;
      }
      if (resp?.selectedIndices && !(resp.selectedIndices instanceof HttpErrorResponse)) {
        const indicesForm = this.annotatorForm.get('indicesFormControl');
        indicesForm?.setValue(resp.selectedIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(resp.selectedIndices, ['text'], []);
        this.getFactsForIndices(indicesForm?.value);
      }
      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });

    this.userStore.getCurrentUser().pipe(take(1)).subscribe(resp => {
      if (resp) {
        this.currentUser = resp;
      }
    });

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });

    this.annotatorForm?.get('annotationTypeFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val === 'binary') {
        this.annotatorForm.get('fieldsFormControl')?.enable();
        this.annotatorForm.get('fieldsEntityFormControl')?.disable();
        this.annotatorForm.get('binaryFormGroup')?.enable();
        this.annotatorForm.get('multiLabelFormGroup')?.disable();
        this.annotatorForm.get('entityFormGroup')?.disable();
      } else if (val === 'multilabel') {
        this.annotatorForm.get('fieldsFormControl')?.enable();
        this.annotatorForm.get('fieldsEntityFormControl')?.disable();
        this.annotatorForm.get('binaryFormGroup')?.disable();
        this.annotatorForm.get('multiLabelFormGroup')?.enable();
        this.annotatorForm.get('entityFormGroup')?.disable();
      } else if (val === 'entity') {
        this.annotatorForm.get('fieldsEntityFormControl')?.enable();
        this.annotatorForm.get('fieldsFormControl')?.disable();
        this.annotatorForm.get('binaryFormGroup')?.disable();
        this.annotatorForm.get('multiLabelFormGroup')?.disable();
        this.annotatorForm.get('entityFormGroup')?.enable();
      }
    });
    const binaryValueChanges = this.annotatorForm?.get('binaryFormGroup')?.get('factNameFormControl')?.valueChanges || of(null);
    const entityvalueChanges = this.annotatorForm?.get('entityFormGroup')?.get('factNameFormControl')?.valueChanges || of(null);
    this.filteredProjectFacts = merge(binaryValueChanges, entityvalueChanges, this.updateFacts$)
      .pipe(takeUntil(this.destroyed$),
        startWith(''),
        map(val => this.filter(val))
      ) || of([]);
  }


  fetchFn(pageNr: number, pageSize: number,
          filterParam: string, context: this): Observable<ResultsWrapper<LabelSet> | HttpErrorResponse> {
    return context.annotatorService.getLabelSets(context.currentProject.id, `${filterParam}&page=${pageNr + 1}&page_size=${pageSize}`);
  }

  onSubmit(formData: OnSubmitParams): void {
    this.createRequestInProgress = true;
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      fields: formData.annotationTypeFormControl === 'entity' ? [formData.fieldsEntityFormControl] : formData.fieldsFormControl,
      ...this.query ? {query: this.query} : {},
      annotation_type: formData.annotationTypeFormControl,
      annotating_users: this.currentUser.is_superuser ? formData.usersFormControl || [] : this.newLineStringToList(formData.usersFormControl as string),
      ...formData.annotationTypeFormControl === 'binary' ?
        {
          binary_configuration: {
            fact_name: formData.binaryFormGroup.factNameFormControl,
            pos_value: formData.binaryFormGroup.posValFormControl,
            neg_value: formData.binaryFormGroup.negValFormControl
          }
        } : {},
      ...formData.annotationTypeFormControl === 'multilabel' ?
        {
          multilabel_configuration: {
            labelset: formData.multiLabelFormGroup.labelSetFormControl.id
          }
        } : {},
      ...formData.annotationTypeFormControl === 'entity' ?
        {
          entity_configuration: {
            fact_name: formData.entityFormGroup.factNameFormControl
          }
        } : {},
    };
    this.annotatorService.createAnnotatorTask(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new task: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
      this.createRequestInProgress = false;
    });
  }

  newLineStringToList(stringWithNewLines: string): string[] {
    if (stringWithNewLines && stringWithNewLines.length !== 0) {
      const stringList = stringWithNewLines.split('\n');
      // filter out empty values
      return stringList.filter(x => x !== '');
    } else {
      return [];
    }
  }

  getFactsForIndices(val: ProjectIndex[]): void {
    if (val.length > 0) {
      this.projectFacts = [];
      this.projectService.getProjectFacts(this.currentProject.id, val.map((x: ProjectIndex) => [{name: x.index}]).flat(), false, false).pipe(takeUntil(this.destroyed$)).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.projectFacts = resp;
          this.updateFacts$.next('');
        } else {
          this.logService.snackBarError(resp);
        }
      });
    } else {
      this.projectFacts = [];
    }
  }

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.annotatorForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(indicesForm.value, ['text'], []);
      if (this.annotatorForm?.get('annotationTypeFormControl')?.value !== 'entity') {
        this.getFactsForIndices(indicesForm?.value);
      } else if (this.annotatorForm?.get('annotationTypeFormControl')?.value === 'entity') {
        const fieldForm = this.annotatorForm.get('fieldsEntityFormControl');
        if (fieldForm?.value) {
          this.getFactsForField(fieldForm?.value, this.annotatorForm.get('indicesFormControl')?.value);
        }
      }
    }
  }

  onQueryChanged(query: unknown): void {
    this.query = query ? query : this.defaultQuery;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  filter(val: string): string[] {
    return this.projectFacts.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  getFactsForField(field: string, indices: ProjectIndex[]): void {
    if (field && indices.length > 0) {
      this.projectFacts = [];
      const body = {
        key_field: 'doc_path',
        value_field: 'fact',
        filter_by_key: field,
        indices: indices.map((x: ProjectIndex) => [{name: x.index}]).flat()
      };
      this.projectService.elasticAggregateFacts(this.currentProject.id, body).pipe(takeUntil(this.destroyed$)).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.projectFacts = resp;
          this.updateFacts$.next(''); // reflect changes in the fact menu instantly
        } else {
          this.logService.snackBarError(resp);
        }
      });
    } else {
      this.projectFacts = [];
    }
  }

  entityFieldsOpenedChange(opened: boolean): void {
    const fieldForm = this.annotatorForm.get('fieldsEntityFormControl');
    if (!opened && fieldForm?.value) {
      this.getFactsForField(fieldForm?.value, this.annotatorForm.get('indicesFormControl')?.value);
    }

  }
}
