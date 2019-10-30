import {Component, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material';
import {UserStore} from '../core/users/user.store';
import {LoginDialogComponent} from '../shared/components/dialogs/login/login-dialog.component';
import {UserProfile} from '../shared/types/UserProfile';
import {UserService} from '../core/users/user.service';
import {LocalStorageService} from '../core/util/local-storage.service';
import {ProjectService} from '../core/projects/project.service';
import {Project, ProjectResourceCounts} from '../shared/types/Project';
import {FormControl} from '@angular/forms';
import {ProjectStore} from '../core/projects/project.store';
import {of, Subscription} from 'rxjs';
import {RegistrationDialogComponent} from '../shared/components/dialogs/registration/registration-dialog.component';
import { LogService } from '../core/util/log.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: UserProfile;
  projects: Project[];
  projectControl = new FormControl();

  currentProjSub: Subscription;
  currentProject: Project;
  projectResourceCounts: ProjectResourceCounts;

  constructor(public dialog: MatDialog,
              private userStore: UserStore,
              private userService: UserService,
              private localStorageService: LocalStorageService,
              private projectStore: ProjectStore,
              private logService: LogService,
              private projectService: ProjectService) {

  }

  ngOnInit() {
    this.userStore.getCurrentUser().subscribe(resp => {
      if (resp) {
        this.user = resp;

        this.projectStore.getCurrentProject().subscribe((proj: Project) => {
          if (proj) {
            this.currentProject = proj;
            this.projectService.getResourceCounts(proj.id).subscribe((resp: ProjectResourceCounts) => {
              this.projectResourceCounts = resp;
            });
          } else {
            this.projectResourceCounts = null;
          }
        });
      }
      this.projectResourceCounts = null;
      return of(null);
    });
    this.projectStore.getProjects().subscribe(projects => {
      if (projects) {
        this.projects = projects;
        // dont select first when already have something selected
        const cachedProject = !!this.localStorageService.getCurrentlySelectedProject() ?
          this.projects.find(x => x.id === this.localStorageService.getCurrentlySelectedProject().id) : null;
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
      height: '400px',
      width: '400px',
    });
  }

  loginDialog() {
    this.dialog.open(LoginDialogComponent, {
      height: '270px',
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
    this.currentProjSub.unsubscribe();
  }
}
