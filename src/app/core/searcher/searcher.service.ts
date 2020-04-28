import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {environment} from '../../../environments/environment';
import {LocalStorageService} from '../util/local-storage.service';
import {
  Constraint,
  DateConstraint,
  ElasticsearchQueryStructure,
  FactConstraint,
  NumberConstraint,
  TextConstraint
} from '../../searcher/searcher-sidebar/build-search/Constraints';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {SavedSearch} from '../../shared/types/SavedSearch';
import {ResultsWrapper} from '../../shared/types/Generic';
import {UtilityFunctions} from '../../shared/UtilityFunctions';

@Injectable({
  providedIn: 'root'
})

// { id: number, constraints: Constraint[], elasticQuery?: ElasticsearchQuery, description: string }[]
export class SearcherService {
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {

  }


  getSavedSearches(projectId: number): Observable<SavedSearch[] | HttpErrorResponse> {
    return this.http.get<SavedSearch[]>(`${this.apiUrl}/projects/${projectId}/searches/`).pipe(
      tap(e => this.logService.logStatus(e, 'getSavedSearches')),
      catchError(this.logService.handleError<SavedSearch[]>('getSavedSearches')));
  }

  saveSearch(projectId: number, constraintList: Constraint[], elasticQuery: ElasticsearchQueryStructure, desc: string) {
    const body = {
      query_constraints: JSON.stringify(UtilityFunctions.convertConstraintListToJson(constraintList)),
      description: desc,
      query: JSON.stringify(elasticQuery)
    };

    return this.http.post(`${this.apiUrl}/projects/${projectId}/searches/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'saveSearch')),
      catchError(this.logService.handleError<unknown>('saveSearch')));
  }

  search(body, projectId: number): Observable<ResultsWrapper<{ highlight: any, doc: any }> | HttpErrorResponse> {
    return this.http.post<ResultsWrapper<{ highlight: any, doc: any }> | HttpErrorResponse>(`${this.apiUrl}/projects/${projectId}/search_by_query/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'search')),
      catchError(this.logService.handleError<ResultsWrapper<{ highlight: any, doc: any }> | HttpErrorResponse>('search')));
  }

  bulkDeleteSavedSearches(projectId: number, body) {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/searches/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteSavedSearches')),
      catchError(this.logService.handleError<unknown>('bulkDeleteSavedSearches')));
  }

}
