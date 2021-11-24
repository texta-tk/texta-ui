import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {
  RegexTaggerGroup, RegexTaggerGroupMultiTagTextResult,
  RegexTaggerGroupTagRandomDocResult,
  RegexTaggerGroupTagTextResult
} from '../../../../shared/types/tasks/RegexTaggerGroup';
import {ResultsWrapper} from '../../../../shared/types/Generic';
import {LogService} from '../../../util/log.service';
import {environment} from '../../../../../environments/environment';
import {AppConfigService} from '../../../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class RegexTaggerGroupService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;

  constructor(private http: HttpClient,
              private logService: LogService) {
  }

  getRegexTaggerGroupTasks(projectId: number, params = ''): Observable<ResultsWrapper<RegexTaggerGroup> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<RegexTaggerGroup>>(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/?${params}`).pipe(
      tap(e => this.logService.logStatus(e, 'getRegexTaggerGroup')),
      catchError(this.logService.handleError<ResultsWrapper<RegexTaggerGroup>>('getRegexTaggerGroup')));
  }

  createRegexTaggerGroupTask(projectId: number, body: unknown): Observable<RegexTaggerGroup | HttpErrorResponse> {
    return this.http.post<RegexTaggerGroup>(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createRegexTaggerGroup')),
      catchError(this.logService.handleError<RegexTaggerGroup>('createRegexTaggerGroup')));
  }

  applyRegexTaggerGroup(projectId: number, groupId: number, body: unknown): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/${groupId}/apply_tagger_group/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'createRegexTaggerGroup')),
      catchError(this.logService.handleError<{ message: string }>('createRegexTaggerGroup')));
  }

  tagDoc(projectId: number, groupId: number, body: unknown): Observable<{ matches: unknown } | HttpErrorResponse> {
    return this.http.post<{ matches: unknown }>(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/${groupId}/tag_doc/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagDoc')),
      catchError(this.logService.handleError<{ matches: unknown }>('tagDoc')));
  }

  tagRandomDoc(projectId: number, groupId: number, body: unknown): Observable<RegexTaggerGroupTagRandomDocResult | HttpErrorResponse> {
    return this.http.post<RegexTaggerGroupTagRandomDocResult>(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/${groupId}/tag_random_doc/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagRandomDoc')),
      catchError(this.logService.handleError<RegexTaggerGroupTagRandomDocResult>('tagRandomDoc')));
  }

  tagText(projectId: number, groupId: number, body: unknown): Observable<RegexTaggerGroupTagTextResult | HttpErrorResponse> {
    return this.http.post<RegexTaggerGroupTagTextResult>(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/${groupId}/tag_text/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagText')),
      catchError(this.logService.handleError<RegexTaggerGroupTagTextResult>('tagText')));
  }

  bulkDeleteRegexTaggerGroupTasks(projectId: number, body: unknown): Observable<{ 'num_deleted': number, 'deleted_types': { string: number }[] } | HttpErrorResponse> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteRegexTaggerGroup')),
      catchError(this.logService.handleError<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>('bulkDeleteRegexTaggerGroup')));
  }

  patchRegexTaggerGroup(projectId: number, regexTaggerId: number, body: unknown): Observable<RegexTaggerGroup | HttpErrorResponse> {
    return this.http.patch<RegexTaggerGroup>(
      `${this.apiUrl}/projects/${projectId}/regex_tagger_groups/${regexTaggerId}/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'patchRegexTaggerGroup')),
      catchError(this.logService.handleError<RegexTaggerGroup>('patchRegexTaggerGroup')));
  }

  multiTagText(projectId: number, body: unknown): Observable<RegexTaggerGroupMultiTagTextResult[] | HttpErrorResponse> {
    return this.http.post<RegexTaggerGroupMultiTagTextResult[]>(
      `${this.apiUrl}/projects/${projectId}/regex_tagger_groups/multitag_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'multiTagText')),
      catchError(this.logService.handleError<RegexTaggerGroupMultiTagTextResult[]>('multiTagText')));
  }

  // tslint:disable-next-line:no-any
  applyRegexTaggerGroupOptions(projectId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/apply_tagger_group/apply_tagger_group/`).pipe(
      tap(e => this.logService.logStatus(e, 'applyRegexTaggerGroupOptions')),
      catchError(this.logService.handleError('applyRegexTaggerGroupOptions')));
  }

  // tslint:disable-next-line:no-any
  getRegexTaggerGroupOptions(projectId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/`).pipe(
      tap(e => this.logService.logStatus(e, 'getRegexTaggerGroupOptions')),
      catchError(this.logService.handleError('getRegexTaggerGroupOptions')));
  }
  // tslint:disable-next-line:no-any
  getTagRdocOptions(projectId: number, taggerId: number): Observable<any | HttpErrorResponse> {
    return this.http.options(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/${taggerId}/tag_random_doc/`).pipe(
      tap(e => this.logService.logStatus(e, 'getTagRdocOptions')),
      catchError(this.logService.handleError('getTagRdocOptions')));
  }

}
