import {Field, ProjectFact} from '../../../shared/types/Project';

export class Constraint {
  fields: Field[];

  constructor(fields: Field[]) {
    this.fields = fields;
  }
}


export class TextConstraint extends Constraint {

  constructor(fields: Field[], public phrasePrefix?, public text?, public operator?) {
    super(fields);
  }

}

export class DateConstraint extends Constraint {

}

export class FactConstraint extends Constraint {
  projectFacts: ProjectFact[];

  constructor(fields: Field[]) {
    super(fields);
  }
}

export class FactTextConstraint extends Constraint {
  projectFacts: ProjectFact[];

  constructor(fields: Field[]) {
    super(fields);
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
