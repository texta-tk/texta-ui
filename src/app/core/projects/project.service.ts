import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Project, ProjectFact, ProjectField} from '../../shared/types/Project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getProjects(): Observable<{count: number, results: Project[]} | HttpErrorResponse> {
    return this.http.get<{count: number, results: Project[]}>(
      this.apiUrl + '/projects/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getProjects')),
      catchError(this.logService.handleError<{count: number, results: Project[]}>('getProjects')));
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
}
