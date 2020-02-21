import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ElasticsearchQuery, FactConstraint, FactTextInputGroup} from '../Constraints';
import {FormControl} from '@angular/forms';
import {debounceTime, pairwise, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {Project, ProjectFact} from '../../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {ProjectService} from '../../../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MatAutocompleteSelectedEvent} from '@angular/material';
import {UtilityFunctions} from '../../../../shared/UtilityFunctions';


@Component({
  selector: 'app-fact-constraints',
  templateUrl: './fact-constraints.component.html',
  styleUrls: ['./fact-constraints.component.scss']
})
export class FactConstraintsComponent implements OnInit, OnDestroy {
  // inner hits name counter
  static componentCount = 0;
  _factConstraint: FactConstraint;
  @Input() set factConstraint(value: FactConstraint) {
    if (value) {
      this._factConstraint = value;
      this.factNameOperatorFormControl = this._factConstraint.factNameOperatorFormControl;
      this.factNameFormControl = this._factConstraint.factNameFormControl;
      this.factTextOperatorFormControl = this._factConstraint.factTextOperatorFormControl;
      if (this._factConstraint.inputGroupArray.length === 0) {
        this.createGroupListeners();
      } else {
        for (const inputGroup of this._factConstraint.inputGroupArray) { // saved search, already has array
          this.createGroupListeners(inputGroup);
        }
      }
    }
  }

  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Input() projectFacts: ProjectFact[] = [];
  @Input() currentProject: Project;
  @Output() change = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes
  destroyed$: Subject<boolean> = new Subject<boolean>();
  factNameOperatorFormControl = new FormControl();
  factNameFormControl = new FormControl();
  factTextOperatorFormControl = new FormControl();
  inputGroupQueryArray: any[] = [];
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
        name: '??' // todo, redundant property?
      }
    }
  };
  factNameQuery: any = {
    bool: {}
  };
  inputGroupQuery: any = {
    bool: {}
  };

  constructor(private projectService: ProjectService) {
    FactConstraintsComponent.componentCount += 1;
  }

  // attach valuechanges listeners to formcontrols, and populate with savedsearch data if there is any
  public createGroupListeners(inputGroup?: FactTextInputGroup) {
    if (!inputGroup) {
      inputGroup = new FactTextInputGroup();
      inputGroup.formQuery.nested.inner_hits.name = `${FactConstraintsComponent.componentCount}_??`;
      this._factConstraint.inputGroupArray.push(inputGroup);
      // cant select when factname is null
      inputGroup.factTextInputFormControl.disable();
    } else { // set default values selected already when we have inputgroup
      this.factValueSelected(inputGroup.factTextInputFormControl.value, inputGroup);
    }

    inputGroup.query.bool = {[this.factTextOperatorFormControl.value]: inputGroup.formQuery};
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
        // todo fix in TS 3.7
        // tslint:disable-next-line:no-non-null-assertion
        if ((value || value === '' && inputGroup!.factTextFactNameFormControl.value) && this.currentProject && inputGroup ) {
          inputGroup.filteredOptions = ['Loading...'];
          inputGroup.isLoadingOptions = true;
          return this.projectService.projectFactValueAutoComplete(this.currentProject.id,
            // todo fix in TS 3.7
            // tslint:disable-next-line:no-non-null-assertion
            inputGroup!.factTextFactNameFormControl.value, 10, value);
        }
        return of(null);
      })).subscribe((val: string[] | HttpErrorResponse) => {
      if (val && !(val instanceof HttpErrorResponse) && inputGroup) {
        inputGroup.isLoadingOptions = false;
        inputGroup.filteredOptions = val;
        // if it returned something then it means its a valid value
      }
    });
  }

  factValueSelected(val: MatAutocompleteSelectedEvent | string, inputGroup) {
    const factValue = (val instanceof MatAutocompleteSelectedEvent) ? val.option.value : val;
    if (factValue.length > 0) {
      inputGroup.formQuery.nested.inner_hits.name = `${FactConstraintsComponent.componentCount}_${this._factConstraint.inputGroupArray.length}_${factValue}`;
      inputGroup.formQuery.nested.query.bool.must = [
        {match: {'texta_facts.fact': inputGroup.factTextFactNameFormControl.value}},
        {match: {'texta_facts.str_val': factValue}}];

      this.change.emit(this.elasticSearchQuery);
    }
  }

  public deleteInputGroup(inputGroup: FactTextInputGroup) {
    const queryIndex = this.inputGroupQueryArray.indexOf(inputGroup.query, 0);
    if (queryIndex > -1) {
      this.inputGroupQueryArray.splice(queryIndex, 1);
    }
    const index = this._factConstraint.inputGroupArray.indexOf(inputGroup, 0);
    if (index > -1) {
      this._factConstraint.inputGroupArray.splice(index, 1);
    }
    this.change.emit(this.elasticSearchQuery);
  }


  ngOnInit() {
    if (this._factConstraint) {
      const formQueries: any[] = [];
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
          this.change.emit(this.elasticSearchQuery);
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
            this.change.emit(this.elasticSearchQuery);
          }
        }
      });
      this.inputGroupQuery.bool = {[this.factTextOperatorFormControl.value]: this.inputGroupQueryArray};
      // todo fix in TS 3.7
      // tslint:disable-next-line:no-non-null-assertion
      this.elasticSearchQuery!.elasticSearchQuery!.query!.bool!.must.push(this.inputGroupQuery);
      this.factTextOperatorFormControl.valueChanges.pipe(
        startWith(this.factTextOperatorFormControl.value as string, this.factTextOperatorFormControl.value as string),
        pairwise(),
        takeUntil(this.destroyed$)).subscribe((value: string[]) => {
        this.inputGroupQuery.bool = {[value[1]]: this.inputGroupQueryArray};
        if (value[0] !== value[1]) {
          this.change.emit(this.elasticSearchQuery);
        }
      });

    }

  }

  ngOnDestroy() {
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

    this.change.emit(this.elasticSearchQuery);
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
