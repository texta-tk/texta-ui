import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../../util/local-storage.service';
import {LogService} from '../../util/log.service';
import {environment} from '../../../../environments/environment';
import {Embedding, EmbeddingPrediction} from '../../../shared/types/tasks/Embedding';
import {ResultsWrapper} from '../../../shared/types/Generic';


@Injectable({
  providedIn: 'root'
})
export class EmbeddingsService {
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getEmbeddings(projectId: number, params = ''): Observable<ResultsWrapper<Embedding> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<Embedding>>(
      `${this.apiUrl}/projects/${projectId}/embeddings/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getEmbeddings')),
      catchError(this.logService.handleError<ResultsWrapper<Embedding>>('getEmbeddings')));
  }

  createEmbedding(body: unknown, projectId: number): Observable<Embedding | HttpErrorResponse> {
    return this.http.post<Embedding>(
      `${this.apiUrl}/projects/${projectId}/embeddings/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getEmbeddings')),
      catchError(this.logService.handleError<Embedding>('getEmbeddings')));
  }

  editEmbedding(body: unknown, projectId: number, embeddingId: number): Observable<Embedding | HttpErrorResponse> {
    return this.http.patch<Embedding>(
      `${this.apiUrl}/projects/${projectId}/embeddings/${embeddingId}/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'editEmbedding')),
      catchError(this.logService.handleError<Embedding>('editEmbedding')));
  }

  predict(body: unknown, projectId: number, embeddingId: number): Observable<EmbeddingPrediction[] | HttpErrorResponse> {
    return this.http.post<EmbeddingPrediction[]>(
      `${this.apiUrl}/projects/${projectId}/embeddings/${embeddingId}/predict_similar/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'predict')),
      catchError(this.logService.handleError<EmbeddingPrediction[]>('predict')));
  }

  phrase(body: { text: string }, currentProjectId: number, embeddingId: number): Observable<string | HttpErrorResponse> {
    return this.http.post<string>(`${this.apiUrl}/projects/${currentProjectId}/embeddings/${embeddingId}/phrase_text/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'phrase')),
      catchError(this.logService.handleError<string>('phrase')));
  }

  bulkDeleteEmbeddings(projectId: number, body: unknown) {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/embeddings/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteEmbeddings')),
      catchError(this.logService.handleError<unknown>('bulkDeleteEmbeddings')));
  }

  deleteEmbedding(projectId: number, embeddingId: number) {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/embeddings/${embeddingId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteEmbedding')),
      catchError(this.logService.handleError<unknown>('deleteEmbedding')));
  }

}
