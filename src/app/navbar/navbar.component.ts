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
import {Subject} from 'rxjs';
import {RegistrationDialogComponent} from '../shared/components/dialogs/registration/registration-dialog.component';
import {LogService} from '../core/util/log.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {Router} from '@angular/router';
import {EditProjectDialogComponent} from '../project/edit-project-dialog/edit-project-dialog.component';
import {AppConfigService} from '../core/util/app-config.service';

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
  projectFieldsControl = new FormControl([]);
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

  ngOnInit(): void {
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.user = resp;
        this.changeDetectorRef.markForCheck();
      } else {
        this.projectResourceCounts = new ProjectResourceCounts();
      }
    });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(proj => {
      if (proj) {
        this.currentProject = proj;
        this.projectControl.setValue(proj); // we set active project when we create a new project at proj component for example
      }
    });
    this.projectStore.getSelectedProjectResourceCounts().pipe(takeUntil(this.destroyed$)).subscribe(counts => {
      this.projectResourceCounts = counts;
      this.changeDetectorRef.markForCheck();
    });
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe((indices: ProjectIndex[] | null) => {
      if (indices && indices.filter(x => this.currentProject.indices.find(y => y.name === x.index))) {
        this.projectFieldsControl.setValue(indices);
      } else {
        this.projectFieldsControl.setValue([]);
      }
    });

    this.projectStore.getProjects().pipe(takeUntil(this.destroyed$)).subscribe(projects => {
      if (projects && projects.length > 0) {
        this.projects = projects.filter(x => (x.users.find(y => y.id === this.user.id) ||
          (AppConfigService.settings.useCloudFoundryUAA && x.scopes.find(y => this.user.profile.scopes.includes(y))))).sort((a, b) => {
          if (a.id > b.id) {
            return -1;
          }
          return 1;
        });
      } else {
        this.projects = [];
      }
      this.changeDetectorRef.markForCheck();
    });
    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.projectFields = x;
      } else {
        this.projectFields = [];
      }
    });
  }

  compareIndices(object1: ProjectIndex, object2: ProjectIndex): boolean {
    return object1 && object2 && object1.index === object2.index;
  }

  compareProjects(object1: Project, object2: Project): boolean {
    return object1 && object2 && object1.id === object2.id;
  }

  edit(project: Project): void {
    this.dialog.open(EditProjectDialogComponent, {
      width: '750px',
      data: project
    });
  }

  indexSelectionOpenedChange(value: unknown): void {
    if (!value) {
      // get the current facts based on the selected indices
      // searcher uses this
      this.projectStore.setSelectedProjectIndices(this.projectFieldsControl.value);
    }
  }

  registerDialog(): void {
    this.dialog.open(RegistrationDialogComponent, {
      maxHeight: '450px',
      width: '400px',
    });
  }

  loginDialog(): void {
    this.dialog.open(LoginDialogComponent, {
      maxHeight: '295px',
      width: '400px',
    });
  }

  logout(): void {
    const observable = this.user.profile.is_uaa_account ? this.userService.logout().pipe(switchMap(x => this.userService.logoutUAA())) : this.userService.logout();
    observable.subscribe(
      () => {
        this.localStorageService.deleteUser();
        this.userStore.setCurrentUser(null);
        location.reload();
      },
      error => {
        this.logService.snackBarError(error, 5000);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
