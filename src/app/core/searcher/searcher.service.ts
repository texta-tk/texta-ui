import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {environment} from '../../../environments/environment';
import {LocalStorageService} from '../util/local-storage.service';
import {Observable, of, Subject} from 'rxjs';
import {TextConstraint} from '../../searcher/searcher-sidebar/build-search/Constraints';
import {Field} from '../../shared/types/Project';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearcherService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getSavedSearchById(id: number, projectId: number) {
    return new TextConstraint([{path: 'body', type: 'body'} as Field], 'phrase', 'tere \nkere', 'must');
  }

  search(body, projectId: number) {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/search_by_query/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'search')),
      catchError(this.logService.handleError<unknown>('search')));
  }

}
