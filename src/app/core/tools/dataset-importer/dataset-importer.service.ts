import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../util/log.service';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatasetImporterService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getIndices(projectId: number, params = ''): Observable<{ count: number, results: unknown[] } | HttpErrorResponse> {
    return this.http.get<{ count: number, results: unknown[] }>(`${this.apiUrl}/projects/${projectId}/dataset-imports/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getIndices')),
      catchError(this.logService.handleError<{ count: number, results: unknown[] }>('getIndices')));
  }

  createIndex(body, projectId): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/dataset-imports/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createIndex')),
      catchError(this.logService.handleError<unknown>('createIndex')));
  }

  bulkDeleteIndices(projectId: number, body) {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/dataset-imports/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteIndices')),
      catchError(this.logService.handleError<unknown>('bulkDeleteReindexers')));
  }

  deleteIndex(datasetId: number, projectId: number) {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/dataset-imports/${datasetId}`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteIndex')),
      catchError(this.logService.handleError<unknown>('deleteIndex')));
  }

  getImporterOptions(projectId: number) {
    return this.http.options<any>(`${this.apiUrl}/projects/${projectId}/dataset-imports/`).pipe(
      tap(e => this.logService.logStatus(e, 'getImporterOptions')),
      catchError(this.logService.handleError<any>('getImporterOptions')));
  }
}
