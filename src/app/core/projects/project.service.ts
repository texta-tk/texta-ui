import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Project} from '../../../shared/types/Project';
import {ProjectFields} from '../../../shared/types/ProjectFields';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getProjects(): Observable<Project[] | HttpErrorResponse> {
    return this.http.get<Project[]>(
      this.apiUrl + '/projects/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getProjects')),
      catchError(this.logService.handleError<Project[]>('getProjects')));
  }

  getProjectById(id: number): Observable<Project | HttpErrorResponse> {
    return this.http.get<Project>(
      this.apiUrl + '/projects/' + id,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getProject')),
      catchError(this.logService.handleError<Project>('getProject')));
  }

  getProjectFields(id: number): Observable<ProjectFields | HttpErrorResponse> {
    return this.http.get<ProjectFields>(
      this.apiUrl + '/projects/' + id + '/get_fields/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'get Project Fields')),
      catchError(this.logService.handleError<ProjectFields>('getProjectFields')));
  }
}
