import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SearchService} from '../services/search.service';
import {Search} from '../../shared/types/Search';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-searcher-table',
  templateUrl: './searcher-table.component.html',
  styleUrls: ['./searcher-table.component.scss'],
})
export class SearcherTableComponent implements OnInit, OnDestroy {
  public tableData: MatTableDataSource<any>;
  public displayedColumns: string[];
  public columnsToDisplay: string[] = [];
  public columnFormControl = new FormControl([]);
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  destroy$: Subject<boolean> = new Subject();

  constructor(private searchService: SearchService) {
  }

  ngOnInit() {

    this.searchService.getSearch().pipe(takeUntil(this.destroy$)).subscribe((resp: Search) => {
      if (resp) {
        this.displayedColumns = this.makeColumns(resp.searchContent);
        console.log(this.displayedColumns);
        // first search || no search results
        if (this.columnsToDisplay.length === 0 || this.displayedColumns.length === 0) {
          this.columnsToDisplay = this.displayedColumns.slice();
          this.columnFormControl.setValue(this.columnsToDisplay);
        }
        this.tableData = new MatTableDataSource<any>(resp.searchContent);
        this.tableData.sort = this.sort;
        this.tableData.paginator = this.paginator;

      }
    });

    this.columnFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.columnsToDisplay = value;
    });
  }
  // temp functions for testing todo
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


}
