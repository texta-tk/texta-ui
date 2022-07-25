import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {BooleanConstraint, ElasticsearchQuery,} from '../../Constraints';
import {UntypedFormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {Field} from "../../../../../shared/types/Project";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-boolean-constraints',
  templateUrl: './boolean-constraints.component.html',
  styleUrls: ['./boolean-constraints.component.scss']
})
export class BooleanConstraintsComponent implements OnInit, OnDestroy {

  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Output() constraintChanged = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes

  operatorFormControl = new UntypedFormControl();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  constraintQuery: any = {};
  formQueries: unknown[] = [];
  // tslint:disable-next-line:variable-name
  public _booleanConstraint: BooleanConstraint;
  booleanValueFormControl = new UntypedFormControl();

  @Input() set booleanConstraint(value: BooleanConstraint) {
    if (value) {
      this._booleanConstraint = value;
      this.booleanValueFormControl = this._booleanConstraint.booleanValueFormControl;
      this.operatorFormControl = this._booleanConstraint.operatorFormControl;
    }
  }

  constructor() {
  }

  ngOnInit(): void {
    if (this._booleanConstraint) {
      this.constraintQuery = {
        bool: {
          [this.operatorFormControl.value]: this.formQueries
        }
      };
      if (this.elasticSearchQuery?.elasticSearchQuery?.query?.bool?.must) {
        this.elasticSearchQuery.elasticSearchQuery.query.bool.must.push(this.constraintQuery);
      }
      this.operatorFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value: string) => {
        this.constraintQuery.bool = {[value]: this.formQueries};
        this.constraintChanged.emit(this.elasticSearchQuery);
      });
      this.makeElasticQuery(this._booleanConstraint.fields, this.booleanValueFormControl.value, this.formQueries);
    }
  }

  booleanOpenedChange(isOpen: boolean): void {
    if (!isOpen) {
      this.makeElasticQuery(this._booleanConstraint.fields, this.booleanValueFormControl.value, this.formQueries);
    }
  }

  private makeElasticQuery(fields: Field[], value: boolean, formQueries: unknown[]): void {
    formQueries.splice(0, formQueries.length);
    for (const field of fields) {
      if (field) {
        formQueries.push({term: {[field.path]: value}});
      }
    }
    this.constraintChanged.emit(this.elasticSearchQuery);
  }

  ngOnDestroy(): void {
    console.log('destroy boolean-constraint');
    const query = this.elasticSearchQuery?.elasticSearchQuery?.query?.bool?.must;
    const index = query?.indexOf(this.constraintQuery, 0);
    if (index != null && index > -1) {
      query?.splice(index, 1);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
