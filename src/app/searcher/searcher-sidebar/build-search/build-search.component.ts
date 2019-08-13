import {Component, Input, OnInit} from '@angular/core';
import {Field, ProjectField} from '../../../shared/types/ProjectField';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';

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

export class FilterForm {
  fields: Field[];
  formType: DateTypeForm | TextTypeForm;
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

  constructor() {
    this.elasticQuery = new ElasticsearchQuery();
  }

  ngOnInit() {
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
      } else {
        filterForm.formType = new DateTypeForm();
        this.dateTypeFormListeners(filterForm);
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
    const formQuery = {
      bool: {
        should: {
          multi_match: {
            query: '',
            fields: filterForm.fields.map(x => x.path),
            type: '',
            slop: 0
          }
        }
      }
    };
    const formQueries = [];

    const elasticQueryShould = {
      bool: {}
    };
    // avoid linter error
    elasticQueryShould.bool = {should: formQueries};
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
    // possible memory leak havent checked yet
    // using javascript object identifier to delete cause everything is a shallow copy
    filterForm.deleted$.subscribe(f => {
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
    const fromDateAccessor = {[accessor]: fromDate};
    const toDateAccessor = {[accessor]: toDate};

    this.elasticQuery.query.bool.must.push(fromDateAccessor);
    this.elasticQuery.query.bool.must.push(toDateAccessor);
    formType.dateFromFormControl.valueChanges.subscribe(f => {
      console.log(f);
      fromDate.gte = f;
    });
    formType.dateToFormControl.valueChanges.subscribe(f => {
      toDate.lte = f;
    });
    // possible memory leak havent checked yet
    // using javascript object identifier to delete cause everything is a shallow copy
    filterForm.deleted$.subscribe(f => {
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


  isTextTypeForm(formType: DateTypeForm | TextTypeForm) {
    return formType instanceof TextTypeForm;
  }

  isDateTypeForm(formType: DateTypeForm | TextTypeForm) {
    return formType instanceof DateTypeForm;
  }

  newLineStringToList(stringWithNewLines: string): string[] {
    const stringList = stringWithNewLines.split('\n');
    // filter out empty values
    return stringList.filter(x => x !== '');
  }
}
