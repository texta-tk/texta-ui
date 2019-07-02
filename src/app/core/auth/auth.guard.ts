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
import {map, mergeMap, take, takeUntil} from 'rxjs/operators';
import {UserProfile} from '../../../shared/types/UserProfile';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material';
import {LoginComponent} from '../../../shared/dialogs/login/login.component';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private userStore: UserStore,
              private dialog: MatDialog,
              private router: Router) {

  }

  // temp todo
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userStore.getCurrentUser().pipe(take(1), mergeMap(resp => {
      if (resp) {
        return of(true);
      } else {
        // get with token no state in store
        return this.userStore.getUserAuthObservable().pipe(map((tokenCheckResponse: UserProfile | HttpErrorResponse) => {
            if (tokenCheckResponse && !(tokenCheckResponse instanceof HttpErrorResponse)) {
              return true;
            } else if (tokenCheckResponse) {
              this.dialog.open(LoginComponent, {
                height: '285px',
                width: '400px',
                data: {returnUrl: state.url}
              });
              this.router.navigate(['']);
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
}
