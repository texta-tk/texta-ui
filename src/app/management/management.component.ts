import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserStore} from '../core/users/user.store';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {UserProfile} from '../shared/types/UserProfile';


@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject();
  currentUser: UserProfile;


  constructor(private userStore: UserStore) {
  }

  ngOnInit(): void {
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
