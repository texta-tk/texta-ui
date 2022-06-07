import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ElasticsearchQuery, NumberConstraint} from '../../Constraints';
import {FormControl} from '@angular/forms';
import {FromToInput, FromToInputComponent} from '../../../../../shared/shared-module/components/from-to-input/from-to-input.component';
import {Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-number-constraints',
  templateUrl: './number-constraints.component.html',
  styleUrls: ['./number-constraints.component.scss']
})
export class NumberConstraintsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Output() constraintChanged = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes
  @ViewChild(FromToInputComponent) fromToInput: FromToInputComponent;
  operatorFormControl = new FormControl();

  destroyed$: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  constraintQuery: any = {bool: {must: []}};

  constructor() {
  }

  // tslint:disable-next-line:variable-name
  public _numberConstraint: NumberConstraint;

  @Input() set numberConstraint(value: NumberConstraint) {
    if (value) {
      this._numberConstraint = value;
      this.operatorFormControl = this._numberConstraint.operatorFormControl;
    }
  }

  ngOnInit(): void {


  }

  ngAfterViewInit(): void {
    if (this._numberConstraint?.fromToInput) {
      this.fromToInput.writeValue({...this._numberConstraint.fromToInput});
    }
    if (this.fromToInput?.parts) {
      if (this._numberConstraint && this.elasticSearchQuery?.elasticSearchQuery?.query?.bool?.must) {
        const fieldPaths = this._numberConstraint.fields.map(x => x.path);

        const formQueries: unknown[] = [];
        this.constraintQuery = {
          bool: {
            [this.operatorFormControl.value]: formQueries
          }
        };
        this.elasticSearchQuery.elasticSearchQuery.query.bool.must.push(this.constraintQuery);

        this.operatorFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value: string) => {
          this.constraintQuery.bool = {[value]: formQueries};
          this.constraintChanged.emit(this.elasticSearchQuery);
        });
        this.fromToInput.parts.valueChanges.pipe(takeUntil(this.destroyed$),
          startWith(this._numberConstraint.fromToInput as FromToInput)).subscribe(value => {
          if (this.fromToInput?.value) {
            this.makeRangeQuery(fieldPaths, this.fromToInput.value, formQueries);
            this._numberConstraint.fromToInput = this.fromToInput.value;
            this.constraintChanged.emit(this.elasticSearchQuery);
          }
        });
      }
    }

  }

  makeRangeQuery(fieldPaths: string[], fromTo: FromToInput, formQueries: unknown[]): void {
    formQueries.splice(0, formQueries.length);
    for (const field of fieldPaths) {
      formQueries.push({
        range: {
          [field]: {
            gte: fromTo.from,
            ...(fromTo.to === '') ? {} : {lte: fromTo.to}
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    console.log('destroy number-constraint');
    const index = this.elasticSearchQuery?.elasticSearchQuery?.query?.bool?.must?.indexOf(this.constraintQuery, 0);
    if (index != null && index > -1) {
      this.elasticSearchQuery?.elasticSearchQuery?.query?.bool?.must?.splice(index, 1);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
