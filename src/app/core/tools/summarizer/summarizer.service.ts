import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {Summarizer, SummarizerOptions} from '../../../shared/types/tasks/Summarizer';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {LogService} from '../../util/log.service';
import {AppConfigService} from '../../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class SummarizerService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getSummarizerTasks(projectId: number, params = ''): Observable<ResultsWrapper<Summarizer> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<Summarizer>>(`${this.apiUrl}/projects/${projectId}/summarizer_index/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getSummarizerTasks')),
      catchError(this.logService.handleError<ResultsWrapper<Summarizer>>('getSummarizerTasks')));
  }

  createSummarizerTask(projectId: number, body: unknown): Observable<Summarizer | HttpErrorResponse> {
    return this.http.post<Summarizer>(`${this.apiUrl}/projects/${projectId}/summarizer_index/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createSummarizerTask')),
      catchError(this.logService.handleError<Summarizer>('createSummarizerTask')));
  }

  applySummarizerText(projectId: number, body: unknown): Observable<{ lexrank: string; textrank: string }[] | HttpErrorResponse> {
    return this.http.post<{ lexrank: string; textrank: string }[]>(`${this.apiUrl}/summarizer/summarize`, body).pipe(
      tap(e => this.logService.logStatus(e, 'applySummarizerText')),
      catchError(this.logService.handleError<{ lexrank: string; textrank: string }[]>('applySummarizerText')));
  }

  bulkDeleteSummarizerTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/summarizer_index/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteSummarizerTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteSummarizerTasks')));
  }

  getSummarizerOptions(projectId: number): Observable<SummarizerOptions | HttpErrorResponse> {
    return this.http.options<SummarizerOptions>(
      `${this.apiUrl}/projects/${projectId}/summarizer_index/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getSummarizerOptions')),
      catchError(this.logService.handleError<SummarizerOptions>('getSummarizerOptions')));
  }

}
