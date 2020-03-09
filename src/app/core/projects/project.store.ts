import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, merge, Observable, of} from 'rxjs';

import {Project, ProjectFact, ProjectField} from '../../shared/types/Project';
import {ProjectService} from './project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {UserStore} from '../users/user.store';
import {switchMap} from 'rxjs/operators';
import {LocalStorageService} from '../util/local-storage.service';


@Injectable({
  providedIn: 'root'
})
export class ProjectStore {
  private projects$: BehaviorSubject<Project[] | null> = new BehaviorSubject(null);
  private selectedProject$: BehaviorSubject<Project | null> = new BehaviorSubject(null);
  private projectFields$: BehaviorSubject<ProjectField[] | null> = new BehaviorSubject(null);
  private selectedProjectFields$: BehaviorSubject<ProjectField[] | null> = new BehaviorSubject(null);
  private projectFacts$: BehaviorSubject<ProjectFact[] | null> = new BehaviorSubject(null);

  constructor(private projectService: ProjectService,
              private logService: LogService,
              private localStorageService: LocalStorageService,
              private userStore: UserStore) {
    this.userStore.getCurrentUser().subscribe(currentUser => {
      if (currentUser) {
        this.refreshProjects();
      }
    });

    this.loadProjectFieldsAndFacts();
  }

  // when we change project get its fields and facts aswell
  private loadProjectFieldsAndFacts() {
    this.selectedProject$.pipe(switchMap((project: Project) => {
      if (project) {
        return merge(this.projectService.getProjectFacts(project.id),
          this.projectService.getProjectFields(project.id)
        );
      }
      return of(null);
    })).subscribe((resp: any | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse) && resp.length > 0) {
        if (resp[0].hasOwnProperty('name')) {
          this.projectFacts$.next(resp);
        }
        if (resp[0].hasOwnProperty('index')) {
          this.projectFields$.next(resp);
        }
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
      }
    });
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

  getProjects(): Observable<Project[] | null> {
    return this.projects$.asObservable();
  }

  getProjectFields(): Observable<ProjectField[] | null> {
    return this.projectFields$.asObservable();
  }

  getCurrentProjectFields(): Observable<ProjectField[] | null> {
    return this.selectedProjectFields$.asObservable();
  }

  setCurrentProjectFields(projectFields: ProjectField[]) {
    this.selectedProjectFields$.next(projectFields);
  }

  getProjectFacts(): Observable<ProjectFact[] | null> {
    return this.projectFacts$.asObservable();
  }


  getCurrentProject(): Observable<Project | null> {
    return this.selectedProject$.asObservable();
  }

  setCurrentProject(project: Project | null) {
    this.localStorageService.setCurrentlySelectedProject(project);
    this.selectedProject$.next(project);
  }

}
