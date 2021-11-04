import {Injectable} from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanDeactivate,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import {Observable, of} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {ProjectStore} from '../projects/project.store';
import {filter, map, skip, skipWhile, switchMap, take, takeUntil, takeWhile} from 'rxjs/operators';
import {ProjectGuardDialogComponent} from '../../shared/components/dialogs/project-guard-dialog/project-guard-dialog.component';
import {UserStore} from "../users/user.store";

@Injectable({
  providedIn: 'root'
})
export class ProjectGuard implements CanActivate, CanActivateChild {
  constructor(public dialog: MatDialog, private projectStore: ProjectStore, private userStore: UserStore) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.projectStore.getProjects().pipe(take(1), switchMap(projs => {
      if (projs && projs.length === 0) {
        return this.dialog.open(ProjectGuardDialogComponent).afterClosed().pipe(map(result => {
          return result;
        }));
      } else {
        return this.projectStore.getCurrentProject().pipe(skipWhile(x => x === null), take(1), switchMap(x => {
          if (x) {
            return of(true);
          } else {
            this.dialog.open(ProjectGuardDialogComponent);
            return of(false);
          }
        }));
      }
    }));
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

}
