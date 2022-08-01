import {Field} from '../../../shared/types/Project';
import {UntypedFormControl} from '@angular/forms';
import {Lexicon} from '../../../shared/types/Lexicon';
import {FromToInput} from '../../../shared/shared-module/components/from-to-input/from-to-input.component';
import {HighlightSettings} from '../../../shared/SettingVars';
import {DateTime} from 'luxon';


export class Constraint {
  fields: Field[];

  constructor(fields: Field[]) {
    this.fields = fields;
  }

}

export class BooleanConstraint extends Constraint {
  booleanValueFormControl = new UntypedFormControl();
  operatorFormControl = new UntypedFormControl();

  constructor(fields: Field[], booleanValue: boolean, operator?: undefined) {
    super(fields);
    this.operatorFormControl.setValue(operator ? operator : 'must');
    this.booleanValueFormControl.setValue(booleanValue);
  }

}

export class TextConstraint extends Constraint {
  textAreaFormControl = new UntypedFormControl();
  slopFormControl = new UntypedFormControl();
  matchFormControl = new UntypedFormControl();
  operatorFormControl = new UntypedFormControl();
  fuzzinessFormControl = new UntypedFormControl();
  prefixLengthFormControl = new UntypedFormControl();
  ignoreCaseFormControl = new UntypedFormControl();
  lexicons: Lexicon[];

  constructor(fields: Field[], lexicons?: Lexicon[], match?: undefined, text?: undefined, operator?: undefined, slop?: undefined, fuzziness?: undefined, prefixLength?: undefined, ignoreCase?: undefined) {
    super(fields);
    this.operatorFormControl.setValue(operator ? operator : 'must');
    this.matchFormControl.setValue(match ? match : 'phrase_prefix');
    this.fuzzinessFormControl.setValue(fuzziness ? fuzziness : 2);
    this.prefixLengthFormControl.setValue(prefixLength ? prefixLength : 0);
    this.slopFormControl.setValue(slop ? slop : '0');
    this.ignoreCaseFormControl.setValue(ignoreCase ? ignoreCase : false);
    this.textAreaFormControl.setValue(text ? text : '');
    if (lexicons) {
      this.lexicons = lexicons;
    }
  }

}

export class NumberConstraint extends Constraint {
  fromToInput: FromToInput;
  operatorFormControl = new UntypedFormControl();

  constructor(fields: Field[], fromTo?: FromToInput, operator?: undefined) {
    super(fields);
    this.operatorFormControl.setValue(operator ? operator : 'must');
    if (fromTo) {
      this.fromToInput = fromTo;
    }
  }

}

export class DateConstraint extends Constraint {
  dateFromFormControl = new UntypedFormControl();
  dateToFormControl = new UntypedFormControl();

  constructor(fields: Field[], dateFrom?: undefined, dateTo?: undefined) {
    super(fields);
    this.dateFromFormControl.setValue(dateFrom ? DateTime.fromISO(dateFrom, {zone: 'utc'}) : '');
    this.dateToFormControl.setValue(dateTo ?  DateTime.fromISO(dateTo, {zone: 'utc'}) : '');
  }
}

export class FactConstraint extends Constraint {
  factNameOperatorFormControl = new UntypedFormControl();
  factNameFormControl = new UntypedFormControl();
  factValueOperatorFormControl = new UntypedFormControl();
  inputGroupArray: FactTextInputGroup[] | undefined; // will always be undefined with factName type

  constructor(fields: Field[], isFactValue: boolean, factNameOperator?: string, factName?: string, factTextOperator?: string,
              inputGroupArray?: FactTextInputGroup[]) {
    super(fields);
    this.factValueOperatorFormControl.setValue(factTextOperator ? factTextOperator : 'must');
    this.factNameOperatorFormControl.setValue(factNameOperator ? factNameOperator : 'must');
    this.factNameFormControl.setValue(factName ? factName : []);
    this.inputGroupArray = isFactValue ? inputGroupArray || [] : undefined;
  }
}

export class FactTextInputGroup {
  factTextOperatorFormControl = new UntypedFormControl();
  factTextFactNameFormControl = new UntypedFormControl();
  factTextInputFormControl = new UntypedFormControl();
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
    track_total_hits: true,
    highlight: {
      pre_tags: [HighlightSettings.PRE_TAG],
      post_tags: [HighlightSettings.POST_TAG],
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
  track_total_hits: boolean;
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

