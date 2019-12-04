import {Component, OnDestroy, OnInit} from '@angular/core';
import {startWith, switchMap, takeUntil} from 'rxjs/operators';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {ProjectStore} from '../../../core/projects/project.store';
import {Subject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ElasticsearchQuery, ElasticsearchQueryStructure} from '../build-search/Constraints';
import {LogService} from '../../../core/util/log.service';

export interface AggregationObject {
  aggregation: any;
  formControl: FormControl;
}

@Component({
  selector: 'app-aggregations',
  templateUrl: './aggregations.component.html',
  styleUrls: ['./aggregations.component.scss']
})
export class AggregationsComponent implements OnInit, OnDestroy {
  currentProject: Project;
  projectFields: ProjectField[] = [];
  projectFacts: ProjectFact[] = [];
  destroy$: Subject<boolean> = new Subject();
  aggregationList: AggregationObject[] = [];
  searcherElasticSearchQuery: ElasticsearchQueryStructure;
  searchQueryExcluded = false;

  aggregationAccessor = (x: any) => (x.aggs);

  constructor(private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private logService: LogService,
              public searchService: SearcherComponentService) {


  }

  addNewAggregation() {
    const frm = new FormControl();
    frm.setValue(this.projectFields[0].fields[0]);
    this.aggregationList.push({aggregation: {}, formControl: frm});
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe((currentProject: Project) => {
      if (currentProject) {
        this.currentProject = currentProject;
      }
    });
    this.projectStore.getProjectFacts().pipe(takeUntil(this.destroy$)).subscribe((projectFacts: ProjectFact[]) => {
      if (projectFacts) {
        this.projectFacts = projectFacts;
      }
    });
    this.projectStore.getProjectFields().pipe(takeUntil(this.destroy$)).subscribe((projectFields: ProjectField[]) => {
      if (projectFields) {
        this.projectFields = ProjectField.cleanProjectFields(projectFields, ['fact'], ['keyword']);
        this.aggregationList = [];
        this.aggregationList.push({aggregation: {}, formControl: new FormControl()});
        this.aggregationList[0].formControl.setValue(this.projectFields[0].fields[0]);
      }
    });
    this.searchService.getSearch().pipe(takeUntil(this.destroy$), startWith({}), switchMap(search => {
      return this.searchService.getElasticQuery();
    })).subscribe((query: ElasticsearchQuery | null) => {
      if (query) {
        // deep clone
        this.searcherElasticSearchQuery = JSON.parse(JSON.stringify(query.elasticSearchQuery));
      }
    });

  }

  aggregate() {
    const agg = this.makeAggregations(this.aggregationList, this.searchQueryExcluded);
    const body = {
      query: {
        aggs: {...agg},
        size: 0 // ignore results, performance improvement
      },

    };
    const savedSearchTemplate = this.makeAggregations(this.aggregationList, true);
    for (const savedSearch of this.searchService.savedSearchSelection.selected) {
      const finalAgg = {...savedSearchTemplate};
      for (const aggType in finalAgg) {
        if (finalAgg.hasOwnProperty(aggType)) {
          body.query.aggs[savedSearch.description] = {aggs: finalAgg};
          const savedSearchQuery = JSON.parse(savedSearch.query);
          body.query.aggs[savedSearch.description].filter = {bool: {...savedSearchQuery.query.bool}};
        }
      }
    }

    this.searchService.setIsLoading(true);
    this.searcherService.search(body, this.currentProject.id).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.searchService.nextAggregation(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
        this.searchService.nextAggregation([]);
      }
      this.searchService.setIsLoading(false);
    });
  }

  makeAggregations(aggregationList: { aggregation: any }[], searcherQueryExcluded: boolean) {
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

    if (!searcherQueryExcluded) {
      for (const aggType in finalAgg) {
        if (finalAgg.hasOwnProperty(aggType)) {
          finalAgg = {[aggType]: {aggs: finalAgg}};
          finalAgg[aggType].filter = {bool: this.searcherElasticSearchQuery.query.bool};
        }
      }
    }
    return finalAgg;
  }

  getInnerMostAggs(aggregation: any) {
    let aggInner;
    let inCaseNoAggsFound;
    for (const firstLevelAgg in aggregation) {
      if (aggregation.hasOwnProperty(firstLevelAgg)) {
        if (firstLevelAgg === 'aggs') {
          aggInner = this.aggregationAccessor(aggregation);
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

  fieldTypeTextOrFact(val: Field) {
    return (val && (val.type === 'text' || val.type === 'fact'));
  }


  fieldTypeDate(val: Field) {
    return (val && (val.type === 'date'));
  }

  checkIfMainAggregation(indx: number) {
    return this.aggregationList.length === (indx + 1);
  }

  removeAggregation(index) {
    this.aggregationList.splice(index, 1);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
