import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';

import {Field, Project, ProjectFact, ProjectField} from '../../shared/types/Project';
import {ProjectService} from './project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {UserStore} from '../users/user.store';
import {switchMap} from 'rxjs/operators';
import {ElasticsearchQuery} from '../../searcher/searcher-sidebar/build-search/Constraints';


@Injectable({
  providedIn: 'root'
})
export class ProjectStore {
  private selectedProject$: BehaviorSubject<Project> = new BehaviorSubject(null);
  private projects$: BehaviorSubject<Project[]> = new BehaviorSubject(null);
  private projectFields$: BehaviorSubject<ProjectField[]> = new BehaviorSubject(null);
  private projectFacts$: BehaviorSubject<ProjectFact[]> = new BehaviorSubject(null);

  constructor(private projectService: ProjectService,
              private logService: LogService,
              private userStore: UserStore) {
    this.userStore.getCurrentUser().subscribe(currentUser => {
      if (currentUser) {
        this.refreshProjects();
      }
    });

    this.loadProjectFieldsAndFacts();
  }

  getProjects(): Observable<Project[]> {
    return this.projects$.asObservable();
  }

  getProjectFields(): Observable<ProjectField[]> {
    return this.projectFields$.asObservable();
  }

  getProjectFacts(): Observable<ProjectFact[]> {
    return this.projectFacts$.asObservable();
  }

  // when we change project get its fields and facts aswell
  loadProjectFieldsAndFacts() {
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

  getCurrentProject(): Observable<Project> {
    return this.selectedProject$.asObservable();
  }

  setCurrentProject(project: Project) {
    this.selectedProject$.next(project);
  }
}
