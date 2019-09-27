import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {environment} from '../../../environments/environment';
import {LocalStorageService} from '../util/local-storage.service';
import {Constraint, ElasticsearchQuery, TextConstraint} from '../../searcher/searcher-sidebar/build-search/Constraints';
import {Field} from '../../shared/types/Project';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearcherService {
  apiUrl = environment.apiUrl;
  _searches: { id: number, constraints: Constraint[], elasticQuery?: ElasticsearchQuery, description: string }[] = [];
  searches$: BehaviorSubject<{
    id: number,
    constraints: Constraint[],
    elasticQuery?: ElasticsearchQuery,
    description: string
  }[]> = new BehaviorSubject(null);

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
    this._searches.push({
      id: 0,
      constraints: [new TextConstraint([{path: 'body', type: 'body'} as Field], 'phrase', 'tere \nkere', 'must', '0')],
      description: 'hardcodedsearch'
    });
    this.searches$.next(this._searches);
  }

  getSavedSearchById(id: number, projectId: number) {
    if (this._searches.length >= id) {
      return this._searches[id];
    }
  }

  getSavedSearches(): Observable<{ constraints: Constraint[], elasticQuery?: ElasticsearchQuery, description: string }[]> {
    return this.searches$.asObservable();
  }

  search(body, projectId: number) {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/search_by_query/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'search')),
      catchError(this.logService.handleError<unknown>('search')));
  }

  saveSearch(constraintList: Constraint[], query: ElasticsearchQuery, desc: string) {
    this._searches.push({id: this._searches.length, constraints: constraintList, elasticQuery: query, description: desc});
    this.searches$.next(this._searches);
  }
}
