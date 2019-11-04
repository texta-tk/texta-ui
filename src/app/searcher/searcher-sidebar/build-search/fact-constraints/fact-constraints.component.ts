import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ElasticsearchQuery, FactConstraint, FactTextInputGroup} from '../Constraints';
import {FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {Project, ProjectFact} from '../../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {ProjectService} from '../../../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';


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
      this.inputGroupArray = this._factConstraint.inputGroupArray;
    }
  }

  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Input() projectFacts: ProjectFact[] = [];
  @Input() currentProject: Project;
  @Output() change = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes
  factNameOperatorFormControl: FormControl = new FormControl();
  factNameFormControl: FormControl = new FormControl();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constraintQueries = [];
  factTextOperatorFormControl = new FormControl();
  inputGroupArray = [];
  inputGroupQueryArray = [];
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

  constructor(private projectService: ProjectService) {

    this.factTextOperatorFormControl.setValue('must');
    FactConstraintsComponent.componentCount += 1;
  }


  public addInputGroup() {
    const inputGroup = new FactTextInputGroup();
    this.inputGroupArray.push(inputGroup);
    const newFormQuery = JSON.parse(JSON.stringify(this.formQueryBluePrint));
    const groupQuery = {
      bool: {}
    };
    groupQuery.bool = {[this.factTextOperatorFormControl.value]: newFormQuery};
    this.inputGroupQueryArray.push(groupQuery);
    inputGroup.formQuery = groupQuery;
    //this.constraintQueries.push(constraintQuery);
    inputGroup.factTextInputFormControl.disable();
    inputGroup.factTextOperatorFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      console.log(val);
      groupQuery.bool = {[val]: newFormQuery};
    });
    inputGroup.factTextFactNameFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      console.log(val);
      if (inputGroup.factTextFactNameFormControl.value) {
        inputGroup.factTextInputFormControl.enable();
      } else {
        inputGroup.factTextInputFormControl.disable();
      }
    });
    inputGroup.factTextInputFormControl.valueChanges.pipe(
      takeUntil(this.destroyed$),
      debounceTime(100),
      switchMap(value => {
        if (value && this.currentProject) {
          return this.projectService.projectFactValueAutoComplete(this.currentProject.id,
            inputGroup.factTextFactNameFormControl.value, 10, value);
        }
        return of(null);
      })).subscribe((val: string[] | HttpErrorResponse) => {
      console.log(val);
      if (val && !(val instanceof HttpErrorResponse)) {
        const factValue = inputGroup.factTextInputFormControl.value;
        inputGroup.filteredOptions = val;
        if (factValue.length > 0) {
          // json for deep copy

          newFormQuery.nested.inner_hits.name = `${FactConstraintsComponent.componentCount}_${this.inputGroupArray.length}_${factValue}`;
          newFormQuery.nested.query.bool.must = [
            {match: {'texta_facts.fact': inputGroup.factTextFactNameFormControl.value}},
            {match: {'texta_facts.str_val': factValue}}];

        }
      }
    });
  }

  public deleteInputGroup(inputGroup: FactTextInputGroup) {
    const queryIndex = this.inputGroupQueryArray.indexOf(inputGroup.formQuery, 0);
    if (queryIndex > -1) {
      this.inputGroupQueryArray.splice(queryIndex, 1);
    }
    const index = this.inputGroupArray.indexOf(inputGroup, 0);
    if (index > -1) {
      this.inputGroupArray.splice(index, 1);
    }
  }


  ngOnInit() {
    if (this._factConstraint) {
      const constraintQuery = {
        bool: {}
      };
      const formQueries = [];
      constraintQuery.bool = {[this.factNameOperatorFormControl.value]: formQueries};
      //this.constraintQueries.push(constraintQuery);
      this.elasticSearchQuery.query.bool.must.push(constraintQuery);
      this.factNameOperatorFormControl.valueChanges.pipe(
        startWith(this.factNameOperatorFormControl.value as object),
        takeUntil(this.destroyed$)).subscribe((value: string) => {
        constraintQuery.bool = {[value]: formQueries};
        this.change.emit(this.elasticSearchQuery);
      });
      this.factNameFormControl.valueChanges.pipe(
        startWith(this.factNameFormControl.value as object),
        takeUntil(this.destroyed$)).subscribe((facts: string[]) => {
        if (facts) {
          formQueries.splice(0, formQueries.length);
          // filter out empty values
          const newlineString = facts.filter(x => x !== '');
          if (newlineString.length > 0) {
            for (const line of newlineString) {
              // json for deep copy
              const newFormQuery = JSON.parse(JSON.stringify(this.formQueryBluePrint));
              newFormQuery.nested.inner_hits.name = `${FactConstraintsComponent.componentCount}_${line}`;
              newFormQuery.nested.query.bool.must = [{match: {'texta_facts.fact': line}}];
              formQueries.push(newFormQuery);
            }
          }
          console.log(formQueries);
          this.change.emit(this.elasticSearchQuery);
        }
      });
      const inputGroupQuery = {bool: {[this.factTextOperatorFormControl.value]: this.inputGroupQueryArray}};
      this.elasticSearchQuery.query.bool.must.push(inputGroupQuery);
      this.factTextOperatorFormControl.valueChanges.pipe(
        startWith(this.factTextOperatorFormControl.value as object),
        takeUntil(this.destroyed$)).subscribe((value: string) => {
        console.log(value);
        inputGroupQuery.bool = {[value]: this.inputGroupQueryArray};
        // this.constraintQuery.bool = {[value]: formQueries};
        // this.change.emit(this.elasticSearchQuery);
      });


      this.addInputGroup();
    }

  }

  ngOnDestroy() {
    console.log('destroy fact-constraint');
    /* const index = this.elasticSearchQuery.query.bool.must.indexOf(constraintQueries, 0);
     if (index > -1) {
       this.elasticSearchQuery.query.bool.must.splice(index, 1);
     }*/
    this.change.emit(this.elasticSearchQuery);
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
