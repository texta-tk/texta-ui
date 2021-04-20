import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {LangDetect} from '../../../shared/types/tasks/LangDetect';
import {LogService} from '../../util/log.service';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LangDetectService {
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getLangDetectTasks(projectId: number, params = ''): Observable<ResultsWrapper<LangDetect> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<LangDetect>>(`${this.apiUrl}/projects/${projectId}/lang_index/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getLangDetectTasks')),
      catchError(this.logService.handleError<ResultsWrapper<LangDetect>>('getLangDetectTasks')));
  }

  createLangDetectTask(projectId: number, body: unknown): Observable<LangDetect | HttpErrorResponse> {
    return this.http.post<LangDetect>(`${this.apiUrl}/projects/${projectId}/lang_index/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createLangDetectTask')),
      catchError(this.logService.handleError<LangDetect>('createLangDetectTask')));
  }

  deleteLangDetect(projectId: number, taskId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/lang_index/${taskId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteLangDetect')),
      catchError(this.logService.handleError<unknown>('deleteLangDetect')));
  }

  bulkDeleteLangDetectTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/lang_index/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteLangDetectTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteLangDetectTasks')));
  }
}
