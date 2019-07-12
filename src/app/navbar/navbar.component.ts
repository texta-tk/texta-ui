import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {UserStore} from '../core/users/user.store';
import {LoginDialogComponent} from '../shared/components/dialogs/login/login-dialog.component';
import {UserProfile} from '../shared/types/UserProfile';
import {UserService} from '../core/users/user.service';
import {LocalStorageService} from '../core/util/local-storage.service';
import {mergeMap} from 'rxjs/operators';
import {ProjectService} from '../core/projects/project.service';
import {Project} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl} from '@angular/forms';
import {ProjectStore} from '../core/projects/project.store';
import {of} from 'rxjs';
import {RegistrationDialogComponent} from '../shared/components/dialogs/registration/registration-dialog.component';

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
              private projectService: ProjectService,
              private projectStore: ProjectStore) {

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
        if (!this.projectControl.value) {
          this.projectControl.setValue(projects[0]);
          this.projectStore.setCurrentProject(projects[0]);
        }
      }
    });
  }

  public selectProject(selectedOption: Project) {
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
      next => console.log(next),
      error => console.log(error),
      () => {
        this.localStorageService.deleteUser();
        this.userStore.setCurrentUser(null);
        location.reload();
      });
  }
}
