import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {ProjectStore} from '../../../core/projects/project.store';
import {of, Subject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ElasticsearchQuery, ElasticsearchQueryStructure} from '../build-search/Constraints';
import {SelectionChange, SelectionModel} from "@angular/cdk/collections";
import {SavedSearch} from "../../../shared/types/SavedSearch";
import {TextAggregationComponent} from "./text-aggregation/text-aggregation.component";
import {DateAggregationComponent} from "./date-aggregation/date-aggregation.component";

export interface AggregationObject {
  savedSearchesAggregations: any[];
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
  _textAggregationComponent;
  @ViewChild(TextAggregationComponent, {static: false}) set textAggregationComponent(x: TextAggregationComponent) {
    if (x && x.id === 0) {
      this._textAggregationComponent = x;
    }
  }

  _dateAggregationComponent;
  @ViewChild(DateAggregationComponent, {static: false}) set dateAggregationComponent(x: DateAggregationComponent) {
    if (x && x.id === 0) {
      this._dateAggregationComponent = x;
    }
  }

  aggregationAccessor = (x: any) => (x.aggs);

  constructor(private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private searchService: SearcherComponentService) {


  }

  addNewAggregation() {
    const frm = new FormControl();
    frm.setValue(this.projectFields[0].fields[0]);
    this.aggregationList.push({savedSearchesAggregations: [], aggregation: {}, formControl: frm});
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
        this.projectFields = projectFields;
        this.aggregationList = [];
        this.aggregationList.push({savedSearchesAggregations: [], aggregation: {}, formControl: new FormControl()});
        this.aggregationList[0].formControl.setValue(projectFields[0].fields[0]);
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
    const agg = this.makeAggregations(this.aggregationList);
    const body = {
      query: {
        aggs: {...agg}
      },
      size: 0 // ignore results, performance improvement
    };
    this.makeSavedSearchAggregations(this.aggregationList[0], this.searchService.savedSearchSelection.selected);
    for (const aggregation of this.aggregationList[0].savedSearchesAggregations) {
      const aggregationName = Object.keys(aggregation)[0];
      body.query.aggs[aggregationName] = aggregation[aggregationName];
    }

    this.searchService.setIsLoading(true);
    this.searcherService.search(body, this.currentProject.id).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.searchService.nextAggregation(resp);
      } else {
        this.searchService.nextAggregation([]);
      }
      this.searchService.setIsLoading(false);
    });
  }

  makeAggregations(aggregationList: { savedSearchesAggregations: any[], aggregation: any }[]) {
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

    if (!this.searchQueryExcluded) {
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

  makeSavedSearchAggregations(aggregationObj: AggregationObject, savedSearch: SavedSearch[]) {
    if (this.fieldTypeDate(aggregationObj.formControl.value)) {
      this._dateAggregationComponent.makeAggregationsWithSavedSearches(this.searchService.savedSearchSelection.selected);
    }
    if (this.fieldTypeTextOrFact(aggregationObj.formControl.value)) {
      if (this.isFormControlTypeOfFact(aggregationObj.formControl)) {
        this._textAggregationComponent.makeFactTextAggregationsWithSavedSearches(this.searchService.savedSearchSelection.selected);
      } else {
        this._textAggregationComponent.makeTextAggregationsWithSavedSearches(this.searchService.savedSearchSelection.selected);
      }
    }
  }

  checkIfMainAggregation(indx: number) {
    return this.aggregationList.length === (indx + 1);
  }

  removeAggregation(index) {
    this.aggregationList.splice(index, 1);
  }

  isFormControlTypeOfFact(formControl: FormControl) {
    return formControl &&
      formControl.value && formControl.value.type && formControl.value.type === 'fact';
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
