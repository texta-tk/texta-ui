import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {ProjectStore} from '../../../core/projects/project.store';
import {Subject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ElasticsearchQuery} from '../build-search/Constraints';

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
  destroy$: Subject<boolean> = new Subject();
  aggregationList: { savedSearchesAggregatons: any[], aggregation: any }[] = [];
  searcherElasticSearchQuery: ElasticsearchQuery;

  constructor(private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private searchService: SearcherComponentService) {
  }

  fieldSelected(val) {
    this.aggregationList = [];
    this.aggregationList.push({savedSearchesAggregatons: [], aggregation: {}});
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe((currentProject: Project) => {
      if (currentProject) {
        this.currentProject = currentProject;
        this.aggregationList = [];
        this.fieldsFormControl.reset();
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
    let body;
    body = {
      query: {
        aggs: {...this.aggregationList[0].aggregation}
      }
    };
    for (const aggregation of this.aggregationList[0].savedSearchesAggregatons) {
      const aggregationName = Object.keys(aggregation)[0];
      body.query.aggs[aggregationName] = aggregation[aggregationName];
    }
    body.query.size = 0; // ignore results, performance improvement
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
