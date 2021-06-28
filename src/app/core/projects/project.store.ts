import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';

import {Project, ProjectFact, ProjectIndex, ProjectResourceCounts} from '../../shared/types/Project';
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
  // @ts-ignore
  private projects$: BehaviorSubject<Project[] | null> = new BehaviorSubject<Project[] | null>(null);
  private selectedProject$: BehaviorSubject<Project | null> = new BehaviorSubject<Project | null>(null);
  private projectIndices$: BehaviorSubject<ProjectIndex[] | null> = new BehaviorSubject<ProjectIndex[] | null>(null);
  private selectedProjectIndices$: BehaviorSubject<ProjectIndex[] | null> = new BehaviorSubject<ProjectIndex[] | null>(null);
  private currentIndicesFacts$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);
  private selectedProjectResourceCounts$: BehaviorSubject<ProjectResourceCounts> = new BehaviorSubject(new ProjectResourceCounts());
  // tslint:disable-next-line:variable-name
  private _selectedProject: Project | null;
  private currentIndicesFactsQueue$: Subject<boolean> = new Subject();

  constructor(private projectService: ProjectService,
              private logService: LogService,
              private localStorageService: LocalStorageService,
              private userStore: UserStore) {
    this.userStore.getCurrentUser().pipe(switchMap(currentUser => {
      if (currentUser) {
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

    this.currentIndicesFactsQueue$.pipe(switchMap(resp => {
      const projectIndices = this.projectIndices$.value;
      if (this._selectedProject && projectIndices) {
        return this.projectService.getProjectFacts(this._selectedProject.id, projectIndices.map(x => [{name: x.index}]).flat());
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.currentIndicesFacts$.next(resp);
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });

    this.loadProjectFieldsAndFacts();
  }

  refreshProjects(): void {
    this.projectService.getProjects().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projects$.next(resp);
      } else {
        this.logService.snackBarError(resp, 5000);
      }
    });
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
    this.currentIndicesFacts$.next(null);
    this.selectedProjectIndices$.next(projectIndices);
  }

  getCurrentIndicesFacts(): Observable<string[] | null> {
    if (this.currentIndicesFacts$.value === null) {
      this.currentIndicesFactsQueue$.next(true);
    }
    return this.currentIndicesFacts$.asObservable();
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
    if (cachedProject) {
      this.setCurrentProject(cachedProject);
    } else {
      this.setCurrentProject(projects[0]);
    }
  }

  private setIndicesSelectionLocalStorage(project: Project, indices: ProjectIndex[]): void {
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

  // side effects
  private loadProjectFieldsAndFacts(): void {
    this.getCurrentProject().pipe(skip(1), switchMap(project => {
      this._selectedProject = project;
      this.localStorageService.setCurrentlySelectedProject(project);
      this.currentIndicesFacts$.next(null);
      this.projectIndices$.next(null); // null old project properties until we get new ones
      this.selectedProjectIndices$.next(null);
      this.refreshSelectedProjectResourceCounts();
      if (project) {
        return this.projectService.getProjectIndices(project.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.getLocalStorageIndicesSelection(this._selectedProject || 0, resp);
        this.projectIndices$.next(UtilityFunctions.sortByStringProperty<ProjectIndex>(resp, y => y.index));
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
      }
    });
    this.getSelectedProjectIndices().pipe(skip(1), distinctUntilChanged()).subscribe(resp => {
      if (this._selectedProject && resp && !(resp instanceof HttpErrorResponse)) {
        this.setIndicesSelectionLocalStorage(this._selectedProject, resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
      }
    });
  }

}
