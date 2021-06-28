import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {AppConfigService} from '../../util/app-config.service';
import {LogService} from '../../util/log.service';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {ElasticAnalyzer, ElasticAnalyzerOptions} from '../../../shared/types/tasks/ElasticAnalyzer';

@Injectable({
  providedIn: 'root'
})
export class ElasticAnalyzerService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient, private logService: LogService) {
  }

  getElasticAnalyzerTasks(projectId: number, params = ''): Observable<ResultsWrapper<ElasticAnalyzer> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<ElasticAnalyzer>>(`${this.apiUrl}/projects/${projectId}/apply_analyzers/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getElasticAnalyzerTasks')),
      catchError(this.logService.handleError<ResultsWrapper<ElasticAnalyzer>>('getElasticAnalyzerTasks')));
  }

  createElasticAnalyzerTask(projectId: number, body: unknown): Observable<ElasticAnalyzer | HttpErrorResponse> {
    return this.http.post<ElasticAnalyzer>(`${this.apiUrl}/projects/${projectId}/apply_analyzers/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createElasticAnalyzerTask')),
      catchError(this.logService.handleError<ElasticAnalyzer>('createElasticAnalyzerTask')));
  }

  bulkDeleteElasticAnalyzerTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/apply_analyzers/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteElasticAnalyzerTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteElasticAnalyzerTasks')));
  }

  getElasticAnalyzerOptions(projectId: number): Observable<ElasticAnalyzerOptions | HttpErrorResponse> {
    return this.http.options<ElasticAnalyzerOptions>(
      `${this.apiUrl}/projects/${projectId}/apply_analyzers/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getElasticAnalyzerOptions')),
      catchError(this.logService.handleError<ElasticAnalyzerOptions>('getElasticAnalyzerOptions')));
  }
}
