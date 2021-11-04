import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {TorchTagger} from '../../../shared/types/tasks/TorchTagger';
import {LogService} from '../../util/log.service';
import {Observable} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {AppConfigService} from '../../util/app-config.service';
import {RegexTaggerTagRandomDocResult} from "../../../shared/types/tasks/RegexTaggerGroup";

@Injectable({
  providedIn: 'root'
})
export class TorchTaggerService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient, private logService: LogService) {
  }

  getTorchTaggers(projectId: number, params = ''): Observable<ResultsWrapper<TorchTagger> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<TorchTagger>>(`${this.apiUrl}/projects/${projectId}/torchtaggers/?${params}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTorchTaggers')),
      catchError(this.logService.handleError<ResultsWrapper<TorchTagger>>('getTorchTaggers')));
  }

  editTorchTagger(body: unknown, projectId: number, taggerId: number): Observable<TorchTagger | HttpErrorResponse> {
    return this.http.patch<TorchTagger>(
      `${this.apiUrl}/projects/${projectId}/torchtaggers/${taggerId}/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'editTorchTagger')),
      catchError(this.logService.handleError<TorchTagger>('editTorchTagger')));
  }

  torchEpochReport(projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.get<unknown>(
      `${this.apiUrl}/projects/${projectId}/torchtaggers/${taggerId}/epoch_reports/`,
    ).pipe(tap(e => this.logService.logStatus(e, 'torchEpochReport')),
      catchError(this.logService.handleError<unknown>('torchEpochReport')));
  }

  retrainTagger(projectId: number, taggerId: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/torchtaggers/${taggerId}/retrain_tagger/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'retrainTorchTagger')),
      catchError(this.logService.handleError<unknown>('retrainTorchTagger')));
  }

  bulkDeleteTorchTaggers(projectId: number, body: unknown): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/torchtaggers/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteTorchTaggers')),
      catchError(this.logService.handleError<unknown>('bulkDeleteTorchTaggers')));
  }

  deleteTorchTagger(projectId: number, taggerId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/torchtaggers/${taggerId}`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteTorchTagger')),
      catchError(this.logService.handleError<unknown>('deleteTorchTagger')));
  }


  getTorchTaggerOptions(projectId: number): Observable<unknown> {
    return this.http.options<unknown>(`${this.apiUrl}/projects/${projectId}/torchtaggers/`).pipe(
      tap(e => this.logService.logStatus(e, 'getTorchTaggerOptions')),
      catchError(this.logService.handleError<unknown>('getTorchTaggerOptions')));
  }

  createTorchTagger(projectId: number, payload: unknown): Observable<TorchTagger> {
    return this.http.post<TorchTagger>(`${this.apiUrl}/projects/${projectId}/torchtaggers/`, payload).pipe(
      tap(e => this.logService.logStatus(e, 'createTorchTagger')),
      catchError(this.logService.handleError<TorchTagger>('createTorchTagger')));
  }

  tagText(body: unknown, projectId: number, taggerId: number): Observable<{ result: boolean, probability: number } | HttpErrorResponse> {
    return this.http.post<{ result: boolean, probability: number }>(`${this.apiUrl}/projects/${projectId}/torchtaggers/${taggerId}/tag_text/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagTorchText')),
      catchError(this.logService.handleError<{ result: boolean, probability: number }>('tagTorchText')));
  }

  applyToIndex(projectId: number, taggerId: number, body: unknown): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/projects/${projectId}/torchtaggers/${taggerId}/apply_to_index/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndex')),
      catchError(this.logService.handleError('applyToIndex')));
  }

  // tslint:disable-next-line:no-any
  applyToIndexOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/torchtaggers/${taskId}/apply_to_index/`).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndexOptions')),
      catchError(this.logService.handleError('applyToIndexOptions')));
  }

  // tslint:disable-next-line:no-any
  getTagTextOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/torchtaggers/${taskId}/tag_text/`).pipe(
      tap(e => this.logService.logStatus(e, 'getTagTextOptions')),
      catchError(this.logService.handleError('getTagTextOptions')));
  }

  tagRandomDoc(currentProjectId: number, id: number, body: { indices: FlatArray<{ name: string }[][], 1>[]; fields: string[] }): Observable<any | HttpErrorResponse> {
    return this.http.post<any>(`${this.apiUrl}/projects/${currentProjectId}/torchtaggers/${id}/tag_random_doc/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagRandomDoc')),
      catchError(this.logService.handleError<any>('tagRandomDoc')));
  }
}
