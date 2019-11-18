import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Tagger, ListFeaturesResponse} from '../../shared/types/tasks/Tagger';
import {TaggerOptions} from '../../shared/types/tasks/TaggerOptions';


@Injectable({
  providedIn: 'root'
})
export class TaggerService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getTaggers(projectId: number, params = ''): Observable<{count: number, results: Tagger[]} | HttpErrorResponse> {
    return this.http.get<{count: number, results: Tagger[]}>(`${this.apiUrl}/projects/${projectId}/taggers/?${params}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggers')),
      catchError(this.logService.handleError<{count: number, results: Tagger[]}>('getTaggers')));
  }

  createTagger(body: {}, projectId: number): Observable<Tagger | HttpErrorResponse> {
    return this.http.post<Tagger>(
      this.apiUrl + '/projects/' + projectId + '/taggers/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'makeTagger')),
      catchError(this.logService.handleError<Tagger>('makeTagger')));
  }

  getTaggerById(id: number, projectId: number): Observable<Tagger | HttpErrorResponse> {
    return this.http.get<Tagger>(
      this.apiUrl + '/projects/' + projectId + '/taggers/' + id,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggerById')),
      catchError(this.logService.handleError<Tagger>('getTaggerById')));
  }

  retrainTagger(projectId: number, taggerId: number) {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/retrain_tagger/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'retrainTagger')),
      catchError(this.logService.handleError<unknown>('retrainTagger')));
  }

  getStopWords(projectId: number, taggerId: number): Observable<{'stop_words': string} | HttpErrorResponse> {
    return this.http.get<{'stop_words': string}>(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/stop_words/`).pipe(
      tap(e => this.logService.logStatus(e, 'getStopWords')),
      catchError(this.logService.handleError<{'stop_words': string}>('getStopWords')));
  }

  listFeatures(projectId: number, taggerId: number): Observable<ListFeaturesResponse | HttpErrorResponse> {
    return this.http.get<ListFeaturesResponse>(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/list_features/`).pipe(
      tap(e => this.logService.logStatus(e, 'listFeatures')),
      catchError(this.logService.handleError<ListFeaturesResponse>('listFeatures')));
  }

  postStopWords(projectId: number, taggerId: number, payload): Observable<{'stop_words': string} | HttpErrorResponse> {
    return this.http.post<{'stop_words': string}>(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/stop_words/`, payload).pipe(
      tap(e => this.logService.logStatus(e, 'postStopWords')),
      catchError(this.logService.handleError<{'stop_words': string}>('postStopWords')));
  }

  // todo backend seperate endpoint
  getTaggerOptions(projectId: number): Observable<TaggerOptions | HttpErrorResponse> {
    return this.http.options<TaggerOptions>(
      this.apiUrl + '/projects/' + projectId + '/taggers/'
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggerOptions')),
      catchError(this.logService.handleError<TaggerOptions>('getTaggerOptions')));
  }

  tagRandomDocument(projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.get(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}/tag_random_doc/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagRandomDocument')),
      catchError(this.logService.handleError('tagRandomDocument')));
  }

  tagDocument(body: {}, projectId: number, taggerId): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      this.apiUrl + '/projects/' + projectId + '/taggers/' + taggerId + '/tag_doc/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagDocument')),
      catchError(this.logService.handleError<unknown>('tagDocument')));
  }
  tagText(body: {}, projectId: number, taggerId): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      this.apiUrl + '/projects/' + projectId + '/taggers/' + taggerId + '/tag_text/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagText')),
      catchError(this.logService.handleError<unknown>('tagText')));
  }
  taggerListFeatures(body: {}, projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      this.apiUrl + '/projects/' + projectId + '/taggers/' + taggerId + '/list_features/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'taggerListFeatures')),
      catchError(this.logService.handleError<unknown>('taggerListFeatures')));
  }

  deleteTagger(projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/taggers/${taggerId}`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteTagger')),
      catchError(this.logService.handleError<unknown>('deleteTagger')));
  }

  bulkDeleteTaggers(projectId: number, body) {
    return this.http.post<{'num_deleted': number, 'deleted_types': {string: number}[] }>
    (`${this.apiUrl}/projects/${projectId}/taggers/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteTaggers')),
      catchError(this.logService.handleError<unknown>('bulkDeleteTaggers')));
  }
}
