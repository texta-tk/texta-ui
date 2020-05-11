import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {UserStore} from '../core/users/user.store';
import {LoginDialogComponent} from '../shared/components/dialogs/login/login-dialog.component';
import {UserProfile} from '../shared/types/UserProfile';
import {UserService} from '../core/users/user.service';
import {LocalStorageService} from '../core/util/local-storage.service';
import {ProjectService} from '../core/projects/project.service';
import {Project, ProjectIndex, ProjectResourceCounts} from '../shared/types/Project';
import {FormControl} from '@angular/forms';
import {ProjectStore} from '../core/projects/project.store';
import {of, Subject} from 'rxjs';
import {RegistrationDialogComponent} from '../shared/components/dialogs/registration/registration-dialog.component';
import {LogService} from '../core/util/log.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {EditProjectDialogComponent} from '../home/project/edit-project-dialog/edit-project-dialog.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: UserProfile;
  projects: Project[];
  projectFields: ProjectIndex[] = [];
  projectControl = new FormControl();
  projectFieldsControl = new FormControl();
  currentProject: Project;
  projectResourceCounts: ProjectResourceCounts = new ProjectResourceCounts();
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(public dialog: MatDialog,
              private userStore: UserStore,
              private userService: UserService,
              private localStorageService: LocalStorageService,
              public projectStore: ProjectStore,
              private logService: LogService,
              public router: Router,
              private changeDetectorRef: ChangeDetectorRef,
              private projectService: ProjectService) {

  }

  ngOnInit() {
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.user = resp;
        this.changeDetectorRef.markForCheck();
      } else {
        this.projectResourceCounts = new ProjectResourceCounts();
      }
    });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
      if (proj && proj.users.includes(this.user.url)) {
        this.currentProject = proj;
        this.projectControl.setValue(proj); // we set active project when we create a new project at proj component for example
        return this.projectService.getResourceCounts(proj.id);
      }
      return of(null);
    })).subscribe((response: ProjectResourceCounts | HttpErrorResponse) => {
      if (response && !(response instanceof HttpErrorResponse)) {
        this.projectResourceCounts = response;
      } else {
        this.projectResourceCounts = new ProjectResourceCounts();
      }
    });
    this.projectStore.getCurrentProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe((indices: ProjectIndex[] | null) => {
      if (indices && indices.filter(x => this.currentProject.indices.includes(x.index))) {
        this.projectFieldsControl.setValue(indices);
      }
    });

    this.projectStore.getProjects().pipe(takeUntil(this.destroyed$)).subscribe(projects => {
      if (projects && projects.length > 0) {
        this.projects = projects.filter(x => x.users.includes(this.user.url)).sort((a, b) => {
          if (a.id > b.id) {
            return -1;
          }
          return 1;
        });
      } else {
        this.projects = [];
      }
    });
    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.projectFields = x;
      }
    });
  }

  compareIndices(object1: ProjectIndex, object2: ProjectIndex) {
    return object1 && object2 && object1.index === object2.index;
  }

  compareProjects(object1: Project, object2: Project) {
    return object1 && object2 && object1.id === object2.id;
  }

  edit(project) {
    this.dialog.open(EditProjectDialogComponent, {
      width: '750px',
      data: project
    });
  }

  indexSelectionOpenedChange(value) {
    if (!value) {
      // get the current facts based on the selected indices
      // searcher uses this
      this.projectStore.setCurrentProjectIndices(this.projectFieldsControl.value);
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
