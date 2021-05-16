import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-geohash-aggregation',
  templateUrl: './geohash-aggregation.component.html',
  styleUrls: ['./geohash-aggregation.component.scss']
})
export class GeohashAggregationComponent implements OnInit, OnDestroy {
  precisionFormControl = new FormControl(5, [Validators.min(1), Validators.max(12), Validators.required]);
  @Output() queryChange = new EventEmitter<unknown>();

  _fieldPath = '';

  @Input() set fieldPath(val: string) {
    if (val) {
      this._fieldPath = val;
      this.queryChange.emit(this.constructQuery(this.precisionFormControl.value, val));
    }
  }
  private destroy$ = new Subject();

  constructor() {
  }

  ngOnInit(): void {
    this.precisionFormControl.valueChanges.pipe(startWith(this.precisionFormControl.value), takeUntil(this.destroy$)).subscribe(x => {
      if (x) {
        this.queryChange.emit(this.constructQuery(x, this._fieldPath));
      }
    });
  }

  constructQuery(precisionN: number, fieldPath: string): unknown {
    return {
      agg_geohash: {
        geohash_grid: {
          field: fieldPath,
          precision: precisionN
        }
      }
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
