import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Health, Project, ProjectFact, ProjectField, ProjectResourceCounts} from '../../shared/types/Project';
import {Index} from '../../shared/types/Index';
import {ResultsWrapper} from '../../shared/types/Generic';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getProjects(): Observable<Project[] | HttpErrorResponse> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects/`).pipe(
      tap(e => this.logService.logStatus(e, 'getProjects')),
      catchError(this.logService.handleError<Project[]>('getProjects')));
  }

  createProject(body: {}): Observable<Project | HttpErrorResponse> {
    return this.http.post<Project>(
      this.apiUrl + '/projects/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createProject')),
      catchError(this.logService.handleError<Project>('createProject')));
  }

  editProject(body: {}, projectId): Observable<Project | HttpErrorResponse> {
    return this.http.put<Project>(
      this.apiUrl + '/projects/' + projectId + '/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createProject')),
      catchError(this.logService.handleError<Project>('createProject')));
  }

  getProjectById(id: number): Observable<Project | HttpErrorResponse> {
    return this.http.get<Project>(
      this.apiUrl + '/projects/' + id,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getProject')),
      catchError(this.logService.handleError<Project>('getProject')));
  }

  getProjectFields(id: number): Observable<ProjectField[] | HttpErrorResponse> {
    return this.http.get<ProjectField[]>(
      this.apiUrl + '/projects/' + id + '/get_fields/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'get Project Fields')),
      catchError(this.logService.handleError<ProjectField[]>('getProjectFields')));
  }

  projectFactValueAutoComplete(id: number, factName: string, limitN: number, startsWith: string): Observable<string[] | HttpErrorResponse> {
    const body = {
      limit: limitN,
      startswith: startsWith,
      fact_name: factName
    };
    return this.http.post<string[]>(
      this.apiUrl + '/projects/' + id + '/autocomplete_fact_values/', body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'projectFactValueAutoComplete')),
      catchError(this.logService.handleError<string[]>('projectFactValueAutoComplete')));
  }

  getProjectFacts(id: number): Observable<ProjectFact[] | HttpErrorResponse> {
    return this.http.get<ProjectFact[]>(
      this.apiUrl + '/projects/' + id + '/get_facts/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'get Project Facts')),
      catchError(this.logService.handleError<ProjectFact[]>('getProjectFacts')));
  }

  getResourceCounts(projId: number): Observable<ProjectResourceCounts | HttpErrorResponse> {
    return this.http.get<ProjectResourceCounts>(`${this.apiUrl}/projects/${projId}/get_resource_counts/`).pipe(
      tap(e => this.logService.logStatus(e, 'get Project Resource Counts')),
      catchError(this.logService.handleError<ProjectResourceCounts>('getResourceCounts')));
  }

  getHealth(): Observable<Health | HttpErrorResponse> {
    return this.http.get<Health>(`${this.apiUrl}/health/`).pipe(
      tap(e => this.logService.logStatus(e, 'get Health')),
      catchError(this.logService.handleError<Health>('getHealth')));
  }

  getIndices(): Observable<string[] | HttpErrorResponse> {
    return this.http.get<string[]>(`${this.apiUrl}/get_indices/`).pipe(
      tap(e => this.logService.logStatus(e, 'get Indices')),
      catchError(this.logService.handleError<string[]>('getIndices')));
  }

  getElasticIndices(projectId: number, params = ''): Observable<ResultsWrapper<Index> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<Index>>(`${this.apiUrl}/projects/${projectId}/index/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getElasticIndices')),
      catchError(this.logService.handleError<ResultsWrapper<Index>>('getElasticIndices')));
  }

  deleteElasticIndex(projectId: number, indexId: number): Observable<ResultsWrapper<Index> | HttpErrorResponse> {
    return this.http.delete<ResultsWrapper<Index>>(`${this.apiUrl}/projects/${projectId}/index/${indexId}`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteElasticIndex')),
      catchError(this.logService.handleError<ResultsWrapper<Index>>('deleteElasticIndex')));
  }

  editElasticIndex(projectId: number, index: Index): Observable<ResultsWrapper<Index> | HttpErrorResponse> {
    return this.http.post<ResultsWrapper<Index>>(`${this.apiUrl}/projects/${projectId}/index/`, index).pipe(
      tap(e => this.logService.logStatus(e, 'editElasticIndex')),
      catchError(this.logService.handleError<ResultsWrapper<Index>>('editElasticIndex')));
  }

  deleteProject(id: number) {
    return this.http.delete<unknown>(`${this.apiUrl}/projects/${id}/`).pipe(
      tap(e => this.logService.logStatus(e, 'delete Project')),
      catchError(this.logService.handleError<string[]>('deleteProject')));
  }
}
