import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {LocalStorageService} from '../util/local-storage.service';
import {Observable} from 'rxjs';
import {LogService} from '../util/log.service';
import {EmbeddingCluster} from '../../shared/types/tasks/Embedding';

@Injectable({
  providedIn: 'root'
})
export class EmbeddingsGroupService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getEmbeddingGroups(projectId: number): Observable<{count: number, results: EmbeddingCluster[]} | HttpErrorResponse> {
    return this.http.get<{count: number, results: EmbeddingCluster[]}>(
      this.apiUrl + '/projects/' + projectId + '/embedding_clusters/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getEmbeddingGroups')),
      catchError(this.logService.handleError<{count: number, results: EmbeddingCluster[]}>('getEmbeddingGroups')));
  }

  createEmbeddingGroup(body: {}, projectId: number): Observable<EmbeddingCluster | HttpErrorResponse> {
    return this.http.post<EmbeddingCluster>(
      this.apiUrl + '/projects/' + projectId + '/embedding_clusters/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createEmbeddingGroup')),
      catchError(this.logService.handleError<EmbeddingCluster>('createEmbeddingGroup')));
  }
}
