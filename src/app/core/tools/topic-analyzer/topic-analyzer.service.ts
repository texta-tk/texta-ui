import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../../util/local-storage.service';
import {LogService} from '../../util/log.service';
import {Observable} from 'rxjs';
import {Cluster, ClusterDetails, ClusterMoreLikeThis, ClusterView} from '../../../shared/types/tasks/Cluster';
import {catchError, tap} from 'rxjs/operators';
import {ClusterOptions} from '../../../shared/types/tasks/ClusterOptions';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {AppConfigService} from '../../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class TopicAnalyzerService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getClusters(projectId: number, params = ''): Observable<ResultsWrapper<Cluster> | HttpErrorResponse> {
    return this.http.get<{ count: number, results: Cluster[] }>(
      `${this.apiUrl}/projects/${projectId}/topic_analyzer/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getClusters')),
      catchError(this.logService.handleError<ResultsWrapper<Cluster>>('getClusters')));
  }

  getCluster(projectId: number, clusteringId: number): Observable<Cluster | HttpErrorResponse> {
    return this.http.get<Cluster>(
      `${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusteringId}`).pipe(
      tap(e => this.logService.logStatus(e, 'getCluster')),
      catchError(this.logService.handleError<Cluster>('getCluster')));
  }


  retrainCluster(projectId: number, clusterId: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusterId}/retrain/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'retrainCluster')),
      catchError(this.logService.handleError<unknown>('retrainCluster')));
  }

  // tslint:disable-next-line:no-any
  createCluster(body: any, projectId: number): Observable<Cluster | HttpErrorResponse> {
    return this.http.post<Cluster>(
      `${this.apiUrl}/projects/${projectId}/topic_analyzer/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createCluster')),
      catchError(this.logService.handleError<Cluster>('createCluster')));
  }

  // tslint:disable-next-line:no-any
  editCluster(projectId: number, clusterId: number, body: any): Observable<Cluster | HttpErrorResponse> {
    return this.http.patch<Cluster>(
      `${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusterId}/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'editCluster')),
      catchError(this.logService.handleError<Cluster>('editCluster')));
  }

  bulkDeleteClusterings(projectId: number, body: { ids: number[]; }): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/topic_analyzer/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteClusterings')),
      catchError(this.logService.handleError<unknown>('bulkDeleteClusterings')));
  }

  bulkDeleteClusters(projectId: number, clusteringId: number, body: { ids: number[]; }): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusteringId}/bulk_delete_clusters/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteClusters')),
      catchError(this.logService.handleError<unknown>('bulkDeleteClusters')));
  }

  bulkDeleteClusterDocuments(projectId: number, clusteringId: number, clusterId: number, body: { ids: number[]; }): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusteringId}/clusters/${clusterId}/remove_documents/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteClusterDocuments')),
      catchError(this.logService.handleError<unknown>('bulkDeleteClusterDocuments')));
  }

  addDocumentsToCluster(projectId: number, clusteringId: number, clusterId: number, body: unknown): Observable<unknown> {
    return this.http.post<unknown>
    (`${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusteringId}/clusters/${clusterId}/add_documents/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'addDocumentsToCluster')),
      catchError(this.logService.handleError<unknown>('addDocumentsToCluster')));
  }

  expandCluster(projectId: number, clusteringId: number, clusterId: number, body: { ids: string[]; }): Observable<unknown> {
    return this.http.post<unknown>
    (`${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusteringId}/clusters/${clusterId}/expand_cluster/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'expandCluster')),
      catchError(this.logService.handleError<unknown>('expandCluster')));
  }

  tagCluster(projectId: number, clusteringId: number, clusterId: number, body: unknown): Observable<unknown> {
    return this.http.post<unknown>
    (`${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusteringId}/clusters/${clusterId}/tag_cluster/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagCluster')),
      catchError(this.logService.handleError<unknown>('tagCluster')));
  }

  moreLikeCluster(projectId: number, clusteringId: number, clusterId: number,
                  body: { size: number; include_meta: boolean; }): Observable<ClusterMoreLikeThis[] | HttpErrorResponse> {
    return this.http.post<ClusterMoreLikeThis[]>
    (`${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusteringId}/clusters/${clusterId}/more_like_cluster/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'moreLikeCluster')),
      catchError(this.logService.handleError<ClusterMoreLikeThis[]>('moreLikeCluster')));
  }

  deleteCluster(projectId: number, clusterId: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusterId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteCluster')),
      catchError(this.logService.handleError<unknown>('deleteCluster')));
  }

  viewClusters(projectId: number, clusterId: number): Observable<ClusterView | HttpErrorResponse> {
    return this.http.get<ClusterView>(
      `${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusterId}/view_clusters`).pipe(
      tap(e => this.logService.logStatus(e, 'viewClusters')),
      catchError(this.logService.handleError<ClusterView>('viewClusters')));
  }

  clusterDetails(projectId: number, clusteringId: number, clusterId: number): Observable<ClusterDetails | HttpErrorResponse> {
    return this.http.get<ClusterDetails>(
      `${this.apiUrl}/projects/${projectId}/topic_analyzer/${clusteringId}/clusters/${clusterId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'clusterDetails')),
      catchError(this.logService.handleError<ClusterDetails>('clusterDetails')));
  }

  getClusterOptions(projectId: number): Observable<ClusterOptions | HttpErrorResponse> {
    return this.http.options<ClusterOptions>(
      `${this.apiUrl}/projects/${projectId}/topic_analyzer/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getClusterOptions')),
      catchError(this.logService.handleError<ClusterOptions>('getClusterOptions')));
  }

}
