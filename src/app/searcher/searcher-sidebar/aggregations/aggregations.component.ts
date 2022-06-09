import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {debounceTime, pairwise, takeUntil} from 'rxjs/operators';
import {Field, Project, ProjectIndex} from '../../../shared/types/Project';
import {ProjectStore} from '../../../core/projects/project.store';
import {BehaviorSubject, forkJoin, of, Subject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ElasticsearchQuery, ElasticsearchQueryStructure} from '../build-search/Constraints';
import {LogService} from '../../../core/util/log.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';

// tslint:disable:no-any
export interface AggregationForm {
  aggregation: any;
  formControl: FormControl;
  formDestroy: Subject<boolean>;
}

@Component({
  selector: 'app-aggregations',
  templateUrl: './aggregations.component.html',
  styleUrls: ['./aggregations.component.scss']
})
export class AggregationsComponent implements OnInit, OnDestroy {
  currentProject: Project;
  projectFields: ProjectIndex[] = [];
  fieldsUnique: Field[] = [];
  public fieldsFiltered: BehaviorSubject<Field[]> = new BehaviorSubject<Field[]>([]);
  destroy$: Subject<boolean> = new Subject();
  aggregationList: AggregationForm[] = [];
  searcherElasticSearchQuery: ElasticsearchQueryStructure;
  searchQueryIncluded = true;
  onlySavedSearchAgg = false;
  dateAlreadySelected = false;
  dateRelativeFrequency = false;
  fieldIndexMap: Map<string, string[]> = new Map<string, string[]>();
  @Output() aggregationQueryChange = new EventEmitter<any>();

  constructor(private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private logService: LogService,
              public searchService: SearcherComponentService) {

  }

