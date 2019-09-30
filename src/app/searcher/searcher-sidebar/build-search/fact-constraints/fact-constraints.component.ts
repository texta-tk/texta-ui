import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ElasticsearchQuery, FactConstraint} from '../Constraints';
import {FormControl} from '@angular/forms';
import {startWith, takeUntil} from 'rxjs/operators';
import {ProjectFact} from '../../../../shared/types/Project';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-fact-constraints',
  templateUrl: './fact-constraints.component.html',
  styleUrls: ['./fact-constraints.component.scss']
})
export class FactConstraintsComponent implements OnInit, OnDestroy {
  // inner hits name counter
  static componentCount = 0;
  _factConstraint: FactConstraint;
  @Input() set factConstraint(value: FactConstraint) {
    if (value) {
      this._factConstraint = value;
      this.factNameOperatorFormControl = this._factConstraint.factNameOperatorFormControl;
      this.factNameFormControl = this._factConstraint.factNameFormControl;
    }
  }

  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Input() projectFacts: ProjectFact[] = [];
  @Output() change = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes
  factNameOperatorFormControl: FormControl;
  factNameFormControl: FormControl;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constraintQuery;

  constructor() {
    FactConstraintsComponent.componentCount += 1;
  }

  ngOnInit() {
    if (this._factConstraint) {
      const fieldPaths = this._factConstraint.fields.map(x => x.path).join(',');

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
            name: '??' // todo, redundant property?
          }
        }
      };
      const formQueries = [];
      this.constraintQuery = {
        bool: {}
      };
      this.constraintQuery.bool = {[this.factNameOperatorFormControl.value]: formQueries};
      this.elasticSearchQuery.query.bool.must.push(this.constraintQuery);
      this.factNameOperatorFormControl.valueChanges.pipe(
        startWith(this.factNameOperatorFormControl.value as object),
        takeUntil(this.destroyed$)).subscribe((value: string) => {
        this.constraintQuery.bool = {[value]: formQueries};
        this.change.emit(this.elasticSearchQuery);
      });
      this.factNameFormControl.valueChanges.pipe(
        startWith(this.factNameFormControl.value as object),
        takeUntil(this.destroyed$)).subscribe((facts: string[]) => {
        if (facts) {
          formQueries.splice(0, formQueries.length);

          console.log(formQueries);
          // filter out empty values
          const newlineString = facts.filter(x => x !== '');
          if (newlineString.length > 0) {
            for (const line of newlineString) {
              // json for deep copy
              const newFormQuery = JSON.parse(JSON.stringify(formQuery));
              newFormQuery.nested.inner_hits.name = `${FactConstraintsComponent.componentCount}_${line}`;
              newFormQuery.nested.query.bool.must.push({term: {'texta_facts.doc_path': fieldPaths}});
              newFormQuery.nested.query.bool.must.push({term: {'texta_facts.fact': line}});
              formQueries.push(newFormQuery);
            }
          }
          this.change.emit(this.elasticSearchQuery);
        }
      });
    }

  }

  ngOnDestroy() {
    console.log('destroy fact-constraint');
    const index = this.elasticSearchQuery.query.bool.must.indexOf(this.constraintQuery, 0);
    if (index > -1) {
      this.elasticSearchQuery.query.bool.must.splice(index, 1);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
