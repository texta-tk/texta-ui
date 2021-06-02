import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {AppConfigService} from '../../util/app-config.service';
import {LogService} from '../../util/log.service';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {SnowballStemmer, SnowballStemmerOptions} from '../../../shared/types/tasks/SnowballStemmer';

@Injectable({
  providedIn: 'root'
})
export class SnowballStemmerService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient, private logService: LogService) {
  }

  getSnowballStemmerTasks(projectId: number, params = ''): Observable<ResultsWrapper<SnowballStemmer> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<SnowballStemmer>>(`${this.apiUrl}/projects/${projectId}/apply_snowball/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getSnowballStemmerTasks')),
      catchError(this.logService.handleError<ResultsWrapper<SnowballStemmer>>('getSnowballStemmerTasks')));
  }

  createSnowballStemmerTask(projectId: number, body: unknown): Observable<SnowballStemmer | HttpErrorResponse> {
    return this.http.post<SnowballStemmer>(`${this.apiUrl}/projects/${projectId}/apply_snowball/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createSnowballStemmerTask')),
      catchError(this.logService.handleError<SnowballStemmer>('createSnowballStemmerTask')));
  }

  bulkDeleteSnowballStemmerTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/apply_snowball/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteSnowballStemmerTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteSnowballStemmerTasks')));
  }

  getSnowballStemmerOptions(projectId: number): Observable<SnowballStemmerOptions | HttpErrorResponse> {
    return this.http.options<SnowballStemmerOptions>(
      `${this.apiUrl}/projects/${projectId}/apply_snowball/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getSnowballStemmerOptions')),
      catchError(this.logService.handleError<SnowballStemmerOptions>('getSnowballStemmerOptions')));
  }
}
