import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

import {Project} from '../../shared/types/Project';
import {ProjectService} from './project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {UserStore} from '../users/user.store';


@Injectable({
  providedIn: 'root'
})
export class ProjectStore {
  private selectedProject$: BehaviorSubject<Project> = new BehaviorSubject(null);
  private projects$: BehaviorSubject<Project[]> = new BehaviorSubject(null);

  constructor(private projectService: ProjectService,
              private logService: LogService,
              private userStore: UserStore) {
    this.userStore.getCurrentUser().subscribe(currentUser => {
      if (currentUser) {
        this.refreshProjects();
      }
    });
  }

  getProjects(): Observable<Project[]> {
    return this.projects$.asObservable();
  }

  refreshProjects() {
    this.projectService.getProjects().subscribe((resp: Project[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projects$.next(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  getCurrentProject(): Observable<Project> {
    return this.selectedProject$.asObservable();
  }

  setCurrentProject(project: Project) {
    this.selectedProject$.next(project);
  }
}
