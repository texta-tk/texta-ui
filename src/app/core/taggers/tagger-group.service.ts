import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {TaggerGroup} from '../../shared/types/tasks/Tagger';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';

@Injectable({
  providedIn: 'root'
})
export class TaggerGroupService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }
  getTaggerGroups(projectId: number): Observable<TaggerGroup[] | HttpErrorResponse> {
    return this.http.get<TaggerGroup[]>(
      this.apiUrl + '/projects/' + projectId + '/tagger_groups/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggerGroups')),
      catchError(this.logService.handleError<TaggerGroup[]>('getTaggerGroups')));
  }

  // todo
  createTaggerGroup(body: {}, projectId: number): Observable<TaggerGroup | HttpErrorResponse> {
    return this.http.post<TaggerGroup>(
      this.apiUrl + '/projects/' + projectId + '/tagger_groups/',
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'makeTagger')),
      catchError(this.logService.handleError<TaggerGroup>('makeTagger')));
  }
}
