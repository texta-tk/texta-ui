import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Tagger} from '../../shared/types/tasks/Tagger';
import {TaggerOptions} from '../../shared/types/tasks/TaggerOptions';


@Injectable({
  providedIn: 'root'
})
export class TaggerService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getTaggers(projectId: number): Observable<Tagger[] | HttpErrorResponse> {
    return this.http.get<Tagger[]>(
      this.apiUrl + '/projects/' + projectId + '/taggers/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggers')),
      catchError(this.logService.handleError<Tagger[]>('getTaggers')));
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
    return this.http.get<Tagger>(
      this.apiUrl + '/projects/' + projectId + '/taggers/' + taggerId + /retrain_tagger/,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'retrainTagger')),
      catchError(this.logService.handleError<Tagger>('retrainTagger')));
  }

  // todo backend seperate endpoint
  getTaggerOptions(projectId: number): Observable<TaggerOptions | HttpErrorResponse> {
    return this.http.options<TaggerOptions>(
      this.apiUrl + '/projects/' + projectId + '/taggers/'
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggerOptions')),
      catchError(this.logService.handleError<TaggerOptions>('getTaggerOptions')));
  }
}
