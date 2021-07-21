import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import {LogService} from '../../../util/log.service';
import {ResultsWrapper} from '../../../../shared/types/Generic';
import {BertTagger} from '../../../../shared/types/tasks/BertTagger';
import {AppConfigService} from '../../../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class BertTaggerService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getBertTaggerTasks(projectId: number, params = ''): Observable<ResultsWrapper<BertTagger> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<BertTagger>>(`${this.apiUrl}/projects/${projectId}/bert_taggers/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getBertTaggerTasks')),
      catchError(this.logService.handleError<ResultsWrapper<BertTagger>>('getBertTaggerTasks')));
  }

  downloadBertModel(projectId: number, modelName: string): Observable<string | HttpErrorResponse> {
    return this.http.post<string>(`${this.apiUrl}/projects/${projectId}/bert_taggers/download_pretrained_model/`, {bert_model: modelName}).pipe(
      tap(e => this.logService.logStatus(e, 'downloadBertModel')),
      catchError(this.logService.handleError<string>('downloadBertModel')));
  }

  tagRandomDocument(projectId: number, taggerId: number, body: unknown): Observable<unknown | HttpErrorResponse> {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/bert_taggers/${taggerId}/tag_random_doc/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagRandomDocument')),
      catchError(this.logService.handleError('tagRandomDocument')));
  }

  tagText(body: unknown, projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      `${this.apiUrl}/projects/${projectId}/bert_taggers/${taggerId}/tag_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagText')),
      catchError(this.logService.handleError<unknown>('tagText')));
  }

  bertEpochReport(projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.get<unknown>(
      `${this.apiUrl}/projects/${projectId}/bert_taggers/${taggerId}/epoch_reports/`,
    ).pipe(tap(e => this.logService.logStatus(e, 'bertEpochReport')),
      catchError(this.logService.handleError<unknown>('bertEpochReport')));
  }

  createBertTaggerTask(projectId: number, body: unknown): Observable<BertTagger | HttpErrorResponse> {
    return this.http.post<BertTagger>(`${this.apiUrl}/projects/${projectId}/bert_taggers/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createBertTaggerTask')),
      catchError(this.logService.handleError<BertTagger>('createBertTaggerTask')));
  }

  getAvailableBertModels(projectId: number): Observable<string[] | HttpErrorResponse> {
    return this.http.get<string[]>(`${this.apiUrl}/projects/${projectId}/bert_taggers/available_models/`).pipe(
      tap(e => this.logService.logStatus(e, 'getAvailableBertModels')),
      catchError(this.logService.handleError<string[]>('getAvailableBertModels')));
  }

  getBertTaggerOptions(projectId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.options<unknown>(
      `${this.apiUrl}/projects/${projectId}/bert_taggers/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getBertTaggerOptions')),
      catchError(this.logService.handleError<unknown>('getBertTaggerOptions')));
  }

  retrainTagger(projectId: number, taggerId: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/bert_taggers/${taggerId}/retrain_tagger/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'retrainTagger')),
      catchError(this.logService.handleError<unknown>('retrainTagger')));
  }

  deleteTagger(projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/bert_taggers/${taggerId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteTagger')),
      catchError(this.logService.handleError<unknown>('deleteTagger')));
  }

  bulkDeleteBertTaggerTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/bert_taggers/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteBertTaggerTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteBertTaggerTasks')));
  }

  editTagger(body: unknown, projectId: number, taggerId: number): Observable<BertTagger | HttpErrorResponse> {
    return this.http.patch<BertTagger>(
      `${this.apiUrl}/projects/${projectId}/bert_taggers/${taggerId}/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'editTagger')),
      catchError(this.logService.handleError<BertTagger>('editTagger')));
  }

  applyToIndex(projectId: number, taggerId: number, body: unknown): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/projects/${projectId}/bert_taggers/${taggerId}/apply_to_index/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndex')),
      catchError(this.logService.handleError('applyToIndex')));
  }

  // tslint:disable-next-line:no-any
  applyToIndexOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/bert_taggers/${taskId}/apply_to_index/`).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndexOptions')),
      catchError(this.logService.handleError('applyToIndexOptions')));
  }

  // tslint:disable-next-line:no-any
  tagRDocOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/bert_taggers/${taskId}/tag_random_doc/`).pipe(
      tap(e => this.logService.logStatus(e, 'tagRDocOptions')),
      catchError(this.logService.handleError('tagRDocOptions')));
  }
  // tslint:disable-next-line:no-any
  tagTextOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/bert_taggers/${taskId}/tag_text/`).pipe(
      tap(e => this.logService.logStatus(e, 'tagTextOptions')),
      catchError(this.logService.handleError('tagTextOptions')));
  }
}
