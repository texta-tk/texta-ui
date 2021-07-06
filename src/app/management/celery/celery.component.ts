import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {UserProfile} from '../../shared/types/UserProfile';
import {UserStore} from '../../core/users/user.store';
import {takeUntil} from 'rxjs/operators';
import {CoreService} from '../../core/core.service';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../core/util/log.service';
import {Project} from '../../shared/types/Project';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CeleryStatus, CeleryTask} from '../../shared/types/Celery';

@Component({
  selector: 'app-celery',
  templateUrl: './celery.component.html',
  styleUrls: ['./celery.component.scss']
})
export class CeleryComponent implements OnInit, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projects: Project[];
  public tableData: MatTableDataSource<UserProfile> = new MatTableDataSource<UserProfile>();
  public isLoadingResults = true;
  purgeLoading: boolean;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  currentUser: UserProfile;
  celeryStatus: CeleryStatus;

  constructor(private userStore: UserStore, private coreService: CoreService, private logService: LogService) {
  }

  ngOnInit(): void {
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });
    this.coreService.getCeleryQueueStats().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.celeryStatus = resp;
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  purgeTasks(): void {
    this.coreService.purgeCeleryTasks().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(resp.detail, 5000);
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
      this.purgeLoading = false;
    });
  }

}
