import {Injectable} from '@angular/core';
import {AsyncSubject, BehaviorSubject, Observable} from 'rxjs';

import {Project} from '../../../shared/types/Project';


@Injectable({
  providedIn: 'root'
})
export class ProjectStore {
  private selectedProject$: BehaviorSubject<Project> = new BehaviorSubject(null);

  constructor() {

  }

  getCurrentProject(): Observable<Project> {
    return this.selectedProject$.asObservable();
  }

  setCurrentProject(project: Project) {
    this.selectedProject$.next(project);
  }
}
