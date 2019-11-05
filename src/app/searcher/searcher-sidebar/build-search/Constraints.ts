import {Field} from '../../../shared/types/Project';
import {FormControl} from '@angular/forms';
import {Observable} from "rxjs";

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
  factTextOperatorFormControl = new FormControl();
  inputGroupArray: FactTextInputGroup[] = [];

  constructor(fields: Field[], factNameOperator?, factName?, factTextOperator?, inputGroupArray?: FactTextInputGroup[]) {
    super(fields);
    this.factTextOperatorFormControl.setValue(factTextOperator ? factTextOperator : 'must');
    this.factNameOperatorFormControl.setValue(factNameOperator ? factNameOperator : 'must');
    this.factNameFormControl.setValue(factName ? factName : '');
    this.inputGroupArray = inputGroupArray ? inputGroupArray : [];
  }
}

export class FactTextInputGroup {
  factTextOperatorFormControl = new FormControl();
  factTextFactNameFormControl = new FormControl();
  factTextInputFormControl = new FormControl();
  filteredOptions: string[] = [];
  isLoadingOptions = false;
  query = {
    bool: {}
  };
  formQuery = {
    nested: {
      query: {
        bool: {
          must: []
        }
      },
      path: 'texta_facts', // constant
      inner_hits: {
        size: 100,
        name: '??' // todo, redundant property?
      }
    }
  };

  constructor(factTextOperator?, factTextFactName?, factTextInput?) {
    this.factTextOperatorFormControl.setValue(factTextOperator ? factTextOperator : 'must');
    this.factTextFactNameFormControl.setValue(factTextFactName ? factTextFactName : '');
    this.factTextInputFormControl.setValue(factTextInput ? factTextInput : '');
  }

}

export class ElasticsearchQuery {
  static PRE_TAG = '<TEXTA_SEARCHER_HIGHLIGHT_START_TAG>';
  static POST_TAG = '<TEXTA_SEARCHER_HIGHLIGHT_END_TAG>';
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

  highlight: {
    order?: string,
    number_of_fragments?: number,
    fragment_size?: number,
    pre_tags?: any[],
    post_tags?: any[],
    type?: string,
    fields: {}
  };

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
    this.highlight = {
      pre_tags: [ElasticsearchQuery.PRE_TAG],
      post_tags: [ElasticsearchQuery.POST_TAG],
      number_of_fragments: 0,
      fields: {}
    };
  }
}
