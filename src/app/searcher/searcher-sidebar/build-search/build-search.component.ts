import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {FormControl} from '@angular/forms';
import {of, Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {Constraint, DateConstraint, ElasticsearchQuery, FactConstraint, FactTextConstraint, TextConstraint} from './Constraints';
import {HttpErrorResponse} from '@angular/common/http';
import {SearcherService} from '../../../core/searcher/searcher.service';

@Component({
  selector: 'app-build-search',
  templateUrl: './build-search.component.html',
  styleUrls: ['./build-search.component.scss']
})
export class BuildSearchComponent implements OnInit, OnDestroy {
  @Input() projectFields: ProjectField[] = [];
  fieldsFormControl = new FormControl();
  filterFormsList: (Constraint)[] = [];
  factNames: ProjectFact[] = [];
  destroy$: Subject<boolean> = new Subject();
  // building whole query onto this
  elasticQuery: ElasticsearchQuery = new ElasticsearchQuery();

  constructor(private projectService: ProjectService, private projectStore: ProjectStore, private searcherService: SearcherService) {
    console.log(this.projectFields);
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((currentProject: Project) => {
      if (currentProject) {
        return this.projectService.getProjectFacts(currentProject.id);
      }
      return of(null);
    })).subscribe((resp: ProjectFact[] | HttpErrorResponse) => {
      if (!(resp instanceof HttpErrorResponse)) {
        for (const constraint of this.filterFormsList) {
          constraint.deleted$.next(true);
        }
        this.filterFormsList = [];
        this.elasticQuery = new ElasticsearchQuery();
        this.factNames = resp;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onOpenedChange(opened) {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (this.fieldsFormControl.value && this.fieldsFormControl.value.length > 0)) {
      const formFields: Field[] = this.fieldsFormControl.value;
      if (formFields[0].type === 'text') {
        this.filterFormsList.push(new TextConstraint(formFields));
      } else if (formFields[0].type === 'date') {
        this.filterFormsList.push(new DateConstraint(formFields));
      } else if (formFields[0].type === 'keyword') { // temp for fact_text_values
        this.filterFormsList.push(new FactTextConstraint(formFields));
      } else {
        this.filterFormsList.push(new FactConstraint(formFields));
      }
      this.fieldsFormControl.reset();
      console.log(this.filterFormsList);
    }
  }

  buildSearch(id: number) {
    for (const constraint of this.filterFormsList) {
      constraint.deleted$.next(true);
    }
    this.filterFormsList.splice(0, this.filterFormsList.length);
    console.log(this.filterFormsList);
    this.filterFormsList.push(this.searcherService.getSavedSearchById(id, id));
  }

  removeFilter(index, filterForm: Constraint) {
    filterForm.deleted$.next(true);
    this.filterFormsList.splice(index, 1);
  }


  isFactNameTypeForm(formType: Constraint) {
    return formType instanceof FactConstraint;
  }

  isTextTypeForm(formType: Constraint) {
    return formType instanceof TextConstraint;
  }

  isDateTypeForm(formType: Constraint) {
    return formType instanceof DateConstraint;
  }

  isFactTextTypeForm(formType: Constraint) {
    return formType instanceof FactTextConstraint;
  }


}
