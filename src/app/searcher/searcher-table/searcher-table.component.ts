import {ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {Search} from '../../shared/types/Search';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ProjectStore} from '../../core/projects/project.store';
import {ElasticsearchQuery} from '../searcher-sidebar/build-search/Constraints';
import {PageEvent} from '@angular/material/typings/paginator';
import {Field, ProjectField} from '../../shared/types/Project';
import {Sort} from '@angular/material/sort';

@Component({
  selector: 'app-searcher-table',
  templateUrl: './searcher-table.component.html',
  styleUrls: ['./searcher-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  public totalCountLength;
  private currentElasticQuery: ElasticsearchQuery;
  isLoadingResults = false;
  projectFields: ProjectField[];

  constructor(public searchService: SearcherComponentService, private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe(proj => {
      this.displayedColumns = [];
      this.columnsToDisplay = [];
      this.tableData.data = [];
    });
    this.projectStore.getProjectFields().pipe(takeUntil(this.destroy$)).subscribe(projField => {
      if (projField) {
        this.projectFields = projField;
        // combine all fields of all projects into one unique array
        this.displayedColumns = [...new Set([].concat.apply([], (projField.map(x => x.fields.map(y => y.path)))))] as string[];
        this.columnsToDisplay = this.displayedColumns;
        this.columnFormControl.setValue(this.columnsToDisplay);
      }
    });

    this.searchService.getSearch().pipe(takeUntil(this.destroy$)).subscribe((resp: Search) => {
      if (resp) {
        this.totalCountLength = resp.searchContent.count;
        this.tableData.data = resp.searchContent.results;
        if (this.currentElasticQuery) {
          this.paginator.pageIndex = this.currentElasticQuery.from / this.currentElasticQuery.size;
        }
      }
    });

    this.searchService.getElasticQuery().pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (resp) {
        this.currentElasticQuery = resp;
      }
    });
    this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(x => {
      if (x && x.active && this.projectFields) {
        this.currentElasticQuery.sort = this.buildSortQuery(x);
        this.searchService.queryNextSearch();
      }
    });
  }

  buildSortQuery(sort: Sort): any {
    if (sort.direction === '') {
      return [];
    }
    const field: Field = this.projectFields.map(x => x.fields.find(y => y.path === sort.active))[0]; // not flattened
    if (field) {
      if (field.type === 'text') {
        return [{[field.path + '.keyword']: sort.direction}];
      } else if (field.type === 'fact') { // fact is nested type
        // no sorting for facts right now
        return [];
      } else {
        return [{[field.path]: sort.direction}];
      }
    }
    return [];
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
