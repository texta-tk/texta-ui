import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../core/users/user.service';
import {UserProfile} from '../shared/types/UserProfile';
import {LogService} from '../core/util/log.service';
import {ProjectStore} from '../core/projects/project.store';
import {mergeMap} from 'rxjs/operators';
import {from, of, Subscription} from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: UserProfile[] = [];
  userSubscription: Subscription;

  constructor(private userService: UserService, private logService: LogService, private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.userSubscription = this.projectStore.getCurrentProject().pipe(mergeMap(currentProject => {
      this.users = [];
      if (currentProject) {
        return from(currentProject.users).pipe(mergeMap((url: string) => this.userService.getUserByUrl(url)));
      } else {
        return of(null);
      }
    })).subscribe((response: UserProfile) => {
      if (response) {
        this.users.push(response);
        this.users = [...this.users];
      }
    });

  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}
