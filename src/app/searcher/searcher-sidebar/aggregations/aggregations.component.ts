import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {ProjectStore} from '../../../core/projects/project.store';
import {Subject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {SearcherService} from '../../../core/searcher/searcher.service';

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
  destroy$: Subject<boolean> = new Subject();

  constructor(private projectStore: ProjectStore, private searcherService: SearcherService) {
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
  }

  aggregate() {
    const aggregationQuery = {
      size: 0,
      aggs: {
        sales_over_time: {
          auto_date_histogram: {
            field: this.fieldsFormControl.value.path,
            buckets: 10,
            format: 'yyyy-MM-dd'
          }
        }
      }
    };
    this.searcherService.search(aggregationQuery, this.currentProject.id).subscribe(resp => {
      console.log(resp);
    });
    console.log(this.aggregationType);
    console.log(this.fieldsFormControl.value);
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
