import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Project, ProjectFact, ProjectField, ProjectResourceCounts, Health} from '../../shared/types/Project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  apiUrl = environment.apiUrl;

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

  getProjectFacts(id: number): Observable<ProjectFact[] | HttpErrorResponse> {
    return this.http.get<ProjectFact[]>(
      this.apiUrl + '/projects/' + id + '/get_facts/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'get Project Facts')),
      catchError(this.logService.handleError<ProjectFact[]>('getProjectFacts')));
  }

  // todo backend seperate endpoint
  getProjectOptions(): Observable<unknown> {
    return this.http.options<unknown>(
      this.apiUrl + '/projects/'
    ).pipe(
      tap(e => this.logService.logStatus(e, 'get Project Options')),
      catchError(this.logService.handleError<unknown>('getProjectOptions')));
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
}
