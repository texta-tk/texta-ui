import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  isProduction = environment.production;

  constructor(private snackBar: MatSnackBar) {
  }

  public handleError<T>(operation = 'operation', result?: T) {
    return (error: T): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.warn(error); // log to console instead

      return of(error);
    };
  }


  public logStatus(val: unknown, msg: string) {
    if (!this.isProduction) {
      console.warn(msg, val);
    }
  }

  public snackBarError(error: HttpErrorResponse, time: number) {
    this.snackBar.open(error.name + ': ' + error.status + ' ' + error.statusText, 'Close', {
      duration: time,
    });
  }

  public snackBarMessage(msg: string, time: number) {
    this.snackBar.open(msg, 'Close', {
      duration: time,
    });
  }
}
