import {Injectable} from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import {Observable, throwError} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {LocalStorageService} from '../util/local-storage.service';
import {LogService} from '../util/log.service';


@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(private localStorageService: LocalStorageService, private logService: LogService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.localStorageService.getUser();

    if (token) {
      request = request.clone({
        headers: request.headers.set('Authorization', 'Token ' + token.key),
        withCredentials: true
      });
    } else {
      request = request.clone({withCredentials: true});
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
