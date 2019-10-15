import {Injectable} from '@angular/core';
import {UserAuth} from '../../shared/types/UserAuth';
import {Project} from '../../shared/types/Project';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {
  }

  public getUser(): UserAuth {
    console.log(JSON.parse(localStorage.getItem('user')), 'hhhhhhhhhhhhhhhhhh');
    return JSON.parse(localStorage.getItem('user'));
  }

  public deleteUser(): void {
    localStorage.removeItem('user');
  }

  public setUser(value: UserAuth) {
    localStorage.setItem('user', JSON.stringify(value));
  }

  public getCurrentlySelectedProject(): Project {
    return JSON.parse(localStorage.getItem('selectedProject'));
  }

  public setCurrentlySelectedProject(value: Project) {
    localStorage.setItem('selectedProject', JSON.stringify(value));
  }
}