  addNewAggregation(): void {
    const form = new FormControl();
    const formDestroy = new Subject<boolean>();
    form.valueChanges.pipe(takeUntil(formDestroy), pairwise()).subscribe(([old, val]) => {
      if (val && val.type === 'date') { // making a second date aggregation would add no value
        this.dateAlreadySelected = true;
      } else if (old.type === 'date') {
        this.dateAlreadySelected = false;
      }
    });
    if (this.projectFields.length > 0 && this.projectFields[0].fields.length > 0) {
      form.setValue(this.fieldsFiltered.value[0]);
    }
    this.aggregationList.push({aggregation: {}, formControl: form, formDestroy});
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
      }
    });
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroy$)).subscribe(projectFields => {
      if (projectFields) {
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(projectFields, ['fact', 'text', 'date', 'long', 'float'], []);
        this.fieldIndexMap = ProjectIndex.getFieldToIndexMap(projectFields);
        const distinct = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(x => x.fields).flat(), (x => x.path));
        const textaFactIndex = distinct.findIndex(item => item.type === 'fact');
        if (textaFactIndex >= 0) {
          distinct.unshift(distinct.splice(textaFactIndex, 1)[0]);
        }

        this.fieldsFiltered.next(distinct);
        this.fieldsUnique = distinct;
        this.dateAlreadySelected = false;
        this.aggregationList = [];
        this.addNewAggregation();
      }
    });
    this.searchService.getElasticQuery().pipe(takeUntil(this.destroy$), debounceTime(150)).subscribe((query: ElasticsearchQuery | null) => {
      if (query) {
        this.searcherElasticSearchQuery = query.elasticSearchQuery;
      }
    });

  }

  aggregate(): void {
    const joinedAggregation = this.makeAggregations(this.aggregationList);
    const aggregationType = Object.keys(joinedAggregation)[0];
    const body = {
      query: {
        aggs: {...this.onlySavedSearchAgg ? {} : joinedAggregation},
        size: 0 // ignore results, performance improvement
      },
      indices: this.projectFields.map(y => y.index)
    };
    for (const savedSearch of this.searchService.savedSearchSelection.selected) {
      const savedSearchQuery = JSON.parse(savedSearch.query);

      if (this.searchQueryIncluded) {
        const query = JSON.parse(JSON.stringify(savedSearchQuery.query));
        if (this.searcherElasticSearchQuery?.query?.bool) {
          query.bool.filter = {bool: this.searcherElasticSearchQuery.query.bool};
          body.query.aggs[savedSearch.description] = {
            aggs: {
              [savedSearch.description]: {
                aggs: {...joinedAggregation},
                filter: savedSearchQuery.query
              }
            },
            filter: this.searcherElasticSearchQuery.query
          };
        } else if (this.searcherElasticSearchQuery?.query?.multi_match) {
          this.logService.snackBarMessage('ERROR: Unexpected query. Please contact the developers!', 5000);
        }
      } else {
        body.query.aggs[savedSearch.description] = {
          aggs: {...joinedAggregation},
          filter: savedSearchQuery.query
        };
      }
    }

    if (this.searchQueryIncluded && !this.onlySavedSearchAgg) {
      if (this.searcherElasticSearchQuery?.query?.bool) {
        body.query.aggs[aggregationType] = {
          aggs: joinedAggregation,
          filter: {bool: this.searcherElasticSearchQuery.query.bool}
        };
      } else if (this.searcherElasticSearchQuery?.query?.multi_match) {
        body.query.aggs[aggregationType] = {
          aggs: joinedAggregation,
          filter: {multi_match: this.searcherElasticSearchQuery.query.multi_match}
        };
      }
    }


    this.searchService.setIsLoading(true);
    this.aggregationQueryChange.next(body.query);
    // need 2 seperate requests to calculate relative frequency
    forkJoin({
      globalAgg: this.dateRelativeFrequency ? this.searcherService.search(this.searchQueryIncluded ?

        {
          query: {
            size: 0,
            aggs: {
              [aggregationType]: {
                aggs: joinedAggregation,
                filter: {bool: this.searcherElasticSearchQuery.query.bool}
              }
            }
          },
          indices: this.projectFields.map(y => y.index)
        } : {
          query: {
            size: 0,
            aggs: joinedAggregation
          },
          indices: this.projectFields.map(y => y.index)
        }, this.currentProject.id) : of(null),
      agg: this.searcherService.search(body, this.currentProject.id)
    }).subscribe(resp => {
      const aggResp = {
        globalAgg: {},
        agg: {},
        aggregationForm: this.aggregationList.map(x => x.formControl.value.path)
      };
      if (resp.agg && !(resp.agg instanceof HttpErrorResponse)) {
        aggResp.agg = resp.agg;
      } else if (resp.agg instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp.agg, 2000);
      }
      if (resp.globalAgg && !(resp.globalAgg instanceof HttpErrorResponse)) {
        aggResp.globalAgg = resp.globalAgg;
      } else if (resp.globalAgg instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp.globalAgg, 2000);
      }
      this.searchService.nextAggregation(aggResp);
    }, x => console.log(x), () => this.searchService.setIsLoading(false));
  }

  makeAggregations(aggregationList: { aggregation: any }[]): any {
    let innermostAgg;
    let finalAgg: any;
    for (const aggregation of aggregationList) {
      // deep copy, dont want to modify original object
      const aggregationToAdd = JSON.parse(JSON.stringify(aggregation.aggregation));
      if (!finalAgg) {
        finalAgg = aggregationToAdd;
        innermostAgg = finalAgg;
        continue;
      }
      innermostAgg = this.getInnerMostAggs(innermostAgg);
      innermostAgg.aggs = aggregationToAdd;
    }

    return finalAgg;
  }

  getInnerMostAggs(aggregation: any): any {
    let aggInner;
    let inCaseNoAggsFound;
    for (const firstLevelAgg in aggregation) {
      if (aggregation.hasOwnProperty(firstLevelAgg)) {
        if (firstLevelAgg === 'aggs') {
          aggInner = aggregation.aggs;
          return this.getInnerMostAggs(aggInner);
        } else if(!aggregation[firstLevelAgg].hasOwnProperty('bucket_selector')) {
          inCaseNoAggsFound = firstLevelAgg;
        }
      }
    }
    if (inCaseNoAggsFound) {
      const aggProperty = aggregation[inCaseNoAggsFound];
      if (aggProperty.hasOwnProperty('field')) {
        return aggregation;
      }
      if (aggProperty.hasOwnProperty('reverse_nested')) {
        return aggProperty;
      } else {
        return this.getInnerMostAggs(aggregation[inCaseNoAggsFound]);
      }
    }
  }

  onRelativeFrequency(val: boolean): void {
    this.dateRelativeFrequency = val;
  }

  fieldTypeTextOrFact(val: Field): boolean {
    return (val && (val.type === 'text' || val.type === 'fact'));
  }

  fieldTypeDate(val: Field): boolean {
    return (val && (val.type === 'date'));
  }

  removeAggregation(index: number): void {
    this.dateAlreadySelected = this.aggregationList[index].formControl.value.type === 'date' ? false : this.dateAlreadySelected;
    this.aggregationList[index].formDestroy.next(true);
    this.aggregationList[index].formDestroy.complete();
    this.aggregationList.splice(index, 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    for (const aggregation of this.aggregationList) {
      aggregation.formDestroy.next(true);
      aggregation.formDestroy.complete();
    }
    this.aggregationList = [];
  }

  fieldTypeNumber(val: Field): boolean {
    return (val && (val.type === 'long' || val.type === 'float'));
  }
}
