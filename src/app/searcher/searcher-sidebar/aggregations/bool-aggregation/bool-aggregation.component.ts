import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {debounceTime, startWith, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-bool-aggregation',
  templateUrl: './bool-aggregation.component.html',
  styleUrls: ['./bool-aggregation.component.scss']
})
export class BoolAggregationComponent implements OnInit {
// tslint:disable:no-any
  @Input() aggregationObj: { aggregation: any };
  @Input() fieldsFormControl: FormControl;
  aggregationType: 'terms' = 'terms';
  minDocCount = 1;
  destroy$: Subject<boolean> = new Subject();

  constructor() {
  }

  ngOnInit(): void {
    this.fieldsFormControl?.valueChanges?.pipe(takeUntil(this.destroy$), startWith(this.fieldsFormControl.value)).subscribe(val => {
      // need to check type, because if we are currently on a fact constraint and switch to a date constraint, then this valuechanges
      // still fires, so we would get val.type === 'date' and after that the component will destroy itself
      if (val && val.type === 'boolean') {
        this.makeBoolAggregation();
      }
    });
  }

  makeBoolAggregation(): void {
    const returnquery = {
        agg_term: {
          [this.aggregationType]: {
            field: `${this.fieldsFormControl.value.path}`,
            show_term_doc_count_error: true
          }
        }
      };

    this.aggregationObj.aggregation = returnquery;
  }
}
