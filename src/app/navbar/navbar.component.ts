import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {UserStore} from '../core/users/user.store';
import {LoginDialogComponent} from '../shared/components/dialogs/login/login-dialog.component';
import {UserProfile} from '../shared/types/UserProfile';
import {UserService} from '../core/users/user.service';
import {LocalStorageService} from '../core/util/local-storage.service';
import {ProjectService} from '../core/projects/project.service';
import {Project, ProjectField, ProjectResourceCounts} from '../shared/types/Project';
import {FormControl} from '@angular/forms';
import {ProjectStore} from '../core/projects/project.store';
import {of, Subject} from 'rxjs';
import {RegistrationDialogComponent} from '../shared/components/dialogs/registration/registration-dialog.component';
import {LogService} from '../core/util/log.service';
import {switchMap, take, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {UtilityFunctions} from '../shared/UtilityFunctions';
import {EditProjectDialogComponent} from '../home/project/edit-project-dialog/edit-project-dialog.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: UserProfile;
  projects: Project[];
  projectFields: ProjectField[];
  projectControl = new FormControl();
  projectFieldsControl = new FormControl();
  currentProject: Project;
  projectResourceCounts: ProjectResourceCounts | null;
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(public dialog: MatDialog,
              private userStore: UserStore,
              private userService: UserService,
              private localStorageService: LocalStorageService,
              public projectStore: ProjectStore,
              private logService: LogService,
              public router: Router,
              private projectService: ProjectService) {

  }

  ngOnInit() {
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.user = resp;
      } else {
        this.projectResourceCounts = null;
      }
    });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        this.projectControl.setValue(proj); // we set active project when we create a new project at proj component for example
        return this.projectService.getResourceCounts(proj.id);
      }
      return of(null);
    })).subscribe((response: ProjectResourceCounts | HttpErrorResponse) => {
      if (response && !(response instanceof HttpErrorResponse)) {
        this.projectResourceCounts = response;
      } else {
        this.projectResourceCounts = null;
      }
    });

    this.projectStore.getProjects().pipe(takeUntil(this.destroyed$)).subscribe(projects => {
      if (projects) {
        this.projects = projects.sort((a, b) => {
          if (a.id > b.id) {
            return -1;
          }
          return 1;
        });
        // dont select first when already have something selected
        const selectedProj = this.localStorageService.getCurrentlySelectedProject();
        const cachedProject = !!selectedProj ?
          this.projects.find(x => x.id === selectedProj.id) : null;
        if (cachedProject) {
          this.projectStore.setCurrentProject(cachedProject);
        } else {
          this.projectStore.setCurrentProject(projects[0]);
        }
      }
    });
    this.projectStore.getProjectFields().pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.projectFields = UtilityFunctions.sortByStringProperty<ProjectField>(x, y => y.index);
        if (this.currentProject) {
          const state = this.localStorageService.getProjectState(this.currentProject);
          if (state?.global?.selectedIndices && state.global.selectedIndices.length > 0) {
            this.projectFieldsControl.setValue(this.projectFields.filter(b => state.global.selectedIndices.includes(b.index)));
            this.projectStore.setCurrentProjectFields(this.projectFieldsControl.value);
          } else {
            this.projectFieldsControl.setValue(this.projectFields);
            this.projectStore.setCurrentProjectFields(this.projectFields);
          }
        }
      }
    });
  }

  edit(project) {
    this.dialog.open(EditProjectDialogComponent, {
      width: '750px',
      data: project
    });
  }

  indexSelectionChanged(indices: ProjectField[]) {
    this.projectStore.setCurrentProjectFields(indices);
    const state = this.localStorageService.getProjectState(this.currentProject);
    if (state) {
      if (!state?.global?.selectedIndices) {
        state.global = {selectedIndices: []};
      }
      state.global.selectedIndices = indices.map(x => x.index);
      this.localStorageService.updateProjectState(this.currentProject, state);
    }
  }

  registerDialog() {
    this.dialog.open(RegistrationDialogComponent, {
      maxHeight: '450px',
      width: '400px',
    });
  }

  loginDialog() {
    this.dialog.open(LoginDialogComponent, {
      maxHeight: '295px',
      width: '400px',
    });
  }

  logout() {
    this.userService.logout().subscribe(
      () => {
        this.localStorageService.deleteUser();
        this.userStore.setCurrentUser(null);
        location.reload();
      },
      error => {
        this.logService.snackBarError(error, 5000);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
