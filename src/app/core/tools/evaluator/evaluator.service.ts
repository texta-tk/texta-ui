import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {LogService} from '../../util/log.service';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {Evaluator} from '../../../shared/types/tasks/Evaluator';

@Injectable({
  providedIn: 'root'
})
export class EvaluatorService {
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getEvaluatorTasks(projectId: number, params = ''): Observable<ResultsWrapper<Evaluator> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<Evaluator>>(`${this.apiUrl}/projects/${projectId}/evaluators/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getEvaluatorTasks')),
      catchError(this.logService.handleError<ResultsWrapper<Evaluator>>('getEvaluatorTasks')));
  }

  createEvaluatorTask(projectId: number, body: unknown): Observable<Evaluator | HttpErrorResponse> {
    return this.http.post<Evaluator>(`${this.apiUrl}/projects/${projectId}/evaluators/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createEvaluatorTask')),
      catchError(this.logService.handleError<Evaluator>('createEvaluatorTask')));
  }

  bulkDeleteEvaluatorTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/evaluators/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteEvaluatorTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteEvaluatorTasks')));
  }
}
