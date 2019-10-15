import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {UserStore} from '../core/users/user.store';
import {LoginDialogComponent} from '../shared/components/dialogs/login/login-dialog.component';
import {UserProfile} from '../shared/types/UserProfile';
import {UserService} from '../core/users/user.service';
import {LocalStorageService} from '../core/util/local-storage.service';
import {ProjectService} from '../core/projects/project.service';
import {Project} from '../shared/types/Project';
import {FormControl} from '@angular/forms';
import {ProjectStore} from '../core/projects/project.store';
import {of} from 'rxjs';
import {RegistrationDialogComponent} from '../shared/components/dialogs/registration/registration-dialog.component';
import { LogService } from '../core/util/log.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: UserProfile;
  projects: Project[];
  projectControl = new FormControl();

  constructor(public dialog: MatDialog,
              private userStore: UserStore,
              private userService: UserService,
              private localStorageService: LocalStorageService,
              private projectStore: ProjectStore,
              private logService: LogService) {

  }

  ngOnInit() {
    this.userStore.getCurrentUser().subscribe(resp => {
      if (resp) {
        this.user = resp;
      }
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
        console.log(' IN LOGOUT NEXT');
        this.localStorageService.deleteUser();
        this.userStore.setCurrentUser(null);
        // location.reload();
      },
      error => {
        console.log(error, ' IN LOGOUT ERRORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR');
        this.logService.snackBarError(error, 5000);
      });
  }
}
