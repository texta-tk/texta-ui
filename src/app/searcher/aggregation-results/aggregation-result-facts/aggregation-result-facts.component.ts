import {Component, Input} from '@angular/core';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {HighlightComponent} from '../../searcher-table/highlight/highlight.component';

@Component({
  selector: 'app-aggregation-result-facts',
  templateUrl: './aggregation-result-facts.component.html',
  styleUrls: ['./aggregation-result-facts.component.scss']
})
export class AggregationResultFactsComponent {
  dataSource: any[];
  displayedColumns = ['key', 'doc_count'];

  ngxChartData: any[] = []; // for select
  chartData: any[] = []; // for actual chart data
  customColors: any[] = [];
  showXAxis = true;
  showYAxis = true;
  showYAxisLabel = false;
  showXAxisLabel = true;
  xAxisLabel = 'Count';
  selectedFacts: any[];
  @Input() viewState: string | 'tree' | 'table' | 'chart';

  constructor(public searchService: SearcherComponentService) {
  }

  @Input()
  set data(value: any) {
    if (value && value.length > 0) {
      this.dataSource = value;
      const COLORS = HighlightComponent.generateColorsForFacts(value.flatMap(x => [{fact: x.key}]));
      for (const item of value) {
        this.ngxChartData.push({
          key: item.key, value: item.buckets.flatMap(x => {
            const factName = `[${item.key}]|${x.key}`; // item.key hack so i can seperate identical names with colors, used in formatYAxisTicks
            this.customColors.push({name: factName, value: COLORS.get(item.key)?.backgroundColor});
            return [{name: factName, value: x.top_reverse_nested.doc_count, extra: {key: item.key, name: x.key, term_count: x.doc_count}}];
          })
        });
      }
      this.selectedFacts = [this.ngxChartData[0]];
      this.chartData = this.ngxChartData[0].value.slice(0, 30);
    }
  }

  barChartSelected(val) {
    if (val?.extra?.key && val?.name) {
      this.makeSearch(val.extra.key, val.extra.name);
    }
  }

  makeSearch(factName, factValue) {
    this.searchService.createConstraintFromFact(factName, factValue);
  }

  formatYAxisTicks(val) {
    let origName = val.split('|'); // take out the ID (KEY, PER, ORG etc)
    origName.shift();
    origName = origName.join('|');

    if (typeof origName === 'string') {
      const split = origName.split(' ');
      let stringValue = '';
      for (const item of split) {
        if (stringValue.length + item.length < 16) {
          stringValue += item + (split.length !== 1 ? ' ' : '');
        } else if (stringValue === '') {
          return split[0].substr(0, 16) + (split.length > 1 ? '...' : '');
        }
      }
      return origName.length === stringValue.trim().length ? stringValue : stringValue + '...';
    }
    return '';
  }

  openedChange(val) {
    if (this.selectedFacts.length >= 0) {
      this.chartData = this.selectedFacts.flatMap(x => x.value).sort((a, b) => (a.value < b.value) ? 1 : -1).slice(0, 30);
    }
  }
}
