import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';

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

  bulkDeleteRegexTaggers(projectId: number, body: unknown) {
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

  multiTagText(projectId: number, body: unknown): Observable<unknown | HttpErrorResponse> {
    return this.http.post<unknown>(
      `${this.apiUrl}/projects/${projectId}/regex_taggers/multitag_text/`,
      body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'multiTagText')),
      catchError(this.logService.handleError<unknown>('multiTagText')));
  }

}
