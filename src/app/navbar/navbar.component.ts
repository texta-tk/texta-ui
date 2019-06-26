import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {UserStore} from '../core/user.store';
import {LoginComponent} from '../login/login.component';
import {UserProfile} from '../../shared/types/UserProfile';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: UserProfile;
  constructor(public dialog: MatDialog, private userStore: UserStore) {

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
}
