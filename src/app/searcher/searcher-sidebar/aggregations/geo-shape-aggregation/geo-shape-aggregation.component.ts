import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-geo-shape-aggregation',
  templateUrl: './geo-shape-aggregation.component.html',
  styleUrls: ['./geo-shape-aggregation.component.scss']
})
export class GeoShapeAggregationComponent implements OnInit {
  // tslint:disable-next-line:no-any
  @Input() aggregationObj: { aggregation: any };
  @Input() fieldsFormControl: FormControl;
  @Input() notSubAgg: boolean;

  destroy$: Subject<boolean> = new Subject();

  constructor() {
  }

  ngOnInit(): void {

  }
}
