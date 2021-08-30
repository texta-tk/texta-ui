import {Component, Input} from '@angular/core';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {HighlightComponent} from '../../searcher-table/highlight/highlight.component';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {UtilityFunctions} from "../../../shared/UtilityFunctions";

interface BarChartData {
  name: string;
  value: number;
  extra: {
    key: string;
    name: string;
    term_count: number;
  };
}

interface BarChartDataCategories {
  key: string;
  value: BarChartData[];
}

@Component({
  selector: 'app-aggregation-result-facts',
  templateUrl: './aggregation-result-facts.component.html',
  styleUrls: ['./aggregation-result-facts.component.scss']
})
export class AggregationResultFactsComponent {
  // tslint:disable-next-line:no-any
  dataSource: any[];
  displayedColumns = ['key', 'doc_count'];
  readonly CHART_MAX_ITEMS = 20;
  ngxChartData: BarChartDataCategories[] = []; // for select
  chartData: BarChartData[] = []; // for actual chart data
  customColors: unknown[] = [];
  showXAxis = true;
  showYAxis = true;
  showYAxisLabel = false;
  showXAxisLabel = true;
  xAxisLabel = 'Count';
  selectedFacts: BarChartDataCategories[];
  @Input() viewState: string | 'tree' | 'table' | 'chart';
  @Input() docPaths: string[];

  constructor(public searchService: SearcherComponentService) {
  }

  @Input()
  set data(value: { key: string, buckets: { key: string; fact_val_reverse: { doc_count: number; }; doc_count: number; }[] }[]) {
    if (value && value.length > 0) {
      this.dataSource = value;
      const COLORS = UtilityFunctions.generateColorsForFacts(value.flatMap(x => [{fact: x.key}]));
      for (const item of value) {
        this.ngxChartData.push({
          key: item.key,
          value: [...item.buckets.flatMap(x => {
            // item.key hack so i can seperate identical names with colors, used in formatYAxisTicks
            const factName = `[${item.key}]|${x.key}`;
            this.customColors.push({name: factName, value: COLORS.get(item.key)?.backgroundColor});
            return [{
              name: factName,
              value: x.fact_val_reverse.doc_count,
              extra: {key: item.key, name: x.key, term_count: x.doc_count}
            }];
          }), ...(Array(this.CHART_MAX_ITEMS).fill('').map((_, i) => [{
            value: 0,
            name: `@#!|${i}`,
            extra: {key: '', name: '', term_count: 0}
          }]).flat())].slice(0, this.CHART_MAX_ITEMS)
        });
      }
      this.selectedFacts = this.ngxChartData;
      this.chartData = this.selectedFacts.flatMap(x => x.value).sort((a, b) => (a.value < b.value) ? 1 : -1).slice(0, this.CHART_MAX_ITEMS);
    }
  }

  barChartSelected(val: BarChartData): void {
    if (val?.extra?.key && val?.name) {
      this.makeSearch(val.extra.key, val.extra.name);
    }
  }

  makeSearch(factName: string, factValue: string): void {
    this.searchService.createConstraintFromFact(factName, factValue);
  }

  makeFactNameSearch(fact: string): void {
    this.searchService.buildFactNameSearch(fact);
  }

  formatYAxisTicks(val: string): string {
    let origName: string | string[] = val.split('|'); // take out the ID (KEY, PER, ORG etc)
    if (origName.length > 0 && origName[0] === '@#!') { // make placeholder titles empty so they dont show up in barchart
      return '';
    }
    origName.shift();
    origName = origName.join('|');

    return origName;
  }

  openedChange(val: boolean): void {
    if (this.selectedFacts.length >= 0) {
      this.chartData = this.selectedFacts.flatMap(x => x.value).sort((a, b) => (a.value < b.value) ? 1 : -1).slice(0, this.CHART_MAX_ITEMS);
    }
  }

  // tslint:disable-next-line:no-any
  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.dataSource, event.previousIndex, event.currentIndex);
  }
}
