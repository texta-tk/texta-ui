import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {AppConfigService} from '../../util/app-config.service';
import {LogService} from '../../util/log.service';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {Annotator} from '../../../shared/types/tasks/Annotator';
import {LabelSet} from '../../../shared/types/tasks/LabelSet';

@Injectable({
  providedIn: 'root'
})
export class AnnotatorService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getAnnotatorTasks(projectId: number, params = ''): Observable<ResultsWrapper<Annotator> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<Annotator>>(`${this.apiUrl}/projects/${projectId}/annotator/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getAnnotatorTasks')),
      catchError(this.logService.handleError<ResultsWrapper<Annotator>>('getAnnotatorTasks')));
  }

  getAnnotatorGroups(projectId: number, params = ''): Observable<ResultsWrapper<{parent: Annotator, children: Annotator[]}> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<{parent: Annotator, children: Annotator[]}>>(`${this.apiUrl}/projects/${projectId}/annotator_groups/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getAnnotatorGroups')),
      catchError(this.logService.handleError<ResultsWrapper<{parent: Annotator, children: Annotator[]}>>('getAnnotatorGroups')));
  }

  createAnnotatorTask(projectId: number, body: unknown): Observable<Annotator | HttpErrorResponse> {
    return this.http.post<Annotator>(`${this.apiUrl}/projects/${projectId}/annotator/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createAnnotatorTask')),
      catchError(this.logService.handleError<Annotator>('createAnnotatorTask')));
  }

  bulkDeleteAnnotatorTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/annotator/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteAnnotatorTasks')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteAnnotatorTasks')));
  }

  patchAnnotator(body: {}, projectId: number, annotatorId: number): Observable<Annotator | HttpErrorResponse> {
    return this.http.patch<Annotator>(
      `${this.apiUrl}/projects/${projectId}/annotator/${annotatorId}/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'patchAnnotator')),
      catchError(this.logService.handleError<Annotator>('patchAnnotator')));
  }

  deleteAnnotator(projectId: number, annotatorId: number): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/projects/${projectId}/annotator/${annotatorId}/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'deleteAnnotator')),
      catchError(this.logService.handleError<{ message: string }>('deleteAnnotator')));
  }

  // tslint:disable-next-line:no-any
  getAnnotatorOptions(projectId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/annotator/`).pipe(
      tap(e => this.logService.logStatus(e, 'getAnnotatorOptions')),
      catchError(this.logService.handleError('getAnnotatorOptions')));
  }

  // tslint:disable-next-line:no-any
  getLabelSetOptions(projectId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/labelset/`).pipe(
      tap(e => this.logService.logStatus(e, 'getLabelSetOptions')),
      catchError(this.logService.handleError('getLabelSetOptions')));
  }

  getLabelSets(projectId: number, params = ''): Observable<ResultsWrapper<LabelSet> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<LabelSet>>(`${this.apiUrl}/projects/${projectId}/labelset/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getLabelSets')),
      catchError(this.logService.handleError<ResultsWrapper<LabelSet>>('getLabelSets')));
  }

  bulkDeleteLabelSets(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/labelset/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteLabelSets')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteLabelSets')));
  }

  createLabelSet(projectId: number, body: unknown): Observable<{ category: string; values: string[] } | HttpErrorResponse> {
    return this.http.post<{ category: string; values: string[] }>(`${this.apiUrl}/projects/${projectId}/labelset/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createLabelSet')),
      catchError(this.logService.handleError<{ category: string; values: string[] }>('createLabelSet')));
  }

}
