import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Project, ProjectFact, ProjectIndex, ProjectResourceCounts} from '../../shared/types/Project';
import {AppConfigService} from '../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getProjects(query?: string): Observable<Project[] | HttpErrorResponse> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects/?${query}`).pipe(
      tap(e => this.logService.logStatus(e, 'getProjects')),
      catchError(this.logService.handleError<Project[]>('getProjects')));
  }

  createProject(body: unknown): Observable<Project | HttpErrorResponse> {
    return this.http.post<Project>(
      `${this.apiUrl}/projects/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createProject')),
      catchError(this.logService.handleError<Project>('createProject')));
  }

  editProject(body: unknown, projectId: number): Observable<Project | HttpErrorResponse> {
    return this.http.patch<Project>(
      `${this.apiUrl}/projects/${projectId}/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'editProject')),
      catchError(this.logService.handleError<Project>('editProject')));
  }

  addUsersToProject(users: string[], projectId: number): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/projects/${projectId}/add_users/`,
      {users}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'addUsersToProject')),
      catchError(this.logService.handleError<{ message: string }>('addUsersToProject')));
  }

  addAdminsToProject(users: string[], projectId: number): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/projects/${projectId}/add_project_admins/`,
      {project_admins: users}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'addAdminsToProject')),
      catchError(this.logService.handleError<{ message: string }>('addAdminsToProject')));
  }

  addIndicesToProject(indices: number[], projectId: number): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/projects/${projectId}/add_indices/`,
      {indices}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'addIndicesToProject')),
      catchError(this.logService.handleError<{ message: string }>('addIndicesToProject')));
  }

  deleteIndicesFromProject(indices: number[], projectId: number): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/projects/${projectId}/remove_indices/`,
      {indices}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'deleteIndicesFromProject')),
      catchError(this.logService.handleError<{ message: string }>('deleteIndicesFromProject')));
  }

  deleteAdminsFromProject(users: string[], projectId: number): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/projects/${projectId}/remove_project_admins/`,
      {project_admins: users}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'deleteAdminsFromProject')),
      catchError(this.logService.handleError<{ message: string }>('deleteAdminsFromProject')));
  }

  deleteUsersFromProject(users: string[], projectId: number): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/projects/${projectId}/remove_users/`,
      {users}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'deleteUsersFromProject')),
      catchError(this.logService.handleError<{ message: string }>('deleteUsersFromProject')));
  }

  exportSearch(projId: number, body: unknown): Observable<string | HttpErrorResponse> {
    return this.http.post<string>(
      `${this.apiUrl}/projects/${projId}/elastic/export_search/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'exportSearch')),
      catchError(this.logService.handleError<string>('exportSearch')));
  }

  getProjectById(id: number): Observable<Project | HttpErrorResponse> {
    return this.http.get<Project>(
      `${this.apiUrl}/projects/${id}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getProject')),
      catchError(this.logService.handleError<Project>('getProject')));
  }

  getProjectIndices(id: number): Observable<ProjectIndex[] | HttpErrorResponse> {
    return this.http.get<ProjectIndex[]>(
      `${this.apiUrl}/projects/${id}/elastic/get_fields/`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getProjectFields')),
      catchError(this.logService.handleError<ProjectIndex[]>('getProjectFields')));
  }

  getIndicesDocCounts(id: number, body: unknown): Observable<number | HttpErrorResponse> {
    return this.http.post<number>(
      `${this.apiUrl}/projects/${id}/count_indices/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getIndicesDocCounts')),
      catchError(this.logService.handleError<number>('getIndicesDocCounts')));
  }

  projectFactValueAutoComplete(id: number, factName: string, limitN: number, startsWith: string, indices?: string[]): Observable<string[] | HttpErrorResponse> {
    const body = {
      limit: limitN,
      startswith: startsWith,
      fact_name: factName,
      indices: indices || []
    };
    return this.http.post<string[]>(
      `${this.apiUrl}/projects/${id}/autocomplete_fact_values/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'projectFactValueAutoComplete')),
      catchError(this.logService.handleError<string[]>('projectFactValueAutoComplete')));
  }

  getProjectFacts(id: number, indices: unknown, includeValues: true, includeDocPath: true, excludeZeroSpans?: boolean, mlpDocPath?: string): Observable<{ name: string, values: { value: string, doc_path: string }[] }[] | HttpErrorResponse>;
  getProjectFacts(id: number, indices: unknown, includeValues: true, includeDocPath: false, excludeZeroSpans?: boolean, mlpDocPath?: string): Observable<{ name: string, values: string[] }[] | HttpErrorResponse>;
  getProjectFacts(id: number, indices: unknown, includeValues: false, includeDocPath: false, excludeZeroSpans?: boolean, mlpDocPath?: string): Observable<string[] | HttpErrorResponse>;
  // tslint:disable-next-line:no-any
  getProjectFacts(id: number, indices: unknown, includeValues: boolean, includeDocPath: boolean, excludeZeroSpans?: boolean, mlpDocPath?: string): Observable<any |
    HttpErrorResponse> {
    // tslint:disable-next-line:no-any
    return this.http.post<any>(
      `${this.apiUrl}/projects/${id}/elastic/get_facts/`, {
        indices,
        include_values: includeValues,
        exclude_zero_spans: !!excludeZeroSpans,
        include_doc_path: includeDocPath, ...mlpDocPath ? {mlp_doc_path: mlpDocPath} : {}
      }
    ).pipe(
      tap(e => this.logService.logStatus(e, 'get Project Facts')),
      catchError(this.logService.handleError('getProjectFacts')));
  }

  getResourceCounts(projId: number): Observable<ProjectResourceCounts | HttpErrorResponse> {
    return this.http.get<ProjectResourceCounts>(`${this.apiUrl}/projects/${projId}/get_resource_counts/`).pipe(
      tap(e => this.logService.logStatus(e, 'get Project Resource Counts')),
      catchError(this.logService.handleError<ProjectResourceCounts>('getResourceCounts')));
  }

  deleteProject(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.apiUrl}/projects/${id}/`).pipe(
      tap(e => this.logService.logStatus(e, 'delete Project')),
      catchError(this.logService.handleError<string[]>('deleteProject')));
  }
}
