import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Project} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {from, Observable, Subject, Subscription} from 'rxjs';
import {LogService} from '../core/util/log.service';
import {CreateProjectDialogComponent} from './create-project-dialog/create-project-dialog.component';
import {ProjectStore} from '../core/projects/project.store';
import {EditProjectDialogComponent} from './edit-project-dialog/edit-project-dialog.component';
import {UserProfile} from '../shared/types/UserProfile';
import {mergeMap, takeUntil, toArray} from 'rxjs/operators';
import {UserService} from '../core/users/user.service';
import {ConfirmDialogComponent} from '../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {ProjectService} from '../core/projects/project.service';
import {UserStore} from '../core/users/user.store';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {

  destroyed$: Subject<boolean> = new Subject<boolean>();
  private urlsToRequest: Subject<string[]> = new Subject();
  public projectUsers$: Observable<(UserProfile | HttpErrorResponse)[]>;
  public tableData: MatTableDataSource<Project>;
  public displayedColumns = ['id', 'owner__username', 'title', 'indices_count', 'users_count'];
  public isLoadingResults = true;
  public currentUser: UserProfile;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(
    private projectStore: ProjectStore,
    private userService: UserService,
    private userStore: UserStore,
    public dialog: MatDialog,
    public logService: LogService,
    private projectService: ProjectService) {
  }

  ngOnInit() {
    this.projectStore.getProjects().pipe(takeUntil(this.destroyed$)).subscribe((projects: Project[]) => {
      if (projects) {
        this.tableData = new MatTableDataSource(projects);
        this.tableData.sort = this.sort;
        this.tableData.paginator = this.paginator;
        this.isLoadingResults = false;
      }
    });
    this.projectUsers$ = this.urlsToRequest.pipe(mergeMap((urls) => {
        return from(urls).pipe(mergeMap(url => {
          return this.userService.getUserByUrl(url);
        }), toArray());
      }
    ));
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

  selectUserElement(urls) {
    this.urlsToRequest.next(urls);
  }

  edit(project) {
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
    dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe((resp: Project | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectStore.refreshProjects();
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onDelete(project: Project) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this Project?'}
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(result => {
      if (result) {
        this.projectService.deleteProject(project.id).subscribe((resp: any | HttpErrorResponse) => {
          if (resp && resp.status === 403) {
            this.logService.snackBarMessage(resp.error.detail, 4000);
          } else if (!(resp instanceof HttpErrorResponse)) {
            this.logService.snackBarMessage(`Project ${project.id}: ${project.title} deleted`, 3000);
            const index = this.tableData.data.indexOf(project, 0);
            if (index > -1) {
              this.tableData.data.splice(index, 1);
              this.tableData.data = [...this.tableData.data];
            }
          }
        });
      }
    });
  }
}
