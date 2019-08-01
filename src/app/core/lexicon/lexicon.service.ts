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
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getLexicons(projectId: number): Observable<Lexicon[] | HttpErrorResponse> {
    return this.http.get<Lexicon[]>(
      this.apiUrl + '/projects/' + projectId + '/lexicons/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getLexicons')),
      catchError(this.logService.handleError<Lexicon[]>('getLexicons')));
  }


  deleteLexicons(projectId: number, lexiconId: number): Observable<Lexicon | HttpErrorResponse> {
    return this.http.delete<Lexicon>(
      this.apiUrl + '/projects/' + projectId + '/lexicons/' + lexiconId + '/'
    ).pipe(
      tap(e => this.logService.logStatus(e, 'deleteLexicons')),
      catchError(this.logService.handleError<Lexicon>('deleteLexicons')));
  }

  addLexicon(body: {}, projectId: number): Observable<Lexicon | HttpErrorResponse> {
    return this.http.post<Lexicon>(
      this.apiUrl + '/projects/' + projectId + '/lexicons/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createLexicon')),
      catchError(this.logService.handleError<Lexicon>('createLexicon')));
  }

  updateLexicon(body: {}, projectId: number, lexiconId: number): Observable<Lexicon | HttpErrorResponse> {
    return this.http.put<Lexicon>(
      this.apiUrl + '/projects/' + projectId + '/lexicons/' + lexiconId + '/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createLexicon')),
      catchError(this.logService.handleError<Lexicon>('createLexicon')));
  }
}
