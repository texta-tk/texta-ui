import {Field} from '../../../shared/types/Project';
import {FormControl} from '@angular/forms';
import {Lexicon} from '../../../shared/types/Lexicon';
import {FromToInput} from '../../../shared/components/from-to-input/from-to-input.component';
import {SearcherOptions} from '../../SearcherOptions';

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

  constructor(fields: Field[], lexicons?: Lexicon[], match?: undefined, text?: undefined, operator?: undefined, slop?: undefined) {
    super(fields);
    this.operatorFormControl.setValue(operator ? operator : 'must');
    this.matchFormControl.setValue(match ? match : 'phrase_prefix');
    this.slopFormControl.setValue(slop ? slop : '0');
    this.textAreaFormControl.setValue(text ? text : '');
    if (lexicons) {
      this.lexicons = lexicons;
    }
  }

}

export class NumberConstraint extends Constraint {
  fromToInput: FromToInput;
  operatorFormControl = new FormControl();

  constructor(fields: Field[], fromTo?: FromToInput, operator?: undefined) {
    super(fields);
    this.operatorFormControl.setValue(operator ? operator : 'must');
    if (fromTo) {
      this.fromToInput = fromTo;
    }
  }

}

export class DateConstraint extends Constraint {
  dateFromFormControl = new FormControl();
  dateToFormControl = new FormControl();

  constructor(fields: Field[], dateFrom?: undefined, dateTo?: undefined) {
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
  isFactValue: boolean;

  constructor(fields: Field[], factNameOperator?: string, factName?: string, factTextOperator?: string,
              inputGroupArray?: FactTextInputGroup[]) {
    super(fields);
    this.factTextOperatorFormControl.setValue(factTextOperator ? factTextOperator : 'must');
    this.factNameOperatorFormControl.setValue(factNameOperator ? factNameOperator : 'must');
    this.factNameFormControl.setValue(factName ? factName : []);
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
        name: 'inne_hits_name' // needs to be unique
      }
    }
  };

  constructor(factTextOperator?: string | undefined, factTextFactName?: string | undefined, factTextInput?: string | undefined) {
    this.factTextOperatorFormControl.setValue(factTextOperator ? factTextOperator : 'must');
    this.factTextFactNameFormControl.setValue(factTextFactName ? factTextFactName : '');
    this.factTextInputFormControl.setValue(factTextInput ? factTextInput : '');
  }

}

export class ElasticsearchQuery {
  elasticSearchQuery: ElasticsearchQueryStructure = {
    query: {
      bool: {
        must: [],
        filter: [],
        must_not: [],
        should: [],
        minimum_should_match: 0,
      }
    },
    highlight: {
      pre_tags: [SearcherOptions.PRE_TAG],
      post_tags: [SearcherOptions.POST_TAG],
      number_of_fragments: 0,
      fields: {}
    },
    from: 0,
    size: 10
  };


}

export interface ElasticsearchQueryStructure {
  highlight: HighlightStructure;
  query: QueryStructure;
  aggs?: AggregationStructure;
  size: number;
  from: number;
  // tslint:disable-next-line:no-any
  sort?: any;
}

interface HighlightStructure {
  order?: string;
  number_of_fragments?: number;
  fragment_size?: number;
  // tslint:disable-next-line:no-any
  pre_tags?: any[];
  // tslint:disable-next-line:no-any
  post_tags?: any[];
  type?: string;
  fields: {};
}

interface QueryStructure {
  bool?: {
    // tslint:disable-next-line:no-any
    must: any[],
    // tslint:disable-next-line:no-any
    filter: any[],
    // tslint:disable-next-line:no-any
    must_not: any[],
    // tslint:disable-next-line:no-any
    should: any[],
    minimum_should_match: number,
  };
  // tslint:disable-next-line:no-any
  multi_match?: any;
}

interface AggregationStructure {
  number_of_fragments: number;
  fields: {};
  pre_tags: string;
  post_tags: string;
}

