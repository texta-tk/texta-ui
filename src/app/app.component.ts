import {Component, OnDestroy, OnInit} from '@angular/core';

import {UserStore} from './core/users/user.store';
import {UserProfile} from '../shared/types/UserProfile';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  user: UserProfile;
  userSubscription: Subscription;

  constructor(private userStore: UserStore) {
  }

  ngOnInit() {
    this.userSubscription = this.userStore.getCurrentUser().subscribe(resp => {
      if (resp) {
        this.user = resp;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}
