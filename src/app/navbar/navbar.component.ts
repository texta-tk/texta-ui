import {Component, OnDestroy, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {UserStore} from '../core/users/user.store';
import {LoginDialogComponent} from '../shared/components/dialogs/login/login-dialog.component';
import {UserProfile} from '../shared/types/UserProfile';
import {UserService} from '../core/users/user.service';
import {LocalStorageService} from '../core/util/local-storage.service';
import {ProjectService} from '../core/projects/project.service';
import {Project, ProjectResourceCounts} from '../shared/types/Project';
import {FormControl} from '@angular/forms';
import {ProjectStore} from '../core/projects/project.store';
import {of, Subject} from 'rxjs';
import {RegistrationDialogComponent} from '../shared/components/dialogs/registration/registration-dialog.component';
import {LogService} from '../core/util/log.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: UserProfile;
  projects: Project[];
  projectControl = new FormControl();
  currentProject: Project;
  projectResourceCounts: ProjectResourceCounts;
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(public dialog: MatDialog,
              private userStore: UserStore,
              private userService: UserService,
              private localStorageService: LocalStorageService,
              private projectStore: ProjectStore,
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
        console.log(projects);
        this.projects = projects;
        // dont select first when already have something selected
        const cachedProject = !!this.localStorageService.getCurrentlySelectedProject() ?
          this.projects.find(x => x.id === this.localStorageService.getCurrentlySelectedProject().id) : null;
        console.log(cachedProject);
        if (cachedProject) {
          this.projectControl.setValue(cachedProject);
          this.projectStore.setCurrentProject(cachedProject);
        } else {
          this.projectControl.setValue(projects[0]);
          this.projectStore.setCurrentProject(projects[0]);
        }
      }
    });
  }

  public selectProject(selectedOption: Project) {
    this.localStorageService.setCurrentlySelectedProject(selectedOption);
    this.projectStore.setCurrentProject(selectedOption);
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
