import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {RakunExtractor} from '../../../shared/types/tasks/RakunExtractor';
import {LogService} from '../../util/log.service';
import {AppConfigService} from '../../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class RakunExtractorService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getRakunExtractorTasks(projectId: number, params = ''): Observable<ResultsWrapper<RakunExtractor> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<RakunExtractor>>(`${this.apiUrl}/projects/${projectId}/rakun_extractors/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getRakunExtractorTasks')),
      catchError(this.logService.handleError<ResultsWrapper<RakunExtractor>>('getRakunExtractorTasks')));
  }

  createRakunExtractorTask(projectId: number, body: unknown): Observable<RakunExtractor | HttpErrorResponse> {
    return this.http.post<RakunExtractor>(`${this.apiUrl}/projects/${projectId}/rakun_extractors/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createRakunExtractorTask')),
      catchError(this.logService.handleError<RakunExtractor>('createRakunExtractorTask')));
  }

  bulkDeleteRakunExtractorTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/rakun_extractors/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteRakunExtractorTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteRakunExtractorTasks')));
  }

  // tslint:disable-next-line:no-any
  extractFromRandomDocument(projectId: number, taggerId: number, body: unknown): Observable<any | HttpErrorResponse> {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/rakun_extractors/${taggerId}/extract_from_random_doc/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'extractFromRandomDocument')),
      catchError(this.logService.handleError('extractFromRandomDocument')));
  }

  extractFromText(projectId: number, taggerId: number, body: unknown): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      `${this.apiUrl}/projects/${projectId}/rakun_extractors/${taggerId}/extract_from_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'extractFromText')),
      catchError(this.logService.handleError<unknown>('extractFromText')));
  }

  getRakunExtractorOptions(projectId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.options<unknown>(
      `${this.apiUrl}/projects/${projectId}/rakun_extractors/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getRakunExtractorOptions')),
      catchError(this.logService.handleError<unknown>('getRakunExtractorOptions')));
  }

  applyToIndex(projectId: number, taggerId: number, body: unknown): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/projects/${projectId}/rakun_extractors/${taggerId}/apply_to_index/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndexRakun')),
      catchError(this.logService.handleError('applyToIndexRakun')));
  }

  // tslint:disable-next-line:no-any
  applyToIndexOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/rakun_extractors/${taskId}/apply_to_index/`).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndexOptionsRakun')),
      catchError(this.logService.handleError('applyToIndexOptionsRakun')));
  }

  deleteRakunExtractor(projectId: number, elId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/rakun_extractors/${elId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteRakunExtractor')),
      catchError(this.logService.handleError<unknown>('deleteRakunExtractor')));
  }

  // tslint:disable-next-line:no-any
  getRakunExtractorTagTextOptions(projectId: number, taskId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/rakun_extractors/${taskId}/extract_from_text/`).pipe(
      tap(e => this.logService.logStatus(e, 'tagTextOptions')),
      catchError(this.logService.handleError('tagTextOptions')));
  }

  duplicateRakun(projectId: number, elId: number, element: RakunExtractor): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/projects/${projectId}/rakun_extractors/${elId}/duplicate/`, element).pipe(
      tap(e => this.logService.logStatus(e, 'duplicateRakun')),
      catchError(this.logService.handleError<{ message: string }>('duplicateRakun')));
  }

  getStopWords(currentProjectId: number, rakunId: number): Observable<{ 'stopwords': string[] } | HttpErrorResponse> {
    return this.http.get<{ 'stopwords': string[] }>
    (`${this.apiUrl}/projects/${currentProjectId}/rakun_extractors/${rakunId}/stop_words/`).pipe(
      tap(e => this.logService.logStatus(e, 'getStopWords')),
      catchError(this.logService.handleError<{ 'stopwords': string[] }>('getStopWords')));
  }

  // tslint:disable-next-line:no-any
  postStopWords(currentProjectId: number, rakunId: number, payload: any): Observable<{ 'stopwords': string } | HttpErrorResponse> {
    return this.http.post<{ 'stopwords': string }>
    (`${this.apiUrl}/projects/${currentProjectId}/rakun_extractors/${rakunId}/stop_words/`, payload).pipe(
      tap(e => this.logService.logStatus(e, 'postStopWords')),
      catchError(this.logService.handleError<{ 'stopwords': string }>('postStopWords')));
  }

  // tslint:disable-next-line:no-any
  getStopWordsOptions(currentProjectId: number, rakunId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${currentProjectId}/rakun_extractors/${rakunId}/stop_words/`).pipe(
      tap(e => this.logService.logStatus(e, 'getStopWordsOptions')),
      catchError(this.logService.handleError('getStopWordsOptions')));
  }
}
