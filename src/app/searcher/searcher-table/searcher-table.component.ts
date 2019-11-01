import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SearchService} from '../services/search.service';
import {Search} from '../../shared/types/Search';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ProjectStore} from '../../core/projects/project.store';

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
  @Output() drawerToggle = new EventEmitter<boolean>();

  constructor(private searchService: SearchService, private projectStore: ProjectStore) {
  }

  ngOnInit() {

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe(proj => {
      this.displayedColumns = [];
      this.columnsToDisplay = [];
      this.tableData = new MatTableDataSource<any>([]);
    });

    this.searchService.getSearch().pipe(takeUntil(this.destroy$)).subscribe((resp: Search) => {
      if (resp) {
        this.displayedColumns = this.makeColumns(resp.searchContent);
        this.displayedColumns.sort((a, b) => 0 - (a < b ? 1 : -1));
        console.log(`columns: ${this.displayedColumns.length}`);
        // first search || no search results
        if (this.columnsToDisplay.length === 0 || this.displayedColumns.length === 0) {
          this.columnsToDisplay = this.displayedColumns.slice();
          this.columnFormControl.setValue(this.columnsToDisplay);
        } else {
          // sometimes response adds columns based on user input, so need to updated columns selection
          this.validateColumnSelect();
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

  // temp functions for testing todo, right now its only looking at first element for columns
  makeColumns(data: { highlight: any, doc: any }[]): string[] {
    const columns: string[] = [];
    if (data.length > 0) {
      for (const key of Object.keys(data[0].doc)) {
        columns.push(key);
      }
    }
    return columns;
  }

  checkIfObject(value) {
    if (value) {
      const stringValue = value.toString().split(',');
      // hacky way to check if object with properties
      return stringValue[0] === '[object Object]';
    }
  }

  validateColumnSelect() {
    for (const item of [...this.columnsToDisplay]) {
      if (!(this.displayedColumns.includes(item))) {
        const index = this.columnsToDisplay.indexOf(item);
        if (index > -1) {
          this.columnsToDisplay.splice(index, 1);
        }
      }
      if (this.columnsToDisplay.length <= 1) {
        if (this.columnsToDisplay[0] === 'texta_facts' || this.columnsToDisplay.length === 0) {
          this.columnsToDisplay = this.displayedColumns.slice();
          this.columnFormControl.setValue(this.columnsToDisplay);
        }
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


}
