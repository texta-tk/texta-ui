import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-geo-centroid-aggregation',
  templateUrl: './geo-centroid-aggregation.component.html',
  styleUrls: ['./geo-centroid-aggregation.component.scss']
})
export class GeoCentroidAggregationComponent implements OnInit, OnDestroy {
  @Output() queryChange = new EventEmitter<unknown>();
  private destroy$ = new Subject();

  constructor() {
  }

  _fieldPath = '';

  @Input() set fieldPath(val: string) {
    if (val) {
      this._fieldPath = val;
      this.queryChange.emit(this.constructQuery(val));
    }
  }

  constructQuery( fieldPath: string): unknown {
    return {
      agg_centroid: {
        geo_centroid: {
          field: fieldPath
        }
      }
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
  }
}
