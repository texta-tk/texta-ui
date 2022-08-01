import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ElasticsearchQuery, FactConstraint, FactTextInputGroup} from '../../Constraints';
import {UntypedFormControl} from '@angular/forms';
import {debounceTime, pairwise, skip, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {Project, ProjectFact, ProjectIndex} from '../../../../../shared/types/Project';
import {BehaviorSubject, merge, of, Subject} from 'rxjs';
import {ProjectService} from '../../../../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {UtilityFunctions} from '../../../../../shared/UtilityFunctions';
import {ProjectStore} from '../../../../../core/projects/project.store';
import {LogService} from '../../../../../core/util/log.service';


@Component({
  selector: 'app-fact-constraints',
  templateUrl: './fact-constraints.component.html',
  styleUrls: ['./fact-constraints.component.scss']
})
export class FactConstraintsComponent implements OnInit, OnDestroy {
  // inner hits name counter
  static componentCount = 0;
  @Input() elasticSearchQuery: ElasticsearchQuery;
  projectFacts: BehaviorSubject<string[]> = new BehaviorSubject(['Loading...']);
  @Input() currentProject: Project;
  @Input() indices: string[];
  @Output() constraintChanged = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes
  destroyed$: Subject<boolean> = new Subject<boolean>();
  factNameOperatorFormControl = new UntypedFormControl();
  factNameFormControl = new UntypedFormControl();
  factValueOperatorFormControl = new UntypedFormControl();
  inputGroupQueryArray: unknown[] = [];
  formQueryBluePrint = {
    nested: {
      query: {
        bool: {
          must: []
        }
      },
      path: 'texta_facts', // constant
      inner_hits: {
        size: 100,
        name: '??' // needs to be unique
      }
    }
  };
  // tslint:disable-next-line:no-any
  factNameQuery: any = {
    bool: {}
  };
  // tslint:disable-next-line:no-any
  inputGroupQuery: any = {
    bool: {}
  };

  constructor(private projectService: ProjectService, private projectStore: ProjectStore, private logService: LogService,
              private changeDetectorRef: ChangeDetectorRef) {
    FactConstraintsComponent.componentCount += 1;
  }

  // tslint:disable-next-line:variable-name
  _factConstraint: FactConstraint;

  @Input() set factConstraint(value: FactConstraint) {
    if (value) {
      this._factConstraint = value;
      this.factNameOperatorFormControl = this._factConstraint.factNameOperatorFormControl;
      this.factNameFormControl = this._factConstraint.factNameFormControl;
      this.factValueOperatorFormControl = this._factConstraint.factValueOperatorFormControl;
      // undefined means its fact name constraint
      if (this._factConstraint.inputGroupArray !== undefined) { // saved searches work because im checking inputGroupArray length in html
        if (this._factConstraint.inputGroupArray.length === 0) {
          this.createGroupListeners();
        } else {
          for (const inputGroup of this._factConstraint.inputGroupArray) { // saved search, already has array
            this.createGroupListeners(inputGroup);
          }
        }
      }
    }
  }

  // attach valuechanges listeners to formcontrols, and populate with savedsearch data if there is any
  public createGroupListeners(inputGroup?: FactTextInputGroup): void {
    if (this._factConstraint.inputGroupArray) {
      if (!inputGroup) {
        inputGroup = new FactTextInputGroup();
        inputGroup.formQuery.nested.inner_hits.name = `${FactConstraintsComponent.componentCount}_??`;
        this._factConstraint.inputGroupArray.push(inputGroup);
        // cant select when factname is null
        inputGroup.factTextInputFormControl.disable();
      } else { // set default values selected already when we have inputgroup
        this.changeFactValue(inputGroup.factTextInputFormControl.value, inputGroup);
      }

      inputGroup.query.bool = {[this.factValueOperatorFormControl.value]: inputGroup.formQuery};
      this.inputGroupQueryArray.push(inputGroup.query);
      inputGroup.factTextOperatorFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(inputGroup.factTextOperatorFormControl.value as string)).subscribe(val => {
        if (val) {
          // todo fix in TS 3.7
          // tslint:disable-next-line:no-non-null-assertion
          inputGroup!.query!.bool = {[val]: inputGroup!.formQuery};
        }
      });
      inputGroup.factTextFactNameFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(inputGroup.factTextFactNameFormControl.value as string),
        pairwise()).subscribe(([prev, next]: [string, string]) => {
        if (next) {
          // todo fix in TS 3.7
          // tslint:disable-next-line:no-non-null-assertion
          inputGroup!.factTextInputFormControl.enable();
          // set inital value to autocomplete after selecting a new fact name
          if (next !== prev) {
            // todo fix in TS 3.7
            // tslint:disable-next-line:no-non-null-assertion
            inputGroup!.factTextInputFormControl.setValue('');
          }
        }
      });
      inputGroup.factTextInputFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        debounceTime(100),
        switchMap(value => {
          if (inputGroup) {
            this.changeFactValue(value, inputGroup);
          }
          // todo fix in TS 3.7
          // tslint:disable-next-line:no-non-null-assertion
          if ((value || value === '' && inputGroup!.factTextFactNameFormControl.value) && this.currentProject && inputGroup) {
            inputGroup.filteredOptions = ['Loading...'];
            inputGroup.isLoadingOptions = true;
            return this.projectService.projectFactValueAutoComplete(this.currentProject.id,
              // todo fix in TS 3.7
              // tslint:disable-next-line:no-non-null-assertion
              inputGroup!.factTextFactNameFormControl.value, 10, value, this.indices);
          }
          return of(null);
        })).subscribe(val => {
        if (val && !(val instanceof HttpErrorResponse) && inputGroup) {
          inputGroup.isLoadingOptions = false;
          inputGroup.filteredOptions = val;
          this.changeDetectorRef.detectChanges();
          // if it returned something then it means its a valid value
        }
      });
    }
  }

  changeFactValue(val: MatAutocompleteSelectedEvent | string, inputGroup: FactTextInputGroup): void {
    const factValue = (val instanceof MatAutocompleteSelectedEvent) ? val.option.value : val;
    if (factValue.length > 0) {
      inputGroup.formQuery.nested.inner_hits.name = `${FactConstraintsComponent.componentCount}_${inputGroup.factTextFactNameFormControl.value}_${factValue}`;
      // @ts-ignore
      inputGroup.formQuery.nested.query.bool.must = [{match: {'texta_facts.fact': inputGroup.factTextFactNameFormControl.value}}, {match: {'texta_facts.str_val': factValue}}];

      this.constraintChanged.emit(this.elasticSearchQuery);
    }
  }

  public deleteInputGroup(inputGroup: FactTextInputGroup): void {
    if (this._factConstraint.inputGroupArray) {
      const queryIndex = this.inputGroupQueryArray.indexOf(inputGroup.query, 0);
      if (queryIndex > -1) {
        this.inputGroupQueryArray.splice(queryIndex, 1);
      }
      const index = this._factConstraint.inputGroupArray.indexOf(inputGroup, 0);
      if (index > -1) {
        this._factConstraint.inputGroupArray.splice(index, 1);
      }
      this.constraintChanged.emit(this.elasticSearchQuery);
    }
  }


  ngOnInit(): void {

    const stopConditions$ = merge(this.destroyed$, this.projectStore.getCurrentProject().pipe(skip(1)));
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(stopConditions$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices) {
        this.projectFacts.next(['Loading...']);
        return this.projectService.getProjectFacts(this.currentProject.id, currentProjIndices.map(x => [{name: x.index}]).flat(), false, false);
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

    if (this._factConstraint) {
      const formQueries: unknown[] = [];
      this.factNameQuery.bool = {[this.factNameOperatorFormControl.value]: formQueries};
      // todo fix in TS 3.7
      // tslint:disable-next-line:no-non-null-assertion
      this.elasticSearchQuery!.elasticSearchQuery!.query!.bool!.must.push(this.factNameQuery);
      this.factNameOperatorFormControl.valueChanges.pipe(
        startWith(this.factNameOperatorFormControl.value as string, this.factNameOperatorFormControl.value as string),
        pairwise(),
        takeUntil(this.destroyed$)).subscribe((value: string[]) => {
        this.factNameQuery.bool = {[value[1]]: formQueries};
        if (value[0] !== value[1]) {
          this.constraintChanged.emit(this.elasticSearchQuery);
        }
      });
      this.factNameFormControl.valueChanges.pipe(
        startWith(this.factNameFormControl.value as string[], this.factNameFormControl.value as string[]),
        pairwise(),
        takeUntil(this.destroyed$)).subscribe((value: string[][]) => {
        if (value) {
          formQueries.splice(0, formQueries.length);
          // filter out empty values
          const newlineString = value[1].filter(x => x !== '');
          if (newlineString.length > 0) {
            for (const line of newlineString) {
              // json for deep copy
              const newFormQuery = JSON.parse(JSON.stringify(this.formQueryBluePrint));
              newFormQuery.nested.inner_hits.name = `${FactConstraintsComponent.componentCount}_${line}`;
              newFormQuery.nested.query.bool.must = [{match: {'texta_facts.fact': line}}];
              formQueries.push(newFormQuery);
            }
          }
          if (!UtilityFunctions.arrayValuesEqual(value[0], value[1])) {
            this.constraintChanged.emit(this.elasticSearchQuery);
          }
        }
      });
      this.inputGroupQuery.bool = {[this.factValueOperatorFormControl.value]: this.inputGroupQueryArray};
      // todo fix in TS 3.7
      // tslint:disable-next-line:no-non-null-assertion
      this.elasticSearchQuery!.elasticSearchQuery!.query!.bool!.must.push(this.inputGroupQuery);
      this.factValueOperatorFormControl.valueChanges.pipe(
        startWith(this.factValueOperatorFormControl.value as string, this.factValueOperatorFormControl.value as string),
        pairwise(),
        takeUntil(this.destroyed$)).subscribe((value: string[]) => {
        this.inputGroupQuery.bool = {[value[1]]: this.inputGroupQueryArray};
        if (value[0] !== value[1]) {
          this.constraintChanged.emit(this.elasticSearchQuery);
        }
      });

    }

  }

  ngOnDestroy(): void {
    console.log('destroy fact-constraint');
    // todo fix in TS 3.7
    // tslint:disable-next-line:no-non-null-assertion
    const index = this.elasticSearchQuery!.elasticSearchQuery!.query!.bool!.must.indexOf(this.factNameQuery, 0);
    if (index > -1) {
      // todo fix in TS 3.7
      // tslint:disable-next-line:no-non-null-assertion
      this.elasticSearchQuery!.elasticSearchQuery!.query!.bool!.must.splice(index, 1);
    }
    // todo fix in TS 3.7
    // tslint:disable-next-line:no-non-null-assertion
    const inputQueryIndex = this.elasticSearchQuery!.elasticSearchQuery!.query!.bool!.must.indexOf(this.inputGroupQuery, 0);
    if (inputQueryIndex > -1) {
      // todo fix in TS 3.7
      // tslint:disable-next-line:no-non-null-assertion
      this.elasticSearchQuery.elasticSearchQuery!.query!.bool!.must.splice(inputQueryIndex, 1);
    }

    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
