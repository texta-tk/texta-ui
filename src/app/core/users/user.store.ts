import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserProfile} from '../../shared/types/UserProfile';
import {UserService} from './user.service';
import {HttpErrorResponse} from '@angular/common/http';
import {shareReplay} from 'rxjs/operators';
import {LocalStorageService} from '../util/local-storage.service';


@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private selectedUser$: BehaviorSubject<UserProfile> = new BehaviorSubject(null);
  private userAuthObservable = this.userService.getUserProfile().pipe(shareReplay(1));

  constructor(private userService: UserService, private localStorageService: LocalStorageService) {
    this.userAuthObservable.subscribe((user: UserProfile | HttpErrorResponse) => {
      if (user && !(user instanceof HttpErrorResponse)) {
        this.setCurrentUser(user);
      } else if (user instanceof HttpErrorResponse) {
        this.localStorageService.deleteUser();
      }
    });
  }

  getUserAuthObservable(): Observable<UserProfile> {
    return this.userAuthObservable;
  }

  getCurrentUser(): Observable<UserProfile> {
    return this.selectedUser$.asObservable();
  }

  setCurrentUser(user: UserProfile) {
    this.selectedUser$.next(user);
  }

}
