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

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getHealth(): Observable<Health | HttpErrorResponse> {
    return this.http.get<Health>(`${this.apiUrl}/health/`).pipe(
      tap(e => this.logService.logStatus(e, 'get Health')),
      catchError(this.logService.handleError<Health>('getHealth')));
  }

  getIndices(): Observable<string[] | HttpErrorResponse> {
    return this.http.get<string[]>(`${this.apiUrl}/get_indices/`).pipe(
      tap(e => this.logService.logStatus(e, 'get Indices')),
      catchError(this.logService.handleError<string[]>('getIndices')));
  }

  bulkDeleteElasticIndices(indices: number[]): Observable<{ num_deleted: number, deleted_types: unknown } | HttpErrorResponse> {
    return this.http.post<{ num_deleted: number, deleted_types: unknown }>(`${this.apiUrl}/index/bulk_delete/`, {ids: indices}).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteElasticIndices')),
      catchError(this.logService.handleError<{ num_deleted: number, deleted_types: unknown }>('bulkDeleteElasticIndices')));
  }

  getElasticIndices(params = ''): Observable<Index[] | HttpErrorResponse> {
    return this.http.get<Index[]>(`${this.apiUrl}/index/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getElasticIndices')),
      catchError(this.logService.handleError<Index[]>('getElasticIndices')));
  }

  deleteElasticIndex(indexId: number): Observable<ResultsWrapper<Index> | HttpErrorResponse> {
    return this.http.delete<ResultsWrapper<Index>>(`${this.apiUrl}/index/${indexId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteElasticIndex')),
      catchError(this.logService.handleError<ResultsWrapper<Index>>('deleteElasticIndex')));
  }

  toggleElasticIndexOpenState(index: Index): Observable<{ message: string } | HttpErrorResponse> {
    const endpoint = index.is_open ? 'close_index' : 'open_index';
    return this.http.patch<{ message: string }>(`${this.apiUrl}/index/${index.id}/${endpoint}/`, {}).pipe(
      tap(e => this.logService.logStatus(e, 'editElasticIndex')),
      catchError(this.logService.handleError<{ message: string }>('editElasticIndex')));
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
}
