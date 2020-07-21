import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Project} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {from, Observable, Subject} from 'rxjs';
import {LogService} from '../core/util/log.service';
import {CreateProjectDialogComponent} from './create-project-dialog/create-project-dialog.component';
import {ProjectStore} from '../core/projects/project.store';
import {EditProjectDialogComponent} from './edit-project-dialog/edit-project-dialog.component';
import {UserProfile} from '../shared/types/UserProfile';
import {delay, map, mergeMap, startWith, takeUntil, toArray} from 'rxjs/operators';
import {UserService} from '../core/users/user.service';
import {ConfirmDialogComponent} from '../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {ProjectService} from '../core/projects/project.service';
import {UserStore} from '../core/users/user.store';
import {FormControl} from '@angular/forms';
import {MatOption} from '@angular/material/core';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectComponent implements OnInit, OnDestroy {

  destroyed$: Subject<boolean> = new Subject<boolean>();
  filteredUsers: Observable<UserProfile[]>;
  public projectUsers$: Observable<UserProfile[]>;
  public tableData: MatTableDataSource<Project> = new MatTableDataSource<Project>([]);
  public displayedColumns = ['id', 'title', 'author_username', 'indices_count', 'users_count'];
  public isLoadingResults = true;
  public currentUser: UserProfile;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  public authorFilterControl = new FormControl();
  private urlsToRequest: Subject<string[]> = new Subject();

  constructor(
    private projectStore: ProjectStore,
    private userService: UserService,
    private userStore: UserStore,
    public dialog: MatDialog,
    public logService: LogService,
    private projectService: ProjectService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    this.tableData.filterPredicate = (data, element) => {
      return data.author_username === element;
    };
    this.userService.getAllUsers().subscribe(users => {
      if (users && !(users instanceof HttpErrorResponse)) {
        this.filteredUsers = this.authorFilterControl.valueChanges
          .pipe(
            startWith(''),
            map(value => {
              const filterVal = value.toLowerCase();
              if (value === '') {
                this.applyFilter({value: ''});
              }
              return users.filter(option => option.username.toLowerCase().includes(filterVal));
            })
          );
      }
    });
    // delay so we could navigate to the page smoothly, and then start rendering the table which takes resources
    this.projectStore.getProjects().pipe(delay(100), takeUntil(this.destroyed$)).subscribe(projects => {
      if (projects) {
        this.tableData.data = projects;
        this.isLoadingResults = false;
      }
    });
    this.projectUsers$ = this.urlsToRequest.pipe(mergeMap((urls) => {
        return from(urls).pipe(mergeMap(url => {
          return this.userService.getUserByUrl(url);
        }), toArray());
      }
    ), map(x => x.filter(resp => !(resp instanceof HttpErrorResponse)))) as Observable<UserProfile[]>;
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
        if (user.is_superuser && !this.displayedColumns.includes('Modify')) {
          this.displayedColumns.push('Modify');
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  selectUserElement(urls: string[]) {
    this.urlsToRequest.next(urls);
  }

  edit(project: Project) {
    this.dialog.open(EditProjectDialogComponent, {
      width: '750px',
      data: project
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      maxHeight: '440px',
      width: '700px',
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectStore.refreshProjects(); // we also need to keep the navbar project select in sync not just table
        this.logService.snackBarMessage(`Created project ${resp.title}`, 2000);
        this.projectStore.setCurrentProject(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  trackById(index: number, item: Project) {
    return item.id;
  }

  onDelete(project: Project) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: `Delete the project \"${project.id}: ${project.title}\"?`}
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(result => {
      if (result) {
        this.projectService.deleteProject(project.id).subscribe(resp => {
          if (resp instanceof HttpErrorResponse) {
            this.logService.snackBarError(resp, 4000);
          } else {
            this.projectStore.refreshProjects(); // we also need to keep the navbar project select in sync not just table
            this.logService.snackBarMessage(`Deleted project ${project.title}`, 3000);
          }
        });
      }
    });
  }

  applyFilter(filterValue: MatOption | { value: string }) {
    this.tableData.filter = filterValue?.value ? filterValue.value : '';
  }

  selectProject(val: Project) {
    if (val.users.includes(this.currentUser.url)) {
      this.projectStore.setCurrentProject(val);
    } else {
      this.projectService.editProject({users: [this.currentUser.url, ...val.users]}, val.id).subscribe((resp: Project | HttpErrorResponse) => {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else if (resp) {
          this.projectStore.refreshProjects();
          this.projectStore.setCurrentProject(val);
        }
      });
    }
  }
}
