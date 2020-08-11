import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {MLPOptions} from '../../../shared/types/tasks/MLPOptions';
import {MLP} from '../../../shared/types/tasks/MLP';
import {ResultsWrapper} from '../../../shared/types/Generic';

@Injectable({
  providedIn: 'root'
})
export class MLPService {
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }


  getMLPOptions(projectId: number): Observable<MLPOptions | HttpErrorResponse> {
    return this.http.options<MLPOptions>(
      `${this.apiUrl}/projects/${projectId}/mlp_index/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getMLPOptions')),
      catchError(this.logService.handleError<MLPOptions>('getMLPOptions')));
  }


  getMLPTasks(projectId: number, params = ''): Observable<ResultsWrapper<MLP> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<MLP>>(`${this.apiUrl}/projects/${projectId}/mlp_index/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getMLPTasks')),
      catchError(this.logService.handleError<ResultsWrapper<MLP>>('getMLPTasks')));
  }

  createMLPTask(projectId: number, body: unknown): Observable<MLP | HttpErrorResponse> {
    return this.http.post<MLP>(`${this.apiUrl}/projects/${projectId}/mlp_index/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createMLPTask')),
      catchError(this.logService.handleError<MLP>('createMLPTask')));
  }

  applyMLPText(body: unknown): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(`${this.apiUrl}/mlp/texts/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'applyMLPText')),
      catchError(this.logService.handleError<unknown>('applyMLPText')));
  }

  bulkDeleteMLPTasks(projectId: number, body: unknown): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/mlp_index/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteMLPTasks')),
      catchError(this.logService.handleError<unknown>('bulkDeleteMLPTasks')));
  }
}
