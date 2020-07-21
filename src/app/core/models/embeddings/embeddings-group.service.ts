import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {LogService} from '../../util/log.service';
import {EmbeddingCluster} from '../../../shared/types/tasks/Embedding';

@Injectable({
  providedIn: 'root'
})
export class EmbeddingsGroupService {
  apiUrl = environment.apiHost + environment.apiBasePath;
  apiEndpoint = 'embedding_clusters';

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getEmbeddingGroups(projectId: number, params = ''): Observable<{count: number, results: EmbeddingCluster[]} | HttpErrorResponse> {
    return this.http.get<{count: number, results: EmbeddingCluster[]}>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/?${params}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getEmbeddingGroups')),
      catchError(this.logService.handleError<{count: number, results: EmbeddingCluster[]}>('getEmbeddingGroups')));
  }

  createEmbeddingGroup(body: {}, projectId: number): Observable<EmbeddingCluster | HttpErrorResponse> {
    return this.http.post<EmbeddingCluster>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createEmbeddingGroup')),
      catchError(this.logService.handleError<EmbeddingCluster>('createEmbeddingGroup')));
  }

  bulkDeleteEmbeddingClusters(projectId: number, body: { ids: number[]; }) {
    return this.http.post<{'num_deleted': number, 'deleted_types': {string: number}[] }>
    (`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteEmbeddingClusters')),
      catchError(this.logService.handleError<unknown>('bulkDeleteEmbeddingClusters')));
  }

  deleteEmbeddingCluster(projectId: number, clusterId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${clusterId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteEmbeddingCluster')),
      catchError(this.logService.handleError<unknown>('deleteEmbeddingCluster')));
  }

  getBrowseClustersOptions(projectId: number, clusterId: number) {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${clusterId}/browse_clusters/`).pipe(
      tap(e => this.logService.logStatus(e, 'getBrowseClustersOptions')),
      catchError(this.logService.handleError<unknown>('getBrowseClustersOptions')));
  }

  browseClusters(projectId: number, clusterId: number, payload: unknown) {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${clusterId}/browse_clusters/`, payload).pipe(
      tap(e => this.logService.logStatus(e, 'browseClusters')),
      catchError(this.logService.handleError<unknown>('browseClusters')));
  }
}
