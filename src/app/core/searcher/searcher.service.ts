import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {environment} from '../../../environments/environment';
import {LocalStorageService} from '../util/local-storage.service';
import {
  Constraint,
  DateConstraint,
  ElasticsearchQuery,
  FactConstraint,
  TextConstraint
} from '../../searcher/searcher-sidebar/build-search/Constraints';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {SavedSearch} from '../../shared/types/SavedSearch';

@Injectable({
  providedIn: 'root'
})

// { id: number, constraints: Constraint[], elasticQuery?: ElasticsearchQuery, description: string }[]
export class SearcherService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {

  }


  getSavedSearches(projectId: number): Observable<SavedSearch[] | HttpErrorResponse> {
    return this.http.get<SavedSearch[]>(`${this.apiUrl}/projects/${projectId}/searches/`).pipe(
      tap(e => this.logService.logStatus(e, 'getSavedSearches')),
      catchError(this.logService.handleError<SavedSearch[]>('getSavedSearches')));
  }

  saveSearch(projectId: number, constraintList: Constraint[], elasticQuery: ElasticsearchQuery, desc: string) {
    const body = {
      query_constraints: JSON.stringify(this.convertConstraintListToJson(constraintList)),
      description: desc,
      query: JSON.stringify(elasticQuery)
    };

    return this.http.post(`${this.apiUrl}/projects/${projectId}/searches/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'saveSearch')),
      catchError(this.logService.handleError<unknown>('saveSearch')));
  }

  search(body, projectId: number) {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/search_by_query/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'search')),
      catchError(this.logService.handleError<unknown>('search')));
  }

  bulkDeleteSavedSearches(projectId: number, body) {
    return this.http.post<{'num_deleted': number, 'deleted_types': {string: number}[] }>
    (`${this.apiUrl}/projects/${projectId}/searches/bulk_delete/`, body).pipe(
      tap(e => this.logService.logStatus(e, 'bulkDeleteSavedSearches')),
      catchError(this.logService.handleError<unknown>('bulkDeleteSavedSearches')));
  }

  private convertConstraintListToJson(constraintList: Constraint[]): any[] {
    const outPutJson = [];
    for (const constraint of constraintList) {
      if (constraint instanceof TextConstraint) {
        outPutJson.push({
          fields: constraint.fields,
          match: constraint.matchFormControl.value,
          slop: constraint.slopFormControl.value,
          text: constraint.textAreaFormControl.value,
          operator: constraint.operatorFormControl.value
        });
      }
      if (constraint instanceof DateConstraint) {
        outPutJson.push({
          fields: constraint.fields,
          dateFrom: constraint.dateFromFormControl.value,
          dateTo: constraint.dateToFormControl.value
        });
      }
      if (constraint instanceof FactConstraint) {
        const inputGroupArrayJson = [];
        console.log(constraint);
        for (const inputGroup of constraint.inputGroupArray) {
          inputGroupArrayJson.push({
            factTextOperator: inputGroup.factTextOperatorFormControl.value,
            factTextName: inputGroup.factTextFactNameFormControl.value,
            factTextInput: inputGroup.factTextInputFormControl.value
          });
        }

        outPutJson.push({
          fields: constraint.fields,
          factName: constraint.factNameFormControl.value,
          factNameOperator: constraint.factNameOperatorFormControl.value,
          factTextOperator: constraint.factTextOperatorFormControl.value,
          inputGroup: inputGroupArrayJson
        })
        ;
      }
    }
    return outPutJson;

  }

}
