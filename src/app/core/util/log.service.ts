import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpErrorResponse, HttpEventType} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../environments/environment';
import {AppConfigService} from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  logging = AppConfigService.settings.logging;

  constructor(private snackBar: MatSnackBar) {
  }

  public handleError<T>(operation = 'operation', result?: T): (error: T) => Observable<T> {
    return (error: T): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.warn(error); // log to console instead

      return of(error);
    };
  }


  public logStatus(val: unknown, msg: string): void {
    if (this.logging) {
      console.warn(msg, val);
    }
  }

  public snackBarError(error: HttpErrorResponse, time = 5000): void {
    if (error.error.hasOwnProperty('detail')) {
      this.snackBar.open(`${error.error.detail}`, 'Close', {
        duration: time,
      });
    } else if (error.error.hasOwnProperty('non_field_errors')) {
      this.snackBar.open(`${error.error.non_field_errors[0]}`, 'Close', {
        duration: time,
      });
    } else if (error.error.hasOwnProperty('error')) {
      this.snackBar.open(`${error.error.error}`, 'Close', {
        duration: time,
      });
    } else if (error.error && typeof error.error === 'object' && !('type' in error.error)) {
      for (const element in error.error) {
        if (error.error.hasOwnProperty(element)) {
          if (typeof error.error[element] === 'string') {
            this.snackBar.open(`${element}: ${error.error[element]}`, 'Close', {
              duration: time,
            });
          } else if (typeof error.error[element] === 'object') {
            this.snackBar.open(`${element}: ${error.error[element][0]}`, 'Close', {
              duration: time,
            });
          }
          break;
        }
      }
    } else {
      this.snackBar.open(error.name + ': ' + error.status + ' ' + error.statusText, 'Close', {
        duration: time,
      });
    }
  }

  public snackBarMessage(msg: string, time: number): void {
    this.snackBar.open(msg, 'Close', {
      duration: time,
    });
  }
}
