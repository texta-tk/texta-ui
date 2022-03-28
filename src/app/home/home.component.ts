import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Health} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {UserStore} from '../core/users/user.store';
import {UserProfile} from '../shared/types/UserProfile';
import {of, Subject, Subscription} from 'rxjs';
import projectPackage from '../../../package.json';
import {CoreService} from '../core/core.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {CeleryCountTasks} from '../shared/types/Celery';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  health: Health;
  unreachable: boolean;
  user: UserProfile | null;
  frontVersion = projectPackage.version;
  destroyed$ = new Subject<boolean>();
  isLoading = true;
  celeryInfo: CeleryCountTasks;

  constructor(private coreService: CoreService, private userStore: UserStore) {

  }

  ngOnInit(): void {
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$), switchMap(user => {
      if (user) {
        this.user = user;
        return this.coreService.getHealth().pipe(takeUntil(this.destroyed$)); // when we route out, dont care about this request anymore
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.health = resp;
        this.isLoading = false;
        this.unreachable = false;
      } else {
        this.unreachable = true;
      }
    });

    this.coreService.getCeleryTaskInfo().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.celeryInfo = resp;
      }
    });

  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
