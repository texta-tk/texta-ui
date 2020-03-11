import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {debounceTime, switchMap, takeUntil} from 'rxjs/operators';
import {Project, ProjectField} from '../../../../shared/types/Project';
import {ProjectStore} from '../../../../core/projects/project.store';
import {of, Subject} from 'rxjs';
import {SearcherService} from '../../../../core/searcher/searcher.service';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {ElasticsearchQuery} from '../Constraints';
import {SearcherOptions} from '../../../SearcherOptions';
import {Search} from '../../../../shared/types/Search';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-simple-search',
  templateUrl: './simple-search.component.html',
  styleUrls: ['./simple-search.component.scss']
})
export class SimpleSearchComponent implements OnInit, OnDestroy {
  searchFormControl = new FormControl();
  destroy$ = new Subject<boolean>();
  projectFields: ProjectField[];
  currentProject: Project;
  elasticSearchQuery = new ElasticsearchQuery();
  searchQueue$: Subject<void> = new Subject<void>();
  @Input() onlyHighlightMatching: boolean;

  constructor(private projectStore: ProjectStore, private searcherComponentService: SearcherComponentService,
              private searcherService: SearcherService) {

  }

  ngOnInit() {
    this.projectStore.getCurrentProjectFields().pipe(takeUntil(this.destroy$)).subscribe((projectFields: ProjectField[]) => {
      if (projectFields) {
        this.projectFields = ProjectField.sortTextaFactsAsFirstItem(projectFields);
      }
    });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe((project: Project) => {
      if (project) {
        this.currentProject = project;
      }
    });
    this.searchFormControl.valueChanges.pipe(debounceTime(SearcherOptions.SEARCH_DEBOUNCE_TIME),
      takeUntil(this.destroy$)).subscribe(value => {
      if (value && this.projectFields && this.currentProject) {
        this.makeQuery(value);
      }
    });
    this.searchQueue$.pipe(debounceTime(SearcherOptions.SEARCH_DEBOUNCE_TIME), takeUntil(this.destroy$),
      switchMap((_) => {
        this.searcherComponentService.setIsLoading(true);
        if (this.elasticSearchQuery) { // check that they arent same
          return this.searcherService.search({
            query: this.elasticSearchQuery.elasticSearchQuery,
            indices: this.projectFields.map(x => x.index)
          }, this.currentProject.id);
        }
        return of(null);
      })).subscribe((result: { count: number, results: { highlight: any, doc: any }[] } | HttpErrorResponse) => {
      this.searcherComponentService.setIsLoading(false);
      if (result && !(result instanceof HttpErrorResponse)) {
        this.searcherComponentService.nextSearch(new Search(result, {
          liveSearch: true,
          onlyShowMatchingColumns: true,
          // onlyhighlightmatching todo
        }));
      }
    });
  }

  makeQuery(value: string) {
    if (value && this.projectFields) {
      const fields = ProjectField.cleanProjectFields(this.projectFields, ['text'], []).map(x => x.fields).flat();
      const fieldPathArray = fields.map(y => y.path);
      this.elasticSearchQuery = new ElasticsearchQuery();
      this.elasticSearchQuery.elasticSearchQuery.query = {
        multi_match: {
          fields: fieldPathArray,
          query: value
        }
      };
      for (const field of fieldPathArray) {
        // @ts-ignore
        this.elasticSearchQuery.elasticSearchQuery.highlight.fields[field] = {};
      }
      this.searcherComponentService.nextElasticQuery(this.elasticSearchQuery);
      this.searchQueue$.next();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
