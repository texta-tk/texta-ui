import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-geo-point-aggregation',
  templateUrl: './geo-point-aggregation.component.html',
  styleUrls: ['./geo-point-aggregation.component.scss']
})
export class GeoPointAggregationComponent implements OnInit {
  // tslint:disable-next-line:no-any
  @Input() aggregationObj: { aggregation: any };
  @Input() fieldsFormControl: FormControl;
  @Input() notSubAgg: boolean;
  selectedType: string;

  destroy$: Subject<boolean> = new Subject();

  constructor() {
  }

  ngOnInit(): void {
    this.aggregationObj.aggregation = {
      agg_centroid: {
        geohash_grid: {
          field: 'Centroid',
          precision: 6
          /*          origin: 'POINT(-123.17754124324 49.1935788600694)',
                    unit: 'km',
                    distance_type: 'plane',
                    ranges: [
                      { to: 100000, key: 'first_ring' },
                      { from: 100000, to: 300000, key: 'second_ring' },
                      { from: 300000, key: 'third_ring' }
                    ],
                    keyed: true*/
        }
      }
    };
  }

  setQuery($event: unknown): void {
    if ($event) {
      this.aggregationObj.aggregation = $event;
    }
  }
}
