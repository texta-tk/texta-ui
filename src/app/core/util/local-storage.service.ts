import {Injectable} from '@angular/core';
import {UserAuth} from '../../shared/types/UserAuth';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {
  }

  public getUser(): UserAuth {
    return JSON.parse(localStorage.getItem('user'));
  }

  public deleteUser(): void {
    localStorage.removeItem('user');
  }

  public setUser(value: UserAuth) {
    localStorage.setItem('user', JSON.stringify(value));
  }
}
