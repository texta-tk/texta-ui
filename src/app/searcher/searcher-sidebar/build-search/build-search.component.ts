import {Component, Input, OnInit} from '@angular/core';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {FormControl} from '@angular/forms';
import {of, Subject} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';

export class TextTypeForm {
  textAreaFormControl = new FormControl();
  slopFormControl = new FormControl();
  matchFormControl = new FormControl();
  operatorFormControl = new FormControl();
}

export class DateTypeForm {
  dateFromFormControl = new FormControl();
  dateToFormControl = new FormControl();
}

export class FactNameTypeForm {
  factNameOperatorFormControl = new FormControl();
  factNameFormControl = new FormControl();
}

export class FilterForm {
  fields: Field[];
  formType: DateTypeForm | TextTypeForm | FactNameTypeForm;
  deleted$: Subject<boolean>;
}

export class ElasticsearchQuery {
  query: {
    bool: {
      must: any[],
      filter: any[],
      must_not: any[],
      should: any[],
      minimum_should_match: 1,
      boost: 1.0
    }
  };

  constructor() {
    this.query = {
      bool: {
        must: [],
        filter: [],
        must_not: [],
        should: [],
        minimum_should_match: 1,
        boost: 1.0
      }
    };
  }
}

@Component({
  selector: 'app-build-search',
  templateUrl: './build-search.component.html',
  styleUrls: ['./build-search.component.scss']
})
export class BuildSearchComponent implements OnInit {
  @Input() projectFields: ProjectField[] = [];
  fieldsFormControl = new FormControl();
  filtersList: FilterForm[] = [];
  elasticQuery: ElasticsearchQuery;
  factNames: ProjectFact[] = [];

