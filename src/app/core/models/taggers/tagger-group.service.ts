import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {TaggerGroup, LightTagger} from '../../../shared/types/tasks/Tagger';
import {LocalStorageService} from '../../util/local-storage.service';
import {LogService} from '../../util/log.service';
import {AppConfigService} from '../../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class TaggerGroupService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;
  apiEndpoint = 'tagger_groups';

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getTaggerGroups(projectId: number, params = ''): Observable<{ count: number, results: TaggerGroup[] } | HttpErrorResponse> {
    return this.http.get<{ count: number, results: TaggerGroup[] }>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/?${params}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggerGroups')),
      catchError(this.logService.handleError<{ count: number, results: TaggerGroup[] }>('getTaggerGroups')));
  }

  createTaggerGroup(body: unknown, projectId: number): Observable<TaggerGroup | HttpErrorResponse> {
    return this.http.post<TaggerGroup>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createTaggerGroup')),
      catchError(this.logService.handleError<TaggerGroup>('createTaggerGroup')));
  }

  addFavoriteTaggerGrp(projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/add_favorite/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'addFavoriteTaggerGrp')),
      catchError(this.logService.handleError<unknown>('addFavoriteTaggerGrp')));
  }

  editTaggerGroup(body: unknown, projectId: number, taggerId: number): Observable<TaggerGroup | HttpErrorResponse> {
    return this.http.patch<TaggerGroup>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'editTaggerGroup')),
      catchError(this.logService.handleError<TaggerGroup>('editTaggerGroup')));
  }

  modelsRetrain(taggerGroupId: number, projectId: number): Observable<HttpErrorResponse | { success: 'retraining tasks created' }> {
    return this.http.post<{ 'success': 'retraining tasks created' }>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerGroupId}/models_retrain/`, {}
    ).pipe(
      tap(e => this.logService.logStatus(e, 'modelsRetrain')),
      catchError(this.logService.handleError<HttpErrorResponse>('modelsRetrain')));
  }

  getModelsList(taggerGroupId: number, projectId: number): Observable<HttpErrorResponse | LightTagger[]> {
    return this.http.get<LightTagger[]>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerGroupId}/models_list/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getModelsList')),
      catchError(this.logService.handleError<HttpErrorResponse>('getModelsList')));
  }

  tagText(body: unknown, projectId: number, taggerId: number):
    Observable<{ probability: number, tag: string, tagger_id: number }[] | HttpErrorResponse> {
    return this.http.post<{ probability: number, tag: string, tagger_id: number }[]>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/tag_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagText')),
      catchError(this.logService.handleError<{ probability: number, tag: string, tagger_id: number }[]>('tagText')));
  }

  tagDoc(body: unknown, projectId: number, taggerId: number):
    Observable<{ probability: number, tag: string, tagger_id: number }[] | HttpErrorResponse> {
    return this.http.post<{ probability: number, tag: string, tagger_id: number }[]>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/tag_doc/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagDoc')),
      catchError(this.logService.handleError<{ probability: number, tag: string, tagger_id: number }[]>('tagDoc')));
  }

  tagRandomDocument(projectId: number, taggerId: number, body: unknown): Observable<any | HttpErrorResponse> {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/tag_random_doc/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'tagRandomDocument')),
      catchError(this.logService.handleError('tagRandomDocument')));
  }

  bulkDeleteTaggerGroups(projectId: number, body: unknown): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteTaggerGroups')),
      catchError(this.logService.handleError<unknown>('bulkDeleteTaggerGroups')));
  }

  deleteTaggerGroup(projectId: number, taggerId: number): Observable<unknown | HttpErrorResponse> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/`).pipe(
      tap(e => this.logService.logStatus(e, 'deleteTaggerGroup')),
      catchError(this.logService.handleError<unknown>('deleteTaggerGroup')));
  }

  applyToIndex(projectId: number, taggerId: number, body: unknown): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taggerId}/apply_to_index/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndex')),
      catchError(this.logService.handleError('applyToIndex')));
  }

  // tslint:disable-next-line:no-any
  getTaggerGroupOptions(projectId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/`).pipe(
      tap(e => this.logService.logStatus(e, 'getTaggerGroupOptions')),
      catchError(this.logService.handleError('getTaggerGroupOptions')));
  }

  // tslint:disable-next-line:no-any
  applyToIndexOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    // tslint:disable-next-line:no-any
    return this.http.options<any>(
      `${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taskId}/apply_to_index/`
    ).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndexOptions')),
      // tslint:disable-next-line:no-any
      catchError(this.logService.handleError<any>('applyToIndexOptions')));
  }

  // tslint:disable-next-line:no-any
  getTagTextOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taskId}/tag_text/`).pipe(
      tap(e => this.logService.logStatus(e, 'applyToIndexOptions')),
      catchError(this.logService.handleError('applyToIndexOptions')));
  }
  // tslint:disable-next-line:no-any
  getTagDocOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taskId}/tag_doc/`).pipe(
      tap(e => this.logService.logStatus(e, 'getTagDocOptions')),
      catchError(this.logService.handleError('getTagDocOptions')));
  }
  // tslint:disable-next-line:no-any
  getTagRandomDocOptions(projectId: number, taskId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/${this.apiEndpoint}/${taskId}/tag_random_doc/`).pipe(
      tap(e => this.logService.logStatus(e, 'getTagRandomDocOptions')),
      catchError(this.logService.handleError('getTagRandomDocOptions')));
  }
}
