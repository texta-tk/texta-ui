import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserProfile} from '../../../shared/types/UserProfile';


@Injectable({
  providedIn: 'root'
})
export class UserStore {
  private selectedUser$: BehaviorSubject<UserProfile> = new BehaviorSubject(null);

  constructor() {

  }

  getCurrentUser(): Observable<UserProfile> {
    return this.selectedUser$.asObservable();
  }

  setCurrentUser(user: UserProfile) {
    this.selectedUser$.next(user);
  }

}
