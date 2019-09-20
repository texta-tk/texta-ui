import {Component, Input, OnInit} from '@angular/core';
import {ElasticsearchQuery, FactTextConstraint} from '../Constraints';
import {FormControl} from '@angular/forms';
import {ProjectFact} from '../../../../shared/types/Project';

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

export class FactTextConstraintsComponent implements OnInit {
  @Input() factTextConstraint: FactTextConstraint;
  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Input() projectFacts: ProjectFact[];
  inputGroupArray: FactTextInputGroup[] = [];
  factTextTypeOperatorFormControl = new FormControl();

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

}
