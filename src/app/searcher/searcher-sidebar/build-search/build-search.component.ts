import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {FormControl} from '@angular/forms';
import {of, Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {DateTypeForm, ElasticsearchQuery, FactNameTypeForm, TextTypeForm} from './FormTypes';


@Component({
  selector: 'app-build-search',
  templateUrl: './build-search.component.html',
  styleUrls: ['./build-search.component.scss']
})
export class BuildSearchComponent implements OnInit, OnDestroy {
  @Input() projectFields: ProjectField[] = [];
  fieldsFormControl = new FormControl();
  filterFormsList: (DateTypeForm | TextTypeForm | FactNameTypeForm)[] = [];
  factNames: ProjectFact[] = [];
  destroy$: Subject<boolean> = new Subject();
  // building whole query onto this
  elasticQuery: ElasticsearchQuery = new ElasticsearchQuery();

  constructor(private projectService: ProjectService, private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((currentProject: Project) => {
      if (currentProject) {
        return this.projectService.getProjectFacts(currentProject.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp) {
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
        this.filterFormsList.push(new TextTypeForm(formFields, this.elasticQuery));
      } else if (formFields[0].type === 'date') {
        this.filterFormsList.push(new DateTypeForm(formFields, this.elasticQuery));
      } else {
        this.filterFormsList.push(new FactNameTypeForm(formFields, this.elasticQuery));
      }
      this.fieldsFormControl.reset();
      console.log(this.filterFormsList);
    }
  }

  removeFilter(index, filterForm: DateTypeForm | TextTypeForm | FactNameTypeForm) {
    filterForm.deleted$.next(true);
    this.filterFormsList.splice(index, 1);
  }


  isFactNameTypeForm(formType: DateTypeForm | TextTypeForm | FactNameTypeForm) {
    return formType instanceof FactNameTypeForm;
  }

  isTextTypeForm(formType: DateTypeForm | TextTypeForm | FactNameTypeForm) {
    return formType instanceof TextTypeForm;
  }

  isDateTypeForm(formType: DateTypeForm | TextTypeForm | FactNameTypeForm) {
    return formType instanceof DateTypeForm;
  }


}
