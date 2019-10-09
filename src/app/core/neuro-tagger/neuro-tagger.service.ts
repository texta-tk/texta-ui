import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {NeuroTagger} from '../../shared/types/tasks/NeuroTagger';

@Injectable({
  providedIn: 'root'
})
export class NeuroTaggerService {
  apiUrl = environment.apiUrl;
  apiEndpoint = 'neurotaggers';

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getNeuroTaggers(projectId: number, params = ''): Observable<{count: number, results: NeuroTagger[]} | HttpErrorResponse> {
    return this.http.get<{count: number, results: NeuroTagger[]}>(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/?${params}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getNeuroTaggers')),
      catchError(this.logService.handleError<{count: number, results: NeuroTagger[]}>('getNeuroTaggers')));
  }

  getNeuroTaggerOptions(projectId: number): Observable<any | HttpErrorResponse> {
    return this.http.options<any>(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getNeuroTaggerOptions')),
      catchError(this.logService.handleError<any>('getNeuroTaggerOptions')));
  }

  getNeuroTaggerTagTextOptions(projectId: number, taggerId: number): Observable<any | HttpErrorResponse> {
    return this.http.options<any>(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/tag_text/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getNeuroTaggerTagTextOptions')),
      catchError(this.logService.handleError<any>('getNeuroTaggerTagTextOptions')));
  }


  deleteNeuroTagger(projectId: number, taggerId: number) {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteNeuroTagger')),
      catchError(this.logService.handleError<unknown>('deleteNeuroTagger')));
  }

  tagText(body: {}, projectId: number, taggerId): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/tag_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagText')),
      catchError(this.logService.handleError<unknown>('tagText')));
  }

  tagDoc(body: {}, projectId: number, taggerId): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/tag_doc/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagDoc')),
      catchError(this.logService.handleError<unknown>('tagDoc')));
  }

  tagRandomDoc(projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.get(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/tag_random_doc/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagRandomDoc')),
      catchError(this.logService.handleError('tagRandomDoc')));
  }

  createNeuroTagger(body: {}, projectId: number): Observable<NeuroTagger | HttpErrorResponse> {
    return this.http.post<NeuroTagger>(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createNeuroTagger')),
      catchError(this.logService.handleError<NeuroTagger>('createNeuroTagger')));
  }

  bulkDeleteNeuroTaggers(projectId: number, body) {
    return this.http.post<{"num_deleted": number, "deleted_types": {string: number}[] }>
    (`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteNeuroTaggers')),
      catchError(this.logService.handleError<unknown>('bulkDeleteNeuroTaggers')));
  }
}
