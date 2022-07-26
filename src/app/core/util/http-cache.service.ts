import {Injectable} from '@angular/core';
import {HttpRequest, HttpResponse} from '@angular/common/http';
import {LogService} from './log.service';
import {DateTime} from 'luxon';
@Injectable({
  providedIn: 'root'
})
export class HttpCacheService {
  cache: { [key: string]: { response: HttpResponse<unknown>, dateCached: DateTime } } = {};
  cachableRoutes = ['/elastic/get_facts/'];

  constructor() {
  }

  // tslint:disable-next-line:no-any
  get(req: HttpRequest<unknown>): { response: HttpResponse<unknown>, dateCached: DateTime } | undefined {
    const hash = this.getHashViaBody(JSON.stringify(req.body));
    const cachedItem = this.cache[hash];
    if (cachedItem) {
      return cachedItem;
    }
  }

  put(req: HttpRequest<unknown>, res: HttpResponse<unknown>): void {
    const shouldCache = this.shouldCache(req.urlWithParams);
    if (shouldCache) {
      const hash = this.getHashViaBody(JSON.stringify(req.body));
      this.cache[hash] = {response: res, dateCached: DateTime.utc()};
    }
  }

  getHashViaBody(input: string): string {
    // tslint:disable-next-line:no-bitwise
    return input.split('').map(v => v.charCodeAt(0)).reduce((a, v) => a + ((a << 7) + (a << 3)) ^ v).toString(16);
  }

  delete(req: HttpRequest<unknown>): boolean {
    const shouldCache = this.shouldCache(req.urlWithParams);
    if (shouldCache) {
      const hash = this.getHashViaBody(JSON.stringify(req.body));
      delete this.cache[hash];
      return true;
    }
    return false;
  }

  shouldCache(urlWithParams: string): boolean {
    let shouldCache = false;
    this.cachableRoutes.forEach((pattern) => {
      const routeMatch = urlWithParams.includes(pattern);
      if (routeMatch) {
        shouldCache = routeMatch;
      }
    });
    return shouldCache;
  }

}
