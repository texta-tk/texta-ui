import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor() {
  }

  public handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      return of(error);
    };
  }

  // todo!
  public logStatus(val, msg) {
    console.warn(msg, val);
  }
}
