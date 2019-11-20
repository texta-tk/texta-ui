import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-aggregation-result-table',
  templateUrl: './aggregation-result-table.component.html',
  styleUrls: ['./aggregation-result-table.component.scss']
})
export class AggregationResultTableComponent implements OnInit {
  tableDataSource: MatTableDataSource<any>;

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

  displayedColumns = ['key', 'doc_count'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor() {
  }

  ngOnInit() {
  }

}
