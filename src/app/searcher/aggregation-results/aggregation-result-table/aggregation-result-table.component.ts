import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-aggregation-result-table',
  templateUrl: './aggregation-result-table.component.html',
  styleUrls: ['./aggregation-result-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AggregationResultTableComponent implements OnInit {
  tableDataSource: MatTableDataSource<any>;
  expandedElement: any | null;

  @Input()
  set tableData(value: MatTableDataSource<any>) {
    if (value && value.data.length > 0) {
      this.tableDataSource = value;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      if (Object.keys(value.data[0]).includes('score')) {
        this.displayedColumns.push('score');
      }
    }
  }

  @Input() factAggregation = false;

  displayedColumns = ['key', 'doc_count'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor() {
  }

  ngOnInit() {
  }

}