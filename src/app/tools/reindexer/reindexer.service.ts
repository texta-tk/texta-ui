import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LogService } from 'src/app/core/util/log.service';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Reindexer } from 'src/app/shared/types/tools/Elastic';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReindexerService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getReindexers(projectId: number, params = ''): Observable<{count: number, results: Reindexer[]} | HttpErrorResponse> {
    return this.http.get<{count: number, results: Reindexer[]}>(`${this.apiUrl}/projects/${projectId}/reindexer/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getReindexers')),
      catchError(this.logService.handleError<{count: number, results: Reindexer[]}>('getReindexers')));
  }

  createReindexer(body, projectId): Observable<Reindexer | HttpErrorResponse> {
    return this.http.post<Reindexer>(`${this.apiUrl}/projects/${projectId}/reindexer/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createReindexer')),
      catchError(this.logService.handleError<Reindexer>('createReindexer')));
  }

  bulkDeleteReindexers(projectId: number, body) {
    return this.http.post<{"num_deleted": number, "deleted_types": {string: number}[] }>
    (`${this.apiUrl}/projects/${projectId}/embeddings/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteEmbeddings')),
      catchError(this.logService.handleError<unknown>('bulkDeleteEmbeddings')));
  }

  deleteReindex(embeddingId: number, projectId: number) {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/taggers/${embeddingId}`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteEmbedding')),
      catchError(this.logService.handleError<unknown>('deleteEmbedding')));
  }

  getReindexerOptions(projectId: number) {
    return this.http.options<any>(`${this.apiUrl}/projects/${projectId}/reindexer/`).pipe(
      tap(e => this.logService.logStatus(e, 'getReindexerOptions')),
      catchError(this.logService.handleError<any>('getReindexerOptions')));
  }
}
