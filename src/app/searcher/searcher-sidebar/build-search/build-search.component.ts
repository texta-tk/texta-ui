import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {FormControl} from '@angular/forms';
import {forkJoin, of, Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {
  Constraint,
  DateConstraint,
  ElasticsearchQuery,
  FactConstraint,
  FactTextConstraint,
  TextConstraint
} from './Constraints';
import {HttpErrorResponse} from '@angular/common/http';
import {SearcherService} from '../../../core/searcher/searcher.service';

@Component({
  selector: 'app-build-search',
  templateUrl: './build-search.component.html',
  styleUrls: ['./build-search.component.scss']
})
export class BuildSearchComponent implements OnInit, OnDestroy {
  projectFields: ProjectField[] = [];
  fieldsFormControl = new FormControl();
  constraintList: (Constraint)[] = [];
  projectFacts: ProjectFact[] = [];
  destroy$: Subject<boolean> = new Subject();
  // building the whole search query onto this
  elasticQuery: ElasticsearchQuery = new ElasticsearchQuery();

  constructor(private projectService: ProjectService, private projectStore: ProjectStore, private searcherService: SearcherService) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((currentProject: Project) => {
      if (currentProject) {
        return forkJoin({
          facts: this.projectService.getProjectFacts(currentProject.id),
          fields: this.projectService.getProjectFields(currentProject.id)
        });
      }
      return of(null);
    })).subscribe((resp: { facts: ProjectFact[], fields: ProjectField[] } | HttpErrorResponse) => {
      if (!(resp instanceof HttpErrorResponse) && resp) {
        this.constraintList = [];
        this.elasticQuery = new ElasticsearchQuery();
        if (resp.facts) {
          this.projectFacts = resp.facts;
        }
        if (resp.fields) {
          this.projectFields = resp.fields;
        }
      }
    });
  }

  onOpenedChange(opened) {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (this.fieldsFormControl.value && this.fieldsFormControl.value.length > 0)) {
      const formFields: Field[] = this.fieldsFormControl.value;
      if (formFields[0].type === 'text') {
        this.constraintList.push(new TextConstraint(formFields));
      } else if (formFields[0].type === 'date') {
        this.constraintList.push(new DateConstraint(formFields));
      } else if (formFields[0].type === 'keyword') { // temp for fact_text_values
        this.constraintList.push(new FactTextConstraint(formFields));
      } else {
        this.constraintList.push(new FactConstraint(formFields));
      }
      this.fieldsFormControl.reset();
      console.log(this.constraintList);
    }
  }

  buildSavedSearch(id: number) {
    this.constraintList.splice(0, this.constraintList.length);
    this.constraintList.push(this.searcherService.getSavedSearchById(id, id));
  }

  removeConstraint(index) {
    this.constraintList.splice(index, 1);
  }

  isFactNameConstraint(constraintType: Constraint) {
    return constraintType instanceof FactConstraint;
  }

  isTextConstraint(constraintType: Constraint) {
    return constraintType instanceof TextConstraint;
  }

  isDateConstraint(constraintType: Constraint) {
    return constraintType instanceof DateConstraint;
  }

  isFactTextConstraint(constraintType: Constraint) {
    return constraintType instanceof FactTextConstraint;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
