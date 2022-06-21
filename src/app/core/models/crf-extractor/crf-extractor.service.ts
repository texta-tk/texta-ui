import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {AppConfigService} from '../../util/app-config.service';
import {LogService} from '../../util/log.service';
import {CRFExtractor, CRFListFeatures} from '../../../shared/types/tasks/CRFExtractor';
import {ResultsWrapper} from '../../../shared/types/Generic';

@Injectable({
  providedIn: 'root'
})
export class CRFExtractorService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getCRFExtractorTasks(projectId: number, params = ''): Observable<ResultsWrapper<CRFExtractor> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<CRFExtractor>>(`${this.apiUrl}/projects/${projectId}/crf_extractors/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getCRFExtractorTasks')),
      catchError(this.logService.handleError<ResultsWrapper<CRFExtractor>>('getCRFExtractorTasks')));
  }

  createCRFExtractorTask(projectId: number, body: unknown): Observable<CRFExtractor | HttpErrorResponse> {
    return this.http.post<CRFExtractor>(`${this.apiUrl}/projects/${projectId}/crf_extractors/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createCRFExtractorTask')),
      catchError(this.logService.handleError<CRFExtractor>('createCRFExtractorTask')));
  }

  editCRFExtractorTask(body: unknown, projectId: number, crfId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.patch<unknown>(
      `${this.apiUrl}/projects/${projectId}/crf_extractors/${crfId}/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'editCRFExtractorTask')),
      catchError(this.logService.handleError<unknown>('editCRFExtractorTask')));
  }

  bulkDeleteCRFExtractorTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/crf_extractors/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteCRFExtractorTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteCRFExtractorTasks')));
  }

  getCRFExtractorOptions(projectId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.options<unknown>(
      `${this.apiUrl}/projects/${projectId}/crf_extractors/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getCRFExtractorOptions')),
      catchError(this.logService.handleError<unknown>('getCRFExtractorOptions')));
  }

  deleteCRFExtractor(projectId: number, elId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/crf_extractors/${elId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteCRFExtractor')),
      catchError(this.logService.handleError<unknown>('deleteCRFExtractor')));
  }

  applyToIndex(projectId: number, taggerId: number, body: unknown): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/projects/${projectId}/crf_extractors/${taggerId}/apply_to_index/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndexCRF')),
      catchError(this.logService.handleError('applyToIndexCRF')));
  }

  // tslint:disable-next-line:no-any
  applyToIndexOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/crf_extractors/${taskId}/apply_to_index/`).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndexOptionsCRF')),
      catchError(this.logService.handleError('applyToIndexOptionsCRF')));
  }


  // tslint:disable-next-line:no-any
  getCRFExtractorTagTextOptions(projectId: number, taskId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/crf_extractors/${taskId}/tag_text/`).pipe(
      tap(e => this.logService.logStatus(e, 'getCRFExtractorTagTextOptions')),
      catchError(this.logService.handleError('getCRFExtractorTagTextOptions')));
  }

  // tslint:disable-next-line:no-any
  tagText(projectId: number, taggerId: number, body: unknown): Observable<{ text_mlp: any; texta_facts: any; } | HttpErrorResponse> {
    return this.http.post<{ text_mlp: any; texta_facts: any; }>(
      `${this.apiUrl}/projects/${projectId}/crf_extractors/${taggerId}/tag_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagTextCRF')),
      catchError(this.logService.handleError<{ text_mlp: any; texta_facts: any; }>('tagTextCRF')));
  }

  retrainCRF(projectId: number, id: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/crf_extractors/${id}/retrain_extractor/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'retrainCRF')),
      catchError(this.logService.handleError<unknown>('retrainCRF')));
  }

  listCRFFeatures(projectId: number, instanceId: number): Observable<CRFListFeatures | HttpErrorResponse> {
    return this.http.get<CRFListFeatures>(`${this.apiUrl}/projects/${projectId}/crf_extractors/${instanceId}/list_features/`).pipe(
      tap(e => this.logService.logStatus(e, 'listCRFFeatures')),
      catchError(this.logService.handleError<CRFListFeatures>('listCRFFeatures')));
  }
}
