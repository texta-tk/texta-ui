import {Component, Input, OnInit} from '@angular/core';
import {DateConstraint, ElasticsearchQuery} from '../Constraints';
import {FormControl} from '@angular/forms';
import {take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-date-constraints',
  templateUrl: './date-constraints.component.html',
  styleUrls: ['./date-constraints.component.scss']
})
export class DateConstraintsComponent implements OnInit {
  @Input() dateConstraint: DateConstraint;
  @Input() elasticSearchQuery: ElasticsearchQuery;
  dateFromFormControl = new FormControl();
  dateToFormControl = new FormControl();

  constructor() {
  }

  ngOnInit() {
    const fieldPaths = this.dateConstraint.fields.map(x => x.path);
    const accessor: string = fieldPaths.join(',');
    const fromDate = {gte: ''};
    const toDate = {lte: ''};
    const fromDateAccessor = {range: {[accessor]: fromDate}};
    const toDateAccessor = {range: {[accessor]: toDate}};

    this.elasticSearchQuery.query.bool.must.push(fromDateAccessor);
    this.elasticSearchQuery.query.bool.must.push(toDateAccessor);
    this.dateFromFormControl.valueChanges.pipe(takeUntil(this.dateConstraint.deleted$)).subscribe(value => {
      fromDate.gte = value;
    });
    this.dateToFormControl.valueChanges.pipe(takeUntil(this.dateConstraint.deleted$)).subscribe(value => {
      toDate.lte = value;
    });
    // using javascript object identifier to delete cause everything is a shallow copy
    this.dateConstraint.deleted$.pipe(take(1)).subscribe(f => {
      let index = this.elasticSearchQuery.query.bool.must.indexOf(fromDateAccessor, 0);
      console.log(index);
      if (index > -1) {
        this.elasticSearchQuery.query.bool.must.splice(index, 1);
      }
      index = this.elasticSearchQuery.query.bool.must.indexOf(toDateAccessor, 0);
      console.log(index);
      if (index > -1) {
        this.elasticSearchQuery.query.bool.must.splice(index, 1);
      }
    });
  }

}
