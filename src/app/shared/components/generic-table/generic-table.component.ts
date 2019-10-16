import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss']
})
export class GenericTableComponent implements OnInit {
  public tableData: MatTableDataSource<any>;
  public displayedColumns: string[];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  @Input() pageSizeOptions: number[] = [15, 50, 100];
  @Input() set dataSource(data: any[]) {
    if (data.length >= 0) {
      this.displayedColumns = this.makeColumns(data);
      this.tableData = new MatTableDataSource(data);
      this.tableData.sort = this.sort;
      this.tableData.paginator = this.paginator;
      this.isLoadingResults = false;
    } else {
      this.isLoadingResults = false;
    }
  }

  constructor() {
  }

  ngOnInit() {
  }

  makeColumns<T>(data: T[]): string[] {
    const columns: string[] = [];
    if (data.length > 0) {
      for (const key of Object.keys(data[0])) {
        columns.push(key);
      }
    }
    return columns;
  }

  checkIfObject(value) {
    if (value) {
      // hacky way to check if object with properties
      return value.toString() === '[object Object]';
    }
  }

  getKeys(object: Object) {
    return Object.keys(object);
  }


}
