import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SearchService} from '../services/search.service';
import {Search} from '../../shared/types/Search';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ProjectStore} from '../../core/projects/project.store';
import {ElasticsearchQuery} from '../searcher-sidebar/build-search/Constraints';
import {PageEvent} from '@angular/material/typings/paginator';

@Component({
  selector: 'app-searcher-table',
  templateUrl: './searcher-table.component.html',
  styleUrls: ['./searcher-table.component.scss'],
})
export class SearcherTableComponent implements OnInit, OnDestroy {
  public tableData: MatTableDataSource<any> = new MatTableDataSource();
  public displayedColumns: string[];
  public columnsToDisplay: string[] = [];
  public columnFormControl = new FormControl([]);
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  destroy$: Subject<boolean> = new Subject();
  @Output() drawerToggle = new EventEmitter<boolean>();
  public resultsLength: number;
  private currentElasticQuery: ElasticsearchQuery;
  isLoadingResults = false;

  constructor(public searchService: SearchService, private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe(proj => {
      this.displayedColumns = [];
      this.columnsToDisplay = [];
      this.tableData.data = [];
    });

    this.searchService.getSearch().pipe(takeUntil(this.destroy$)).subscribe((resp: Search) => {
      if (resp) {
        this.resultsLength = resp.searchContent.count >= 10000 ? 10000 : resp.searchContent.count;
        this.displayedColumns = this.makeColumns(resp.searchContent.results);
        this.displayedColumns.sort((a, b) => 0 - (a < b ? 1 : -1));
        // first search || no search results
        if (this.columnsToDisplay.length === 0 || this.displayedColumns.length === 0) {
          this.columnsToDisplay = this.displayedColumns.slice();
          this.columnFormControl.setValue(this.columnsToDisplay);
        } else {
          // sometimes response adds columns based on user input, so need to updated columns selection
          this.validateColumnSelect();
        }
        this.tableData.data = resp.searchContent.results;
        if (this.currentElasticQuery) {
          console.log(this.currentElasticQuery.from);
          this.paginator.pageIndex = this.currentElasticQuery.from / this.currentElasticQuery.size;
        }
      }
    });

    this.searchService.getElasticQuery().pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (resp) {
        this.currentElasticQuery = resp;
      }
    });
  }

  pageChange(event: PageEvent) {
    if (this.currentElasticQuery) {
      this.currentElasticQuery.size = event.pageSize;
      this.currentElasticQuery.from = event.pageIndex * event.pageSize;
      this.searchService.queryNextSearch();
    }
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

  public onOpenedChange(opened) {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (this.columnFormControl.value)) {
      this.columnsToDisplay = this.columnFormControl.value;
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


}
