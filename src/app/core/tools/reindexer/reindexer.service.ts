import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {LogService} from 'src/app/core/util/log.service';
import {Observable} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Reindexer} from 'src/app/shared/types/tools/Elastic';
import {catchError, tap} from 'rxjs/operators';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {AppConfigService} from '../../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ReindexerService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getReindexers(projectId: number, params = ''): Observable<ResultsWrapper<Reindexer> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<Reindexer>>(`${this.apiUrl}/projects/${projectId}/reindexer/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getReindexers')),
      catchError(this.logService.handleError<ResultsWrapper<Reindexer>>('getReindexers')));
  }

  createReindexer(body: unknown, projectId: number): Observable<Reindexer | HttpErrorResponse> {
    return this.http.post<Reindexer>(`${this.apiUrl}/projects/${projectId}/reindexer/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createReindexer')),
      catchError(this.logService.handleError<Reindexer>('createReindexer')));
  }

  bulkDeleteReindexers(projectId: number, body: unknown): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/reindexer/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteReindexers')),
      catchError(this.logService.handleError<unknown>('bulkDeleteReindexers')));
  }

  deleteReindex(reindexerId: number, projectId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/reindexer/${reindexerId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteReindex')),
      catchError(this.logService.handleError<unknown>('deleteReindex')));
  }

  getReindexerOptions(projectId: number): Observable<unknown> {
    return this.http.options<unknown>(`${this.apiUrl}/projects/${projectId}/reindexer/`).pipe(
      tap(e => this.logService.logStatus(e, 'getReindexerOptions')),
      catchError(this.logService.handleError<unknown>('getReindexerOptions')));
  }
}
