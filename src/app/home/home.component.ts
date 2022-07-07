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
import {LogService} from '../core/util/log.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy {
  health: Health;
  user: UserProfile | null;
  frontVersion = projectPackage.version;
  destroyed$ = new Subject<boolean>();
  celeryInfo: CeleryCountTasks;
  celeryInfoLoading = false;
  healthLoading = false;

  constructor(private coreService: CoreService, private logService: LogService) {

  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  loadHealth(): void {
    if (!this.health && !this.healthLoading) {
      this.healthLoading = true;
      this.coreService.getHealth().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.health = resp;
        }else{
          this.logService.snackBarError(resp);
        }
        this.healthLoading = false;
      });
    }
  }

  loadCeleryTaskInfo(): void {
    if (!this.celeryInfo && !this.celeryInfoLoading) {
      this.celeryInfoLoading = true;
      this.coreService.getCeleryTaskInfo().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.celeryInfo = resp;
        }else{
          this.logService.snackBarError(resp);
        }
        this.celeryInfoLoading = false;
      });
    }
  }
}
