import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';
import {
  RegexTaggerGroupTagTextResult,
  RegexTaggerTagRandomDocResult,
  RegexTaggerTagTextResult
} from '../../../shared/types/tasks/RegexTaggerGroup';

@Injectable({
  providedIn: 'root'
})
export class RegexTaggerService {
  apiUrl = environment.apiHost + environment.apiBasePath;

  constructor(private http: HttpClient, private logService: LogService) {
  }

  getRegexTaggers(projectId: number, params = ''): Observable<ResultsWrapper<RegexTagger> | HttpErrorResponse> {
    return this.http.get<ResultsWrapper<RegexTagger>>(`${this.apiUrl}/projects/${projectId}/regex_taggers/?${params}`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getRegexTaggers')),
      catchError(this.logService.handleError<ResultsWrapper<RegexTagger>>('getRegexTaggers')));
  }

  tagDoc(projectId: number, groupId: number, body: unknown): Observable<{ matches: unknown } | HttpErrorResponse> {
    return this.http.post<{ matches: unknown }>(`${this.apiUrl}/projects/${projectId}/regex_taggers/${groupId}/tag_doc/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagDoc')),
      catchError(this.logService.handleError<{ matches: unknown }>('tagDoc')));
  }

  tagRandomDoc(projectId: number, groupId: number, body: unknown): Observable<RegexTaggerTagRandomDocResult | HttpErrorResponse> {
    return this.http.post<RegexTaggerTagRandomDocResult>(`${this.apiUrl}/projects/${projectId}/regex_taggers/${groupId}/tag_random_doc/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagRandomDoc')),
      catchError(this.logService.handleError<RegexTaggerTagRandomDocResult>('tagRandomDoc')));
  }

  tagText(projectId: number, groupId: number, body: unknown): Observable<RegexTaggerTagTextResult | HttpErrorResponse> {
    return this.http.post<RegexTaggerTagTextResult>(`${this.apiUrl}/projects/${projectId}/regex_taggers/${groupId}/tag_text/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'tagText')),
      catchError(this.logService.handleError<RegexTaggerTagTextResult>('tagText')));
  }

  duplicate(projectId: number, taggerId: number, tagger: RegexTagger): Observable<{ message: string } | HttpErrorResponse> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/projects/${projectId}/regex_taggers/${taggerId}/duplicate/`, tagger).pipe(
      tap(e => this.logService.logStatus(e, 'duplicate')),
      catchError(this.logService.handleError<{ message: string }>('duplicate')));
  }


  bulkDeleteRegexTaggers(projectId: number, body: unknown): Observable<unknown> {
    return this.http.post<{ 'num_deleted': number, 'deleted_types': { string: number }[] }>
    (`${this.apiUrl}/projects/${projectId}/regex_taggers/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteRegexTaggers')),
      catchError(this.logService.handleError<unknown>('bulkDeleteRegexTaggers')));
  }

  createRegexTagger(projectId: number, body: unknown): Observable<RegexTagger | HttpErrorResponse> {
    return this.http.post<RegexTagger>(
      `${this.apiUrl}/projects/${projectId}/regex_taggers/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'createRegexTagger')),
      catchError(this.logService.handleError<RegexTagger>('createRegexTagger')));
  }

  patchRegexTagger(projectId: number, regexTaggerId: number, body: unknown): Observable<RegexTagger | HttpErrorResponse> {
    return this.http.patch<RegexTagger>(
      `${this.apiUrl}/projects/${projectId}/regex_taggers/${regexTaggerId}/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'patchRegexTagger')),
      catchError(this.logService.handleError<RegexTagger>('patchRegexTagger')));
  }

  multiTagText(projectId: number, body: unknown): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      `${this.apiUrl}/projects/${projectId}/regex_taggers/multitag_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'multiTagText')),
      catchError(this.logService.handleError<unknown>('multiTagText')));
  }

}
