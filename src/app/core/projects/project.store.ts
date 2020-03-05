import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';

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
  private selectedProject$: BehaviorSubject<Project | null> = new BehaviorSubject(null);
  private projects$: BehaviorSubject<Project[] | null> = new BehaviorSubject(null);
  private projectFields$: BehaviorSubject<ProjectField[] | null> = new BehaviorSubject(null);
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

  getProjects(): Observable<Project[] | null> {
    return this.projects$.asObservable();
  }

  getProjectFields(): Observable<ProjectField[] | null> {
    return this.projectFields$.asObservable();
  }

  getProjectFacts(): Observable<ProjectFact[] | null> {
    return this.projectFacts$.asObservable();
  }

  // when we change project get its fields and facts aswell
  private loadProjectFieldsAndFacts() {
    this.selectedProject$.pipe(switchMap((project: Project) => {
      if (project) {
        return forkJoin({
          facts: this.projectService.getProjectFacts(project.id),
          fields: this.projectService.getProjectFields(project.id)
        });
      }
      return of(null);
    })).subscribe((resp: { facts: ProjectFact[] | HttpErrorResponse, fields: ProjectField[] | HttpErrorResponse }) => {
      if (resp) {
        if (!(resp.facts instanceof HttpErrorResponse)) {
          this.projectFacts$.next(resp.facts);
        }
        if (!(resp.fields instanceof HttpErrorResponse)) {
          this.projectFields$.next(resp.fields);
        }
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

  getCurrentProject(): Observable<Project | null> {
    return this.selectedProject$.asObservable();
  }

  setCurrentProject(project: Project | null) {
    this.localStorageService.setCurrentlySelectedProject(project);
    this.selectedProject$.next(project);
  }
}
