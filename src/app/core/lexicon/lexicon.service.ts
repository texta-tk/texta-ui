import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {LocalStorageService} from '../util/local-storage.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {environment} from '../../../environments/environment';
import {Lexicon} from '../../shared/types/Lexicon';

@Injectable({
  providedIn: 'root'
})
export class LexiconService {
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getLexicons(projectId: number, params = ''): Observable<{ count: number, results: Lexicon[] } | HttpErrorResponse> {
    return this.http.get<{ count: number, results: Lexicon[] }>(
      `${this.apiUrl}/projects/${projectId}/lexicons/?${params}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getLexicons')),
      catchError(this.logService.handleError<{ count: number, results: Lexicon[] }>('getLexicons')));
  }


  deleteLexicon(projectId: number, lexiconId: number): Observable<Lexicon | HttpErrorResponse> {
    return this.http.delete<Lexicon>(
      this.apiUrl + '/projects/' + projectId + '/lexicons/' + lexiconId + '/'
    ).pipe(
      tap(e => this.logService.logStatus(e, 'deleteLexicons')),
      catchError(this.logService.handleError<Lexicon>('deleteLexicons')));
  }

  createLexicon(body: {}, projectId: number): Observable<Lexicon | HttpErrorResponse> {
    return this.http.post<Lexicon>(
      this.apiUrl + '/projects/' + projectId + '/lexicons/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createLexicon')),
      catchError(this.logService.handleError<Lexicon>('createLexicon')));
  }

  updateLexicon(body: {}, projectId: number, lexiconId: number): Observable<Lexicon | HttpErrorResponse> {
    return this.http.patch<Lexicon>(
      this.apiUrl + '/projects/' + projectId + '/lexicons/' + lexiconId + '/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createLexicon')),
      catchError(this.logService.handleError<Lexicon>('createLexicon')));
  }
}
