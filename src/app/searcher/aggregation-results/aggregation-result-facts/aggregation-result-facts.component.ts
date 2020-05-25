import {Component, Input, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {SavedSearch} from '../../../shared/types/SavedSearch';
import {take} from 'rxjs/operators';
import {Constraint, FactConstraint, FactTextInputGroup} from '../../searcher-sidebar/build-search/Constraints';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {SearcherComponentService} from '../../services/searcher-component.service';

@Component({
  selector: 'app-aggregation-result-facts',
  templateUrl: './aggregation-result-facts.component.html',
  styleUrls: ['./aggregation-result-facts.component.scss']
})
export class AggregationResultFactsComponent {
  dataSource: any[];
  displayedColumns = ['key', 'doc_count'];
  constraintBluePrint = {
    fields: [{
      path: 'texta_facts',
      type: 'fact'
    }],
    factName: [],
    factNameOperator: 'must',
    factTextOperator: 'must',
    inputGroup: [{
      factTextOperator: 'must',
      factTextName: 'texta-facts-chips-placeholder',
      factTextInput: 'texta-facts-chips-placeholder'
    }]
  };

  constructor(public searchService: SearcherComponentService) {
  }

  @Input()
  set data(value: any) {
    if (value && value.length > 0) {
      this.dataSource = value;
    }
  }

  makeSearch(factName, factValue) {
    const constraint = new SavedSearch();
    constraint.query_constraints = [];
    this.searchService.getAdvancedSearchConstraints$().pipe(take(1)).subscribe(constraintList => {
      if (typeof constraint.query_constraints !== 'string') {
        const factConstraint: Constraint | undefined = constraintList.find(y => y instanceof FactConstraint && y.inputGroupArray.length > 0);
        // inputGroup means its a fact_val constraint
        if (factConstraint instanceof FactConstraint && factConstraint.inputGroupArray.length > 0) {
          if (!factConstraint.inputGroupArray.some(group => group.factTextFactNameFormControl.value === factName &&
            group.factTextInputFormControl.value === factValue)) {
            factConstraint.inputGroupArray.push(new FactTextInputGroup('must', factName, factValue));
          }
        } else {
          const constraintBluePrint = {...this.constraintBluePrint};
          constraintBluePrint.inputGroup[0].factTextInput = factValue;
          constraintBluePrint.inputGroup[0].factTextName = factName;
          constraint.query_constraints.push(constraintBluePrint);
        }
        constraint.query_constraints.push(...UtilityFunctions.convertConstraintListToJson(constraintList));
        constraint.query_constraints = JSON.stringify(constraint.query_constraints);
        this.searchService.nextSavedSearch(constraint);
      }
    });
  }
}
