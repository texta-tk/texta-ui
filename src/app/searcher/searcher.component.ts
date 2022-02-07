import {ChangeDetectionStrategy, Component, DoCheck, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {SearcherComponentService} from './services/searcher-component.service';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  skip,
  skipWhile,
  switchMap,
  take,
  takeUntil
} from 'rxjs/operators';
import {combineLatest, forkJoin, of, Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {ProjectStore} from '../core/projects/project.store';
import {Project, ProjectIndex} from '../shared/types/Project';
import {ProjectService} from '../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../shared/UtilityFunctions';
import {UserStore} from '../core/users/user.store';
import {UserProfile} from '../shared/types/UserProfile';
import {LogService} from '../core/util/log.service';

@Component({
  selector: 'app-searcher',
  templateUrl: './searcher.component.html',
  styleUrls: ['./searcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearcherComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  isSearch = true;
  isAggregation = false;
  projectInUrl: Project;
  selectedProject: Project;
  selectedIndices: ProjectIndex[] = [];
  projectIndices: ProjectIndex[] = [];
  projects: Project[] = [];
  currentUser: UserProfile;
  routeParamProjId: number;
  routeParamIndices: string[] = [];

  constructor(private searchService: SearcherComponentService, private route: ActivatedRoute, private router: Router, private location: Location,
              private userStore: UserStore,
              private logService: LogService,
              private projectStore: ProjectStore, private projectService: ProjectService) {
  }

  ngOnInit(): void {

    forkJoin({
      currentUser: this.userStore.getCurrentUser().pipe(filter(x => !!x), take(1)),
      projects: this.projectStore.getProjects().pipe(filter(x => !!x), take(1)),
      selectedProject: this.projectStore.getCurrentProject().pipe(filter(x => !!x), take(1)),
      selectedIndices: this.projectStore.getSelectedProjectIndices().pipe(filter(x => !!x), take(1)),
      projectIndices: this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)),
    }).pipe(switchMap(data => {
      if (data.projects && data.selectedProject && data.selectedIndices && data.currentUser) {
        this.projects = data.projects;
        this.selectedProject = data.selectedProject;
        this.selectedIndices = data.selectedIndices;
        this.projectIndices = data.projectIndices as ProjectIndex[];
        this.currentUser = data.currentUser;
        return this.route.params;
      }
      return of(null);
    }), take(1)).pipe(concatMap(rout => {
      if (rout?.projectId) {
        if (rout.index) {
          this.routeParamIndices = rout.index.split(',');
        }
        if (rout.projectId) {
          this.routeParamProjId = +rout.projectId;
        }
        return of(this.projects);
      }
      return of(null);
    }), take(1)).pipe(concatMap(projects => {
      if (projects) {
        const project = projects.find(x => x.id === +this.routeParamProjId);
        if (project) {
          this.projectInUrl = project;
          // if the currently active project is the same one as in the url (localstorage data matched url)
          // then dont request extra stuff that we already have
          if (this.selectedProject.id === project.id) {
            return of(this.projectIndices);
          } else if (this.selectedProject.id !== project.id) {
            if (UtilityFunctions.isUserInProject(this.currentUser, project)) {
              this.projectStore.setCurrentProject(project);
              return this.projectService.getProjectIndices(project.id);
            } else { // if project exists that means the user has the rights to join the project (superuser status etc)
              return this.projectService.addUsersToProject([this.currentUser.username], project.id).pipe(switchMap(resp => {
                if (resp instanceof HttpErrorResponse) {
                  this.logService.snackBarError(resp, 5000);
                } else if (resp) {
                  this.projectStore.refreshProjects();
                  this.projectStore.setCurrentProject(project);
                  return this.projectStore.getCurrentProject().pipe(filter(x => x?.id === project.id), take(1), switchMap(g => this.projectStore.getProjectIndices().pipe(take(1))));
                }
                return of(null);
              }));
            }
          }
        }
      }
      return of(null);
    })).subscribe(projectIndices => {
      if (projectIndices && !(projectIndices instanceof HttpErrorResponse)) {
        const indices = projectIndices.filter(x => this.routeParamIndices.includes(x.index));
        this.projectStore.setSelectedProjectIndices(indices.length > 0 ? indices : projectIndices);
      }

      combineLatest(
        [
          this.projectStore.getCurrentProject(),
          this.projectStore.getSelectedProjectIndices()
        ]).pipe(
        takeUntil(this.destroy$), distinctUntilChanged(),
        map(([a$, b$]) => ({
          project: a$,
          indices: b$,
        }))).subscribe((resp) => {
        if (resp && resp.project) {
          const url = `/searcher/${resp.project.id}/${resp.indices !== null ? resp.indices.map(x => x.index).join(',') : ''}`;
          this.location.replaceState(url);
        }
      });
    });

    this.searchService.getSearch().pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        this.isAggregation = false;
        this.isSearch = true;
      }
    });
    this.searchService.getAggregation().pipe(takeUntil(this.destroy$)).subscribe(aggregation => {
      if (aggregation) {
        this.isSearch = false;
        this.isAggregation = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
