import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {Project} from '../../shared/types/Project';
import {MatTableDataSource} from '@angular/material/table';
import {UserProfile} from '../../shared/types/UserProfile';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {UserService} from '../../core/users/user.service';
import {LogService} from '../../core/util/log.service';
import {MatDialog} from '@angular/material/dialog';
import {ProjectStore} from '../../core/projects/project.store';
import {Router} from '@angular/router';
import {UserStore} from '../../core/users/user.store';
import {takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projects: Project[];
  public tableData: MatTableDataSource<UserProfile> = new MatTableDataSource<UserProfile>();

  public displayedColumns = ['id', 'is_superuser', 'username', 'email', 'date_joined', 'last_login', 'delete'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  currentUser: UserProfile;

  constructor(private userService: UserService,
              private logService: LogService,
              public dialog: MatDialog,
              private projectStore: ProjectStore,
              private router: Router,
              private userStore: UserStore) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    this.sort.sortChange.pipe(takeUntil(this.destroyed$)).subscribe(() => this.paginator.pageIndex = 0);
    this.userService.getAllUsers().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = resp;
        this.isLoadingResults = false;
      }
    });
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });
  }

  togglePermissions(row: UserProfile) {
    if (row.id !== 1) { // admin always id 1???? todo
      this.userService.toggleSuperUser(row.id, {is_superuser: !row.is_superuser}).subscribe((resp: UserProfile | HttpErrorResponse) => {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 2000);
        } else {
          if (this.currentUser && row.id === this.currentUser.id) {
            row.is_superuser = false; // can only access this view as superuser
            this.userStore.setCurrentUser(row); // removed our own admin status
            this.router.navigateByUrl('');
            this.logService.snackBarMessage('No permissions for this resource', 2000);
          }
        }
      });
    }
  }

  deleteUser(user: UserProfile) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        confirmText: 'Delete',
        mainText: `Are you sure you want to delete this user?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.url).subscribe(x => {
          if (!(x instanceof HttpErrorResponse)) {
            this.tableData.data = this.tableData.data.filter(y => y.id !== user.id);
          }
        });
      }
    });
  }

  trackById(index, item: UserProfile) {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
