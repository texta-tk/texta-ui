import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-geo-distance-aggregation',
  templateUrl: './geo-distance-aggregation.component.html',
  styleUrls: ['./geo-distance-aggregation.component.scss']
})
export class GeoDistanceAggregationComponent implements OnInit, OnDestroy {
  distanceFormControl = new FormControl(10000, [Validators.required]);
  @Output() queryChange = new EventEmitter<unknown>();
  originFormControl = new FormControl('', [Validators.required]);
  private destroy$ = new Subject();

  constructor() {
  }

  _fieldPath = '';

  @Input() set fieldPath(val: string) {
    if (val) {
      this._fieldPath = val;
      this.queryChange.emit(this.constructQuery(this.distanceFormControl.value, this.originFormControl.value, this._fieldPath));
    }
  }

  ngOnInit(): void {
    this.distanceFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(x => {
      if (x) {
        this.queryChange.emit(this.constructQuery(x, this.originFormControl.value, this._fieldPath));
      }
    });
    this.originFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(x => {
      if (x) {
        this.queryChange.emit(this.constructQuery(this.distanceFormControl.value, x, this._fieldPath));
      }
    });
  }

  constructQuery(distanceN: number, originC: string, fieldPath: string): unknown {
    return {
      agg_distance: {
        geo_distance: {
          field: fieldPath,
          origin: originC,
          distance_type: 'arc',
          ranges: [
            { from: 0, to: distanceN, key: 'POINT(-123.17754124324 49.1935788600694)'},
          ]
        }
      }
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
