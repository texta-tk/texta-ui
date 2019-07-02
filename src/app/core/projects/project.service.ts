import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {LocalstorageService} from '../util/localstorage.service';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Project} from '../../../shared/types/Project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalstorageService,
              private logService: LogService) {
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(
      this.apiUrl + '/projects/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getProjects')),
      catchError(this.logService.handleError<Project[]>('getProjects')));
  }
}
