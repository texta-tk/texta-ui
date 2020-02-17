import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TorchTagger } from '../../../shared/types/tasks/TorchTagger';
import { LogService } from '../../util/log.service';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TorchTaggerService {
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient, private logService: LogService) {}

  getTorchTaggers(projectId: number, params = ''): Observable<{count: number, results: TorchTagger[]} | HttpErrorResponse> {
    return this.http.get<{count: number, results: TorchTagger[]}>(`${this.apiUrl}/projects/${projectId}/torchtaggers/?${params}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTorchTaggers')),
      catchError(this.logService.handleError<{count: number, results: TorchTagger[]}>('getTorchTaggers')));
  }

  bulkDeleteTorchTaggers(projectId: number, body: { ids: number[]; }) {
    return this.http.post<{'num_deleted': number, 'deleted_types': {string: number}[] }>
    (`${this.apiUrl}/projects/${projectId}/torchtaggers/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteTorchTaggers')),
      catchError(this.logService.handleError<unknown>('bulkDeleteTorchTaggers')));
  }

  deleteTorchTagger(projectId: number, taggerId: number) {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/torchtaggers/${taggerId}`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteTorchTagger')),
      catchError(this.logService.handleError<unknown>('deleteTorchTagger')));
  }


  getTorchTaggerOptions(projectId: number) {
    return this.http.options<unknown>(`${this.apiUrl}/projects/${projectId}/torchtaggers/`).pipe(
      tap(e => this.logService.logStatus(e, 'getTorchTaggerOptions')),
      catchError(this.logService.handleError<unknown>('getTorchTaggerOptions')));
  }

  createTorchTagger(projectId: number, payload): Observable<TorchTagger> {
    return this.http.post<TorchTagger>(`${this.apiUrl}/projects/${projectId}/torchtaggers/`, payload).pipe(
      tap(e => this.logService.logStatus(e, 'makeTagger')),
      catchError(this.logService.handleError<TorchTagger>('makeTagger')));
  }

  tagText(body: {}, projectId: number, taggerId): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(`${this.apiUrl}/projects/${projectId}/torchtaggers/${taggerId}/tag_text/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagText')),
      catchError(this.logService.handleError<unknown>('tagText')));
  }
}
