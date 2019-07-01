import {Injectable} from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import {Observable, of} from 'rxjs';
import {UserStore} from '../users/user.store';
import {LocalstorageService} from '../util/localstorage.service';
import {UserService} from '../users/user.service';
import {map, mergeMap, take} from 'rxjs/operators';
import {UserProfile} from '../../../shared/types/UserProfile';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from "@angular/material";
import {LoginComponent} from "../../login/login.component";


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private userStore: UserStore, private dialog: MatDialog, private userService: UserService, private localStorageService: LocalstorageService) {

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
        // token added by interceptor if it exists
        return this.userService.getUserProfile().pipe(map((user: UserProfile | HttpErrorResponse) => {
          if (user instanceof HttpErrorResponse) {
            // expired
            this.localStorageService.deleteUser();
            this.dialog.open(LoginComponent, {
              height: '285px',
              width: '400px',
              data: {returnUrl: state.url}
            });
            return false;


          } else if (user) {
            // still valid
            this.userStore.setCurrentUser(user);
            return true;
          }
        })) as Observable<boolean>;
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
