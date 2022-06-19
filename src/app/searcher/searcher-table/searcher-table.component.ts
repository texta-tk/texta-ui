import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  TrackByFunction,
  ViewChild
} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {Search, SearchOptions} from '../../shared/types/Search';
import {MatPaginator, MatPaginatorIntl, PageEvent} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl} from '@angular/forms';
import {forkJoin, of, Subject} from 'rxjs';
import {debounceTime, delay, distinctUntilChanged, filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {ProjectStore} from '../../core/projects/project.store';
import {ElasticsearchQuery} from '../searcher-sidebar/build-search/Constraints';
import {Field, Project, ProjectIndex} from '../../shared/types/Project';
import {LocalStorageService} from '../../core/util/local-storage.service';
import {SearcherOptions} from '../SearcherOptions';
import {HttpErrorResponse} from '@angular/common/http';
import {SearcherService} from '../../core/searcher/searcher.service';
import {ProjectService} from '../../core/projects/project.service';
import {UtilityFunctions} from '../../shared/UtilityFunctions';
import {ExportSearchDialogComponent} from "./export-search-dialog/export-search-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {FactsFilterDialogComponent} from "./facts-filter-dialog/facts-filter-dialog.component";

@Component({
  selector: 'app-searcher-table',
  templateUrl: './searcher-table.component.html',
  styleUrls: ['./searcher-table.component.scss'],
  providers: [{provide: MatPaginatorIntl, useClass: MatPaginatorIntl}], // changing paginator intl here, dont want to affect whole app
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearcherTableComponent implements OnInit, OnDestroy {
  totalCountLength: number; // paginator max length with label
  // tslint:disable-next-line:no-any
  public tableData: MatTableDataSource<any> = new MatTableDataSource();
  public displayedFacts: string[] | undefined = undefined;
  public displayedColumns: Field[] = [];
  public columnsToDisplay: string[] = [];
  public columnFormControl = new FormControl([]);
  public isLoadingResults = false;
  public paginatorLength: number;
  public searchOptions: SearchOptions = {highlightTextaFacts: true, highlightSearcherMatches: true};
  public currentElasticQuery: ElasticsearchQuery;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @Output() drawerToggle = new EventEmitter<boolean>();
  searchQueue$: Subject<void> = new Subject<void>();
  public projectFields: ProjectIndex[];
  private destroy$: Subject<boolean> = new Subject();
  private currentProject: Project;
  private totalDocs = 0;

  constructor(public searchService: SearcherComponentService, private projectStore: ProjectStore,
              private dialog: MatDialog,
              private searcherService: SearcherService, private projectService: ProjectService,
              private localStorage: LocalStorageService) {
  }

  pathAccessor = (x: { path: string; type: string }) => x.path;

  ngOnInit(): void {
    // paginator label hack
    this.paginator._intl.getRangeLabel = this.countRangeLabel;

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe((project => {
      if (project) {
        this.currentProject = project;
        const currentProjectState = this.localStorage.getProjectState(project);
        if (currentProjectState?.searcher?.itemsPerPage) {
          this.paginator.pageSize = currentProjectState.searcher.itemsPerPage;
        }
      }
    }));
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroy$), filter(x => !!x), distinctUntilChanged(),
      switchMap(projField => {
        if (projField) {
          this.projectFields = ProjectIndex.cleanProjectIndicesFields(projField, ['text', 'long', 'fact', 'date', 'boolean', 'float'], []);
          // combine all fields of all indexes into one unique array to make columns
          this.displayedColumns = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(x => x.fields).flat(), (x => x.path));
          this.setColumnsToDisplay();
          // project changed reset table
          this.tableData.data = [];
        }
        // todo remove me after total-docs endpoint / fix
        if (projField) {
          return this.projectService.getIndicesDocCounts(this.currentProject.id, {
            indices: projField.map(x => x.index) || []
          });
        }
        return of(null);
      })
    ).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.totalDocs = resp;
      }
    });

    this.searchService.getSearch().pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (resp && resp.searchOptions) {
        console.table(resp.searchOptions.showShortVersion?.highlightedFacts);
        this.searchOptions = resp.searchOptions;
        if (this.searchOptions.onlyShowMatchingColumns) {
          const columnsToHighlight: string[] = [];
          resp.searchContent.results.forEach(doc => {
            // tslint:disable-next-line:no-any
            for (const col in doc.highlight as any) {
              // tslint:disable-next-line:no-any
              if ((doc.highlight as any).hasOwnProperty(col)) {
                columnsToHighlight.push(col);
              }
            }
          });
          if (columnsToHighlight.length > 0) {
            // @ts-ignore
            this.columnsToDisplay = [...new Set([].concat.apply([], columnsToHighlight))] as string[];
            this.columnFormControl.setValue(this.columnsToDisplay);
          } else {
            this.setColumnsToDisplay();
          }
        } else {
          // filter out table columns by index, unique array(table columns have to be unique)
          this.setColumnsToDisplay();
        }

        this.totalCountLength = typeof resp.searchContent.count !== 'number' ? resp.searchContent.count.value : resp.searchContent.count;
        this.paginatorLength = this.totalCountLength > 10000 ? 10000 : this.totalCountLength;
        this.tableData.data = resp.searchContent.results;
        this.currentElasticQuery = resp.elasticsearchQuery;
        if (this.currentElasticQuery.elasticSearchQuery) {
          // sync up table paginator and backend paginator
          this.paginator.pageIndex = this.currentElasticQuery.elasticSearchQuery.from / this.currentElasticQuery.elasticSearchQuery.size;
        }

      }
    });

    this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(x => {
      if (x && x.active && this.projectFields && this.currentElasticQuery) {
        this.currentElasticQuery.elasticSearchQuery.sort = this.buildSortQuery(x);
        this.currentElasticQuery.elasticSearchQuery.from = 0; // paginator reset is done in getSearch response
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
    })).subscribe(result => {
      this.searchService.setIsLoading(false);
      if (result && !(result instanceof HttpErrorResponse)) {
        this.searchService.nextSearch(new Search(result, this.currentElasticQuery, this.searchOptions));
      }
    });
  }

  exportSearch(): void {
    if (this.currentElasticQuery?.elasticSearchQuery && this.currentProject) {
      this.dialog.open(ExportSearchDialogComponent, {
        data: {
          projectFields: this.projectFields,
          selectedProjectFields: this.columnsToDisplay,
          currentProjectId: this.currentProject.id
        },
        maxHeight: '500px',
        width: '450px'
      });
    }
  }

  // tslint:disable-next-line:no-any
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
        return [{[field.path + '.fact']: {order: sort.direction, nested: {path: field.path}}}];
      } else {
        return [{[field.path]: {order: sort.direction, unmapped_type: field.type}}];
      }
    }
    return [];
  }

  pageChange(event: PageEvent): void {
    if (this.currentElasticQuery) {
      this.currentElasticQuery.elasticSearchQuery.size = event.pageSize;
      this.currentElasticQuery.elasticSearchQuery.from = event.pageIndex * event.pageSize;
      this.searchQueue$.next();
    }
    const state = this.localStorage.getProjectState(this.currentProject);
    if (state) {
      state.searcher.itemsPerPage = event.pageSize;
      this.localStorage.updateProjectState(this.currentProject, state);
    }
  }

  public onFieldSelectionChange(opened: boolean): void {
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  countRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 of ${length}/${this.totalDocs}`;
    }

    length = Math.max(length, 0);
    const startIndex = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    if (length >= 10000) {
      return `${startIndex + 1} - ${endIndex} of 10000 (${this.totalCountLength}/${this.totalDocs})`;
    } else {
      return `${startIndex + 1} - ${endIndex} of ${length}/${this.totalDocs}`;
    }
  };

  // tslint:disable-next-line:no-any
  trackByTableData: TrackByFunction<any> = (index: number, item: any) => item.doc;

  buildFactNameSearch(fact: string): void {
    this.searchService.buildFactNameSearch(fact);
  }

  buildFactValSearch(data: { factName: string, factValue: string }): void {
    this.searchService.createConstraintFromFact(data.factName, data.factValue);
  }

  private setColumnsToDisplay(): void {
    const currentProjectState = this.localStorage.getProjectState(this.currentProject);
    if (currentProjectState?.searcher?.selectedFields && currentProjectState.searcher.selectedFields.length >= 1) {
      let fieldsExist = true;
      for (const field of currentProjectState.searcher.selectedFields) {
        if (!this.displayedColumns.find(x => x.path === field)) {
          fieldsExist = false;
        }
      }
      if (fieldsExist) {
        this.columnsToDisplay = currentProjectState.searcher.selectedFields;
        this.columnFormControl.setValue(this.columnsToDisplay);
        return;
      }
    }
    if (this.displayedColumns.length > 0) {
      this.displayedColumns.push(this.displayedColumns.splice(this.displayedColumns.findIndex(x => x.type === 'fact'), 1)[0]);
      this.columnsToDisplay = this.displayedColumns.slice(0, 10).map(x => x.path);
      const factCol = this.displayedColumns.find(x => x.type === 'fact');
      if (factCol && !this.columnsToDisplay.includes(factCol.path)) {
        this.columnsToDisplay.splice(this.columnsToDisplay.length, 0, factCol.path);
      }
    }
    this.columnFormControl.setValue(this.columnsToDisplay);
  }

  filterTextaFactsCol(): void {
    this.dialog.open(FactsFilterDialogComponent, {
      data: {
        selectedFacts: this.displayedFacts,
        currentProjectId: this.currentProject.id
      },
      maxHeight: '500px',
      width: '450px'
    }).afterClosed().subscribe(resp => {
      if (resp) {
        this.displayedFacts = resp;
        console.log(this.displayedFacts);
      }
    });
  }
}
