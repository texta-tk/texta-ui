import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-geohash-aggregation',
  templateUrl: './geohash-aggregation.component.html',
  styleUrls: ['./geohash-aggregation.component.scss']
})
export class GeohashAggregationComponent implements OnInit, OnDestroy {
  precisionFormControl = new FormControl(5, [Validators.min(1), Validators.max(12), Validators.required]);
  @Output() queryChange = new EventEmitter<unknown>();
  @Input() fieldPath = '';
  private destroy$ = new Subject();

  constructor() {
  }

  ngOnInit(): void {
    this.precisionFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(x => {
      if (x) {
        this.queryChange.emit(this.constructQuery(x));
      }
    });
  }

  constructQuery(precisionN: number): unknown {
    return {
      agg_centroid: {
        geohash_grid: {
          field: this.fieldPath,
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
