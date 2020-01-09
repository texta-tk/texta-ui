import {Field} from '../../../shared/types/Project';
import {FormControl} from '@angular/forms';
import {Lexicon} from '../../../shared/types/Lexicon';

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
  lexicons: Lexicon[];

  constructor(fields: Field[], lexicons?: Lexicon[], match?, text?, operator?, slop?) {
    super(fields);
    this.operatorFormControl.setValue(operator ? operator : 'must');
    this.matchFormControl.setValue(match ? match : 'phrase_prefix');
    this.slopFormControl.setValue(slop ? slop : '0');
    this.textAreaFormControl.setValue(text ? text : '');
    this.lexicons = lexicons;
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

  private _elasticSearchQuery: ElasticsearchQueryStructure = {};

  constructor() {
    this._elasticSearchQuery.query = {
      bool: {
        must: [],
        filter: [],
        must_not: [],
        should: [],
        minimum_should_match: 0,
      }
    };
    this._elasticSearchQuery.highlight = {
      pre_tags: [ElasticsearchQuery.PRE_TAG],
      post_tags: [ElasticsearchQuery.POST_TAG],
      number_of_fragments: 0,
      fields: {}
    };
    this._elasticSearchQuery.from = 0;
    this._elasticSearchQuery.size = 10;
  }

  get size(): number {
    return this._elasticSearchQuery.size;
  }

  set size(val: number) {
    this._elasticSearchQuery.size = val;
  }

  get from(): number {
    return this._elasticSearchQuery.from;
  }

  set from(val: number) {
    this._elasticSearchQuery.from = val;
  }

  get sort() {
    return this._elasticSearchQuery.sort;
  }

  set sort(val) {
    this._elasticSearchQuery.sort = val;
  }

  get elasticSearchQuery(): ElasticsearchQueryStructure {
    return this._elasticSearchQuery;
  }

  set elasticSearchQuery(elasticQuery: ElasticsearchQueryStructure) {
    this._elasticSearchQuery = elasticQuery;
  }
}

export interface ElasticsearchQueryStructure {
  highlight?: HighlightStructure;
  query?: QueryStructure;
  aggs?: AggregationStructure;
  size?: number;
  from?: number;
  sort?: any;
}

interface HighlightStructure {
  order?: string;
  number_of_fragments?: number;
  fragment_size?: number;
  pre_tags?: any[];
  post_tags?: any[];
  type?: string;
  fields: {};
}

interface QueryStructure {
  bool: {
    must: any[],
    filter: any[],
    must_not: any[],
    should: any[],
    minimum_should_match: number,
  };
}

interface AggregationStructure {
  number_of_fragments: number;
  fields: {};
  pre_tags: string;
  post_tags: string;
}
