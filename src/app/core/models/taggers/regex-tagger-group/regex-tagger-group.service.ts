import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {RegexTaggerGroup} from '../../../../shared/types/tasks/RegexTaggerGroup';
import {ResultsWrapper} from '../../../../shared/types/Generic';
import {LogService} from '../../../util/log.service';
import {environment} from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegexTaggerGroupService {
  apiUrl = environment.apiHost + environment.apiBasePath;

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

  tagRandomDoc(projectId: number, groupId: number, body: unknown): Observable<{ matches: unknown, texts: string[] } | HttpErrorResponse> {
    return this.http.post<{ matches: unknown, texts: string[] }>(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/${groupId}/tag_random_doc/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagRandomDoc')),
      catchError(this.logService.handleError<{ matches: unknown, texts: string[] }>('tagRandomDoc')));
  }

  tagText(projectId: number, groupId: number, body: unknown): Observable<{ matches: unknown } | HttpErrorResponse> {
    return this.http.post<{ matches: unknown }>(`${this.apiUrl}/projects/${projectId}/regex_tagger_groups/${groupId}/tag_text/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagText')),
      catchError(this.logService.handleError<{ matches: unknown }>('tagText')));
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

  multiTagText(projectId: number, body: unknown): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      `${this.apiUrl}/projects/${projectId}/regex_tagger_groups/multitag_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'multiTagText')),
      catchError(this.logService.handleError<unknown>('multiTagText')));
  }
}
