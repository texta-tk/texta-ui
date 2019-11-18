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
import {mergeMap, toArray} from 'rxjs/operators';
import {UserService} from '../core/users/user.service';
import { ConfirmDialogComponent } from '../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { ProjectService } from '../core/projects/project.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {

  dialogAfterClosedSubscription: Subscription;
  projectSubscription: Subscription;

  private urlsToRequest: Subject<string[]> = new Subject();
  public projectUsers$: Observable<UserProfile[]>;
  public tableData: MatTableDataSource<Project>;
  public displayedColumns = ['id', 'owner__username', 'title', 'indices_count', 'users_count', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(
    private projectStore: ProjectStore,
    private userService: UserService,
    public dialog: MatDialog,
    public logService: LogService,
    private projectService: ProjectService) {
  }

  ngOnInit() {
    this.projectSubscription = this.projectStore.getProjects().subscribe((projects: Project[]) => {
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
  }

  ngOnDestroy() {
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
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
      height: '340px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: Project | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectStore.refreshProjects();
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onDelete(project: Project, index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { confirmText: 'Delete', mainText: 'Are you sure you want to delete this Project?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.deleteProject(project.id).subscribe((resp: any | HttpErrorResponse) => {
          if (resp && resp.status === 403) {
            this.logService.snackBarMessage(resp.error.detail, 4000);
          } else if (!(resp instanceof HttpErrorResponse)) {
            this.logService.snackBarMessage(`Project ${project.id}: ${project.title} deleted`, 3000);
            console.log(index);
            this.tableData.data.splice(index, 1);
            this.tableData.data = [...this.tableData.data];
          }});
        }
      });
    }
}
