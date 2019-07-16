import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {UserProfile} from '../../shared/types/UserProfile';
import {UserAuth} from '../../shared/types/UserAuth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  authenticate(name: string, pass: string): Observable<UserAuth | HttpErrorResponse> {
    const body = {username: name, password: pass};

    return this.http.post<UserAuth>(
      this.apiUrl + '/rest-auth/login/',
      body).pipe(tap(e => this.logService.logStatus(e, 'authenticate')),
      catchError(this.logService.handleError<UserAuth>('authenticate')));
  }

  register(body: {}): Observable<UserAuth | HttpErrorResponse> {
    return this.http.post<UserAuth>(
      this.apiUrl + '/rest-auth/registration/',
      body).pipe(tap(e => this.logService.logStatus(e, 'register')),
      catchError(this.logService.handleError<UserAuth>('register')));
  }

  resetPassword(mail: string): Observable<any> {
    return this.http.post<any>(
      this.apiUrl + '/rest-auth/password/reset/',
      {email: mail}).pipe(tap(e => this.logService.logStatus(e, 'reset password')),
      catchError(this.logService.handleError<any>('reset password')));
  }

  changePassword(body: {}): Observable<any> {
    return this.http.post<any>(
      this.apiUrl + '/rest-auth/password/change/',
      body).pipe(tap(e => this.logService.logStatus(e, 'change password')),
      catchError(this.logService.handleError<any>('change password')));
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      this.apiUrl + '/rest-auth/user/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'userProfile')),
      catchError(this.logService.handleError<UserProfile>('getUserProfile')));
  }
  // todo
  logout(): Observable<unknown> {
    return this.http.post<unknown>(
      this.apiUrl + '/rest-auth/logout/', {}).pipe(
      tap(e => this.logService.logStatus(e, 'logout')),
      catchError(this.logService.handleError<unknown>('logout')));
  }

  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(
      this.apiUrl + '/users/',
    ).pipe(
      tap(e => this.logService.logStatus(e, 'userProfile')),
      catchError(this.logService.handleError<UserProfile[]>('getUserProfile')));
  }

  getUserByUrl(url: string): Observable<UserProfile> {
    console.log('f')
    console.log(url);
    return this.http.get<UserProfile>(
      url,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getbyurl')),
      catchError(this.logService.handleError<UserProfile>('getbyurl')));
  }

}
