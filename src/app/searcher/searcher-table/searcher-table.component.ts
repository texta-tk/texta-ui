import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {Search, SearchOptions} from '../../shared/types/Search';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ProjectStore} from '../../core/projects/project.store';
import {ElasticsearchQuery, FactConstraint} from '../searcher-sidebar/build-search/Constraints';
import {PageEvent} from '@angular/material/typings/paginator';
import {Field, ProjectField} from '../../shared/types/Project';
import {Sort} from '@angular/material/sort';
import {UtilityFunctions} from '../../shared/UtilityFunctions';

@Component({
  selector: 'app-searcher-table',
  templateUrl: './searcher-table.component.html',
  styleUrls: ['./searcher-table.component.scss']
})
export class SearcherTableComponent implements OnInit, OnDestroy {
  static totalCountLength; // hack for paginator max length with label, no easy way to do this
  public tableData: MatTableDataSource<any> = new MatTableDataSource();
  public displayedColumns: string[] = [];
  public columnsToDisplay: string[] = [];
  public columnFormControl = new FormControl([]);
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  destroy$: Subject<boolean> = new Subject();
  @Output() drawerToggle = new EventEmitter<boolean>();
  public paginatorLength;
  private currentElasticQuery: ElasticsearchQuery;
  isLoadingResults = false;
  projectFields: ProjectField[];
  searchOptions: SearchOptions;
  private selectedIndexes: string[]; // is used to remember column selection
  constructor(public searchService: SearcherComponentService, private projectStore: ProjectStore) {
  }

  ngOnInit() {
    // paginator label hack
    this.paginator._intl.getRangeLabel = this.countRangeLabel;

    this.projectStore.getProjectFields().pipe(takeUntil(this.destroy$)).subscribe(projField => {
      if (projField) {
        this.projectFields = projField;
        // combine all fields of all projects into one unique array to make columns
        this.setTableColumns([...new Set([].concat.apply([], (projField.map(x => x.fields.map(y => y.path)))))] as string[]);
        // project changed reset table
        this.tableData.data = [];
      }
    });

    this.searchService.getSearch().pipe(takeUntil(this.destroy$)).subscribe((resp: Search) => {
      if (resp) {
        this.searchOptions = resp.searchOptions;
        // filter out table columns by index, unique array(table columns have to be unique)
        if (this.selectedIndexes && !UtilityFunctions.arrayValuesEqual(this.selectedIndexes, resp.searchOptions.selectedIndexes)) {
          this.setTableColumns([...new Set([].concat.apply([],
            (this.projectFields.map(x => {
              if (this.searchOptions.selectedIndexes.includes(x.index)) {
                return x.fields.map(y => y.path);
              }
              return [];
            }))))] as string[]);
        }
        SearcherTableComponent.totalCountLength = resp.searchContent.count;
        this.paginatorLength = SearcherTableComponent.totalCountLength > 10000 ? 10000 : SearcherTableComponent.totalCountLength;
        this.tableData.data = resp.searchContent.results;
        if (this.currentElasticQuery) {
          this.paginator.pageIndex = this.currentElasticQuery.from / this.currentElasticQuery.size;
        }
        this.selectedIndexes = resp.searchOptions.selectedIndexes;

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

  private setTableColumns(columnList: string[]) {
    this.displayedColumns = columnList;
    this.columnsToDisplay = this.displayedColumns;
    this.columnFormControl.setValue(this.columnsToDisplay);
  }


  buildSortQuery(sort: Sort): any {
    if (sort.direction === '') {
      return [];
    }
    // check if column truly exists, if it does get col object for type
    const field: Field = this.projectFields.map(x => x.fields.find(y => y.path === sort.active)).filter(x => x && x.path === sort.active)[0];
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

  countRangeLabel(page: number, pageSize: number, length: number) {
    if (length === 0 || pageSize === 0) {
      return `0 of ${length}`;
    }

    length = Math.max(length, 0);
    const startIndex = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    if (length >= 10000) {
      return `${startIndex + 1} - ${endIndex} of 10000(${SearcherTableComponent.totalCountLength})`;
    } else {
      return `${startIndex + 1} - ${endIndex} of ${length}`;
    }
  }

  trackByTableData(index, val) {
    return val.doc;
  }

}
