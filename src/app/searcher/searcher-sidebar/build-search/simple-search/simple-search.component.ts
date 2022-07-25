import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
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
  searchFormControl = new UntypedFormControl();
  destroy$ = new Subject<boolean>();
  projectFields: ProjectIndex[];
  currentProject: Project;
  elasticSearchQuery = new ElasticsearchQuery();
  searchQueue$: Subject<void> = new Subject<void>();
  @Input() highlightMatching: boolean;
  @Input() showShortVersion: number;

  @Input() highlightSearcherMatches: boolean;
  @Input() highlightTextaFacts: boolean;
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
        this.projectFields = projectFields;
        this.makeQuery(this.searchFormControl.value);
      }
    });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe(project => {
      if (project) {
        this.currentProject = project;
      }
    });
    this.searchQueue$.pipe(debounceTime(SearcherOptions.SEARCH_DEBOUNCE_TIME), takeUntil(this.destroy$),
      switchMap((_) => {
        this.makeQuery(this.searchFormControl.value);
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
          onlyShowMatchingColumns: true,
          ...this.showShortVersion ? {showShortVersion: {wordContextDistance: this.showShortVersion, highlightedFacts: []}} : {},
          highlightSearcherMatches: this.highlightSearcherMatches,
          highlightTextaFacts: this.highlightTextaFacts,
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

    this.searchFormControl.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(SearcherOptions.SEARCH_DEBOUNCE_TIME)).subscribe(val => {
      this.makeQuery(val);
    });

  }

  makeQuery(value: string): void {
    if (value && this.projectFields) {
      const fields = ProjectIndex.cleanProjectIndicesFields(this.projectFields, ['text'], []).map(x => x.fields).flat();
      const fieldPathArray = fields.map(y => y.path);
      this.elasticSearchQuery = new ElasticsearchQuery();
      value.split(' ').forEach(x => {
        this.elasticSearchQuery.elasticSearchQuery.query.bool?.must.push({
          multi_match: {
            fields: fieldPathArray,
            query: x,
            type: 'phrase_prefix',
            operator: 'and',
          }
        });
      });
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

  buildSavedSearch(search: SavedSearch): void {
    if (search.query) {
      const query = JSON.parse(search.query);
      if (query?.query?.multi_match?.query) {
        this.searchFormControl.setValue(query.query.multi_match.query);
      } else if (query?.query?.bool?.must && query.query.bool.must.length > 0) {
        const sq: string[] = query.query.bool.must.map((x: { multi_match: { query: string; }; }) => x.multi_match.query);
        this.searchFormControl.setValue(sq.join(' '));
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
