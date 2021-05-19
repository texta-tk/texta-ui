import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import {SearchQueryTagger} from '../../../../shared/types/tasks/SearchQueryTagger';
import {ResultsWrapper} from '../../../../shared/types/Generic';
import {LogService} from '../../../util/log.service';

@Injectable({
  providedIn: 'root'
})
export class SearchTaggerService {
  apiUrl2 = environment.apiHost + environment.apiBasePath2;
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getSearchFieldsTaggerTasks(projectId: number, params = ''): Observable<ResultsWrapper<SearchQueryTagger> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<SearchQueryTagger>>(`${this.apiUrl2}/projects/${projectId}/elastic/search_fields_tagger/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getSearchFieldsTaggerTasks')),
      catchError(this.logService.handleError<ResultsWrapper<SearchQueryTagger>>('getSearchFieldsTaggerTasks')));
  }

  getSearchQueryTaggerTasks(projectId: number, params = ''): Observable<ResultsWrapper<SearchQueryTagger> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<SearchQueryTagger>>(`${this.apiUrl2}/projects/${projectId}/elastic/search_query_tagger/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getSearchQueryTaggerTasks')),
      catchError(this.logService.handleError<ResultsWrapper<SearchQueryTagger>>('getSearchQueryTaggerTasks')));
  }

  createSearchQueryTaggerTask(projectId: number, body: unknown): Observable<SearchQueryTagger | HttpErrorResponse> {
    return this.http.post<SearchQueryTagger>(`${this.apiUrl2}/projects/${projectId}/elastic/search_query_tagger/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createSearchQueryTaggerTask')),
      catchError(this.logService.handleError<SearchQueryTagger>('createSearchQueryTaggerTask')));
  }

  createSearchFieldsTaggerTask(projectId: number, body: unknown): Observable<SearchQueryTagger | HttpErrorResponse> {
    return this.http.post<SearchQueryTagger>(`${this.apiUrl2}/projects/${projectId}/elastic/search_fields_tagger/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createSearchFieldsTaggerTask')),
      catchError(this.logService.handleError<SearchQueryTagger>('createSearchFieldsTaggerTask')));
  }

  bulkDeleteSearchFieldsTaggerTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl2}/projects/${projectId}/elastic/search_fields_tagger/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteSearchFieldsTaggerTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteSearchFieldsTaggerTasks')));
  }

  bulkDeleteSearchQueryTaggerTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl2}/projects/${projectId}/elastic/search_query_tagger/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteSearchQueryTaggerTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteSearchQueryTaggerTasks')));
  }
}
