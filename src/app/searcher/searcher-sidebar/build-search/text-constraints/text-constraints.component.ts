import {AfterViewChecked, AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {ElasticsearchQuery, TextConstraint} from '../Constraints';
import {FormControl} from '@angular/forms';
import {take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-text-constraints',
  templateUrl: './text-constraints.component.html',
  styleUrls: ['./text-constraints.component.scss']
})
export class TextConstraintsComponent implements OnInit {
  @Input() textConstraint: TextConstraint;
  @Input() elasticSearchQuery: ElasticsearchQuery;
  textAreaFormControl = new FormControl();
  slopFormControl = new FormControl();
  matchFormControl = new FormControl();
  operatorFormControl = new FormControl();

  constructor() {
    this.slopFormControl.setValue('0');
    this.matchFormControl.setValue('phrase_prefix');
    this.operatorFormControl.setValue('must');

  }

  ngOnInit() {
    const formQuery = {
      bool: {
        should: []
      }
    };
    const formQueries = [];
    const multiMatchBlueprint = {
      multi_match: {
        query: '',
        type: this.matchFormControl.value,
        slop: this.slopFormControl.value,
        fields: this.textConstraint.fields.map(x => x.path)
      }
    };
    const elasticQueryShould = {
      bool: {
        [this.operatorFormControl.value]: formQueries
      }
    };
    formQuery.bool.should.push(multiMatchBlueprint);
    this.elasticSearchQuery.query.bool.should.push(elasticQueryShould);

    this.textAreaFormControl.valueChanges.pipe(takeUntil(this.textConstraint.deleted$)).subscribe(value => {
      this.buildTextareaMultiMatchQuery(formQueries, value, multiMatchBlueprint);
    });
    this.matchFormControl.valueChanges.pipe(takeUntil(this.textConstraint.deleted$)).subscribe(value => {
      multiMatchBlueprint.multi_match.type = value;
      // update deep copy multi_match clauses
      if (this.textAreaFormControl.value && this.textAreaFormControl.value.length > 0) {
        this.buildTextareaMultiMatchQuery(formQueries, this.textAreaFormControl.value, multiMatchBlueprint);
      }
    });
    this.operatorFormControl.valueChanges.pipe(takeUntil(this.textConstraint.deleted$)).subscribe((value: string) => {
      elasticQueryShould.bool = {[value]: formQueries};
    });
    this.slopFormControl.valueChanges.pipe(takeUntil(this.textConstraint.deleted$)).subscribe(value => {
      multiMatchBlueprint.multi_match.slop = value;
      // update slop
      if (this.textAreaFormControl.value && this.textAreaFormControl.value.length > 0) {
        this.buildTextareaMultiMatchQuery(formQueries, this.textAreaFormControl.value, multiMatchBlueprint);
      }
    });
    // using javascript object identifier to delete cause everything is a shallow copy
    this.textConstraint.deleted$.pipe(take(1)).subscribe(f => {
      const index = this.elasticSearchQuery.query.bool.should.indexOf(elasticQueryShould, 0);
      if (index > -1) {
        this.elasticSearchQuery.query.bool.should.splice(index, 1);
      }
    });
    // todo
    if (this.textConstraint.operator && this.textConstraint.phrasePrefix && this.textConstraint.text) {
      this.operatorFormControl.setValue(this.textConstraint.operator);
      this.matchFormControl.setValue(this.textConstraint.phrasePrefix);
      this.textAreaFormControl.setValue(this.textConstraint.text);
    }
  }



  // every newline in textarea is a new multi_match clause
  private buildTextareaMultiMatchQuery(formQueries, formValue, multiMatchBlueprint) {
    // reset
    formQueries.splice(0, formQueries.length);

    const stringList = formValue.split('\n');
    // filter out empty values
    const newlineString = stringList.filter(x => x !== '');
    if (newlineString.length > 0) {
      for (const line of newlineString) {
        // json for deep copy because i need to also delete terms so I cant have shallow copies of the new formquery
        const newFormQuery = {
          bool: {
            should: []
          }
        };
        const deepCloneMultiMatchBluePrint = JSON.parse(JSON.stringify(multiMatchBlueprint));
        deepCloneMultiMatchBluePrint.multi_match.query = line;
        newFormQuery.bool.should.push(deepCloneMultiMatchBluePrint);
        formQueries.push(newFormQuery);
      }
    }
  }

}
