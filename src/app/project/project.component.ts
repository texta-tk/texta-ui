import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Project} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {from, Observable, Subject, Subscription} from 'rxjs';
import {LogService} from '../core/util/log.service';
import {CreateProjectDialogComponent} from './create-project-dialog/create-project-dialog.component';
import {ProjectStore} from '../core/projects/project.store';
import {EditProjectDialogComponent} from './edit-project-dialog/edit-project-dialog.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {

  dialogAfterClosedSubscription: Subscription;
  projectSubscription: Subscription;
  /*   // users
    private urlsToRequest: Subject<string[]> = new Subject();
    public usersObservable: Observable<UserProfile[]>;*/
  public tableData: MatTableDataSource<Project>;
  public displayedColumns = ['Id', 'Owner', 'Title', 'Indices', /* 'Users',*/ 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(
    private projectStore: ProjectStore,
    public dialog: MatDialog,
    public logService: LogService) {
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
    /*    this.getElementUsers();*/
  }

  ngOnDestroy() {
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
  }

  /*selectUserElement(urls) {
    this.urlsToRequest.next(urls);
  }
*/

  /*  getElementUsers() {
      this.urlsToRequest.subscribe(urls => {
        this.usersObservable = from(urls).pipe(mergeMap((url: string) => this.userService.getUserByUrl(url)), toArray());
      });
    }*/

  edit(project) {
    this.dialog.open(EditProjectDialogComponent, {
      width: '750px',
      data: project
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      height: '350px',
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
}
