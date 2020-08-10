import {Component, Input, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

interface TableElement {
  doc_count: number;
  key: string;
  top_reverse_nested: { doc_count: number };
}

@Component({
  selector: 'app-aggregation-result-table',
  templateUrl: './aggregation-result-table.component.html',
  styleUrls: ['./aggregation-result-table.component.scss'],
})
export class AggregationResultTableComponent {
  tableDataSource: MatTableDataSource<TableElement>;
  expandedElement: TableElement | null;
  displayedColumns = ['key', 'doc_count'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor() {
  }

  @Input()
  set tableData(value: MatTableDataSource<TableElement>) {
    if (value && value.data.length > 0) {
      this.tableDataSource = value;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      if (Object.keys(value.data[0]).includes('score')) {
        this.displayedColumns.push('score');
      }
    }
  }

}
