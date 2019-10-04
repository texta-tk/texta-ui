import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ElasticsearchQuery, TextConstraint} from '../Constraints';
import {FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, startWith, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-text-constraints',
  templateUrl: './text-constraints.component.html',
  styleUrls: ['./text-constraints.component.scss']
})
export class TextConstraintsComponent implements OnInit, OnDestroy {
  public _textConstraint: TextConstraint;
  @Input() set textConstraint(value: TextConstraint) {
    if (value) {
      this._textConstraint = value;
      this.textAreaFormControl = this._textConstraint.textAreaFormControl;
      this.slopFormControl = this._textConstraint.slopFormControl;
      this.matchFormControl = this._textConstraint.matchFormControl;
      this.operatorFormControl = this._textConstraint.operatorFormControl;
    }
  }

  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Output() change = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes

  destroyed$: Subject<boolean> = new Subject<boolean>();
  constraintQuery;
  // so i dont have to rename everything if i decide to refactor something
  textAreaFormControl: FormControl = new FormControl();
  slopFormControl: FormControl = new FormControl();
  matchFormControl: FormControl = new FormControl();
  operatorFormControl: FormControl = new FormControl();

  constructor() {

  }

  ngOnInit() {
    if (this._textConstraint) {
      // multi line textarea, 1 formequery entry for each line
      const formQueries = [];
      const multiMatchBlueprint = {
        multi_match: {
          query: '',
          type: this.matchFormControl.value,
          slop: this.slopFormControl.value,
          fields: this._textConstraint.fields.map(x => x.path)
        }
      };

      this.constraintQuery = {
        bool: {
          [this.operatorFormControl.value]: formQueries
        }
      };

      this.elasticSearchQuery.query.bool.should.push(this.constraintQuery);

      this.textAreaFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(this.textAreaFormControl.value as object),
        distinctUntilChanged(),
        debounceTime(200)).subscribe(value => {
        if (this.matchFormControl.value === 'regexp') {
          this.buildRegexQuery(formQueries, value, this._textConstraint.fields.map(x => x.path));
        } else {
          this.buildTextareaMultiMatchQuery(formQueries, value, multiMatchBlueprint);
        }
        this.change.emit(this.elasticSearchQuery);
      });

      this.matchFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
        multiMatchBlueprint.multi_match.type = value;
        // update deep copy multi_match clauses
        if (this.textAreaFormControl.value && this.textAreaFormControl.value.length > 0) {
          if (value === 'regexp') {
            this.buildRegexQuery(formQueries, this.textAreaFormControl.value, this._textConstraint.fields.map(x => x.path));
          } else {
            this.buildTextareaMultiMatchQuery(formQueries, this.textAreaFormControl.value, multiMatchBlueprint);
          }
        }
        this.change.emit(this.elasticSearchQuery);
      });

      this.operatorFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value: string) => {
        this.constraintQuery.bool = {[value]: formQueries};
        this.change.emit(this.elasticSearchQuery);
      });

      this.slopFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
        multiMatchBlueprint.multi_match.slop = value;
        // update slop
        if (this.textAreaFormControl.value && this.textAreaFormControl.value.length > 0) {
          this.buildTextareaMultiMatchQuery(formQueries, this.textAreaFormControl.value, multiMatchBlueprint);
        }
        this.change.emit(this.elasticSearchQuery);
      });

      // todo

    }
  }

  private buildRegexQuery(formQueries, formValue, fields) {
// gonna rebuild formqueries so delete previous
    formQueries.splice(0, formQueries.length);
    const textareaValues = this.stringToArray(formValue, '\n');
    console.warn(fields);

    if (textareaValues.length > 0) {
      for (const line of textareaValues) {
        const newFormQuery = {
          bool: {
            should: [],
            minimum_should_match: 1
          }
        };
        const regexQuery = {
          regexp: {}
        };
        for (const field of fields) {
          regexQuery.regexp[field] = line;
        }
        newFormQuery.bool.should.push(regexQuery);
        formQueries.push(newFormQuery);
      }
    }
  }

  // every newline in textarea is a new multi_match clause
  private buildTextareaMultiMatchQuery(formQueries, formValue, multiMatchBlueprint) {
    // gonna rebuild formqueries so delete previous
    formQueries.splice(0, formQueries.length);
    const textareaValues = this.stringToArray(formValue, '\n');
    if (textareaValues.length > 0) {
      for (const line of textareaValues) {
        const newFormQuery = {
          bool: {
            should: [],
            minimum_should_match: 1
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

  private stringToArray(stringToSplit: string, splitBy: string): string[] {
    const stringList = stringToSplit.split(splitBy);
    // filter out empty values
    return stringList.filter(x => x !== '');
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
