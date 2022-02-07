import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of, Subject} from 'rxjs';

import {Project, ProjectFact, ProjectIndex, ProjectResourceCounts} from '../../shared/types/Project';
import {ProjectService} from './project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {UserStore} from '../users/user.store';
import {distinctUntilChanged, skip, switchMap} from 'rxjs/operators';
import {LocalStorageService} from '../util/local-storage.service';
import {UtilityFunctions} from '../../shared/UtilityFunctions';
import {UserProfile} from '../../shared/types/UserProfile';


@Injectable({
  providedIn: 'root'
})
export class ProjectStore {
  // @ts-ignore
  private projects$: BehaviorSubject<Project[] | null> = new BehaviorSubject<Project[] | null>(null);
  private selectedProject$: BehaviorSubject<Project | null> = new BehaviorSubject<Project | null>(null);
  private projectIndices$: BehaviorSubject<ProjectIndex[] | null> = new BehaviorSubject<ProjectIndex[] | null>(null);
  private selectedProjectIndices$: BehaviorSubject<ProjectIndex[] | null> = new BehaviorSubject<ProjectIndex[] | null>(null);
  private selectedProjectResourceCounts$: BehaviorSubject<ProjectResourceCounts> = new BehaviorSubject(new ProjectResourceCounts());
  // tslint:disable-next-line:variable-name
  private _selectedProject: Project | null;
  // tslint:disable-next-line:variable-name
  private _currentUser: UserProfile;

  private refreshProjectsQueue$: Subject<boolean> = new Subject();

  constructor(private projectService: ProjectService,
              private logService: LogService,
              private localStorageService: LocalStorageService,
              private userStore: UserStore) {
    this.userStore.getCurrentUser().pipe(switchMap(currentUser => {
      if (currentUser) {
        this._currentUser = currentUser;
        return this.projectService.getProjects();
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projects$.next(resp);
        this.getLocalStorageProjectSelection(resp);
      } else if (resp) {
        this.logService.snackBarError(resp, 5000);
      }
    });

    this.getCurrentProject().pipe(skip(1), switchMap(project => {
      this._selectedProject = project;
      this.localStorageService.setCurrentlySelectedProject(project);
      this.projectIndices$.next(null); // null old project properties until we get new ones
      this.selectedProjectIndices$.next(null);
      if (project) {
        return forkJoin({
          indices: this.projectService.getProjectIndices(project.id),
          resourceCounts: this.projectService.getResourceCounts(project.id)
        });
      }
      return of(null);
    })).subscribe(resp => {
      if (resp?.indices && !(resp.indices instanceof HttpErrorResponse)) {
        this.getLocalStorageIndicesSelection(this._selectedProject || 0, resp.indices);
        this.projectIndices$.next(UtilityFunctions.sortByStringProperty<ProjectIndex>(resp.indices, y => y.index));
      }
      if (resp?.resourceCounts && !(resp.resourceCounts instanceof HttpErrorResponse)) {
        this.selectedProjectResourceCounts$.next(resp.resourceCounts);
      }
      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });
    // switchmap to cancel previous request
    this.refreshProjectsQueue$.pipe(switchMap(resp => {
      return forkJoin({projects: this.projectService.getProjects(), refreshSelection: of(resp)});
    })).subscribe(resp => {
      if (resp.projects && !(resp.projects instanceof HttpErrorResponse)) {
        this.projects$.next(resp.projects);
        if (resp.refreshSelection) {
          this.getLocalStorageProjectSelection(resp.projects);
        }
      } else {
        this.logService.snackBarError(resp.projects, 5000);
      }
    });
  }

  refreshProjects(refreshSelection?: boolean): void {
    this.refreshProjectsQueue$.next(refreshSelection);
  }

  refreshSelectedProjectResourceCounts(): void {
    if (this._selectedProject) {
      this.projectService.getResourceCounts(this._selectedProject.id).subscribe(x => {
        if (!(x instanceof HttpErrorResponse)) {
          this.selectedProjectResourceCounts$.next(x);
        } else {
          this.logService.snackBarError(x, 5000);
        }
      });
    }
  }

  getSelectedProjectResourceCounts(): Observable<ProjectResourceCounts> {
    return this.selectedProjectResourceCounts$.asObservable();
  }

  getProjects(): Observable<Project[] | null> {
    return this.projects$.asObservable();
  }

  // all indices in proj
  getProjectIndices(): Observable<ProjectIndex[] | null> {
    return this.projectIndices$.asObservable();
  }

  // selected indices
  getSelectedProjectIndices(): Observable<ProjectIndex[] | null> {
    return this.selectedProjectIndices$.asObservable();
  }

  setSelectedProjectIndices(projectIndices: ProjectIndex[]): void {
    this.selectedProjectIndices$.next(projectIndices);
    if (projectIndices && this._selectedProject) {
      this.setIndicesSelectionLocalStorage(this._selectedProject, projectIndices);
    }
  }


  getCurrentProject(): Observable<Project | null> {
    return this.selectedProject$.asObservable();
  }

  setCurrentProject(project: Project | null): void {
    this.selectedProject$.next(project);
  }

  private getLocalStorageProjectSelection(projects: Project[]): void {
    // dont select first when already have something selected
    const selectedProj = this.localStorageService.getCurrentlySelectedProject();
    const cachedProject = !!selectedProj ?
      projects.find(x => x.id === selectedProj.id) : null;
    if (cachedProject && UtilityFunctions.isUserInProject(this._currentUser, cachedProject)) {
      this.setCurrentProject(cachedProject);
    } else {
      const projectsUserIsIn = projects.filter(x => UtilityFunctions.isUserInProject(this._currentUser, x)).sort((a, b) => {
        if (a.id > b.id) {
          return -1;
        }
        return 1;
      });
      this.setCurrentProject(projectsUserIsIn[0]);
    }
  }

  public setIndicesSelectionLocalStorage(project: Project, indices: ProjectIndex[]): void {
    const state = this.localStorageService.getProjectState(project);
    if (state) {
      if (!state?.global?.selectedIndices) {
        state.global = {selectedIndices: []};
      }
      state.global.selectedIndices = indices.map(x => x.index);
      this.localStorageService.updateProjectState(project, state);
    }
  }

  private getLocalStorageIndicesSelection(project: Project | number, indices: ProjectIndex[]): void {
    const state = this.localStorageService.getProjectState(project);
    if (state?.global?.selectedIndices && state.global.selectedIndices.length > 0) {
      this.setSelectedProjectIndices(indices.filter(b => state.global.selectedIndices.includes(b.index)));
    } else {
      this.setSelectedProjectIndices(indices);
    }
  }


}
