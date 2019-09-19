import {Subject} from 'rxjs';
import {Field, ProjectFact} from '../../../shared/types/Project';

export class Constraint {
  fields: Field[];
  deleted$: Subject<boolean> = new Subject<boolean>();
  elasticQuery: ElasticsearchQuery;

  constructor(fields: Field[], elasticSearchQuery: ElasticsearchQuery) {
    this.fields = fields;
    this.elasticQuery = elasticSearchQuery;
  }
}

// for type checking, maybe need to add something specific to constraint in the future>?
export class TextConstraint extends Constraint {

}

export class DateConstraint extends Constraint {

}

export class FactConstraint extends Constraint {
  projectFacts: ProjectFact[];

  constructor(fields: Field[], elasticSearchQuery: ElasticsearchQuery, projectFacts: ProjectFact[]) {
    super(fields, elasticSearchQuery);
    this.projectFacts = projectFacts;
  }
}

export class FactTextConstraint extends Constraint {
  projectFacts: ProjectFact[];

  constructor(fields: Field[], elasticSearchQuery: ElasticsearchQuery, projectFacts: ProjectFact[]) {
    super(fields, elasticSearchQuery);
    this.projectFacts = projectFacts;
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