  constructor(private projectService: ProjectService, private projectStore: ProjectStore) {
    this.elasticQuery = new ElasticsearchQuery();
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(switchMap((x: Project) => {
      if (x) {
        return this.projectService.getProjectFacts(x.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp) {
        this.factNames = resp;
      }
    });
  }

  onOpenedChange(opened) {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (this.fieldsFormControl.value && this.fieldsFormControl.value.length > 0)) {
      console.log(this.filtersList.length);
      console.log(this.fieldsFormControl.value);
      const filterForm = new FilterForm();
      filterForm.fields = this.fieldsFormControl.value;
      filterForm.deleted$ = new Subject<boolean>();
      if (filterForm.fields[0].type === 'text') {
        filterForm.formType = new TextTypeForm();
        this.textTypeFormListeners(filterForm);
      } else if (filterForm.fields[0].type === 'date') {
        filterForm.formType = new DateTypeForm();
        this.dateTypeFormListeners(filterForm);
      } else {
        filterForm.formType = new FactNameTypeForm();
        this.factNameTypeFormListeners(filterForm);
      }
      this.filtersList.push(filterForm);
      this.fieldsFormControl.reset();
      console.log(this.filtersList);
    }
  }

  removeFilter(index, filterForm: FilterForm) {
    // remove the part that the form has from the query
    filterForm.deleted$.next(true);
    this.filtersList.splice(index, 1);
  }

  textTypeFormListeners(filterForm: FilterForm) {
    // using javascript object identifier to delete cause everything is a shallow copy
    const formType = filterForm.formType as TextTypeForm;
    formType.slopFormControl.setValue('0');
    formType.matchFormControl.setValue('phrase_prefix');
    formType.operatorFormControl.setValue('must');
    const formQuery = {
      bool: {
        should: {
          multi_match: {
            query: '',
            fields: filterForm.fields.map(x => x.path),
            type: formType.matchFormControl.value,
            slop: formType.slopFormControl.value
          }
        }
      }
    };
    const formQueries = [];

    const elasticQueryShould = {
      bool: {}
    };
    // avoid linter error
    elasticQueryShould.bool = {[formType.operatorFormControl.value]: formQueries};
    this.elasticQuery.query.bool.should.push(elasticQueryShould);

    formType.textAreaFormControl.valueChanges.subscribe(f => {
      this.buildTextareaMultiMatchQuery(formQueries, formQuery, f);
    });
    formType.matchFormControl.valueChanges.subscribe(f => {
      formQuery.bool.should.multi_match.type = f;
      // update match type
      if (formType.textAreaFormControl.value && formType.textAreaFormControl.value.length > 0) {
        this.buildTextareaMultiMatchQuery(formQueries, formQuery, formType.textAreaFormControl.value);
      }
    });
    formType.operatorFormControl.valueChanges.subscribe((f: string) => {
      elasticQueryShould.bool = {[f]: formQueries};
    });
    formType.slopFormControl.valueChanges.subscribe(f => {
      formQuery.bool.should.multi_match.slop = f;
      // update slop
      if (formType.textAreaFormControl.value && formType.textAreaFormControl.value.length > 0) {
        this.buildTextareaMultiMatchQuery(formQueries, formQuery, formType.textAreaFormControl.value);
      }
    });
    // using javascript object identifier to delete cause everything is a shallow copy
    filterForm.deleted$.pipe(take(1)).subscribe(f => {
      const index = this.elasticQuery.query.bool.should.indexOf(elasticQueryShould, 0);
      console.log(index);
      if (index > -1) {
        this.elasticQuery.query.bool.should.splice(index, 1);
      }
      console.log(elasticQueryShould);
    });

  }

  private buildTextareaMultiMatchQuery(formQueries, formQuery, formValue) {
    formQueries.splice(0, formQueries.length);
    const newlineString = this.newLineStringToList(formValue);
    console.log(newlineString);
    if (newlineString.length > 0) {
      for (const line of newlineString) {
        // json for deep copy
        const newFormQuery = JSON.parse(JSON.stringify(formQuery));
        newFormQuery.bool.should.multi_match.query = line;
        formQueries.push(newFormQuery);
      }
    }
  }

  dateTypeFormListeners(filterForm: FilterForm) {
    const formType = filterForm.formType as DateTypeForm;
    const fieldPaths = filterForm.fields.map(x => x.path);
    const accessor: string = fieldPaths.join(',');
    const fromDate = {gte: ''};
    const toDate = {lte: ''};
    const fromDateAccessor = {range: {[accessor]: fromDate}};
    const toDateAccessor = {range: {[accessor]: toDate}};

    this.elasticQuery.query.bool.must.push(fromDateAccessor);
    this.elasticQuery.query.bool.must.push(toDateAccessor);
    formType.dateFromFormControl.valueChanges.subscribe(f => {
      console.log(f);
      fromDate.gte = f;
    });
    formType.dateToFormControl.valueChanges.subscribe(f => {
      toDate.lte = f;
    });
    // using javascript object identifier to delete cause everything is a shallow copy
    filterForm.deleted$.pipe(take(1)).subscribe(f => {
      let index = this.elasticQuery.query.bool.must.indexOf(fromDateAccessor, 0);
      console.log(index);
      if (index > -1) {
        this.elasticQuery.query.bool.must.splice(index, 1);
      }
      index = this.elasticQuery.query.bool.must.indexOf(toDateAccessor, 0);
      console.log(index);
      if (index > -1) {
        this.elasticQuery.query.bool.must.splice(index, 1);
      }
    });

  }

  factNameTypeFormListeners(filterForm: FilterForm) {
    const formType = filterForm.formType as FactNameTypeForm;
    const fieldPaths = filterForm.fields.map(x => x.path);
    formType.factNameOperatorFormControl.setValue('must');
    const selection = {
      'texta_facts.fact': formType.factNameFormControl.value
    };
    const formQuery = {
      nested: {
        query: {
          bool: {
            must: [
              {
                term: {
                  'texta_facts.doc_path': fieldPaths
                }
              },
              {
                term: selection
              }
            ]
          }
        }
      }
    };
    const query = {
      bool: {}
    };
    query.bool = {[formType.factNameOperatorFormControl.value]: formQuery};
    this.elasticQuery.query.bool.must.push(query);
    formType.factNameOperatorFormControl.valueChanges.subscribe((f: string) => {
      query.bool = {[f]: formQuery};
    });
    formType.factNameFormControl.valueChanges.subscribe((f: string) => {
      // selection['texta_facts.fact'] = f;

    });

    filterForm.deleted$.pipe(take(1)).subscribe(f => {
      const index = this.elasticQuery.query.bool.must.indexOf(query, 0);
      console.log(index);
      if (index > -1) {
        this.elasticQuery.query.bool.must.splice(index, 1);
      }
      console.log(query);
    });

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

  newLineStringToList(stringWithNewLines: string): string[] {
    const stringList = stringWithNewLines.split('\n');
    // filter out empty values
    return stringList.filter(x => x !== '');
  }

}
