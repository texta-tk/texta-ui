import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {TaggerGroup, LightTagger} from '../../shared/types/tasks/Tagger';
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
  getTaggerGroups(projectId: number,  params = ''): Observable<{count: number, results: TaggerGroup[]} | HttpErrorResponse> {
    return this.http.get<{count: number, results: TaggerGroup[]}>(
      `${this.apiUrl}/projects/${projectId}/tagger_groups/?${params}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggerGroups')),
      catchError(this.logService.handleError<{count: number, results: TaggerGroup[]}>('getTaggerGroups')));
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

  modelsRetrain(taggerGroupId: number, projectId: number) {
    return this.http.post<{'success': 'retraining tasks created'}>(
      `${this.apiUrl}/projects/${projectId}/tagger_groups/${taggerGroupId}/models_retrain/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'modelsRetrain')),
      catchError(this.logService.handleError<HttpErrorResponse>('modelsRetrain')));
  }

  getModelsList(taggerGroupId: number, projectId: number) {
    return this.http.get<LightTagger[]>(
      `${this.apiUrl}/projects/${projectId}/tagger_groups/${taggerGroupId}/models_list/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getModelsList')),
      catchError(this.logService.handleError<HttpErrorResponse>('getModelsList')));
  }

  tagText(body: {}, projectId: number, taggerId):
   Observable<{ probability: number, tag: string, tagger_id: number }[] | HttpErrorResponse> {
    return this.http.post<{ probability: number, tag: string, tagger_id: number }[]>(
      `${this.apiUrl}/projects/${projectId}/tagger_groups/${taggerId}/tag_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagText')),
      catchError(this.logService.handleError<{ probability: number, tag: string, tagger_id: number }[]>('tagText')));
  }
}
