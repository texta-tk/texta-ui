import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ListFeaturesResponse, Tagger} from '../../../shared/types/tasks/Tagger';
import {TaggerOptions} from '../../../shared/types/tasks/TaggerOptions';
import {AppConfigService} from '../../util/app-config.service';


@Injectable({
  providedIn: 'root'
})
export class TaggerService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient, private logService: LogService) {
  }

  getTaggers(projectId: number, params = ''): Observable<{ count: number, results: Tagger[] } | HttpErrorResponse> {
    return this.http.get<{ count: number, results: Tagger[] }>(`${this.apiUrl}/projects/${projectId}/taggers/?${params}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggers')),
      catchError(this.logService.handleError<{ count: number, results: Tagger[] }>('getTaggers')));
  }

  createTagger(body: unknown, projectId: number): Observable<Tagger | HttpErrorResponse> {
    return this.http.post<Tagger>(
      `${this.apiUrl}/projects/${projectId}/taggers/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'makeTagger')),
      catchError(this.logService.handleError<Tagger>('makeTagger')));
  }

  editTagger(body: unknown, projectId: number, taggerId: number): Observable<Tagger | HttpErrorResponse> {
    return this.http.patch<Tagger>(
      `${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'editTagger')),
      catchError(this.logService.handleError<Tagger>('editTagger')));
  }

  getTaggerById(id: number, projectId: number): Observable<Tagger | HttpErrorResponse> {
    return this.http.get<Tagger>(
      `${this.apiUrl}/projects/${projectId}/taggers/${id}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggerById')),
      catchError(this.logService.handleError<Tagger>('getTaggerById')));
  }

  retrainTagger(projectId: number, taggerId: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/retrain_tagger/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'retrainTagger')),
      catchError(this.logService.handleError<unknown>('retrainTagger')));
  }

  getStopWords(projectId: number, taggerId: number): Observable<{ 'stop_words': string[] } | HttpErrorResponse> {
    return this.http.get<{ 'stop_words': string[] }>(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/stop_words/`).pipe(
      tap(e => this.logService.logStatus(e, 'getStopWords')),
      catchError(this.logService.handleError<{ 'stop_words': string[] }>('getStopWords')));
  }

  // tslint:disable-next-line:no-any
  getStopWordsOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/taggers/${taskId}/stop_words/`).pipe(
      tap(e => this.logService.logStatus(e, 'getStopWordsOptions')),
      catchError(this.logService.handleError('getStopWordsOptions')));
  }

  // tslint:disable-next-line:no-any
  getTagTextOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/taggers/${taskId}/tag_text/`).pipe(
      tap(e => this.logService.logStatus(e, 'getTagTextOptions')),
      catchError(this.logService.handleError('getTagTextOptions')));
  }

  // tslint:disable-next-line:no-any
  getTagDocOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/taggers/${taskId}/tag_doc/`).pipe(
      tap(e => this.logService.logStatus(e, 'getTagDocOptions')),
      catchError(this.logService.handleError('getTagDocOptions')));
  }
  // tslint:disable-next-line:no-any
  getTagRandomDocOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/taggers/${taskId}/tag_random_doc/`).pipe(
      tap(e => this.logService.logStatus(e, 'getTagRandomDocOptions')),
      catchError(this.logService.handleError('getTagRandomDocOptions')));
  }

  listFeatures(projectId: number, taggerId: number, size: number): Observable<ListFeaturesResponse | HttpErrorResponse> {
    return this.http.post<ListFeaturesResponse>(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/list_features/`, {size}).pipe(
      tap(e => this.logService.logStatus(e, 'listFeatures')),
      catchError(this.logService.handleError<ListFeaturesResponse>('listFeatures')));
  }

  postStopWords(projectId: number, taggerId: number, payload: unknown): Observable<{ 'stop_words': string } | HttpErrorResponse> {
    return this.http.post<{ 'stop_words': string }>(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/stop_words/`, payload).pipe(
      tap(e => this.logService.logStatus(e, 'postStopWords')),
      catchError(this.logService.handleError<{ 'stop_words': string }>('postStopWords')));
  }

  getTaggerOptions(projectId: number): Observable<TaggerOptions | HttpErrorResponse> {
    return this.http.options<TaggerOptions>(
      `${this.apiUrl}/projects/${projectId}/taggers/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggerOptions')),
      catchError(this.logService.handleError<TaggerOptions>('getTaggerOptions')));
  }

  tagRandomDocument(projectId: number, taggerId: number, body: unknown): Observable<unknown | HttpErrorResponse> {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/tag_random_doc/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagRandomDocument')),
      catchError(this.logService.handleError('tagRandomDocument')));
  }

  tagDocument(body: unknown, projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      `${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/tag_doc/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagDocument')),
      catchError(this.logService.handleError<unknown>('tagDocument')));
  }

  tagText(body: unknown, projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      `${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/tag_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagText')),
      catchError(this.logService.handleError<unknown>('tagText')));
  }

  taggerListFeatures(body: unknown, projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      `${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/list_features/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'taggerListFeatures')),
      catchError(this.logService.handleError<unknown>('taggerListFeatures')));
  }

  deleteTagger(projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteTagger')),
      catchError(this.logService.handleError<unknown>('deleteTagger')));
  }

  bulkDeleteTaggers(projectId: number, body: unknown): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/taggers/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteTaggers')),
      catchError(this.logService.handleError<unknown>('bulkDeleteTaggers')));
  }

  applyToIndex(projectId: number, taggerId: number, body: unknown): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/apply_to_index/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndex')),
      catchError(this.logService.handleError('applyToIndex')));
  }

  // tslint:disable-next-line:no-any
  applyToIndexOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    // tslint:disable-next-line:no-any
    return this.http.options<any>(
      `${this.apiUrl}/projects/${projectId}/taggers/${taskId}/apply_to_index/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndexOptions')),
      // tslint:disable-next-line:no-any
      catchError(this.logService.handleError<any>('applyToIndexOptions')));
  }
}
