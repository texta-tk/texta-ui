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

@Injectable({
  providedIn: 'root'
})
export class ClusterService {
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getClusters(projectId: number, params = ''): Observable<ResultsWrapper<Cluster> | HttpErrorResponse> {
    return this.http.get<{ count: number, results: Cluster[] }>(
      `${this.apiUrl}/projects/${projectId}/clustering/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getClusters')),
      catchError(this.logService.handleError<ResultsWrapper<Cluster>>('getClusters')));
  }

  retrainCluster(projectId: number, clusterId: number) {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/clustering/${clusterId}/retrain/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'retrainCluster')),
      catchError(this.logService.handleError<unknown>('retrainCluster')));
  }

  createCluster(body, projectId): Observable<Cluster | HttpErrorResponse> {
    return this.http.post<Cluster>(
      this.apiUrl + '/projects/' + projectId + '/clustering/', body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createCluster')),
      catchError(this.logService.handleError<Cluster>('createCluster')));
  }

  editCluster(projectId, clusterId, body: any): Observable<Cluster | HttpErrorResponse> {
    return this.http.patch<Cluster>(
      `${this.apiUrl}/projects/${projectId}/clustering/${clusterId}/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'editCluster')),
      catchError(this.logService.handleError<Cluster>('editCluster')));
  }

  bulkDeleteClusterings(projectId: number, body) {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/clustering/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteClusterings')),
      catchError(this.logService.handleError<unknown>('bulkDeleteClusterings')));
  }

  bulkDeleteClusters(projectId: number, clusteringId: number, body) {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/clustering/${clusteringId}/bulk_delete_clusters/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteClusters')),
      catchError(this.logService.handleError<unknown>('bulkDeleteClusters')));
  }

  bulkDeleteClusterDocuments(projectId: number, clusteringId: number, clusterId: number, body) {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/clustering/${clusteringId}/clusters/${clusterId}/remove_documents/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteClusterDocuments')),
      catchError(this.logService.handleError<unknown>('bulkDeleteClusterDocuments')));
  }

  addDocumentsToCluster(projectId: number, clusteringId: number, clusterId: number, body) {
    return this.http.post<unknown>
    (`${this.apiUrl}/projects/${projectId}/clustering/${clusteringId}/clusters/${clusterId}/add_documents/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'addDocumentsToCluster')),
      catchError(this.logService.handleError<unknown>('addDocumentsToCluster')));
  }
  expandCluster(projectId: number, clusteringId: number, clusterId: number, body) {
    return this.http.post<unknown>
    (`${this.apiUrl}/projects/${projectId}/clustering/${clusteringId}/clusters/${clusterId}/expand_cluster/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'expandCluster')),
      catchError(this.logService.handleError<unknown>('expandCluster')));
  }
  tagCluster(projectId: number, clusteringId: number, clusterId: number, body) {
    return this.http.post<unknown>
    (`${this.apiUrl}/projects/${projectId}/clustering/${clusteringId}/clusters/${clusterId}/tag_cluster/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagCluster')),
      catchError(this.logService.handleError<unknown>('tagCluster')));
  }

  moreLikeCluster(projectId: number, clusteringId: number, clusterId: number, body): Observable<ClusterMoreLikeThis[] | HttpErrorResponse> {
    return this.http.post<ClusterMoreLikeThis[]>
    (`${this.apiUrl}/projects/${projectId}/clustering/${clusteringId}/clusters/${clusterId}/more_like_cluster/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'moreLikeCluster')),
      catchError(this.logService.handleError<ClusterMoreLikeThis[]>('moreLikeCluster')));
  }

  deleteCluster(projectId: number, clusterId: number) {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/clustering/${clusterId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteCluster')),
      catchError(this.logService.handleError<unknown>('deleteCluster')));
  }

  viewClusters(projectId: number, clusterId: number): Observable<ClusterView | HttpErrorResponse> {
    return this.http.get<ClusterView>(
      `${this.apiUrl}/projects/${projectId}/clustering/${clusterId}/view_clusters`).pipe(
      tap(e => this.logService.logStatus(e, 'viewClusters')),
      catchError(this.logService.handleError<ClusterView>('viewClusters')));
  }

  clusterDetails(projectId: number, clusteringId: number, clusterId: number): Observable<ClusterDetails | HttpErrorResponse> {
    return this.http.get<ClusterDetails>(
      `${this.apiUrl}/projects/${projectId}/clustering/${clusteringId}/clusters/${clusterId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'clusterDetails')),
      catchError(this.logService.handleError<ClusterDetails>('clusterDetails')));
  }

  getClusterOptions(projectId: number): Observable<ClusterOptions | HttpErrorResponse> {
    return this.http.options<ClusterOptions>(
      this.apiUrl + '/projects/' + projectId + '/clustering/'
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getClusterOptions')),
      catchError(this.logService.handleError<ClusterOptions>('getClusterOptions')));
  }

}
