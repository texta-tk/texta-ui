import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserProfile } from '../shared/types/UserProfile';
import { UserStore } from '../core/users/user.store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {
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
