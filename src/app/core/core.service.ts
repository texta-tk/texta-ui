import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from './util/log.service';
import {Observable} from 'rxjs';
import {Health} from '../shared/types/Project';
import {catchError, tap} from 'rxjs/operators';
import {Index} from '../shared/types/Index';
import {ResultsWrapper} from '../shared/types/Generic';
import {CoreVariables} from '../shared/types/CoreVariables';
import {AppConfigService} from './util/app-config.service';
import {CeleryCountTasks, CeleryStatus} from '../shared/types/Celery';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getHealth(): Observable<Health | HttpErrorResponse> {
    return this.http.get<Health>(`${this.apiUrl}/health/`).pipe(
      tap(e => this.logService.logStatus(e, 'get Health')),
      catchError(this.logService.handleError<Health>('getHealth')));
  }

  getIndices(): Observable<{ id: number, name: string }[] | HttpErrorResponse> {
    return this.http.get<{ id: number, name: string }[]>(`${this.apiUrl}/elastic/get_indices/`).pipe(
      tap(e => this.logService.logStatus(e, 'get Indices')),
      catchError(this.logService.handleError<{ id: number, name: string }[]>('getIndices')));
  }

  getSnowballLanguages(): Observable<string[] | HttpErrorResponse> {
    return this.http.get<string[]>(`${this.apiUrl}/elastic/snowball/`).pipe(
      tap(e => this.logService.logStatus(e, 'getSnowballLanguages')),
      catchError(this.logService.handleError<string[]>('getSnowballLanguages')));
  }

  postSnowballStemmer(body: unknown): Observable<{ text: string, language: string } | HttpErrorResponse> {
    return this.http.post<{ text: string, language: string }>(`${this.apiUrl}/elastic/snowball/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'postSnowballStemmer')),
      catchError(this.logService.handleError<{ text: string, language: string }>('postSnowballStemmer')));
  }

  bulkDeleteElasticIndices(indices: number[]): Observable<{ num_deleted: number, deleted_types: unknown } | HttpErrorResponse> {
    return this.http.post<{ num_deleted: number, deleted_types: unknown }>(`${this.apiUrl}/elastic/index/bulk_delete/`, {ids: indices}).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteElasticIndices')),
      catchError(this.logService.handleError<{ num_deleted: number, deleted_types: unknown }>('bulkDeleteElasticIndices')));
  }

  getElasticIndices(params = ''): Observable<Index[] | HttpErrorResponse> {
    return this.http.get<Index[]>(`${this.apiUrl}/elastic/index/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getElasticIndices')),
      catchError(this.logService.handleError<Index[]>('getElasticIndices')));
  }

  getElasticIndicesOptions(): Observable<unknown | HttpErrorResponse> {
    return this.http.options<Index[]>(`${this.apiUrl}/elastic/index/`).pipe(
      tap(e => this.logService.logStatus(e, 'getElasticIndicesOptions')),
      catchError(this.logService.handleError<Index[]>('getElasticIndicesOptions')));
  }

  deleteElasticIndex(indexId: number): Observable<ResultsWrapper<Index> | HttpErrorResponse> {
    return this.http.delete<ResultsWrapper<Index>>(`${this.apiUrl}/elastic/index/${indexId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteElasticIndex')),
      catchError(this.logService.handleError<ResultsWrapper<Index>>('deleteElasticIndex')));
  }

  toggleElasticIndexOpenState(index: Index): Observable<{ message: string } | HttpErrorResponse> {
    const endpoint = index.is_open ? 'close_index' : 'open_index';
    return this.http.patch<{ message: string }>(`${this.apiUrl}/elastic/index/${index.id}/${endpoint}/`, {}).pipe(
      tap(e => this.logService.logStatus(e, 'toggleElasticIndexOpenState')),
      catchError(this.logService.handleError<{ message: string }>('toggleElasticIndexOpenState')));
  }

  editElasticIndex(index: Partial<Index>): Observable<{ message: string } | HttpErrorResponse> {
    if (index.domain === '') {
      delete index.domain;
    }
    return this.http.patch<{ message: string }>(`${this.apiUrl}/elastic/index/${index.id}/`, index).pipe(
      tap(e => this.logService.logStatus(e, 'editElasticIndex')),
      catchError(this.logService.handleError<{ message: string }>('editElasticIndex')));
  }

  indexAddFactMapping(index: Index): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/elastic/index/${index.id}/add_facts_mapping/`, {}).pipe(
      tap(e => this.logService.logStatus(e, 'indexAddFactMapping')),
      catchError(this.logService.handleError<{ message: string }>('indexAddFactMapping')));
  }

  getCoreVariables(): Observable<CoreVariables[] | HttpErrorResponse> {
    return this.http.get<CoreVariables[]>(`${this.apiUrl}/core_variables/`).pipe(
      tap(e => this.logService.logStatus(e, 'getCoreVariables')),
      catchError(this.logService.handleError<CoreVariables[]>('getCoreVariables')));
  }

  patchCoreVariables(body: unknown, url: string): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.patch<{ message: string }>(url, body).pipe(
      tap(e => this.logService.logStatus(e, 'patchCoreVariables')),
      catchError(this.logService.handleError<{ message: string }>('patchCoreVariables')));
  }

  purgeCeleryTasks(): Observable<{ detail: string } | HttpErrorResponse> {
    return this.http.post<{ detail: string }>(`${this.apiUrl}/celery/queue/purge_tasks/`, {}).pipe(
      tap(e => this.logService.logStatus(e, 'purgeCeleryTasks')),
      catchError(this.logService.handleError<{ detail: string }>('purgeCeleryTasks')));
  }

  // tslint:disable-next-line:no-any
  getCeleryQueueStats(): Observable<CeleryStatus | HttpErrorResponse> {
    return this.http.post<CeleryStatus>(`${this.apiUrl}/celery/queue/stats/`, {}).pipe(
      tap(e => this.logService.logStatus(e, 'getCeleryQueueStats')),
      catchError(this.logService.handleError<CeleryStatus>('getCeleryQueueStats')));
  }

  getCeleryTaskInfo(): Observable<CeleryCountTasks | HttpErrorResponse> {
    return this.http.post<CeleryCountTasks>(`${this.apiUrl}/celery/queue/count_tasks/`, {}).pipe(
      tap(e => this.logService.logStatus(e, 'getCeleryTaskInfo')),
      catchError(this.logService.handleError<CeleryCountTasks>('getCeleryTaskInfo')));
  }

}
