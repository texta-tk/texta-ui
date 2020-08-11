import {Component, Input, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss']
})
export class GenericTableComponent implements OnInit {
  public tableData: MatTableDataSource<unknown>;
  public displayedColumns: string[];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  @Input() pageSizeOptions: number[] = [15, 50, 100];
  // tslint:disable-next-line:no-any
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

  ngOnInit(): void {
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

  checkIfObject(value: object): boolean {
    if (value) {
      // hacky way to check if object with properties
      return value.toString() === '[object Object]';
    }
    return false;
  }

  getKeys(object: object): string[] {
    return Object.keys(object);
  }


}
