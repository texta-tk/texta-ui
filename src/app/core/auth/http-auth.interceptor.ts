import {Injectable} from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import {Observable, of, throwError} from 'rxjs';
import {map, catchError, take} from 'rxjs/operators';
import {LocalStorageService} from '../util/local-storage.service';


@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(private localStorageService: LocalStorageService
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.localStorageService.getUser();

    if (token) {
      request = request.clone({headers: request.headers.set('Authorization', 'Token ' + token.key)});
    } else {

    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error && error.status === 403) {

        }
        return throwError(error);
      }));
  }
}
