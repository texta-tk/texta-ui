import {Component, EventEmitter, OnDestroy, OnInit, Output,} from '@angular/core';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {FormControl} from '@angular/forms';
import {forkJoin, of, Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {Constraint, DateConstraint, ElasticsearchQuery, FactConstraint, TextConstraint} from './Constraints';
import {HttpErrorResponse} from '@angular/common/http';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {MatSelectChange} from '@angular/material';
import {Search} from '../../../shared/types/Search';
import {SearchService} from '../../services/search.service';
import {UserStore} from '../../../core/users/user.store';
import {UserProfile} from '../../../shared/types/UserProfile';

@Component({
  selector: 'app-build-search',
  templateUrl: './build-search.component.html',
  styleUrls: ['./build-search.component.scss']
})
export class BuildSearchComponent implements OnInit, OnDestroy {
  @Output() searchButtonClick = new EventEmitter<Search>();
  currentProject: Project;
  projectFields: ProjectField[] = [];
  projectFieldsFiltered: ProjectField[] = [];
  fieldsFormControl = new FormControl();
  constraintList: (Constraint)[] = [];
  projectFacts: ProjectFact[] = [];
  destroy$: Subject<boolean> = new Subject();
  // building the whole search query onto this
  elasticQuery: ElasticsearchQuery = new ElasticsearchQuery();
  searcherOptions: string[] = ['live_search'];
  currentUser: UserProfile;

  constructor(private projectService: ProjectService,
              private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private userStore: UserStore,
              private searchService: SearchService) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((currentProject: Project) => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin({
          facts: this.projectService.getProjectFacts(this.currentProject.id),
          fields: this.projectService.getProjectFields(this.currentProject.id)
        });
      }
      return of(null);
    })).subscribe((resp: { facts: ProjectFact[] | HttpErrorResponse, fields: ProjectField[] | HttpErrorResponse }) => {
      if (resp) {
        this.constraintList = [];
        this.elasticQuery = new ElasticsearchQuery();
        if (!(resp.facts instanceof HttpErrorResponse)) {
          this.projectFacts = resp.facts;
        }
        if (!(resp.fields instanceof HttpErrorResponse)) {
          this.projectFields = resp.fields;
          this.projectFieldsFiltered = this.projectFields;
        }
      }
    });
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });
  }

  public onOpenedChange(opened) {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (this.fieldsFormControl.value && this.fieldsFormControl.value.length > 0)) {
      const formFields: Field[] = this.fieldsFormControl.value;
      if (formFields[0].type === 'text') {
        this.constraintList.push(new TextConstraint(formFields));
      } else if (formFields[0].type === 'date') {
        this.constraintList.push(new DateConstraint(formFields));
      } else {
        this.constraintList.push(new FactConstraint(formFields));
      }
      this.updateFieldsToHighlight(this.constraintList);
      this.checkMinimumMatch(); // query minimum_should_match
      // reset field selection
      this.fieldsFormControl.reset();
      this.projectFieldsFiltered = this.projectFields; // remove field filter by type
    }
  }

  onSelectionChange(event: MatSelectChange) {
    if (event.value.length > 0 && event.value[0].type) {
      this.filterFieldsByConstraintType(event.value[0].type);
    } else {
      this.projectFieldsFiltered = this.projectFields; // no selection remove field filter
    }
  }

  filterFieldsByConstraintType(constraintType: string) {
    this.projectFieldsFiltered = [];
    for (const index of this.projectFields) {
      const filteredFields = index.fields.filter((field) => field.type === constraintType);
      const filteredIndex = {...index}; // deep copy, shallow would change the original projectFields
      filteredIndex.fields = filteredFields;
      this.projectFieldsFiltered.push(filteredIndex);
    }
  }

  buildSavedSearch(savedSearch: any) { // todo type
    this.constraintList.splice(0, this.constraintList.length);
    // console.log(this.searcherService.getSavedSearchById(id, id));
    this.constraintList = [...savedSearch.constraints];
    this.checkMinimumMatch();
  }

  removeConstraint(index) {
    this.constraintList.splice(index, 1);
    this.checkMinimumMatch();
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


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  getSearch() {// implement previous query cancellation todo
    this.searcherService.search({query: this.elasticQuery.elasticsearchQuery}, this.currentProject.id).subscribe(
      (result: { highlight: any, doc: any }[] | HttpErrorResponse) => {
        if (result && !(result instanceof HttpErrorResponse)) {
          this.searchService.nextSearch(new Search(result, false, false));
        }
      });
  }

  searchOnChange(event) {
    // dont want left focus events
    if (event === this.elasticQuery && this.searcherOptions.includes('live_search')) {
      this.getSearch();
    }
  }

  saveSearch(description: string) {
    if (this.currentUser) {
      this.searcherService.saveSearch(this.currentProject.id, this.currentUser.pk, [...this.constraintList], this.elasticQuery, description).subscribe(resp => {
        if (resp) {
          console.log(resp);
        }
      });
    }
  }

  checkMinimumMatch() {
    // need this for fact query to work standalone
    let shouldMatch = 0;
    for (let i = 0; i < this.constraintList.length; i++) {
      if (!(this.constraintList[i] instanceof FactConstraint) && !(this.constraintList[i] instanceof DateConstraint)) {
        shouldMatch += 1;
      }
    }
    this.elasticQuery.query.bool.minimum_should_match = shouldMatch;
  }

  updateFieldsToHighlight(constraints: Constraint[]) {
    this.elasticQuery.highlight.fields = {};
    const fieldsToHighlight = [];
    for (const constraint of constraints) {
      const fields = constraint.fields.map((x: Field) => x.path);
      fieldsToHighlight.push(...fields);
    }
    for (const field of fieldsToHighlight) {
      this.elasticQuery.highlight.fields[field] = {};
    }
  }

}
