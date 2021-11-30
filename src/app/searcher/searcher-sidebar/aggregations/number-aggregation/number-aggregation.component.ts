import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-number-aggregation',
  templateUrl: './number-aggregation.component.html',
  styleUrls: ['./number-aggregation.component.scss']
})
export class NumberAggregationComponent implements OnInit {
  @Input() aggregationObj: { aggregation: any };
  @Input() fieldsFormControl: FormControl;
  isMainAgg: boolean;
  aggregationType: 'percentiles' | 'extended_stats' | 'boxplot' = 'extended_stats';
  aggregationSize = 20;
  destroy$: Subject<boolean> = new Subject();

  constructor() {
  }

  @Input() set notSubAgg(val: boolean) {
    this.isMainAgg = val;
    if (this.isMainAgg) {
      this.updateAggregations();
    }
  }

  ngOnInit(): void {
    this.fieldsFormControl?.valueChanges?.pipe(takeUntil(this.destroy$)).subscribe(val => {
      // need to check type, because if we are currently on a fact constraint and switch to a date constraint, then this valuechanges
      // still fires, so we would get val.type === 'date' and after that the component will destroy itself
      if (val && val.type === 'long' || val.type === 'float') {
        this.updateAggregations();
      }
    });
  }

  updateAggregations(): void {
    // tslint:disable-next-line:no-any
    let returnquery: { [key: string]: any };
    returnquery = {
      [`agg_number_${this.aggregationType}`]: {
        [this.aggregationType]: {
          field: `${this.fieldsFormControl.value.path}`,
          ...this.aggregationType === 'percentiles' ? {keyed: false} : {},
        }
      }
    };

    this.aggregationObj.aggregation = returnquery;
  }
}
