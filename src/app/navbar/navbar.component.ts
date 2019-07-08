import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {UserStore} from '../core/users/user.store';
import {LoginComponent} from '../../shared/dialogs/login/login.component';
import {UserProfile} from '../../shared/types/UserProfile';
import {UserService} from '../core/users/user.service';
import {LocalStorageService} from '../core/util/local-storage.service';
import {mergeMap} from 'rxjs/operators';
import {ProjectService} from '../core/projects/project.service';
import {Project} from '../../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl} from '@angular/forms';
import {ProjectStore} from '../core/projects/project.store';
import {of} from 'rxjs';

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
    this.userStore.getCurrentUser().pipe(mergeMap(resp => {
      if (resp) {
        this.user = resp;
        return this.projectService.getProjects();
      }
      return of(null);
    })).subscribe((resp: Project[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projects = resp;
        this.projectControl.setValue(resp[0]);
        this.projectStore.setCurrentProject(resp[0]);
      }
    });
  }

  public selectProject(selectedOption: Project) {
    this.projectStore.setCurrentProject(selectedOption);
  }

  openDialog() {
    this.dialog.open(LoginComponent, {
      height: '285px',
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
