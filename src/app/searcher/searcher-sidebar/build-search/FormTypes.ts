import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {Field} from '../../../shared/types/Project';
import {take} from 'rxjs/operators';


export class TextTypeForm {
  fields: Field[];
  textAreaFormControl = new FormControl();
  slopFormControl = new FormControl();
  matchFormControl = new FormControl();
  operatorFormControl = new FormControl();
  deleted$: Subject<boolean> = new Subject<boolean>();
  elasticQuery: ElasticsearchQuery;

  constructor(fields: Field[], elasticSearchQuery: ElasticsearchQuery) {
    this.fields = fields;
    this.elasticQuery = elasticSearchQuery;
    this.slopFormControl.setValue('0');
    this.matchFormControl.setValue('phrase_prefix');
    this.operatorFormControl.setValue('must');
    this.initFormListeners();
  }

  initFormListeners() {
    // using javascript object identifier to delete cause everything is a shallow copy
    const formQuery = {
      bool: {
        should: {
          multi_match: {
            query: '',
            fields: this.fields.map(x => x.path),
            type: this.matchFormControl.value,
            slop: this.slopFormControl.value
          }
        }
      }
    };
    const formQueries = [];

    const elasticQueryShould = {
      bool: {
        [this.operatorFormControl.value]: formQueries
      }
    };
    this.elasticQuery.query.bool.should.push(elasticQueryShould);

    this.textAreaFormControl.valueChanges.subscribe(value => {
      this.buildTextareaMultiMatchQuery(formQueries, formQuery, value);
    });
    this.matchFormControl.valueChanges.subscribe(value => {
      formQuery.bool.should.multi_match.type = value;
      // update deep copy multi_match clauses
      if (this.textAreaFormControl.value && this.textAreaFormControl.value.length > 0) {
        this.buildTextareaMultiMatchQuery(formQueries, formQuery, this.textAreaFormControl.value);
      }
    });
    this.operatorFormControl.valueChanges.subscribe((value: string) => {
      elasticQueryShould.bool = {[value]: formQueries};
    });
    this.slopFormControl.valueChanges.subscribe(value => {
      formQuery.bool.should.multi_match.slop = value;
      // update slop
      if (this.textAreaFormControl.value && this.textAreaFormControl.value.length > 0) {
        this.buildTextareaMultiMatchQuery(formQueries, formQuery, this.textAreaFormControl.value);
      }
    });
    // using javascript object identifier to delete cause everything is a shallow copy
    this.deleted$.pipe(take(1)).subscribe(f => {
      const index = this.elasticQuery.query.bool.should.indexOf(elasticQueryShould, 0);
      if (index > -1) {
        this.elasticQuery.query.bool.should.splice(index, 1);
      }
    });
  }

  // every newline in textarea is a new multi_match clause
  private buildTextareaMultiMatchQuery(formQueries, formQuery, formValue) {
    // reset
    formQueries.splice(0, formQueries.length);

    const stringList = formValue.split('\n');
    // filter out empty values
    const newlineString = stringList.filter(x => x !== '');
    if (newlineString.length > 0) {
      for (const line of newlineString) {
        // json for deep copy
        const newFormQuery = JSON.parse(JSON.stringify(formQuery));
        newFormQuery.bool.should.multi_match.query = line;
        formQueries.push(newFormQuery);
      }
    }
  }

}

export class DateTypeForm {
  fields: Field[];
  dateFromFormControl = new FormControl();
  dateToFormControl = new FormControl();
  deleted$: Subject<boolean> = new Subject<boolean>();
  elasticQuery: ElasticsearchQuery;

  constructor(fields: Field[], elasticSearchQuery: ElasticsearchQuery) {
    this.fields = fields;
    this.elasticQuery = elasticSearchQuery;
    this.initFormListeners();
  }

  private initFormListeners() {
    const fieldPaths = this.fields.map(x => x.path);
    const accessor: string = fieldPaths.join(',');
    const fromDate = {gte: ''};
    const toDate = {lte: ''};
    const fromDateAccessor = {range: {[accessor]: fromDate}};
    const toDateAccessor = {range: {[accessor]: toDate}};

    this.elasticQuery.query.bool.must.push(fromDateAccessor);
    this.elasticQuery.query.bool.must.push(toDateAccessor);
    this.dateFromFormControl.valueChanges.subscribe(value => {
      fromDate.gte = value;
    });
    this.dateToFormControl.valueChanges.subscribe(value => {
      toDate.lte = value;
    });
    // using javascript object identifier to delete cause everything is a shallow copy
    this.deleted$.pipe(take(1)).subscribe(f => {
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
}

export class FactNameTypeForm {
  fields: Field[];
  factNameOperatorFormControl = new FormControl();
  factNameFormControl = new FormControl();
  deleted$: Subject<boolean> = new Subject<boolean>();
  elasticQuery: ElasticsearchQuery;

  constructor(fields: Field[], elasticSearchQuery: ElasticsearchQuery) {
    this.fields = fields;
    this.elasticQuery = elasticSearchQuery;
    this.factNameOperatorFormControl.setValue('must');
    this.initFormListeners();
  }

  // todo test this, refactor
  private initFormListeners() {
    const fieldPaths = this.fields.map(x => x.path).join(',');

    const formQuery = {
      nested: {
        query: {
          bool: {
            must: []
          }
        },
        path: fieldPaths,
        inner_hits: {
          size: 100,
          name: '??' // todo
        }
      }
    };
    const formQueries = [];
    const query = {
      bool: {}
    };
    query.bool = {[this.factNameOperatorFormControl.value]: formQueries};
    this.elasticQuery.query.bool.must.push(query);
    this.factNameOperatorFormControl.valueChanges.subscribe((value: string) => {
      query.bool = {[value]: formQueries};
    });
    this.factNameFormControl.valueChanges.subscribe((f: string[]) => {
      formQueries.splice(0, formQueries.length);

      console.log(formQueries);
      // filter out empty values
      const newlineString = f.filter(x => x !== '');
      if (newlineString.length > 0) {
        for (const line of newlineString) {
          // json for deep copy
          const newFormQuery = JSON.parse(JSON.stringify(formQuery));
          newFormQuery.nested.query.bool.must.push({term: {'texta_facts.doc_path': fieldPaths}});
          newFormQuery.nested.query.bool.must.push({term: {'texta_facts.fact': line}});
          formQueries.push(newFormQuery);
        }
      }

    });

    this.deleted$.pipe(take(1)).subscribe(f => {
      const index = this.elasticQuery.query.bool.must.indexOf(query, 0);
      console.log(index);
      if (index > -1) {
        this.elasticQuery.query.bool.must.splice(index, 1);
      }
      console.log(query);
    });

  }

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
