import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Project, ProjectFact, ProjectIndex, ProjectResourceCounts} from '../../shared/types/Project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  apiUrl = environment.apiHost + environment.apiBasePath;

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
      tap(e => this.logService.logStatus(e, 'createProject')),
      catchError(this.logService.handleError<Project>('createProject')));
  }

  exportSearch(projId: number, query: unknown, indices: string[]): Observable<string | HttpErrorResponse> {
    return this.http.post<string>(
      `${this.apiUrl}/projects/${projId}/export_search/`,
      {indices, query}
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
      `${this.apiUrl}/projects/${id}/get_fields/`,
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

  getProjectFacts(id: number, indices: unknown): Observable<ProjectFact[] | HttpErrorResponse> {
    return this.http.post<ProjectFact[]>(
      `${this.apiUrl}/projects/${id}/get_facts/`, {indices, output_type: false}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'get Project Facts')),
      catchError(this.logService.handleError<ProjectFact[]>('getProjectFacts')));
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
