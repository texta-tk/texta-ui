import {Injectable} from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpXsrfTokenExtractor
} from '@angular/common/http';

import {Observable, throwError} from 'rxjs';
import {catchError, map, flatMap} from 'rxjs/operators';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';
import { environment } from 'src/environments/environment';
import { UserService } from '../users/user.service';
import { RefreshTokenResp } from 'src/app/shared/types/UserAuth';
import {AppConfigService} from '../util/app-config.service';


@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(private localStorageService: LocalStorageService,
              private logService: LogService,
              private tokenExtractor: HttpXsrfTokenExtractor,
              private userService: UserService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // If using CloudFoundry UAA OAuth 2.0 authentication, auth the req with the accessToken
    request = this.addBearerHeader(request);

    // If the Auth header wasn't already added, from the access_token, use CSRF Token authentication
    if (!request.headers.get('Authorization')) {
      request = this.addCSRFToken(request)
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<unknown>) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        return this.handleHttpError(error, request, next);
      }));
  }


  handleHttpError(error: HttpErrorResponse, request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (error && error.status === 403) {
      if(error.error.detail === 'Invalid token.'){
        this.localStorageService.deleteUser();
        location.reload();
      }
    }
    if (error && error.status === 401) {

      // If using UAA and the request got 401'd, make an attempt to refresh the token
      // and retry the request
      const refreshToken = this.localStorageService.getOAuthRefreshToken()
      if (AppConfigService.settings.useCloudFoundryUAA && refreshToken) {
        return this.userService.refreshUAAOAuthToken(refreshToken).pipe(flatMap(
          (data: RefreshTokenResp) => {
            this.localStorageService.setOAuthAccessToken(data.access_token);
            this.localStorageService.setOAuthRefreshToken(data.refresh_token);
            request = this.addBearerHeader(request);

            return next.handle(request).pipe(
              map((event: HttpEvent<unknown>) => {
                return event;
              }),
              catchError((error: HttpErrorResponse) => {
                return this.handleHttpError(error, request, next);
              }));
          }), catchError((e: HttpErrorResponse) => {
            // If token refresh fails, delete the user/refresh token
            this.localStorageService.deleteUser();
            location.reload();
            return throwError(error)
          }))
        }
      }
    if (error && error.status === 502 || error.status === 503 || error.status === 504 || error.status === 0) {
      this.logService.snackBarMessage(`WARNING: Failed connecting to server. (Status: ${error.status})`, 15000);
    }
    return throwError(error);
  }


  addBearerHeader(request: HttpRequest<unknown>): HttpRequest<unknown> {
    if (AppConfigService.settings.useCloudFoundryUAA) {
      const accessToken = this.localStorageService.getOAuthAccessToken();

      // If the access token exists, use UAA
      if (accessToken) {
        request = request.clone({
          headers: request.headers.set('Authorization', 'Bearer ' + accessToken)
        });
      }
    }

    return request;
  }


  addCSRFToken(request: HttpRequest<unknown>): HttpRequest<unknown> {
    const token = this.localStorageService.getUser();
    const csrfToken = this.tokenExtractor.getToken() as string;

    if (token) {
      request = request.clone({
        headers: request.headers.set('Authorization', 'Token ' + token.key),
        withCredentials: true
      });
    }
    if (csrfToken && (request.method !== 'GET' && request.method !== 'HEAD')) {
      request = request.clone({setHeaders: {'X-XSRF-TOKEN': csrfToken}});
    }

    return request;
  }
}
