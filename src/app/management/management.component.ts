import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {from, of, Subject} from 'rxjs';
import {UserService} from '../core/users/user.service';
import {LogService} from '../core/util/log.service';
import {ProjectStore} from '../core/projects/project.store';
import {mergeMap, take, takeUntil} from 'rxjs/operators';
import {Project} from '../shared/types/Project';
import {UserStore} from '../core/users/user.store';
import {MatTableDataSource} from '@angular/material/table';
import {UserProfile} from '../shared/types/UserProfile';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projects: Project[];
  public tableData: MatTableDataSource<UserProfile> = new MatTableDataSource<UserProfile>();

  public displayedColumns = ['id', 'is_superuser', 'username', 'email', 'date_joined'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  currentUser: UserProfile;

  constructor(private userService: UserService,
              private logService: LogService,
              private projectStore: ProjectStore,
              private router: Router,
              private userStore: UserStore) {
  }

  ngOnInit() {
    this.userService.getAllUsers().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.tableData.data = resp;
        this.isLoadingResults = false;
      }
    });
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$)).subscribe(user => {
      this.currentUser = user;
    })
  }

  togglePermissions(row: UserProfile) {
    this.userService.toggleSuperUser(row.id).subscribe((resp: UserProfile | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
      } else {
        if (row.id === this.currentUser.id) {
          row.is_superuser = false; // can only access this view as superuser
          this.userStore.setCurrentUser(row); // removed our own admin status
          this.router.navigateByUrl('');
          this.logService.snackBarMessage('No permissions for this resource', 2000);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
