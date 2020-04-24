import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {HighlightComponent, HighlightSpan} from '../highlight/highlight.component';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SavedSearch} from '../../../shared/types/SavedSearch';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-texta-facts-chips',
  templateUrl: './texta-facts-chips.component.html',
  styleUrls: ['./texta-facts-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextaFactsChipsComponent implements OnInit{
  readonly NUMBER_OF_CHIPS_TO_DISPLAY = 25;
  factList: { factName: string, showing: boolean, factValues: { key: string, count: number }[], color: string | undefined }[] = [];
  constraintBluePrint = [{
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
  }];


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

  buildSearch(fact, factValue) {
    const constraint = new SavedSearch();
    constraint.query_constraints = [...this.constraintBluePrint];
    constraint.query_constraints[0].inputGroup[0].factTextName = fact;
    constraint.query_constraints[0].inputGroup[0].factTextInput = factValue;
    constraint.query_constraints = JSON.stringify(constraint.query_constraints);
    this.searchService.buildAdvancedSearch(constraint);
  }

  buildChipList(facts, doneCallback: () => void) {
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
            color: colors.get(val.fact)
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
