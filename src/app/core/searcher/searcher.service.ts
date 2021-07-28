import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {environment} from '../../../environments/environment';
import {LocalStorageService} from '../util/local-storage.service';
import {
  Constraint,
  ElasticsearchQuery,
  ElasticsearchQueryStructure
} from '../../searcher/searcher-sidebar/build-search/Constraints';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {SavedSearch} from '../../shared/types/SavedSearch';
import {UtilityFunctions} from '../../shared/UtilityFunctions';
import {SearchByQueryResponse} from '../../shared/types/Search';
import {AppConfigService} from '../util/app-config.service';

@Injectable({
  providedIn: 'root'
})

// { id: number, constraints: Constraint[], elasticQuery?: ElasticsearchQuery, description: string }[]
export class SearcherService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {

  }


  getSavedSearches(projectId: number): Observable<SavedSearch[] | HttpErrorResponse> {
    return this.http.get<SavedSearch[]>(`${this.apiUrl}/projects/${projectId}/searches/`).pipe(
      tap(e => this.logService.logStatus(e, 'getSavedSearches')),
      catchError(this.logService.handleError<SavedSearch[]>('getSavedSearches')));
  }

  saveSearch(projectId: number, constraintList: Constraint[],
             elasticQuery: ElasticsearchQueryStructure, desc: string): Observable<SavedSearch | HttpErrorResponse> {
    const body = {
      query_constraints: JSON.stringify(UtilityFunctions.convertConstraintListToJson(constraintList)),
      description: desc,
      query: JSON.stringify(elasticQuery)
    };

    return this.http.post<SavedSearch>(`${this.apiUrl}/projects/${projectId}/searches/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'saveSearch')),
      catchError(this.logService.handleError('saveSearch')));
  }

  search(body: unknown, projectId: number): Observable<SearchByQueryResponse | HttpErrorResponse> {
    return this.http.post<SearchByQueryResponse>(`${this.apiUrl}/projects/${projectId}/search_by_query/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'search')),
      catchError(this.logService.handleError<SearchByQueryResponse>('search')));
  }

  bulkDeleteSavedSearches(projectId: number, body: unknown): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/searches/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteSavedSearches')),
      catchError(this.logService.handleError<unknown>('bulkDeleteSavedSearches')));
  }

  editSavedSearchDescription(projectId: number, searchId: number, description: string): Observable<SavedSearch | HttpErrorResponse> {
    return this.http.patch<SavedSearch | HttpErrorResponse>
    (`${this.apiUrl}/projects/${projectId}/searches/${searchId}/`, {description}).pipe(
      tap(e => this.logService.logStatus(e, 'editSavedSearchDescription')),
      catchError(this.logService.handleError<SavedSearch | HttpErrorResponse>('editSavedSearchDescription')));
  }

  patchSavedSearch(projectId: number, searchId: number, constraintList: Constraint[], query: ElasticsearchQueryStructure):
    Observable<SavedSearch | HttpErrorResponse> {
    const body = {
      query_constraints: JSON.stringify(UtilityFunctions.convertConstraintListToJson(constraintList)),
      query: JSON.stringify(query)
    };
    return this.http.patch<SavedSearch>(`${this.apiUrl}/projects/${projectId}/searches/${searchId}/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'patchSavedSearch')),
      catchError(this.logService.handleError('patchSavedSearch')));
  }
}
