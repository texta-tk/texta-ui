import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {IndexSplitter, IndexSplitterOptions} from '../../../shared/types/tasks/IndexSplitter';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {LogService} from '../../util/log.service';
import {environment} from '../../../../environments/environment';
import {AppConfigService} from '../../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class IndexSplitterService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getIndexSplitterTasks(projectId: number, params = ''): Observable<ResultsWrapper<IndexSplitter> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<IndexSplitter>>(`${this.apiUrl}/projects/${projectId}/index_splitter/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getIndexSplitterTasks')),
      catchError(this.logService.handleError<ResultsWrapper<IndexSplitter>>('getIndexSplitterTasks')));
  }

  createIndexSplitterTask(projectId: number, body: unknown): Observable<IndexSplitter | HttpErrorResponse> {
    return this.http.post<IndexSplitter>(`${this.apiUrl}/projects/${projectId}/index_splitter/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createIndexSplitterTask')),
      catchError(this.logService.handleError<IndexSplitter>('createIndexSplitterTask')));
  }

  bulkDeleteIndexSplitterTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/index_splitter/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteIndexSplitterTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteIndexSplitterTasks')));
  }

  getIndexSplitterOptions(projectId: number): Observable<IndexSplitterOptions | HttpErrorResponse> {
    return this.http.options<IndexSplitterOptions>(
      `${this.apiUrl}/projects/${projectId}/index_splitter/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getIndexSplitterOptions')),
      catchError(this.logService.handleError<IndexSplitterOptions>('getIndexSplitterOptions')));
  }
}
