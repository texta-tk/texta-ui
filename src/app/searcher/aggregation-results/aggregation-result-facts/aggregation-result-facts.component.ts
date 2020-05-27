import {Component, Input} from '@angular/core';
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
  static readonly COLORS = {
    ORG: '#b71c1c',
    PER: '#880e4f',
    GPE: '#4a148c',
    LOC: '#311b92',
    ADDR: '#0d47a1',
    COMPANY: '#006064',
    PHO: '#1b5e20',
    EMAIL: '#3e2723',
    KEYWORD: '#263238'
  };
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
  ngxChartData: any[] = []; // for select
  chartData: any[] = []; // for actual chart data
  customColors: any[] = [];
  showXAxis = true;
  showYAxis = true;
  showYAxisLabel = false;
  showXAxisLabel = true;
  xAxisLabel = 'Count';
  selectedFacts: any[];
  @Input() viewState: boolean;

  constructor(public searchService: SearcherComponentService) {
  }

  @Input()
  set data(value: any) {
    if (value && value.length > 0) {
      this.dataSource = value;
      for (const item of value) {
        this.ngxChartData.push({
          key: item.key, value: item.buckets.flatMap(x => {
            this.customColors.push({name: x.key, value: AggregationResultFactsComponent.COLORS[item.key]});
            return [{name: x.key, value: x.doc_count, extra: {key: item.key}}];
          })
        });
      }
      this.selectedFacts = [this.ngxChartData[0]];
      this.chartData = this.ngxChartData[0].value;
    }
  }

  barChartSelected(val) {
    if (val?.extra?.key && val?.name) {
      this.makeSearch(val.extra.key, val.name);
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

  formatYAxisTicks(val) {
    const split = val.split(' ');
    let stringValue = '';
    for (const item of split) {
      if (stringValue.length + item.length < 16) {
        stringValue += item + (split.length !== 1 ? ' ' : '');
      } else if (stringValue === '') {
        return split[0].substr(0, 16) + (split.length > 1 ? '...' : '');
      }
    }
    return val.length === stringValue.trim().length ? stringValue : stringValue + '...';
  }

  openedChange(val) {
    if (this.selectedFacts.length >= 0) {
      this.chartData = this.selectedFacts.flatMap(x => x.value).sort((a, b) => (a.value < b.value) ? 1 : -1);
    }
  }
}
