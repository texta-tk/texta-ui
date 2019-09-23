import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ElasticsearchQuery, FactTextConstraint} from '../Constraints';
import {FormControl} from '@angular/forms';
import {ProjectFact} from '../../../../shared/types/Project';
import {Subject} from "rxjs";

export class FactTextInputGroup {
  factTextOperatorFormControl = new FormControl();
  factTextFactNameFormControl = new FormControl();
  factTextInputFormControl = new FormControl();

  constructor() {
    this.factTextOperatorFormControl.setValue('must');
  }

}

@Component({
  selector: 'app-fact-text-constraints',
  templateUrl: './fact-text-constraints.component.html',
  styleUrls: ['./fact-text-constraints.component.scss']
})

export class FactTextConstraintsComponent implements OnInit, OnDestroy {
  @Input() factTextConstraint: FactTextConstraint;
  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Input() projectFacts: ProjectFact[];
  inputGroupArray: FactTextInputGroup[] = [];
  factTextTypeOperatorFormControl = new FormControl();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constraintQuery;
  constructor() {
    this.inputGroupArray.push(new FactTextInputGroup());
    this.factTextTypeOperatorFormControl.setValue('must');
  }

  ngOnInit() {
  }

  public addInputGroup() {
    this.inputGroupArray.push(new FactTextInputGroup());
  }

  public deleteInputGroup(inputGroup: FactTextInputGroup) {
    const index = this.inputGroupArray.indexOf(inputGroup, 0);
    if (index > -1) {
      this.inputGroupArray.splice(index, 1);
    }
  }
  ngOnDestroy() {
    console.log('destroy fact-text-constraint');
    const index = this.elasticSearchQuery.query.bool.should.indexOf(this.constraintQuery, 0);
    if (index > -1) {
      this.elasticSearchQuery.query.bool.should.splice(index, 1);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
