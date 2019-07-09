import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, mergeMap, take, tap} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';
import {environment} from '../../../environments/environment';
import {Embedding} from '../../../shared/types/Embedding';


@Injectable({
  providedIn: 'root'
})
export class EmbeddingsService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getEmbeddings(projectId): Observable<Embedding[] | HttpErrorResponse> {
    return this.http.get<Embedding[]>(
      this.apiUrl + '/projects/' + projectId + '/embeddings/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getEmbeddings')),
      catchError(this.logService.handleError<Embedding[]>('getEmbeddings')));

  }

  createEmbedding(body, projectId): Observable<Embedding | HttpErrorResponse> {
    return this.http.post<Embedding>(
      this.apiUrl + '/projects/' + projectId + '/embeddings/', body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getEmbeddings')),
      catchError(this.logService.handleError<Embedding>('getEmbeddings')));

  }

  /*  getEmbeddingsOptions(): Observable<unknown[] | HttpErrorResponse> {
      return this.http.options<unknown[]>(
        this.apiUrl + '/projects/' + 1 + '/embeddings/',
      ).pipe(
        tap(e => this.logService.logStatus(e, 'getEmbeddings')),
        catchError(this.logService.handleError<unknown[]>('getEmbeddings')));
    }*/
}
