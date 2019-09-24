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

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getNeuroTaggers(projectId: number): Observable<NeuroTagger[] | HttpErrorResponse> {
    return this.http.get<NeuroTagger[]>(
      this.apiUrl + '/projects/' + projectId + '/neurotaggers/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getNeuroTaggers')),
      catchError(this.logService.handleError<NeuroTagger[]>('getNeuroTaggers')));
  }

  getNeuroTaggerOptions(projectId: number): Observable<any | HttpErrorResponse> {
    return this.http.options<any>(
      this.apiUrl + '/projects/' + projectId + '/neurotaggers/'
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getNeuroTaggerOptions')),
      catchError(this.logService.handleError<any>('getNeuroTaggerOptions')));
  }
}
