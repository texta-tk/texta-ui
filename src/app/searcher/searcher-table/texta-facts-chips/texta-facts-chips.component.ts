import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone, OnInit} from '@angular/core';
import {HighlightComponent, HighlightSpan, LegibleColor} from '../highlight/highlight.component';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SavedSearch} from '../../../shared/types/SavedSearch';
import {take} from 'rxjs/operators';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {FactConstraint, FactTextInputGroup} from '../../searcher-sidebar/build-search/Constraints';

@Component({
  selector: 'app-texta-facts-chips',
  templateUrl: './texta-facts-chips.component.html',
  styleUrls: ['./texta-facts-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextaFactsChipsComponent implements OnInit {
  readonly NUMBER_OF_CHIPS_TO_DISPLAY = 25;
  factList: { factName: string, showing: boolean, factValues: { key: string, count: number }[], color: LegibleColor }[] = [];
  constraintBluePrint = {
    fields: [{
      path: 'texta_facts',
      type: 'fact'
    }],
    factName: [''],
    factNameOperator: 'must',
    factTextOperator: 'must',
    inputGroup: [{
      factTextOperator: 'must',
      factTextName: 'texta-facts-chips-placeholder',
      factTextInput: 'texta-facts-chips-placeholder'
    }]
  };


  constructor(public searchService: SearcherComponentService, private changeDetectorRef: ChangeDetectorRef,
              private ngZone: NgZone) {
  }

  @Input() set facts(facts: HighlightSpan[]) {
    this.ngZone.runOutsideAngular(() => {
      this.buildChipList(facts, () => this.ngZone.run(() => this.changeDetectorRef.markForCheck()));
    });
  }

  ngOnInit(): void {
  }

  buildFactValSearch(fact: string, factValue: string): void {
    const constraint = new SavedSearch();
    constraint.query_constraints = [];
    this.searchService.getAdvancedSearchConstraints$().pipe(take(1)).subscribe(constraintList => {
      if (typeof constraint.query_constraints !== 'string') {
        const factConstraint = constraintList.find(y => y instanceof FactConstraint && y.inputGroupArray.length > 0);
        // inputGroup means its a fact_val constraint
        if (factConstraint instanceof FactConstraint && factConstraint.inputGroupArray.length > 0) {
          if (!factConstraint.inputGroupArray.some(group => group.factTextFactNameFormControl.value === fact &&
            group.factTextInputFormControl.value === factValue)) {
            factConstraint.inputGroupArray.push(new FactTextInputGroup('must', fact, factValue));
          }
        } else {
          const constraintBluePrint = {...this.constraintBluePrint};
          constraintBluePrint.inputGroup[0].factTextInput = factValue;
          constraintBluePrint.inputGroup[0].factTextName = fact;
          constraint.query_constraints.push(constraintBluePrint);
        }
        constraint.query_constraints.push(...UtilityFunctions.convertConstraintListToJson(constraintList));
        constraint.query_constraints = JSON.stringify(constraint.query_constraints);
        this.searchService.nextSavedSearch(constraint);
      }
    });
  }

  buildFactNameSearch(fact: string): void {
    const constraint = new SavedSearch();
    constraint.query_constraints = [];
    this.searchService.getAdvancedSearchConstraints$().pipe(take(1)).subscribe(constraintList => {
      if (typeof constraint.query_constraints !== 'string') {
        const factConstraint = constraintList.find(y => y instanceof FactConstraint && !(y.inputGroupArray.length > 0));
        // inputGroup means its a fact_val constraint
        if (factConstraint instanceof FactConstraint && (factConstraint.isFactValue || factConstraint.inputGroupArray.length === 0)) {
          if (!factConstraint.factNameFormControl.value.includes(fact)) {
            factConstraint.factNameFormControl.setValue([fact, ...factConstraint.factNameFormControl.value]);
          }
        } else {
          const constraintBluePrint = {...this.constraintBluePrint};
          constraintBluePrint.factName = [fact];
          constraintBluePrint.inputGroup = [];
          constraint.query_constraints.push(constraintBluePrint);
        }
        constraint.query_constraints.push(...UtilityFunctions.convertConstraintListToJson(constraintList));
        constraint.query_constraints = JSON.stringify(constraint.query_constraints);
        this.searchService.nextSavedSearch(constraint);
      }
    });
  }

  buildChipList(facts: { fact: string, str_val: string }[], doneCallback: () => void): void {
    setTimeout(() => {
      const colors = HighlightComponent.generateColorsForFacts(facts);
      facts.forEach(val => {
        const obj = this.factList.find(x => x.factName === val.fact);
        if (obj && obj.factValues) {
          const factValue = obj.factValues.find(x => x.key === val.str_val);
          if (factValue) {
            factValue.count += 1;
          } else {
            obj.factValues.push({key: val.str_val, count: 1});
          }
        } else {
          this.factList.push({
            showing: false,
            factName: val.fact, factValues: [{key: val.str_val, count: 1}],
            color: colors.get(val.fact) || {backgroundColor: 'black', textColor: 'white'}
          });
        }
      });
      for (const factNameGroup of this.factList) {
        factNameGroup.factValues.sort((a, b) => b.count - a.count);
      }
      doneCallback();
    }, 1);
  }

}
