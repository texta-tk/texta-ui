import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpRequest} from '@angular/common/http';
import {LogService} from '../../util/log.service';
import {environment} from '../../../../environments/environment';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {AppConfigService} from '../../util/app-config.service';
import {DatasetImporter} from '../../../shared/types/tools/Elastic';

@Injectable({
  providedIn: 'root'
})
export class DatasetImporterService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getDatasetImports(projectId: number, params = ''): Observable<ResultsWrapper<DatasetImporter> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<DatasetImporter>>(`${this.apiUrl}/projects/${projectId}/elastic/dataset_imports/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getIndices')),
      catchError(this.logService.handleError<ResultsWrapper<DatasetImporter>>('getIndices')));
  }

  createIndex(body: FormData, projectId: number): Observable<HttpEvent<unknown> | HttpErrorResponse> {
    const request = new HttpRequest('POST', `${this.apiUrl}/projects/${projectId}/elastic/dataset_imports/`, body, {reportProgress: true});
    return this.http.request(request).pipe(
      catchError(this.logService.handleError<HttpEvent<unknown>>('createIndex')));
  }

  bulkDeleteIndices(projectId: number, body: { ids: number[]; }): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/elastic/dataset_imports/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteIndices')),
      catchError(this.logService.handleError<unknown>('bulkDeleteReindexers')));
  }

  deleteIndex(datasetId: number, projectId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/elastic/dataset_imports/${datasetId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteIndex')),
      catchError(this.logService.handleError<unknown>('deleteIndex')));
  }

  // tslint:disable-next-line:no-any
  getDatasetImporterOptions(projectId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/elastic/dataset_imports/`).pipe(
      tap(e => this.logService.logStatus(e, 'getDatasetImporterOptions')),
      catchError(this.logService.handleError('getDatasetImporterOptions')));
  }
}
