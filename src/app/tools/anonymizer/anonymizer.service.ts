import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../core/util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ResultsWrapper} from '../../shared/types/Generic';
import {Anonymizer} from './types/Anonymizer';

@Injectable({
  providedIn: 'root'
})
export class AnonymizerService {

  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }


  getAnonymizers(projectId: number, params = ''): Observable<ResultsWrapper<Anonymizer> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<Anonymizer>>(`${this.apiUrl}/projects/${projectId}/anonymizers/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getAnonymizers')),
      catchError(this.logService.handleError<ResultsWrapper<Anonymizer>>('getAnonymizers')));
  }

  createAnonymizer(projectId: number, body: unknown): Observable<Anonymizer | HttpErrorResponse> {
    return this.http.post<Anonymizer>(`${this.apiUrl}/projects/${projectId}/anonymizers/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createAnonymizer')),
      catchError(this.logService.handleError<Anonymizer>('createAnonymizer')));
  }

  anonymizeText(projectId: number, anonymizerId: number, body: unknown): Observable<string | HttpErrorResponse> {
    return this.http.post<string>(`${this.apiUrl}/projects/${projectId}/anonymizers/${anonymizerId}/anonymize_text/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'anonymizeText')),
      catchError(this.logService.handleError<string>('anonymizeText')));
  }

  bulkDeleteAnonymizers(projectId: number, body: unknown): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/anonymizers/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteAnonymizers')),
      catchError(this.logService.handleError<unknown>('bulkDeleteAnonymizers')));
  }
}
