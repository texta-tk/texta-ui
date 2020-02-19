import {Injectable} from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree, Router
} from '@angular/router';
import {Observable, of} from 'rxjs';
import {UserStore} from '../users/user.store';
import {map, mergeMap, take} from 'rxjs/operators';
import {UserProfile} from '../../shared/types/UserProfile';
import {HttpErrorResponse} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import {LoginDialogComponent} from '../../shared/components/dialogs/login/login-dialog.component';
import {USERROLES} from '../../shared/types/UserAuth';
import {LogService} from '../util/log.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private userStore: UserStore,
              private dialog: MatDialog,
              private logService: LogService,
              private router: Router) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userStore.getCurrentUser().pipe(take(1), mergeMap(resp => {
      if (resp) {
        if (this.checkPermissions(resp, next, state)) {
          return of(true);
        } else {
          this.router.navigateByUrl('');
          this.logService.snackBarMessage('No permissions for this resource', 2000);
          return of(false);
        }
      } else {
        // get with token no state in store
        return this.userStore.getUserAuthObservable().pipe(map((tokenCheckResponse: UserProfile | HttpErrorResponse) => {
            if (tokenCheckResponse && !(tokenCheckResponse instanceof HttpErrorResponse)) {
              if (this.checkPermissions(tokenCheckResponse, next, state)) {
                return true;
              } else {
                this.router.navigateByUrl('');
                this.logService.snackBarMessage('No permissions for this resource', 2000);
                return false;
              }
            } else if (tokenCheckResponse) {
              this.dialog.open(LoginDialogComponent, {
                maxHeight: '295px',
                width: '400px',
                data: {returnUrl: state.url},
                disableClose: true,
              });
              return false;
            }
          }
        ));
      }
    }));
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }


  checkPermissions(user, route, state?): boolean {
    if (route.data.role === USERROLES.SUPERUSER) {
      return user.is_superuser;
    }
    return true;
  }
}
