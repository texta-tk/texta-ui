import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpResponse, HttpErrorResponse
} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {HttpCacheService} from '../util/http-cache.service';
import {catchError, tap} from 'rxjs/operators';
import { DateTime } from 'luxon';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {

  constructor(
    private cacheService: HttpCacheService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // tslint:disable-next-line:no-any
    let cachedResponse: { response: HttpResponse<unknown>, dateCached: DateTime } | undefined;
    if (request.method === 'POST') {
      cachedResponse = this.cacheService.get(request);
    }
    if (cachedResponse && cachedResponse.dateCached > (DateTime.utc().minus({second: 120}))){
      return of(cachedResponse.response.clone());
    }
    return next.handle(request)
      .pipe(
        tap<HttpEvent<unknown>>((httpEvent: HttpEvent<unknown>) => {
          if (httpEvent instanceof HttpResponse) {
            this.cacheService.put(request, httpEvent);
          }
        }),
        catchError((err: HttpErrorResponse) => {
          throw err;
        }),
      );
  }
}
