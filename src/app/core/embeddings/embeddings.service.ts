import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';
import {environment} from '../../../environments/environment';
import {Embedding, EmbeddingPrediction} from '../../shared/types/tasks/Embedding';


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

  predict(body, projectId, embeddingId): Observable<EmbeddingPrediction[] | HttpErrorResponse> {
    return this.http.post<EmbeddingPrediction[]>(
      this.apiUrl + '/projects/' + projectId + '/embeddings/' + embeddingId + '/predict/', body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'predict')),
      catchError(this.logService.handleError<EmbeddingPrediction[]>('predict')));
  }

  phrase(body: {text: string}, currentProjectId: number, embeddingId: number) {
    return this.http.post<Embedding>(`${this.apiUrl}/projects/${currentProjectId}/embeddings/${embeddingId}/phrase/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'phrase')),
      catchError(this.logService.handleError('phrase')));
  }
}
