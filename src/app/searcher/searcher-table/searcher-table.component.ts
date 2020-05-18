import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output, Renderer2,
  ViewChild
} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {Search, SearchOptions} from '../../shared/types/Search';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {FormControl} from '@angular/forms';
import {of, Subject} from 'rxjs';
import {debounceTime, switchMap, takeUntil} from 'rxjs/operators';
import {ProjectStore} from '../../core/projects/project.store';
import {ElasticsearchQuery} from '../searcher-sidebar/build-search/Constraints';
import {Project, ProjectIndex} from '../../shared/types/Project';
import {LocalStorageService} from '../../core/util/local-storage.service';
import {SearcherOptions} from '../SearcherOptions';
import {HttpErrorResponse} from '@angular/common/http';
import {SearcherService} from '../../core/searcher/searcher.service';

@Component({
  selector: 'app-searcher-table',
  templateUrl: './searcher-table.component.html',
  styleUrls: ['./searcher-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearcherTableComponent implements OnInit, OnDestroy {
  static totalCountLength; // hack for paginator max length with label, no easy way to do this
  public tableData: MatTableDataSource<any> = new MatTableDataSource();
  public displayedColumns: string[] = [];
  public columnsToDisplay: string[] = [];
  public columnFormControl = new FormControl([]);
  public isLoadingResults = false;
  public paginatorLength;
  public searchOptions: SearchOptions = {liveSearch: true};
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @Output() drawerToggle = new EventEmitter<boolean>();
  private destroy$: Subject<boolean> = new Subject();
  private currentElasticQuery: ElasticsearchQuery;
  private projectFields: ProjectIndex[];
  private currentProject: Project;
  searchQueue$: Subject<void> = new Subject<void>();

  constructor(public searchService: SearcherComponentService, private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private localStorage: LocalStorageService) {
  }

  ngOnInit() {
    // paginator label hack
    this.paginator._intl.getRangeLabel = this.countRangeLabel;

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((project => {
      if (project) {
        this.currentProject = project;
        const currentProjectState = this.localStorage.getProjectState(project);
        if (currentProjectState?.searcher?.itemsPerPage) {
          this.paginator.pageSize = currentProjectState.searcher.itemsPerPage;
        }
        return this.projectStore.getCurrentProjectIndices();
      } else {
        return of(null);
      }
    }))).subscribe(projField => {
      if (projField) {
        this.projectFields = projField;
        // combine all fields of all indexes into one unique array to make columns
        this.displayedColumns = [...new Set([].concat.apply([], (projField.map(x => x.fields.map(y => y.path)))))] as string[];
        this.setColumnsToDisplay();
        // project changed reset table
        this.tableData.data = [];
      }
    });

    this.searchService.getSearch().pipe(takeUntil(this.destroy$)).subscribe((resp: Search) => {
      if (resp && resp.searchOptions) {
        this.searchOptions = resp.searchOptions;
        if (this.searchOptions.onlyShowMatchingColumns) {
          const highlights = resp.searchContent.results.map(x => x.highlight).flat();
          const columnsToHighlight: string[] = [];
          highlights.forEach(x => {
            for (const col in x) {
              if (x.hasOwnProperty(col)) {
                columnsToHighlight.push(col);
              }
            }
          });
          if (columnsToHighlight.length > 0) {
            this.columnsToDisplay = [...new Set([].concat.apply([], columnsToHighlight))] as string[];
            this.columnFormControl.setValue(this.columnsToDisplay);
          } else {
            this.setColumnsToDisplay();
          }
        } else {
          // filter out table columns by index, unique array(table columns have to be unique)
          this.setColumnsToDisplay();
        }
        SearcherTableComponent.totalCountLength = resp.searchContent.count;
        this.paginatorLength = SearcherTableComponent.totalCountLength > 10000 ? 10000 : SearcherTableComponent.totalCountLength;
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
        this.searchQueue$.next();
      }
    });
    this.searchQueue$.pipe(debounceTime(SearcherOptions.SEARCH_DEBOUNCE_TIME), takeUntil(this.destroy$), switchMap(x => {
      if (this.currentProject) {
        this.searchService.setIsLoading(true);
        return this.searcherService.search({
          query: this.currentElasticQuery.elasticSearchQuery,
          indices: this.projectFields.map(y => y.index)
        }, this.currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe(
      (result: { count: number, results: { highlight: any, doc: any }[] } | HttpErrorResponse) => {
        this.searchService.setIsLoading(false);
        if (result && !(result instanceof HttpErrorResponse)) {
          this.searchService.nextSearch(new Search(result, this.searchOptions));
        }
      });
  }

  private setColumnsToDisplay(): void {
    const currentProjectState = this.localStorage.getProjectState(this.currentProject);
    if (currentProjectState?.searcher?.selectedFields && currentProjectState.searcher.selectedFields.length >= 1) {
      let fieldsExist = true;
      for (const field of currentProjectState.searcher.selectedFields) {
        if (!this.displayedColumns.includes(field)) {
          fieldsExist = false;
        }
      }
      if (fieldsExist) {
        this.columnsToDisplay = currentProjectState.searcher.selectedFields;
        this.columnFormControl.setValue(this.columnsToDisplay);
        return;
      }
    }
    this.columnsToDisplay = this.displayedColumns;
    this.columnFormControl.setValue(this.columnsToDisplay);
  }

  buildSortQuery(sort: Sort): any {
    if (sort.direction === '') {
      return [];
    }
    // check if column truly exists, if it does get col object for type
    const field = this.projectFields.map(x => x.fields.find(y => y.path === sort.active)).filter(x => x && x.path === sort.active)[0];
    if (field) {
      if (field.type === 'text') {
        return [{[field.path + '.keyword']: {order: sort.direction, unmapped_type: 'text'}}];
      } else if (field.type === 'fact') { // fact is nested type
        // no sorting for facts right now
        return [];
      } else {
        return [{[field.path]: {order: sort.direction, unmapped_type: field.type}}];
      }
    }
    return [];
  }

  pageChange(event: PageEvent) {
    if (this.currentElasticQuery) {
      this.currentElasticQuery.size = event.pageSize;
      this.currentElasticQuery.from = event.pageIndex * event.pageSize;
      this.searchQueue$.next();
    }
    const state = this.localStorage.getProjectState(this.currentProject);
    if (state) {
      state.searcher.itemsPerPage = event.pageSize;
      this.localStorage.updateProjectState(this.currentProject, state);
    }
  }

  public onfieldSelectionChange(opened) {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (this.columnFormControl.value)) {
      this.columnsToDisplay = this.columnFormControl.value;
      const currentProjectState = this.localStorage.getProjectState(this.currentProject);
      if (currentProjectState) {
        currentProjectState.searcher.selectedFields = this.columnsToDisplay;
        this.localStorage.updateProjectState(this.currentProject, currentProjectState);
      }
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
      return `${startIndex + 1} - ${endIndex} of 10000 (${SearcherTableComponent.totalCountLength})`;
    } else {
      return `${startIndex + 1} - ${endIndex} of ${length}`;
    }
  }

  trackByTableData(index, val) {
    return val.doc;
  }

}
