import {Injectable} from '@angular/core';
import {CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {ConfirmDialogComponent} from '../../shared/shared-module/components/dialogs/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {map} from 'rxjs/operators';

export interface CanDeactivateComponent {
  canDeactivate: () => boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeactivateGuard implements CanDeactivate<CanDeactivateComponent> {
  constructor(
    public dialog: MatDialog) {
  }

  canDeactivate(
    component: CanDeactivateComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (component.canDeactivate()) {
      return true;
    } else {
      return this.dialog.open(ConfirmDialogComponent, {
        data: {confirmText: 'Yes', mainText: 'You have unsaved changes, are you sure?'}
      }).afterClosed().pipe(map(result => {
        return result;
      }));
    }
  }

}
