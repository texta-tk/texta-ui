import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {UserStore} from '../core/users/user.store';
import {LoginComponent} from '../login/login.component';
import {UserProfile} from '../../shared/types/UserProfile';
import {UserService} from '../core/users/user.service';
import {LocalstorageService} from '../core/util/localstorage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: UserProfile;

  constructor(public dialog: MatDialog,
              private userStore: UserStore,
              private userService: UserService,
              private localStorageService: LocalstorageService) {

  }

  ngOnInit() {
    this.userStore.getCurrentUser().subscribe(resp => {
      if (resp) {
        this.user = resp;
      }
    });
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
