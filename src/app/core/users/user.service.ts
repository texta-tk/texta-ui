import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {UserProfile} from '../../shared/types/UserProfile';
import {UserAuth, RefreshTokenResp} from '../../shared/types/UserAuth';
import {AppConfigService} from '../util/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUrl = AppConfigService.settings.apiHost + AppConfigService.settings.apiBasePath;
  UAAUrl = AppConfigService.settings.uaaConf.uaaURL;
  UAALogout = AppConfigService.settings.uaaConf.logout_uri;
  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  authenticate(name: string, pass: string): Observable<UserAuth | HttpErrorResponse> {
    const body = {username: name, password: pass};

    return this.http.post<UserAuth>(
      `${this.apiUrl}/rest-auth/login/`,
      body).pipe(tap(e => this.logService.logStatus(e, 'authenticate')),
      catchError(this.logService.handleError<UserAuth>('authenticate')));
  }

  register(body: unknown): Observable<UserAuth | HttpErrorResponse> {
    return this.http.post<UserAuth>(
      `${this.apiUrl}/rest-auth/registration/`,
      body).pipe(tap(e => this.logService.logStatus(e, 'register')),
      catchError(this.logService.handleError<UserAuth>('register')));
  }

  resetPassword(mail: string): Observable<{detail: string} | HttpErrorResponse> {
    return this.http.post<{detail: string}>(
      `${this.apiUrl}/rest-auth/password/reset/`,
      {email: mail}).pipe(tap(e => this.logService.logStatus(e, 'reset password')),
      catchError(this.logService.handleError<{detail: string}>('reset password')));
  }

  changePassword(body: unknown): Observable<{ detail: string } | HttpErrorResponse> {
    return this.http.post<{ detail: string }>(
      `${this.apiUrl}/rest-auth/password/change/`,
      body).pipe(tap(e => this.logService.logStatus(e, 'change password')),
      catchError(this.logService.handleError<{ detail: string }>('change password')));
  }

  getUserProfile(): Observable<UserProfile | HttpErrorResponse> {
    return this.http.get<UserProfile>(
      `${this.apiUrl}/rest-auth/user/`,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'userProfile')),
      catchError(this.logService.handleError<UserProfile>('getUserProfile')));
  }


  logout(): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.apiUrl}/rest-auth/logout/`, {}).pipe(
      tap(e => this.logService.logStatus(e, 'logout')));
  }
  logoutUAA(): Observable<unknown> {
    return this.http.get<unknown>(
      `${this.UAALogout}?redirect=${window.location}`, {}).pipe(
      tap(e => this.logService.logStatus(e, 'logoutUAA')));
  }

  getAllUsers(): Observable<UserProfile[] | HttpErrorResponse> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/users/`).pipe(
      tap(e => this.logService.logStatus(e, 'getAllUsers')),
      catchError(this.logService.handleError<UserProfile[]>('getAllUsers')));
  }

  getUserByUrl(url: string | number): Observable<UserProfile | HttpErrorResponse> {
    if (Number(url)) {
      url = `${this.apiUrl}/users/${url}/`;
    }
    return this.http.get<UserProfile>(
      url as string,
    ).pipe(
      tap(e => this.logService.logStatus(e, 'getbyurl')),
      catchError(this.logService.handleError<UserProfile>('getbyurl')));
  }

  toggleSuperUser(id: number, body: unknown): Observable<UserProfile | HttpErrorResponse> {
    return this.http.put<UserProfile>(
      `${this.apiUrl}/users/${id}/`, body
    ).pipe(
      tap(e => this.logService.logStatus(e, 'toggleSuperUser')),
      catchError(this.logService.handleError<UserProfile>('toggleSuperUser')));
  }

  deleteUser(url: string): Observable<unknown> {
    return this.http.delete(url).pipe(
      tap(e => this.logService.logStatus(e, 'deleteUser')),
      catchError(this.logService.handleError<unknown>('deleteUser')));
  }

  refreshUAAOAuthToken(refreshToken: string): Observable<RefreshTokenResp> {
    return this.http.post<RefreshTokenResp>(
      `${this.apiUrl}/uaa/refresh-token/`, {'refresh_token': refreshToken}).pipe(
      tap(e => this.logService.logStatus(e, 'refreshUAAOAuthToken')));
  }

}
