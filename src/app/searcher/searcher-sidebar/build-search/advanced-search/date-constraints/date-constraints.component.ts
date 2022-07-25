import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DateConstraint, ElasticsearchQuery} from '../../Constraints';
import {UntypedFormControl, FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged, min, pairwise, skip, startWith, switchMap, take, takeUntil} from 'rxjs/operators';
import {forkJoin, merge, of, Subject} from 'rxjs';
import {ProjectStore} from '../../../../../core/projects/project.store';
import {SearcherService} from '../../../../../core/searcher/searcher.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Project} from '../../../../../shared/types/Project';
import * as _moment from 'moment';
import {Moment} from 'moment';

const moment = _moment;
@Component({
  selector: 'app-date-constraints',
  templateUrl: './date-constraints.component.html',
  styleUrls: ['./date-constraints.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateConstraintsComponent implements OnInit, OnDestroy {
  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Input() currentProject: Project;
  @Output() constraintChanged = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes
  dateFromFormControl: UntypedFormControl = new UntypedFormControl();
  dateToFormControl: UntypedFormControl = new UntypedFormControl();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  constraintQuery: any = {bool: {must: []}};
  public minDate: Moment;
  public maxDate: Moment;


  constructor(private projectStore: ProjectStore, private searcherService: SearcherService) {
  }

  // tslint:disable-next-line:variable-name
  _dateConstraint: DateConstraint;

  @Input() set dateConstraint(value: DateConstraint) {
    if (value) {
      this._dateConstraint = value;
      this.dateFromFormControl = this._dateConstraint.dateFromFormControl;
      this.dateToFormControl = this._dateConstraint.dateToFormControl;
    }
  }

  ngOnInit(): void {
    if (this._dateConstraint && this.elasticSearchQuery?.elasticSearchQuery?.query?.bool?.must) {
      const fieldPaths = this._dateConstraint.fields.map(x => x.path);
      this.elasticSearchQuery.elasticSearchQuery.query.bool.must.push(this.constraintQuery);
      this.dateFromFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(this.dateFromFormControl.value as object, this.dateFromFormControl.value as object),
        pairwise(),
        distinctUntilChanged()).subscribe(value => {
        this.makeDateQuery(fieldPaths, this.dateFromFormControl.value, this.dateToFormControl.value);
        if (value[0] !== value[1]) {
          this.constraintChanged.emit(this.elasticSearchQuery);
        }
      });
      this.dateToFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(this.dateToFormControl.value as object, this.dateToFormControl.value as object),
        pairwise(),
        distinctUntilChanged()).subscribe(value => {
        this.makeDateQuery(fieldPaths, this.dateFromFormControl.value, this.dateToFormControl.value);
        if (value[0] !== value[1]) {
          this.constraintChanged.emit(this.elasticSearchQuery);
        }
      });
      // when we change project component doesnt get destroyed before it fires request, so check it here
      const stopConditions$ = merge(this.destroyed$, this.projectStore.getCurrentProject().pipe(skip(1)));
      this.projectStore.getSelectedProjectIndices().pipe(takeUntil(stopConditions$), switchMap(selectedIndices => {
        console.log(selectedIndices);
        if (selectedIndices) {
          const queryMinMax = {
            query: {
              aggs: {}, size: 0
            },
            indices: selectedIndices.map(x => x.index)
          };
          let index = 0;
          for (const field of fieldPaths) {
            // @ts-ignore
            queryMinMax.query.aggs['min_date' + index] = {min: {field, format: 'yyyy-MM-dd'}};
            // @ts-ignore
            queryMinMax.query.aggs['max_date' + index] = {max: {field, format: 'yyyy-MM-dd'}};
            index++;
          }
          return this.searcherService.search(queryMinMax, this.currentProject.id);
        }
        return of(null);
      })).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          let minDate: Moment | undefined;
          let maxDate: Moment | undefined;
          for (const prop in resp.aggs) {
            if (resp.aggs.hasOwnProperty(prop)) {
              if (prop.includes('min_date')) {
                if ((minDate && resp.aggs[prop].value < minDate) || !minDate) {
                  minDate = moment.utc(resp.aggs[prop].value);
                }
              }
              if (prop.includes('max_date')) {
                if ((maxDate && resp.aggs[prop].value > maxDate) || !maxDate) {
                  maxDate = moment.utc(resp.aggs[prop].value);
                }
              }
            }
          }
          if (minDate && maxDate) {
            this.minDate = minDate;
            this.maxDate = maxDate;
            // if we dont already have dates set from saved search or user hasnt entered, set min max
            if (!this.dateFromFormControl.value && !this.dateToFormControl.value) {
              this.dateFromFormControl.setValue(this.minDate);
              this.dateToFormControl.setValue(this.maxDate);
              // @ts-ignore
              this.makeDateQuery(fieldPaths, this.minDate, this.maxDate);
            }
          }
        }
      });

    }

  }

  makeDateQuery(fieldPaths: string[], fromValue: Moment, toValue: Moment): void {
    this.constraintQuery.bool.must.splice(0, this.constraintQuery.bool.must.length);
    fromValue = moment(fromValue);
    toValue = moment(toValue);
    const dateQuery = {gte: fromValue.startOf('day'), lte: toValue.endOf('day')};
    for (const field of fieldPaths) {
      this.constraintQuery.bool.must.push({range: {[field]: dateQuery}});
    }
  }

  ngOnDestroy(): void {
    console.log('destroy date-constraint');
    const query = this.elasticSearchQuery?.elasticSearchQuery?.query?.bool?.must;
    const index = query?.indexOf(this.constraintQuery, 0);
    if (index != null && index > -1) {
      query?.splice(index, 1);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
