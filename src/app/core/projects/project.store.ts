import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';

import {Project, ProjectFact, ProjectIndex} from '../../shared/types/Project';
import {ProjectService} from './project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {UserStore} from '../users/user.store';
import {distinctUntilChanged, skip, switchMap} from 'rxjs/operators';
import {LocalStorageService} from '../util/local-storage.service';
import {UtilityFunctions} from '../../shared/UtilityFunctions';


@Injectable({
  providedIn: 'root'
})
export class ProjectStore {
  private projects$: BehaviorSubject<Project[] | null> = new BehaviorSubject(null);
  private selectedProject$: BehaviorSubject<Project | null> = new BehaviorSubject(null);
  private projectIndices$: BehaviorSubject<ProjectIndex[] | null> = new BehaviorSubject(null);
  private selectedProjectIndices$: BehaviorSubject<ProjectIndex[] | null> = new BehaviorSubject(null);
  private currentIndicesFacts$: BehaviorSubject<ProjectFact[] | null> = new BehaviorSubject(null);
  private _selectedProject: Project | null;

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

  refreshProjects() {
    this.projectService.getProjects().subscribe((resp: Project[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.getLocalStorageProjectSelection(resp);
        this.projects$.next(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  getProjects(): Observable<Project[] | null> {
    return this.projects$.asObservable();
  }

  // all indices in proj
  getProjectIndices(): Observable<ProjectIndex[] | null> {
    return this.projectIndices$.asObservable();
  }

  // selected indices
  getCurrentProjectIndices(): Observable<ProjectIndex[] | null> {
    return this.selectedProjectIndices$.asObservable();
  }

  setCurrentProjectIndices(projectIndices: ProjectIndex[]) {
    this.selectedProjectIndices$.next(projectIndices);
  }

  getCurrentIndicesFacts(): Observable<ProjectFact[] | null> {
    return this.currentIndicesFacts$.asObservable();
  }

  getCurrentProject(): Observable<Project | null> {
    return this.selectedProject$.asObservable();
  }

  setCurrentProject(project: Project | null) {
    this.selectedProject$.next(project);
  }

  private getLocalStorageProjectSelection(projects: Project[]) {
    // dont select first when already have something selected
    const selectedProj = this.localStorageService.getCurrentlySelectedProject();
    const cachedProject = !!selectedProj ?
      projects.find(x => x.id === selectedProj.id) : null;
    if (cachedProject) {
      this.setCurrentProject(cachedProject);
    } else {
      this.setCurrentProject(projects[0]);
    }
  }

  private setIndicesSelectionLocalStorage(project: Project, indices: ProjectIndex[]) {
    const state = this.localStorageService.getProjectState(project);
    if (state) {
      if (!state?.global?.selectedIndices) {
        state.global = {selectedIndices: []};
      }
      state.global.selectedIndices = indices.map(x => x.index);
      this.localStorageService.updateProjectState(project, state);
    }
  }

  private getLocalStorageIndicesSelection(project: Project | number, indices: ProjectIndex[]) {
    const state = this.localStorageService.getProjectState(project);
    if (state?.global?.selectedIndices && state.global.selectedIndices.length > 0) {
      this.setCurrentProjectIndices(indices.filter(b => state.global.selectedIndices.includes(b.index)));
    } else {
      this.setCurrentProjectIndices(indices);
    }
  }

  // side effects
  private loadProjectFieldsAndFacts() {
    this.getCurrentProject().pipe(skip(1), switchMap((project: Project) => {
      this._selectedProject = project;
      this.localStorageService.setCurrentlySelectedProject(project);
      this.currentIndicesFacts$.next(null);
      this.projectIndices$.next(null); // null old project properties until we get new ones
      this.selectedProjectIndices$.next(null);
      if (project) {
        return this.projectService.getProjectIndices(project.id);
      }
      return of(null);
    })).subscribe((resp: any | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.getLocalStorageIndicesSelection(this._selectedProject || 0, resp);
        this.projectIndices$.next(UtilityFunctions.sortByStringProperty<ProjectIndex>(resp, y => y.index));
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
      }
    });
      // todo distinct pipe ???
    this.getCurrentProjectIndices().pipe(skip(1), distinctUntilChanged(), switchMap(projectIndices => {
      if (this._selectedProject && projectIndices) {
        this.setIndicesSelectionLocalStorage(this._selectedProject, projectIndices);
        return this.projectService.getProjectFacts(this._selectedProject.id, projectIndices.map(x => [{name: x.index}]).flat());
      } else {
        return of(null);
      }
    })).subscribe((resp: any | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.currentIndicesFacts$.next(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
      }
    });
  }

}
