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
  }

  setQuery($event: unknown): void {
    if ($event) {
      this.aggregationObj.aggregation = $event;
    }
  }
}
