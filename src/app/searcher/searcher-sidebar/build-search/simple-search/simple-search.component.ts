import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {debounceTime, switchMap, takeUntil} from 'rxjs/operators';
import {Project, ProjectIndex} from '../../../../shared/types/Project';
import {ProjectStore} from '../../../../core/projects/project.store';
import {of, Subject} from 'rxjs';
import {SearcherService} from '../../../../core/searcher/searcher.service';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {ElasticsearchQuery} from '../Constraints';
import {SearcherOptions} from '../../../SearcherOptions';
import {Search} from '../../../../shared/types/Search';
import {HttpErrorResponse} from '@angular/common/http';
import {UserStore} from '../../../../core/users/user.store';
import {UserProfile} from '../../../../shared/types/UserProfile';
import {SavedSearch} from '../../../../shared/types/SavedSearch';
import {LocalStorageService} from '../../../../core/util/local-storage.service';

@Component({
  selector: 'app-simple-search',
  templateUrl: './simple-search.component.html',
  styleUrls: ['./simple-search.component.scss']
})
export class SimpleSearchComponent implements OnInit, OnDestroy {
  searchFormControl = new FormControl();
  destroy$ = new Subject<boolean>();
  projectFields: ProjectIndex[];
  currentProject: Project;
  elasticSearchQuery = new ElasticsearchQuery();
  searchQueue$: Subject<void> = new Subject<void>();
  @Input() highlightMatching: boolean;
  @Input() showShortVersion: number;
  currentUser: UserProfile;

  constructor(private projectStore: ProjectStore,
              private searcherComponentService: SearcherComponentService,
              private searcherService: SearcherService,
              private localStorage: LocalStorageService,
              private userStore: UserStore) {

  }

  ngOnInit(): void {
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroy$)).subscribe(projectFields => {
      if (projectFields) {
        this.projectFields = ProjectIndex.sortTextaFactsAsFirstItem(projectFields);
        this.makeQuery(this.searchFormControl.value);
      }
    });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe(project => {
      if (project) {
        this.currentProject = project;
      }
    });
    this.searchFormControl.valueChanges.pipe(debounceTime(SearcherOptions.SEARCH_DEBOUNCE_TIME),
      takeUntil(this.destroy$)).subscribe(value => {
      this.makeQuery(value);
      this.searchQueue$.next();
    });
    this.searchQueue$.pipe(debounceTime(SearcherOptions.SEARCH_DEBOUNCE_TIME), takeUntil(this.destroy$),
      switchMap((_) => {
        this.searcherComponentService.setIsLoading(true);
        if (this.elasticSearchQuery) { // check that they arent same
          this.searcherComponentService.setQuerySizeFromLocalStorage(this.currentProject, this.elasticSearchQuery);
          return this.searcherService.search({
            query: this.elasticSearchQuery.elasticSearchQuery,
            indices: this.projectFields.map(x => x.index)
          }, this.currentProject.id);
        }
        return of(null);
      })).subscribe(result => {
      this.searcherComponentService.setIsLoading(false);
      if (result && !(result instanceof HttpErrorResponse)) {
        this.searcherComponentService.nextSearch(new Search(result, this.elasticSearchQuery, {
          liveSearch: true,
          onlyShowMatchingColumns: true,
          showShortVersion: this.showShortVersion,
          onlyHighlightMatching: this.highlightMatching ? [] : undefined
        }));
      }
    });

    this.userStore.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });
    this.searcherComponentService.getSavedSearch().pipe(takeUntil(this.destroy$)).subscribe(savedSearch => {
      if (savedSearch) {
        const constraints = JSON.parse(savedSearch.query_constraints as string);
        if (constraints.length === 0) {
          this.buildSavedSearch(savedSearch);
        }
      }
    });
  }

  makeQuery(value: string): void {
    if (value && this.projectFields) {
      const fields = ProjectIndex.cleanProjectIndicesFields(this.projectFields, ['text'], []).map(x => x.fields).flat();
      const fieldPathArray = fields.map(y => y.path);
      this.elasticSearchQuery.elasticSearchQuery.query = {
        multi_match: {
          fields: fieldPathArray,
          query: value,
          type: 'best_fields',
          operator: 'and',
        }
      };
      for (const field of fieldPathArray) {
        // @ts-ignore
        this.elasticSearchQuery.elasticSearchQuery.highlight.fields[field] = {};
      }
      this.searcherComponentService.nextElasticQuery(this.elasticSearchQuery);
    } else if (this.projectFields) {
      this.elasticSearchQuery = new ElasticsearchQuery(); // emptied the searchbox, so reset query
      this.searcherComponentService.nextElasticQuery(this.elasticSearchQuery);
    }
  }

  // THIS IS TEMPORARY todo, think of a way to save simple searches and advanced searches with a clear cut difference
  saveSearch(description: string): void {
    if (this.currentUser) {
      this.searcherService.saveSearch(
        this.currentProject.id,
        [],
        this.elasticSearchQuery.elasticSearchQuery,
        description).subscribe(resp => {
        if (resp) {
          this.searcherComponentService.nextSavedSearchUpdate();
        }
      });
    }
  }

  buildSavedSearch(search: SavedSearch): void {
    if (search.query) {
      const query = JSON.parse(search.query);
      if (query?.query?.multi_match?.query) {
        this.searchFormControl.setValue(query.query.multi_match.query);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
