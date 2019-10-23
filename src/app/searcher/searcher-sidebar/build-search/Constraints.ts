import {Field} from '../../../shared/types/Project';
import {FormControl} from '@angular/forms';

export class Constraint {
  fields: Field[];

  constructor(fields: Field[]) {
    this.fields = fields;
  }
}


export class TextConstraint extends Constraint {
  textAreaFormControl = new FormControl();
  slopFormControl = new FormControl();
  matchFormControl = new FormControl();
  operatorFormControl = new FormControl();

  constructor(fields: Field[], match?, text?, operator?, slop?) {
    super(fields);
    this.operatorFormControl.setValue(operator ? operator : 'must');
    this.matchFormControl.setValue(match ? match : 'phrase_prefix');
    this.slopFormControl.setValue(slop ? slop : '0');
    this.textAreaFormControl.setValue(text ? text : '');
  }

}

export class DateConstraint extends Constraint {
  dateFromFormControl = new FormControl();
  dateToFormControl = new FormControl();

  constructor(fields: Field[], dateFrom?, dateTo?) {
    super(fields);
    this.dateFromFormControl.setValue(dateFrom ? dateFrom : '');
    this.dateToFormControl.setValue(dateTo ? dateTo : '');
  }
}

export class FactConstraint extends Constraint {
  factNameOperatorFormControl = new FormControl();
  factNameFormControl = new FormControl();

  constructor(fields: Field[], factNameOperator?, factName?) {
    super(fields);
    this.factNameOperatorFormControl.setValue(factNameOperator ? factNameOperator : 'must');
    this.factNameFormControl.setValue(factName ? factName : '');
  }
}

export class ElasticsearchQuery {
  query: {
    bool: {
      must: any[],
      filter: any[],
      must_not: any[],
      should: any[],
      minimum_should_match: number,
      boost: 1.0
    }
  };
  // todo highlight query here?
  highlight = {
    fields: {
      kysimus_ja_vastus: {pre_tags: ['<em>'], post_tags: ['</em>']},
    }
  };
  elasticsearchQuery;

  constructor() {
    this.query = {
      bool: {
        must: [],
        filter: [],
        must_not: [],
        should: [],
        minimum_should_match: 0,
        boost: 1.0
      }
    };
    this.elasticsearchQuery = {
      query: this.query,
      highlight: this.highlight
    };
  }
}
