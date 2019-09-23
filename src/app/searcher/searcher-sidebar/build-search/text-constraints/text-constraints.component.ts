import {AfterViewChecked, AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ElasticsearchQuery, TextConstraint} from '../Constraints';
import {FormControl} from '@angular/forms';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from "rxjs";

@Component({
  selector: 'app-text-constraints',
  templateUrl: './text-constraints.component.html',
  styleUrls: ['./text-constraints.component.scss']
})
export class TextConstraintsComponent implements OnInit, OnDestroy {
  @Input() textConstraint: TextConstraint;
  @Input() elasticSearchQuery: ElasticsearchQuery;
  textAreaFormControl = new FormControl();
  slopFormControl = new FormControl();
  matchFormControl = new FormControl();
  operatorFormControl = new FormControl();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constraintQuery;

  constructor() {
    this.slopFormControl.setValue('0');
    this.matchFormControl.setValue('phrase_prefix');
    this.operatorFormControl.setValue('must');

  }

  ngOnInit() {
    if (this.textConstraint) {
      // multi line textarea, 1 formequery entry for each line
      const formQueries = [];
      const multiMatchBlueprint = {
        multi_match: {
          query: '',
          type: this.matchFormControl.value,
          slop: this.slopFormControl.value,
          fields: this.textConstraint.fields.map(x => x.path)
        }
      };
      this.constraintQuery = {
        bool: {
          [this.operatorFormControl.value]: formQueries
        }
      };
      const formQuery = {
        bool: {
          should: []
        }
      };
      formQuery.bool.should.push(multiMatchBlueprint);

      this.elasticSearchQuery.query.bool.should.push(this.constraintQuery);

      this.textAreaFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
        this.buildTextareaMultiMatchQuery(formQueries, value, multiMatchBlueprint);
      });
      this.matchFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
        multiMatchBlueprint.multi_match.type = value;
        // update deep copy multi_match clauses
        if (this.textAreaFormControl.value && this.textAreaFormControl.value.length > 0) {
          this.buildTextareaMultiMatchQuery(formQueries, this.textAreaFormControl.value, multiMatchBlueprint);
        }
      });
      this.operatorFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value: string) => {
        this.constraintQuery.bool = {[value]: formQueries};
      });
      this.slopFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
        multiMatchBlueprint.multi_match.slop = value;
        // update slop
        if (this.textAreaFormControl.value && this.textAreaFormControl.value.length > 0) {
          this.buildTextareaMultiMatchQuery(formQueries, this.textAreaFormControl.value, multiMatchBlueprint);
        }
      });

      // todo
      if (this.textConstraint.operator && this.textConstraint.phrasePrefix && this.textConstraint.text) {
        this.operatorFormControl.setValue(this.textConstraint.operator);
        this.matchFormControl.setValue(this.textConstraint.phrasePrefix);
        this.textAreaFormControl.setValue(this.textConstraint.text);
      }
    }
  }


  // every newline in textarea is a new multi_match clause
  private buildTextareaMultiMatchQuery(formQueries, formValue, multiMatchBlueprint) {
    // gonna rebuild formqueries so delete previous
    formQueries.splice(0, formQueries.length);
    const stringList = formValue.split('\n');
    // filter out empty values
    const newlineString = stringList.filter(x => x !== '');
    if (newlineString.length > 0) {
      for (const line of newlineString) {
        const newFormQuery = {
          bool: {
            should: []
          }
        };
        // json for deep copy because i need to also delete clauses when newline is deleted, cant have shallow copies
        const deepCloneMultiMatchBluePrint = JSON.parse(JSON.stringify(multiMatchBlueprint));
        deepCloneMultiMatchBluePrint.multi_match.query = line;
        newFormQuery.bool.should.push(deepCloneMultiMatchBluePrint);
        formQueries.push(newFormQuery);
      }
    }
  }

  ngOnDestroy() {
    console.log('destroy text-constraint');
    const index = this.elasticSearchQuery.query.bool.should.indexOf(this.constraintQuery, 0);
    if (index > -1) {
      this.elasticSearchQuery.query.bool.should.splice(index, 1);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
