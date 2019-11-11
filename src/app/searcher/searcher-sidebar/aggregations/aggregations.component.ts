import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {ProjectStore} from '../../../core/projects/project.store';
import {Subject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {SearchService} from "../../services/search.service";
import {ElasticsearchQuery} from "../build-search/Constraints";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-aggregations',
  templateUrl: './aggregations.component.html',
  styleUrls: ['./aggregations.component.scss']
})
export class AggregationsComponent implements OnInit, OnDestroy {
  currentProject: Project;
  projectFields: ProjectField[] = [];
  projectFacts: ProjectFact[] = [];
  fieldsFormControl = new FormControl();
  aggregationType;
  aggregationSize = 30;
  dateInterval;
  destroy$: Subject<boolean> = new Subject();
  searcherElasticSearchQuery: ElasticsearchQuery;

  constructor(private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private searchService: SearchService) {
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
      }
    });
    this.searchService.getElasticQuery().pipe(takeUntil(this.destroy$)).subscribe((query: ElasticsearchQuery) => {
      if (query) {
        this.searcherElasticSearchQuery = query;
      }
    });
  }

  aggregate() {
    let aggregationQuery;
    if (this.fieldTypeTextOrFact(this.fieldsFormControl.value)) {
      aggregationQuery = this.makeTextAggregation();
    } else if (this.fieldTypeDate(this.fieldsFormControl.value)) {
      aggregationQuery = this.makeDateAggregation();

    }

    this.searcherElasticSearchQuery.aggs = aggregationQuery;
    this.searcherService.search({query: this.searcherElasticSearchQuery}, this.currentProject.id).subscribe(resp => {
      console.log(resp);
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.searchService.nextAggregation(resp);
      }
    });
    console.log(this.aggregationType);
    console.log(this.fieldsFormControl.value);
  }

  makeDateAggregation() {
    this.searcherElasticSearchQuery.size = 0;
    return {
      agg_histo: {
        date_histogram: {
          field: this.fieldsFormControl.value.path,
          interval: this.dateInterval
        }
      }
    };
  }

  makeTextAggregation() {
    this.searcherElasticSearchQuery.size = this.aggregationSize;
    return {
      agg_term: {
        [this.aggregationType]: {
          field:
            `${this.fieldsFormControl.value.path}${
              this.aggregationType === 'significant_terms' || this.aggregationType === 'terms' ? '.keyword' : ''}`
        }
      }
    };
  }

  fieldTypeTextOrFact(val: Field) {
    return (val && (val.type === 'text' || val.type === 'fact'));
  }

  fieldTypeDate(val: Field) {
    return (val && (val.type === 'date'));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
