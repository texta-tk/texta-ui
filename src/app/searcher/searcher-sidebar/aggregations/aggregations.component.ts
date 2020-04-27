import {Component, OnDestroy, OnInit} from '@angular/core';
import {pairwise, takeUntil} from 'rxjs/operators';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../shared/types/Project';
import {ProjectStore} from '../../../core/projects/project.store';
import {BehaviorSubject, forkJoin, of, Subject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ElasticsearchQuery, ElasticsearchQueryStructure} from '../build-search/Constraints';
import {LogService} from '../../../core/util/log.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';

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
  searchQueryExcluded = false;
  dateAlreadySelected = false;
  dateRelativeFrequency = false;

  constructor(private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private logService: LogService,
              public searchService: SearcherComponentService) {

  }

  addNewAggregation() {
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

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe((currentProject: Project) => {
      if (currentProject) {
        this.currentProject = currentProject;
      }
    });
    this.projectStore.getCurrentProjectIndices().pipe(takeUntil(this.destroy$)).subscribe((projectFields: ProjectIndex[]) => {
      if (projectFields) {
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(projectFields, ['fact', 'text', 'date'], []);
        this.projectFields = ProjectIndex.sortTextaFactsAsFirstItem(this.projectFields);
        const distinct = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(x => x.fields).flat(), (x => x.path));
        this.fieldsFiltered.next(distinct);
        this.fieldsUnique = distinct;
        this.dateAlreadySelected = false;
        this.aggregationList = [];
        this.addNewAggregation();
      }
    });
    this.searchService.getElasticQuery().pipe(takeUntil(this.destroy$)).subscribe((query: ElasticsearchQuery | null) => {
      if (query) {
        this.searcherElasticSearchQuery = JSON.parse(JSON.stringify(query.elasticSearchQuery));
      }
    });

  }

  aggregate() {
    const joinedAggregation = this.makeAggregations(this.aggregationList);
    const aggregationType = Object.keys(joinedAggregation)[0];
    const body: any = {
      query: {
        aggs: {...joinedAggregation},
        size: 0 // ignore results, performance improvement
      },
      indices: this.projectFields.map(y => y.index)
    };
    for (const savedSearch of this.searchService.savedSearchSelection.selected) {
      const savedSearchQuery = JSON.parse(savedSearch.query);
      body.query.aggs[savedSearch.description] = {
        aggs: {...joinedAggregation},
        filter: savedSearchQuery.query
      };
    }

    if (!this.searchQueryExcluded) {
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
    // need 2 seperate requests to calculate relative frequency
    forkJoin({
      globalAgg: this.dateRelativeFrequency ? this.searcherService.search({
        query: {
          size: 0,
          aggs: joinedAggregation
        },
        indices: this.projectFields.map(y => y.index)
      }, this.currentProject.id) : of(null),
      agg: this.searcherService.search(body, this.currentProject.id)
    }).subscribe((resp: { globalAgg: any, agg: any }) => {
      const aggResp = {globalAgg: {}, agg: {}};
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

  makeAggregations(aggregationList: { aggregation: any }[]) {
    let innermostAgg;
    let finalAgg: any;
    for (const aggregation of aggregationList) {
      // deep copy, dont want to modify original object
      const aggregationToAdd = JSON.parse(JSON.stringify(aggregation.aggregation));
      if (!finalAgg) {
        finalAgg = aggregationToAdd;
        continue;
      }
      innermostAgg = this.getInnerMostAggs(finalAgg);
      innermostAgg.aggs = aggregationToAdd;
    }

    return finalAgg;
  }

  getInnerMostAggs(aggregation: any) {
    let aggInner;
    let inCaseNoAggsFound;
    for (const firstLevelAgg in aggregation) {
      if (aggregation.hasOwnProperty(firstLevelAgg)) {
        if (firstLevelAgg === 'aggs') {
          aggInner = aggregation.aggs;
          return this.getInnerMostAggs(aggInner);
        } else {
          inCaseNoAggsFound = firstLevelAgg;
        }
      }
    }
    if (inCaseNoAggsFound) {
      if (aggregation[inCaseNoAggsFound].hasOwnProperty('field')) {
        return aggregation;
      } else {
        return this.getInnerMostAggs(aggregation[inCaseNoAggsFound]);
      }
    }
  }

  onRelativeFrequency(val: boolean) {
    this.dateRelativeFrequency = val;
  }

  fieldTypeTextOrFact(val: Field) {
    return (val && (val.type === 'text' || val.type === 'fact'));
  }

  fieldTypeDate(val: Field) {
    return (val && (val.type === 'date'));
  }

  removeAggregation(index) {
    this.dateAlreadySelected = this.aggregationList[index].formControl.value.type === 'date' ? false : this.dateAlreadySelected;
    this.aggregationList[index].formDestroy.next(true);
    this.aggregationList[index].formDestroy.complete();
    this.aggregationList.splice(index, 1);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    for (const aggregation of this.aggregationList) {
      aggregation.formDestroy.next(true);
      aggregation.formDestroy.complete();
    }
    this.aggregationList = [];
  }
}
