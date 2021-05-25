import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {LogService} from '../../util/log.service';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {Evaluator} from '../../../shared/types/tasks/Evaluator';
import {AppConfigService} from '../../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluatorService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getEvaluatorTasks(projectId: number, params = ''): Observable<ResultsWrapper<Evaluator> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<Evaluator>>(`${this.apiUrl}/projects/${projectId}/evaluators/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getEvaluatorTasks')),
      catchError(this.logService.handleError<ResultsWrapper<Evaluator>>('getEvaluatorTasks')));
  }

  editEvaluator(body: unknown, projectId: number, evalId: number): Observable<Evaluator | HttpErrorResponse> {
    return this.http.patch<Evaluator>(
      `${this.apiUrl}/projects/${projectId}/evaluators/${evalId}/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'editEvaluator')),
      catchError(this.logService.handleError<Evaluator>('editEvaluator')));
  }

  retrainEvaluator(projectId: number, id: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/evaluators/${id}/reevaluate/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'retrainEvaluator')),
      catchError(this.logService.handleError<unknown>('retrainEvaluator')));
  }

  evaluatorIndividualResults(projectId: number, evaluatorId: number, body: unknown): Observable<unknown | HttpErrorResponse> {
    return this.http.post<Evaluator>(`${this.apiUrl}/projects/${projectId}/evaluators/${evaluatorId}/individual_results/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'evaluatorIndividualResults')),
      catchError(this.logService.handleError<Evaluator>('evaluatorIndividualResults')));
  }

  evaluatorFilteredAverage(projectId: number, evaluatorId: number, body: unknown): Observable<{ precision: number; recall: number; f1_score: number; accuracy: number; count: number; } | HttpErrorResponse> {
    return this.http.post<{ precision: number; recall: number; f1_score: number; accuracy: number; count: number; }>(`${this.apiUrl}/projects/${projectId}/evaluators/${evaluatorId}/filtered_average/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'evaluatorFilteredAverage')),
      catchError(this.logService.handleError<{ precision: number; recall: number; f1_score: number; accuracy: number; count: number; }>('evaluatorFilteredAverage')));
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

  // tslint:disable-next-line:no-any
  evaluatorOptions(projectId: number): Observable<any | HttpErrorResponse> {
    // tslint:disable-next-line:no-any
    return this.http.options<any>(
      `${this.apiUrl}/projects/${projectId}/evaluators/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'evaluatorOptions')),
      // tslint:disable-next-line:no-any
      catchError(this.logService.handleError<any>('evaluatorOptions')));
  }

  deleteEvaluator(projectId: number, evalId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/evaluators/${evalId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteEvaluator')),
      catchError(this.logService.handleError<unknown>('deleteEvaluator')));
  }
}
