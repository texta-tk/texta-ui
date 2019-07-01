import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalstorageService} from '../util/localstorage.service';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {UserProfile} from '../../../shared/types/UserProfile';
import {UserAuth} from '../../../shared/types/UserAuth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalstorageService,
              private logService: LogService) {
  }

  authenticate(name: string, pass: string): Observable<UserAuth | HttpErrorResponse> {
    const body = {username: name, password: pass};

    return this.http.post<UserAuth>(
      this.apiUrl + '/rest-auth/login/',
      body).pipe(tap(e => this.logService.logStatus(e, 'authenticate')),
      catchError(this.logService.handleError<UserAuth>('authenticate')));
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      this.apiUrl + '/rest-auth/user/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'get userProfile')),
      catchError(this.logService.handleError<UserProfile>('getUserProfile')));
  }

  logout(): Observable<unknown> {
    return this.http.post<unknown>(
      this.apiUrl + '/rest-auth/logout/', {}).pipe(
      tap(e => this.logService.logStatus(e, 'post logout')),
      catchError(this.logService.handleError<unknown>('logout')));

  }

}
