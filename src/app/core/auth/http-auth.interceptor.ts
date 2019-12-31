import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpXsrfTokenExtractor} from '@angular/common/http';

import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';


@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(private localStorageService: LocalStorageService, private logService: LogService,
              private tokenExtractor: HttpXsrfTokenExtractor) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.localStorageService.getUser();
    const csrfToken = this.tokenExtractor.getToken() as string;

    if (token) {
      request = request.clone({
        headers: request.headers.set('Authorization', 'Token ' + token.key),
        withCredentials: true
      });
    }
    if (csrfToken && (request.method !== 'GET' && request.method !== 'HEAD')) {
      console.log(request.method);
      request = request.clone({setHeaders: {'X-XSRF-TOKEN': csrfToken}});
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error && error.status === 403) {

        }
        if (error && error.status === 502 || error.status === 503 || error.status === 504 || error.status === 0) {
          console.log('here, ', error, error.status)
          this.logService.snackBarMessage(`WARNING: Failed connecting to server. (Status: ${error.status})`, 15000)
        }
        return throwError(error);
      }));
  }
}
